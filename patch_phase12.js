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
    () => s.includes("require('./unique_features11')"),
    "var uniqueFeatures10 = require('./unique_features10');",
    "var uniqueFeatures10 = require('./unique_features10');\nvar uniqueFeatures11 = require('./unique_features11');"
);

patch('db-keys',
    () => s.includes('groupOracle:'),
    "    silentMode: {},\n    silentAccum: {},\n    activePersona: {},\n    selfAuditLog: []",
    "    silentMode: {},\n    silentAccum: {},\n    activePersona: {},\n    selfAuditLog: [],\n    groupOracle: {},\n    timeBank: {},\n    livingArchive: {},\n    socialPhysics: {},\n    interventions: {}"
);

patch('ensure',
    () => s.includes('uniqueFeatures11.ensure(db);'),
    "uniqueFeatures10.ensure(db);",
    "uniqueFeatures10.ensure(db);\nuniqueFeatures11.ensure(db);"
);

// Hook: log time-bank interaction on mentions and replies
patch('time-bank-hook',
    () => s.includes('uniqueFeatures11.logInteraction('),
    "if (mj !== sender) power.trackRelation(db, from, sender, mj, 'mention');",
    "if (mj !== sender) { power.trackRelation(db, from, sender, mj, 'mention'); uniqueFeatures11.logInteraction(db, from, sender, pn || ('@' + sn), mj, null, 'mention'); }"
);

patch('time-bank-hook2',
    () => s.includes('uniqueFeatures11.logInteraction(') && s.indexOf("'reply'") !== -1 && s.indexOf('logInteraction') !== -1,
    "if (rp !== sender) power.trackRelation(db, from, sender, rp, 'reply');",
    "if (rp !== sender) { power.trackRelation(db, from, sender, rp, 'reply'); uniqueFeatures11.logInteraction(db, from, sender, pn || ('@' + sn), rp, null, 'reply'); }"
);

// Conflict detection hook — after scanGroupLore call
patch('conflict-hook',
    () => s.includes('uniqueFeatures11.detectConflict('),
    "scanGroupLore(from).catch(function () {});",
    "scanGroupLore(from).catch(function () {});\n                    if (!msg.key.fromMe) {\n                        try {\n                            var confHit = uniqueFeatures11.detectConflict(db, from);\n                            if (confHit) {\n                                var lastInt = db.interventions[from] || 0;\n                                if (Date.now() - lastInt > 30 * 60 * 1000) {\n                                    db.interventions[from] = Date.now();\n                                    saveDB();\n                                    await sock.sendMessage(from, { text: uniqueFeatures11.renderIntervention() });\n                                }\n                            }\n                        } catch (e) { console.log('[INTERV]', e.message); }\n                    }"
);

var newCommands = [
    "} else if (cmd === 'oracleritual' || cmd === 'weekly') {",
    "                    if (!isA) continue;",
    "                    var oCtx = recentGroupContext(from, 50);",
    "                    if (!oCtx || oCtx.length < 80) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDD2E Need more group context first.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDD2E Preparing this week\\'s oracle questions...' }, { quoted: msg });",
    "                        var oRaw = await uniqueFeatures11.generateOracleQuestions(askAI, oCtx, meta.subject || 'this group');",
    "                        if (!oRaw) {",
    "                            await sock.sendMessage(from, { text: '\\uD83D\\uDD2E The oracle is silent this week.' }, { quoted: msg });",
    "                        } else {",
    "                            var qs = [];",
    "                            String(oRaw).split('\\n').forEach(function (l) {",
    "                                var m = l.match(/^\\s*[1-3]\\s*\\|\\s*(.+)$/);",
    "                                if (m && m[1].trim().length > 5) qs.push(m[1].trim());",
    "                            });",
    "                            if (qs.length < 1) {",
    "                                await sock.sendMessage(from, { text: '\\uD83D\\uDD2E Could not parse questions.' }, { quoted: msg });",
    "                            } else {",
    "                                uniqueFeatures11.saveOracle(db, from, qs);",
    "                                saveDBNow();",
    "                                var weekNum = db.groupOracle[from].week;",
    "                                var oOut = '\\uD83D\\uDD2E *GROUP ORACLE \u2014 WEEK ' + weekNum + '*\\n\\nAnswer all three, together this week.\\n\\n';",
    "                                qs.forEach(function (q, i) { oOut += '*' + (i + 1) + '.* ' + q + '\\n\\n'; });",
    "                                oOut += 'Reply in the group with:\\n.answer <1|2|3> <your answer>';",
    "                                await sock.sendMessage(from, { text: oOut }, { quoted: msg });",
    "                            }",
    "                        }",
    "                    }",
    "                } else if (cmd === 'answer') {",
    "                    var aNum = parseInt(args[0], 10);",
    "                    if (!aNum || aNum < 1 || aNum > 3) {",
    "                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'answer <1|2|3> <your answer>' }, { quoted: msg });",
    "                    } else {",
    "                        var aText = args.slice(1).join(' ').trim();",
    "                        if (!aText) {",
    "                            await sock.sendMessage(from, { text: 'You need to write an answer after the number.' }, { quoted: msg });",
    "                        } else {",
    "                            var ok = uniqueFeatures11.recordAnswer(db, from, aNum - 1, sender, pn || ('@' + sn), aText);",
    "                            if (!ok) {",
    "                                await sock.sendMessage(from, { text: '\\uD83D\\uDD2E No active oracle right now.' }, { quoted: msg });",
    "                            } else {",
    "                                saveDBNow();",
    "                                await sock.sendMessage(from, { text: '\\u2705 Answer recorded for question ' + aNum + '.' }, { quoted: msg });",
    "                            }",
    "                        }",
    "                    }",
    "                } else if (cmd === 'oracle') {",
    "                    await sock.sendMessage(from, { text: uniqueFeatures11.renderOracle(db, from) }, { quoted: msg });",
    "                } else if (cmd === 'oracleclose') {",
    "                    if (!isA) continue;",
    "                    if (!db.groupOracle[from]) continue;",
    "                    db.groupOracle[from].closed = true;",
    "                    saveDBNow();",
    "                    var summary = uniqueFeatures11.renderOracleSummary(db, from);",
    "                    if (summary) await sock.sendMessage(from, { text: summary });",
    "                } else if (cmd === 'timebank' || cmd === 'tb') {",
    "                    await sock.sendMessage(from, { text: uniqueFeatures11.renderTimeBank(db, from) }, { quoted: msg });",
    "                } else if (cmd === 'chapter' || cmd === 'personalchapter') {",
    "                    var cWho = tgt || sender;",
    "                    var cMem = db.memory[from] && db.memory[from][cWho];",
    "                    if (!cMem) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDCD6 No data on this member yet.' }, { quoted: msg });",
    "                    } else {",
    "                        var cName = cMem.name || ('@' + num(cWho));",
    "                        var cFacts = longTermMemory.recall(db, cWho, 'personality interests habits', 15);",
    "                        var cRecent = (cMem.recent || []).slice(-15);",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDCD6 Writing chapter for @' + num(cWho) + '...', mentions: [cWho] }, { quoted: msg });",
    "                        var cYear = new Date().getFullYear().toString();",
    "                        var cOut = await uniqueFeatures11.writePersonalChapter(askAI, cName, cFacts, cRecent, meta.subject || 'this group', cYear);",
    "                        if (cOut) {",
    "                            if (!db.livingArchive[from]) db.livingArchive[from] = {};",
    "                            db.livingArchive[from][cWho] = { text: cOut, writtenAt: Date.now() };",
    "                            saveDBNow();",
    "                            await sock.sendMessage(from, { text: cOut, mentions: [cWho] }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'archivechapter') {",
    "                    var aWho = tgt || sender;",
    "                    var arch = db.livingArchive[from] && db.livingArchive[from][aWho];",
    "                    if (!arch) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDCD6 No archive chapter yet for this member. Use ' + PREFIX + 'chapter first.' });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: arch.text + '\\n\\n_Written: ' + new Date(arch.writtenAt).toLocaleDateString() + '_' });",
    "                    }",
    "                } else if (cmd === 'gravity' || cmd === 'physics') {",
    "                    var gList = uniqueFeatures11.computeGravity(db, from);",
    "                    await sock.sendMessage(from, { text: uniqueFeatures11.renderGravity(gList, meta.subject || 'this group') }, { quoted: msg });",
    "                } else if (cmd === 'pause') {",
    "                    await sock.sendMessage(from, { text: uniqueFeatures11.renderIntervention() }, { quoted: msg });",
    "                } else if (cmd === 'aboutme') {"
].join('\n');

patch('commands',
    () => s.includes("cmd === 'oracleritual'"),
    "} else if (cmd === 'aboutme') {",
    newCommands
);

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function(x){ console.log('  ' + x); });
