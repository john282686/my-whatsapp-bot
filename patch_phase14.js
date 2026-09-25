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
    () => s.includes("require('./unique_features13')"),
    "var uniqueFeatures12 = require('./unique_features12');",
    "var uniqueFeatures12 = require('./unique_features12');\nvar uniqueFeatures13 = require('./unique_features13');"
);

patch('db-keys',
    () => s.includes('stockMarket:'),
    "    groupNovel: {},\n    memoryLeaks: {},\n    foundersArchive: {},\n    deepMirror: {},\n    watcherArchive: {}",
    "    groupNovel: {},\n    memoryLeaks: {},\n    foundersArchive: {},\n    deepMirror: {},\n    watcherArchive: {},\n    stockMarket: {},\n    futureLetters: [],\n    reversePolls: {},\n    anthropologist: {}"
);

patch('ensure',
    () => s.includes('uniqueFeatures13.ensure(db);'),
    "uniqueFeatures12.ensure(db);",
    "uniqueFeatures12.ensure(db);\nuniqueFeatures13.ensure(db);"
);

// Hook: stock market drift on every message
patch('stock-hook',
    () => s.includes('uniqueFeatures13.updatePrices('),
    "if (uniqueFeatures10.isSilent(db, from)) uniqueFeatures10.accumulateSilent(db, from, pn || ('@' + sn), text);",
    "if (uniqueFeatures10.isSilent(db, from)) uniqueFeatures10.accumulateSilent(db, from, pn || ('@' + sn), text);\n                    uniqueFeatures13.updatePrices(db, from);\n                    uniqueFeatures13.addCoins(db, from, sender, 5);"
);

// Hook: deliver future letters periodically (every 15 min)
patch('letter-scheduler',
    () => s.includes('uniqueFeatures13.deliverDueLetters'),
    "console.log('[CAPSULE] delivered ' + dueC.length);",
    "console.log('[CAPSULE] delivered ' + dueC.length);\n        try {\n            var lettersSent = await uniqueFeatures13.deliverDueLetters(runningSock, db);\n            if (lettersSent) console.log('[LETTERS] delivered ' + lettersSent);\n        } catch (e) { console.log('[LETTERS]', e.message); }"
);

var newCommands = [
    "} else if (cmd === 'market' || cmd === 'stocks') {",
    "                    uniqueFeatures13.updatePrices(db, from);",
    "                    saveDBNow();",
    "                    await sock.sendMessage(from, { text: uniqueFeatures13.renderStockMarket(db, from) }, { quoted: msg });",
    "                } else if (cmd === 'wallet' || cmd === 'coins') {",
    "                    await sock.sendMessage(from, { text: uniqueFeatures13.renderWallet(db, from, sender) }, { quoted: msg });",
    "                } else if (cmd === 'buy') {",
    "                    var bTarget = tgt;",
    "                    var bShares = parseInt(args[1], 10) || parseInt(args[0], 10) || 1;",
    "                    if (!bTarget) {",
    "                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'buy @user <shares>' }, { quoted: msg });",
    "                    } else {",
    "                        var bResult = uniqueFeatures13.buyStock(db, from, sender, pn || ('@' + sn), bTarget, bShares);",
    "                        if (!bResult) await sock.sendMessage(from, { text: '\\u274C Stock not found.' }, { quoted: msg });",
    "                        else if (bResult.error === 'insufficient') await sock.sendMessage(from, { text: '\\u274C Not enough coins. Need ' + bResult.need + ', you have ' + bResult.have }, { quoted: msg });",
    "                        else {",
    "                            saveDBNow();",
    "                            await sock.sendMessage(from, { text: '\\u2705 Bought ' + bResult.shares + ' shares for ' + bResult.cost + ' coins. Balance: ' + bResult.newBalance });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'letter') {",
    "                    var lDays = parseInt(args[0], 10);",
    "                    if (!lDays || lDays < 1 || lDays > 3650) {",
    "                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'letter <days> <your message>\\nExample: ' + PREFIX + 'letter 90 Hey future me, hope you\\'re winning.' }, { quoted: msg });",
    "                    } else {",
    "                        var lText = args.slice(1).join(' ').trim();",
    "                        if (!lText) {",
    "                            await sock.sendMessage(from, { text: 'You need to write the letter.' }, { quoted: msg });",
    "                        } else {",
    "                            uniqueFeatures13.queueFutureLetter(db, from, sender, pn || ('@' + sn), lText, lDays);",
    "                            saveDBNow();",
    "                            await sock.sendMessage(from, { text: '\\uD83D\\uDC8C Letter saved. I will deliver it to you in ' + lDays + ' days.' }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'poll') {",
    "                    var pQuestion = args.join(' ').trim();",
    "                    if (!pQuestion) {",
    "                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'poll <question>\\nOptions separated by |\\nExample: ' + PREFIX + 'poll Who\\'s the funniest? |Favor |Dani |B.B.9' }, { quoted: msg });",
    "                    } else {",
    "                        var parts = pQuestion.split('|').map(function (x) { return x.trim(); }).filter(Boolean);",
    "                        if (parts.length < 3) {",
    "                            await sock.sendMessage(from, { text: 'Need at least 3 parts: question |option1 |option2 ...' }, { quoted: msg });",
    "                        } else {",
    "                            var pQ = parts[0];",
    "                            var pOpts = parts.slice(1);",
    "                            await sock.sendMessage(from, { text: '\\uD83C\\uDFAF Making reverse predictions...' }, { quoted: msg });",
    "                            var pMembers = {};",
    "                            if (db.memory && db.memory[from]) {",
    "                                Object.keys(db.memory[from]).forEach(function (jid) {",
    "                                    var m = db.memory[from][jid];",
    "                                    if (m && m.name && (m.count || 0) > 3) pMembers[m.name] = jid;",
    "                                });",
    "                            }",
    "                            var pMemNames = Object.keys(pMembers).slice(0, 15);",
    "                            var pRaw = await uniqueFeatures13.predictPolls(askAI, db, from, pQ, pOpts, pMemNames);",
    "                            var preds = {};",
    "                            if (pRaw) {",
    "                                String(pRaw).split('\\n').forEach(function (l) {",
    "                                    var m = l.match(/^\\s*(.+?)\\s*\\|\\s*(.+?)\\s*$/);",
    "                                    if (m) preds[m[1].trim()] = m[2].trim();",
    "                                });",
    "                            }",
    "                            var pId = uniqueFeatures13.saveReversePoll(db, from, pQ, pOpts, preds);",
    "                            saveDBNow();",
    "                            var pOut = '\\uD83C\\uDFAF *REVERSE POLL*\\n\\n_Question:_ ' + pQ + '\\n\\n_Options:_ ' + pOpts.join(' / ') + '\\n\\n_Bot\\'s pre-vote predictions (sealed):_\\n';",
    "                            Object.keys(preds).forEach(function (n) { pOut += '\\u2022 ' + n + ' \\u2192 ' + preds[n] + '\\n'; });",
    "                            pOut += '\\nPoll ID: ' + pId + '\\nTo vote, reply with: ' + PREFIX + 'vote ' + pId + ' <option>';",
    "                            await sock.sendMessage(from, { text: pOut }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'vote') {",
    "                    var vId = args[0];",
    "                    var vChoice = args.slice(1).join(' ').trim();",
    "                    if (!vId || !vChoice) {",
    "                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'vote <pollId> <option>' }, { quoted: msg });",
    "                    } else {",
    "                        var vName = pn || ('@' + sn);",
    "                        var vOk = uniqueFeatures13.recordPollVote(db, from, vId, vName, vChoice);",
    "                        if (!vOk) await sock.sendMessage(from, { text: '\\u274C Poll not found.' }, { quoted: msg });",
    "                        else { saveDBNow(); await sock.sendMessage(from, { text: '\\u2705 Vote recorded.' }); }",
    "                    }",
    "                } else if (cmd === 'polldone') {",
    "                    var pdId = args[0];",
    "                    if (!pdId) { await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'polldone <pollId>' }, { quoted: msg }); }",
    "                    else {",
    "                        var score = uniqueFeatures13.scoreReversePoll(db, from, pdId);",
    "                        if (!score) await sock.sendMessage(from, { text: '\\u274C Poll not found.' }, { quoted: msg });",
    "                        else {",
    "                            await sock.sendMessage(from, { text: '\\uD83C\\uDFAF *BOT ACCURACY*\\n\\nGuessed right: ' + score.hits + '/' + score.total + ' (' + score.accuracy + '%)' });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'anthropologist' || cmd === 'study') {",
    "                    var aTarget = tgt || sender;",
    "                    var aTargetName = (db.memory[from] && db.memory[from][aTarget] && db.memory[from][aTarget].name) || ('@' + num(aTarget));",
    "                    await sock.sendMessage(from, { text: '\\uD83D\\uDD2C Studying @' + num(aTarget) + '...', mentions: [aTarget] }, { quoted: msg });",
    "                    var aRep = await uniqueFeatures13.anthropologist(askAI, db, from, aTarget, aTargetName, meta.subject || 'this group');",
    "                    if (aRep) await sock.sendMessage(from, { text: aRep, mentions: [aTarget] }, { quoted: msg });",
    "                } else if (cmd === 'forgotten') {",
    "                    var fPick = uniqueFeatures13.forgetRandom(db, from);",
    "                    if (!fPick) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDD70 Nothing forgotten yet. Need 2+ weeks of history.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: uniqueFeatures13.renderForgotten(fPick) }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'aboutme') {"
].join('\n');

patch('commands',
    () => s.includes("cmd === 'market'"),
    "} else if (cmd === 'aboutme') {",
    newCommands
);

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function(x){ console.log('  ' + x); });
