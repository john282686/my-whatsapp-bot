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
    () => s.includes("require('./unique_features4')"),
    "var power = require('./power_features');",
    "var power = require('./power_features');\nvar uniqueFeatures4 = require('./unique_features4');"
);

// 2. db keys
patch('db-keys',
    () => s.includes('predictionLedger:'),
    "    relationshipGraph: {},\n    guardianLog: {},\n    guardianCooldown: {}",
    "    relationshipGraph: {},\n    guardianLog: {},\n    guardianCooldown: {},\n    predictionLedger: {}"
);

// 3. commands — insert before .aboutme
var newCommands = [
    "} else if (cmd === 'network' || cmd === 'match') {",
    "                    var nCtx = recentGroupContext(from, 40);",
    "                    if (!nCtx || nCtx.length < 80) {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDF10 Need more chat before I can match.' }, { quoted: msg });",
    "                    } else {",
    "                        var nProfiles = [];",
    "                        if (meta.participants) {",
    "                            meta.participants.slice(0, 25).forEach(function (p) {",
    "                                var facts = longTermMemory.recall(db, p.id, 'personality interests habits', 5);",
    "                                var nm = p.notify || '@' + num(p.id);",
    "                                nProfiles.push(nm + ': ' + (facts ? facts.replace(/\\n/g, ' ') : 'no profile yet'));",
    "                            });",
    "                        }",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDF10 Looking for connections...' }, { quoted: msg });",
    "                        var netOut = await uniqueFeatures4.whisperNetwork(askAI, nCtx, nProfiles.join('\\n'));",
    "                        if (!netOut || netOut.trim().toUpperCase() === 'NONE') {",
    "                            await sock.sendMessage(from, { text: '\\uD83C\\uDF10 No clear connections right now.' }, { quoted: msg });",
    "                        } else {",
    "                            await sock.sendMessage(from, { text: '\\uD83C\\uDF10 *WHISPER NETWORK*\\n\\n' + netOut }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'silent' || cmd === 'agreement') {",
    "                    var sCtx = recentGroupContext(from, 50);",
    "                    if (!sCtx || sCtx.length < 100) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDD4A\\uFE0F Need more chat first.' }, { quoted: msg });",
    "                    } else {",
    "                        var sOut = await uniqueFeatures4.silentAgreement(askAI, sCtx);",
    "                        await sock.sendMessage(from, { text: sOut || '\\uD83D\\uDD4A\\uFE0F No reading.' }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'mirror') {",
    "                    var mCtx = recentGroupContext(from, 60);",
    "                    if (!mCtx || mCtx.length < 80) {",
    "                        await sock.sendMessage(from, { text: '\\uD83E\\uDE9E Need more chat for a mirror.' }, { quoted: msg });",
    "                    } else {",
    "                        var mMembers = meta.participants ? meta.participants.slice(0, 20).map(function (p) { return p.notify || '@' + num(p.id); }) : [];",
    "                        var mOut = await uniqueFeatures4.mirror(askAI, mCtx, meta.subject || 'this group', mMembers);",
    "                        await sock.sendMessage(from, { text: mOut || '\\uD83E\\uDE9E No reflection.' }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'predict2' || cmd === 'ipredict') {",
    "                    var myPred = args.join(' ').trim();",
    "                    if (!myPred) {",
    "                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'ipredict <your prediction about this group>' }, { quoted: msg });",
    "                    } else {",
    "                        uniqueFeatures4.savePrediction(db, from, sender, pn || ('@' + sn), myPred);",
    "                        saveDBNow();",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDCDC Prediction logged. I will score it as the group chats.' });",
    "                    }",
    "                } else if (cmd === 'scoreboard' || cmd === 'ledger') {",
    "                    var lWho = tgt || null;",
    "                    var lOut = uniqueFeatures4.renderPredictionLedger(db, from, lWho);",
    "                    await sock.sendMessage(from, { text: lOut, mentions: lWho ? [lWho] : [] });",
    "                } else if (cmd === 'resolvepredictions' || cmd === 'rp') {",
    "                    if (!isA) continue;",
    "                    var rpCtx = recentGroupContext(from, 60);",
    "                    if (!rpCtx || rpCtx.length < 100) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDCDC Need more chat to score predictions.' });",
    "                    } else {",
    "                        var updates = await uniqueFeatures4.resolvePredictions(askAI, db, from, rpCtx);",
    "                        if (!updates.length) {",
    "                            await sock.sendMessage(from, { text: '\\uD83D\\uDCDC No predictions resolved this round.' });",
    "                        } else {",
    "                            saveDBNow();",
    "                            var uOut = '\\uD83D\\uDCDC *PREDICTIONS RESOLVED*\\n\\n';",
    "                            updates.forEach(function (u) {",
    "                                var icon = u.status === 'hit' ? '\\u2705' : '\\u274C';",
    "                                uOut += icon + ' ' + u.name + ': \"' + u.text.substring(0, 80) + '\"\\n   _' + (u.note || '') + '_\\n';",
    "                            });",
    "                            await sock.sendMessage(from, { text: uOut });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'aboutme') {"
].join('\n');

patch('commands',
    () => s.includes("cmd === 'mirror'"),
    "} else if (cmd === 'aboutme') {",
    newCommands
);

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function (x) { console.log('  ' + x); });
