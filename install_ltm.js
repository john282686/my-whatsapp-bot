const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
const steps = [];

function patch(name, condition, from, to) {
    if (condition()) { steps.push('skip ' + name); return; }
    if (!s.includes(from)) { steps.push('FAIL ' + name); return; }
    s = s.split(from).join(to);
    steps.push('ok ' + name);
}

// 1. require
patch('require',
    () => s.includes("require('./long_term_memory')"),
    "var memberProfiles = require('./member_profiles');",
    "var memberProfiles = require('./member_profiles');\nvar longTermMemory = require('./long_term_memory');"
);

// 2. db keys
patch('db-keys',
    () => s.includes('longTermMemory:'),
    "    loreScan: {}",
    "    loreScan: {},\n    longTermMemory: {},\n    ltmInbox: {}"
);

// 3. ensure + seed
patch('ensure',
    () => s.includes('longTermMemory.ensure(db);'),
    "memberProfiles.ensure(db);",
    "memberProfiles.ensure(db);\nlongTermMemory.ensure(db);\nlongTermMemory.seedFromExisting(db);"
);

// 4. observe + consolidate after addMem
patch('observe',
    () => s.includes('longTermMemory.observe('),
    "scanGroupLore(from).catch(function () {});",
    "scanGroupLore(from).catch(function () {});\n                    longTermMemory.observe(db, sender, pn, text, from);\n                    if (longTermMemory.needsConsolidation(db, sender)) {\n                        longTermMemory.consolidate(db, sender, askAI).then(function(){ saveDB(); }).catch(function(e){ console.log('[LTM]', e.message); });\n                    }"
);

// 5a. auto-reply prompt LTM context
patch('prompt-auto',
    () => s.includes('longTermMemory.recall(db, sender, text)'),
    "var prompt =\n                            (history ? 'RECENT CONVERSATION:\\n' + history + '\\n\\n' : '') +\n                            'Person just said: ' +\n                            text;",
    "var ltmRecall = longTermMemory.recall(db, sender, text);\n                        var prompt =\n                            (ltmRecall ? 'THINGS YOU REMEMBER ABOUT THIS PERSON (long-term):\\n' + ltmRecall + '\\n\\n' : '') +\n                            (history ? 'RECENT CONVERSATION:\\n' + history + '\\n\\n' : '') +\n                            'Person just said: ' +\n                            text;"
);

// 5b. @bot prompt LTM context
patch('prompt-bot',
    () => s.includes('longTermMemory.recall(db, sender, q)'),
    "var prompt2 =\n                            (hist2 ? 'RECENT CONVERSATION:\\n' + hist2 + '\\n\\n' : '') +\n                            'Person just said: ' +\n                            q;",
    "var ltmRecall2 = longTermMemory.recall(db, sender, q);\n                        var prompt2 =\n                            (ltmRecall2 ? 'THINGS YOU REMEMBER ABOUT THIS PERSON (long-term):\\n' + ltmRecall2 + '\\n\\n' : '') +\n                            (hist2 ? 'RECENT CONVERSATION:\\n' + hist2 + '\\n\\n' : '') +\n                            'Person just said: ' +\n                            q;"
);

// 6. .aboutme + .forget commands
patch('commands',
    () => s.includes("cmd === 'aboutme'"),
    "} else if (cmd === 'clearmymemory') {",
    "} else if (cmd === 'aboutme') {\n                    var ltmUser = longTermMemory.getUser(db, sender);\n                    var aboutOut = '📌 *LONG-TERM MEMORY*\\n\\n';\n                    aboutOut += longTermMemory.buildProfileText(db, sender) + '\\n\\n';\n                    if (ltmUser.facts && ltmUser.facts.length) {\n                        aboutOut += 'Facts I remember (' + ltmUser.facts.length + '):\\n';\n                        ltmUser.facts.slice(0, 25).forEach(function(f, i){\n                            aboutOut += (i+1) + '. [' + f.category + '] ' + f.text + '\\n';\n                        });\n                        if (ltmUser.facts.length > 25) aboutOut += '... +' + (ltmUser.facts.length - 25) + ' more\\n';\n                    } else {\n                        aboutOut += 'No long-term facts saved yet. Talk to me more!';\n                    }\n                    await sock.sendMessage(from, { text: aboutOut });\n                } else if (cmd === 'forget') {\n                    if (db.longTermMemory[sender]) {\n                        delete db.longTermMemory[sender];\n                        if (db.ltmInbox) delete db.ltmInbox[sender];\n                        saveDBNow();\n                        await sock.sendMessage(from, { text: '🗑️ Long-term memory about you cleared.' });\n                    } else {\n                        await sock.sendMessage(from, { text: 'No long-term memory to clear.' });\n                    }\n                } else if (cmd === 'clearmymemory') {"
);

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function(x){ console.log('  ' + x); });
