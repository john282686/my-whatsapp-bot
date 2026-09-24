const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
const steps = [];

function patch(name, cond, from, to) {
    if (cond()) { steps.push('skip ' + name); return; }
    if (!s.includes(from)) { steps.push('FAIL ' + name); return; }
    s = s.split(from).join(to);
    steps.push('ok ' + name);
}

// 1. require
patch('require',
    () => s.includes("require('./unique_features3')"),
    "var uniqueFeatures2 = require('./unique_features2');",
    "var uniqueFeatures2 = require('./unique_features2');\nvar uniqueFeatures3 = require('./unique_features3');"
);

// 2. db key
patch('db-keys',
    () => s.includes('groupDNA:'),
    "    timeCapsules: []",
    "    timeCapsules: [],\n    groupDNA: {}"
);

// 3. ensure on boot
patch('ensure',
    () => s.includes('uniqueFeatures3.ensure(db);'),
    "longTermMemory.seedFromExisting(db);",
    "longTermMemory.seedFromExisting(db);\nuniqueFeatures3.ensure(db);"
);

// 4. commands block — insert before .aboutme
var newCommands = [
    "} else if (cmd === 'dna' || cmd === 'groupdna') {",
    "                    var dnaCtx = recentGroupContext(from, 60);",
    "                    if (!dnaCtx || dnaCtx.length < 80) {",
    "                        await sock.sendMessage(from, { text: '\\uD83E\\uDDEC Not enough chat to sequence the group DNA yet.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83E\\uDDEC Sequencing group DNA...' }, { quoted: msg });",
    "                        var prevGenome = (db.groupDNA && db.groupDNA[from]) || null;",
    "                        var newGenome = await uniqueFeatures3.analyzeDNA(askAI, dnaCtx, meta.subject || 'this group', prevGenome);",
    "                        if (!newGenome) {",
    "                            await sock.sendMessage(from, { text: '\\u274C DNA analysis failed.' }, { quoted: msg });",
    "                        } else {",
    "                            db.groupDNA[from] = newGenome;",
    "                            saveDBNow();",
    "                            await sock.sendMessage(from, { text: uniqueFeatures3.renderDNA(newGenome) }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'universe' || cmd === 'au') {",
    "                    var auTwist = args.join(' ').trim();",
    "                    if (!auTwist) {",
    "                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'universe <what if ...>' }, { quoted: msg });",
    "                    } else {",
    "                        var auCtx = recentGroupContext(from, 40);",
    "                        if (!auCtx) {",
    "                            await sock.sendMessage(from, { text: '\\uD83C\\uDF00 Not enough chat yet.' }, { quoted: msg });",
    "                        } else {",
    "                            var auOut = await uniqueFeatures3.alternateUniverse(askAI, auCtx, auTwist);",
    "                            if (auOut) await sock.sendMessage(from, { text: '\\uD83C\\uDF00 *ALTERNATE UNIVERSE*\\n_' + auTwist + '_\\n\\n' + auOut }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'echo') {",
    "                    var echoWho = tgt || sender;",
    "                    var echoName = '@' + num(echoWho);",
    "                    var echoFacts = longTermMemory.recall(db, echoWho, 'personality interests habits', 10);",
    "                    var echoHist = getChatHistory(from, echoWho);",
    "                    var echoOut = await uniqueFeatures3.echoChamber(askAI, echoFacts, echoHist, echoName, meta.subject || 'this group');",
    "                    if (echoOut) await sock.sendMessage(from, { text: echoOut, mentions: [echoWho] }, { quoted: msg });",
    "                } else if (cmd === 'aboutme') {"
].join('\n');

patch('commands',
    () => s.includes("cmd === 'echo'"),
    "} else if (cmd === 'aboutme') {",
    newCommands
);

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function (x) { console.log('  ' + x); });
