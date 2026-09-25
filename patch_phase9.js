const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
const steps = [];

function patch(name, cond, from, to) {
    if (cond()) { steps.push('skip ' + name); return; }
    if (!s.includes(from)) { steps.push('FAIL ' + name); return; }
    s = s.split(from).join(to);
    steps.push('ok ' + name);
}

patch('require',
    () => s.includes("require('./unique_features8')"),
    "var uniqueFeatures7 = require('./unique_features7');",
    "var uniqueFeatures7 = require('./unique_features7');\nvar uniqueFeatures8 = require('./unique_features8');"
);

patch('db-keys',
    () => s.includes('cultureVault:'),
    "    confessions: {},\n    confessTargets: {},\n    groupSecondLife: {}",
    "    confessions: {},\n    confessTargets: {},\n    groupSecondLife: {},\n    cultureVault: {},\n    matchSuggestions: {},\n    weeklyReplayLast: {},\n    ghostAlerts: {}"
);

patch('ensure',
    () => s.includes('uniqueFeatures8.ensure(db);'),
    "uniqueFeatures7.ensure(db);",
    "uniqueFeatures7.ensure(db);\nuniqueFeatures8.ensure(db);"
);

var newCommands = [
    "} else if (cmd === 'match' || cmd === 'matchmaking') {",
    "                    if (!isA) continue;",
    "                    var mCtx2 = recentGroupContext(from, 40);",
    "                    var mRels = (db.relationshipGraph && db.relationshipGraph[from]) || {};",
    "                    var mNames = meta.participants ? meta.participants.slice(0, 25).map(function(p){ return p.notify || ('@' + num(p.id)); }) : [];",
    "                    await sock.sendMessage(from, { text: '\\uD83D\\uDC9E Analysing connections...' }, { quoted: msg });",
    "                    var mOut = await uniqueFeatures8.findMatches(askAI, mRels, mNames, mCtx2);",
    "                    if (!mOut || mOut.trim().toUpperCase() === 'NONE') {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDC9E No clear matches yet. Keep chatting.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDC9E *POSSIBLE CONNECTIONS*\\n\\n' + mOut }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'replay') {",
    "                    if (!isA) continue;",
    "                    var rpWho = tgt || sender;",
    "                    var rpMem = db.memory[from] && db.memory[from][rpWho];",
    "                    if (!rpMem || !rpMem.recent || !rpMem.recent.length) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDCEC No recent activity for this member.' }, { quoted: msg });",
    "                    } else {",
    "                        var rpName = rpMem.name || ('@' + num(rpWho));",
    "                        var rpMsgs = rpMem.recent.map(function(t){ return { text: t }; });",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDCEC Building replay for @' + num(rpWho) + '...' }, { quoted: msg });",
    "                        var rpOut = await uniqueFeatures8.weeklyReplay(askAI, rpName, rpMsgs, meta.subject || 'this group');",
    "                        if (rpOut) {",
    "                            try {",
    "                                await sock.sendMessage(rpWho, { text: rpOut });",
    "                                await sock.sendMessage(from, { text: '\\u2705 Sent a personal weekly replay to @' + num(rpWho), mentions: [rpWho] }, { quoted: msg });",
    "                            } catch (e) {",
    "                                await sock.sendMessage(from, { text: '\\u274C Could not DM @' + num(rpWho) + '. They may need to message me first.' }, { quoted: msg });",
    "                            }",
    "                        }",
    "                    }",
    "                } else if (cmd === 'ghosts' || cmd === 'ghostscan') {",
    "                    if (!isA) continue;",
    "                    var gHours = args[0] ? parseInt(args[0], 10) : 72;",
    "                    var ghosts = uniqueFeatures8.detectGhosts(db, from, gHours);",
    "                    if (!ghosts.length) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDC7B No silent members detected (threshold ' + gHours + 'h).' }, { quoted: msg });",
    "                    } else {",
    "                        var gOut = '\\uD83D\\uDC7B *GHOST PROTOCOL*\\n\\n_Members who normally talk but went quiet:_\\n\\n';",
    "                        var gMentions = [];",
    "                        ghosts.slice(0, 15).forEach(function (g) {",
    "                            gOut += '\\u2022 ' + g.name + ' \\u2014 ' + g.daysSilent + ' days silent (' + g.totalMsgs + ' total msgs)\\n';",
    "                            gMentions.push(g.jid);",
    "                        });",
    "                        await sock.sendMessage(from, { text: gOut, mentions: gMentions });",
    "                    }",
    "                } else if (cmd === 'welcomeall' && tgt) {",
    "                    var wCtx = recentGroupContext(from, 40);",
    "                    var wName = '@' + num(tgt);",
    "                    await sock.sendMessage(from, { text: '\\uD83C\\uDF81 Preparing ritual for @' + num(tgt) + '...', mentions: [tgt] }, { quoted: msg });",
    "                    var wOut = await uniqueFeatures8.welcomeRitual(askAI, wName, meta.subject || 'this group', wCtx);",
    "                    if (wOut) await sock.sendMessage(from, { text: wOut, mentions: [tgt] }, { quoted: msg });",
    "                } else if (cmd === 'vault') {",
    "                    var vKey = args.join(' ').trim();",
    "                    var vResults = uniqueFeatures8.searchVault(db, from, vKey);",
    "                    if (!vResults.length) {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDFDB The vault is empty' + (vKey ? ' for \"' + vKey + '\"' : '') + '.' }, { quoted: msg });",
    "                    } else {",
    "                        var vOut = '\\uD83C\\uDFDB *CULTURE VAULT*\\n' + (vKey ? '_Search: ' + vKey + '_\\n' : '_Recent entries_\\n') + '\\n';",
    "                        vResults.slice(0, 15).forEach(function (entry, i) {",
    "                            vOut += (i + 1) + '. [' + entry.category + '] ' + entry.text + '\\n';",
    "                        });",
    "                        await sock.sendMessage(from, { text: vOut }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'archive') {",
    "                    if (!isA) continue;",
    "                    var aCtx = recentGroupContext(from, 60);",
    "                    if (!aCtx || aCtx.length < 80) {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDFDB Need more chat to extract culture.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDFDB Extracting culture from recent chat...' }, { quoted: msg });",
    "                        var aRaw = await uniqueFeatures8.extractCulture(askAI, aCtx, meta.subject || 'this group');",
    "                        if (!aRaw || aRaw.trim().toUpperCase() === 'NONE') {",
    "                            await sock.sendMessage(from, { text: '\\uD83C\\uDFDB No new culture detected this round.' }, { quoted: msg });",
    "                        } else {",
    "                            var aLines = aRaw.split('\\n').filter(function (l) { return l.indexOf('|') !== -1; });",
    "                            var aAdded = 0;",
    "                            aLines.forEach(function (line) {",
    "                                var parts = line.split('|');",
    "                                if (parts.length < 2) return;",
    "                                var cat = parts[0].trim().toLowerCase();",
    "                                var txt = parts.slice(1).join('|').trim();",
    "                                if (txt.length < 4) return;",
    "                                uniqueFeatures8.addLore(db, from, txt, cat);",
    "                                aAdded++;",
    "                            });",
    "                            saveDBNow();",
    "                            await sock.sendMessage(from, { text: '\\uD83C\\uDFDB ' + aAdded + ' culture entries added to the vault.\\nUse ' + PREFIX + 'vault to browse.' }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'aboutme') {"
].join('\n');

patch('commands',
    () => s.includes("cmd === 'match'"),
    "} else if (cmd === 'aboutme') {",
    newCommands
);

// Hook welcome ritual into participant update (in addition to standard welcome)
patch('welcome-ritual-hook',
    () => s.includes('WELCOME RITUAL'),
    "await sock.sendMessage(u.id,{text:'Welcome to '+gn+', @'+p.split('@')[0]+'!\\n\\nThis group is for friendship and fun. Please keep posts relevant and respectful.\\n\\nNo spam, scams, hate speech, porn, or illegal content.\\n\\nPlease follow the group rules.',mentions:[p]});",
    "await sock.sendMessage(u.id,{text:'Welcome to '+gn+', @'+p.split('@')[0]+'!\\n\\nThis group is for friendship and fun. Please keep posts relevant and respectful.\\n\\nNo spam, scams, hate speech, porn, or illegal content.\\n\\nPlease follow the group rules.',mentions:[p]});\n                    try {\n                        var wCulture = recentGroupContext(u.id, 30);\n                        if (wCulture && wCulture.length > 80) {\n                            var wRitualOut = await uniqueFeatures8.welcomeRitual(askAI, '@' + p.split('@')[0], gn, wCulture);\n                            if (wRitualOut) await sock.sendMessage(u.id, { text: wRitualOut, mentions: [p] });\n                        }\n                    } catch (e) { console.log('[RITUAL]', e.message); }"
);

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function(x){ console.log('  ' + x); });
