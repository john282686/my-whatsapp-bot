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
    () => s.includes("require('./unique_features5')"),
    "var uniqueFeatures4 = require('./unique_features4');",
    "var uniqueFeatures4 = require('./unique_features4');\nvar uniqueFeatures5 = require('./unique_features5');"
);

// 2. db keys
patch('db-keys',
    () => s.includes('groupAutobiography:'),
    "    predictionLedger: {},\n    dmReplies: true",
    "    predictionLedger: {},\n    dmReplies: true,\n    groupAutobiography: {},\n    oraclePredictions: {},\n    oracleScore: { hits: 0, misses: 0 }"
);

// 3. ensure
patch('ensure',
    () => s.includes('uniqueFeatures5.ensure(db);'),
    "uniqueFeatures4.ensure(db);",
    "uniqueFeatures4.ensure(db);\nuniqueFeatures5.ensure(db);"
);

// 4. commands — insert before .aboutme
var newCommands = [
    "} else if (cmd === 'multiverse' || cmd === 'mv') {",
    "                    var mvScenario = args.join(' ').trim();",
    "                    if (!mvScenario) {",
    "                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'multiverse <scenario>\\nExample: ' + PREFIX + 'multiverse we are all on a pirate ship' }, { quoted: msg });",
    "                    } else {",
    "                        var mvCtx = recentGroupContext(from, 40);",
    "                        if (!mvCtx) {",
    "                            await sock.sendMessage(from, { text: '\\uD83C\\uDF0C Need more chat first.' }, { quoted: msg });",
    "                        } else {",
    "                            var mvMembers = meta.participants ? meta.participants.slice(0, 15).map(function(p){ return p.notify || ('@' + num(p.id)); }) : [];",
    "                            await sock.sendMessage(from, { text: '\\uD83C\\uDF0C Entering parallel universe...' }, { quoted: msg });",
    "                            var mvOut = await uniqueFeatures5.multiverse(askAI, mvCtx, mvMembers, mvScenario);",
    "                            if (mvOut) await sock.sendMessage(from, { text: '\\uD83C\\uDF0C *MULTIVERSE: ' + mvScenario + '*\\n\\n' + mvOut }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'detective') {",
    "                    var detKw = args.join(' ').trim();",
    "                    if (!detKw) {",
    "                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'detective <topic>' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDD0D Investigating...' }, { quoted: msg });",
    "                        var detResult = await uniqueFeatures5.detective(askAI, db, from, detKw);",
    "                        if (!detResult) {",
    "                            await sock.sendMessage(from, { text: '\\uD83D\\uDD0D No trace of \"' + detKw + '\" in the case files.' }, { quoted: msg });",
    "                        } else {",
    "                            var detOut = detResult.narrative || ('\\uD83D\\uDD0D Found ' + detResult.found.total + ' mentions. First by ' + detResult.found.firstBy + ' on ' + new Date(detResult.found.firstAt).toLocaleString());",
    "                            await sock.sendMessage(from, { text: detOut }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'oracle') {",
    "                    var oCtx = recentGroupContext(from, 50);",
    "                    if (!oCtx || oCtx.length < 80) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDD2E The Oracle needs more context.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDD2E The Oracle is watching...' }, { quoted: msg });",
    "                        var oMembers = meta.participants ? meta.participants.slice(0, 15).map(function(p){ return p.notify || ('@' + num(p.id)); }) : [];",
    "                        var oRaw = await uniqueFeatures5.oracleNewPrediction(askAI, oCtx, oMembers);",
    "                        if (oRaw) {",
    "                            var oText = oRaw;",
    "                            var oConf = 50;",
    "                            var cm = oRaw.match(/CONFIDENCE:\\s*(\\d+)/i);",
    "                            if (cm) oConf = parseInt(cm[1], 10);",
    "                            var pm = oRaw.match(/PREDICTION:\\s*(.+)/i);",
    "                            if (pm) oText = pm[1].trim();",
    "                            var rm = oRaw.match(/REASON:\\s*(.+)/i);",
    "                            var oReason = rm ? rm[1].trim() : '';",
    "                            uniqueFeatures5.saveOracle(db, from, oText, oConf);",
    "                            saveDBNow();",
    "                            var oReply = '\\uD83D\\uDD2E *THE ORACLE SPEAKS*\\n\\n' + oText + '\\n_Confidence:_ ' + oConf + '%';",
    "                            if (oReason) oReply += '\\n_Reason:_ ' + oReason;",
    "                            await sock.sendMessage(from, { text: oReply }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'oraclescore' || cmd === 'oscore') {",
    "                    var osc = uniqueFeatures5.oracleScoreboard(db, from);",
    "                    var osOut = '\\uD83D\\uDD2E *ORACLE SCOREBOARD*\\n\\n';",
    "                    osOut += 'Accuracy: *' + osc.accuracy + '%*\\n';",
    "                    osOut += 'Wins: ' + osc.hits + ' | Losses: ' + osc.misses + ' | Open: ' + osc.open + '\\n';",
    "                    osOut += 'Total predictions: ' + osc.total;",
    "                    await sock.sendMessage(from, { text: osOut }, { quoted: msg });",
    "                } else if (cmd === 'oracleresolve' || cmd === 'oresolve') {",
    "                    if (!isA) continue;",
    "                    var orCtx = recentGroupContext(from, 60);",
    "                    if (!orCtx || orCtx.length < 100) {",
    "                        await sock.sendMessage(from, { text: 'Need more context.' });",
    "                    } else {",
    "                        var orUpdates = await uniqueFeatures5.oracleResolve(askAI, db, from, orCtx);",
    "                        saveDBNow();",
    "                        if (!orUpdates.length) {",
    "                            await sock.sendMessage(from, { text: 'No oracle predictions resolved this round.' });",
    "                        } else {",
    "                            var orOut = '\\uD83D\\uDD2E *ORACLE VERDICT*\\n\\n';",
    "                            orUpdates.forEach(function(u){",
    "                                var ic = u.status === 'hit' ? '\\u2705' : '\\u274C';",
    "                                orOut += ic + ' \"' + u.text.substring(0, 90) + '\"\\n   _' + (u.reason || '') + '_\\n';",
    "                            });",
    "                            await sock.sendMessage(from, { text: orOut });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'anomaly' || cmd === 'anomalies') {",
    "                    var an = uniqueFeatures5.anomalyScan(db, from);",
    "                    if (an.reason) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDEA8 ' + an.reason }, { quoted: msg });",
    "                    } else if (!an.anomalies || !an.anomalies.length) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDEA8 Everything normal. Recent: ' + an.recentHour + ' msgs/hr (avg ' + an.avgPerHour + ').' }, { quoted: msg });",
    "                    } else {",
    "                        var anNarr = await uniqueFeatures5.anomalyNarrative(askAI, an.anomalies);",
    "                        await sock.sendMessage(from, { text: anNarr || '\\uD83D\\uDEA8 Anomalies detected.' }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'autobiography' || cmd === 'auto') {",
    "                    var auCtx2 = recentGroupContext(from, 80);",
    "                    if (!auCtx2 || auCtx2.length < 100) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDCD6 Not enough content yet.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDCD6 Writing this chapter...' }, { quoted: msg });",
    "                        if (!db.groupAutobiography[from]) db.groupAutobiography[from] = { chapters: [] };",
    "                        var prevSummary = db.groupAutobiography[from].chapters.slice(-1).map(function(c){ return c.text.substring(0, 400); }).join(' ');",
    "                        var monthLabel = new Date().toLocaleString('en', { month: 'long', year: 'numeric' });",
    "                        var chOut = await uniqueFeatures5.autobiographyChapter(askAI, auCtx2, meta.subject || 'this group', prevSummary, monthLabel);",
    "                        if (chOut) {",
    "                            db.groupAutobiography[from].chapters.push({",
    "                                month: monthLabel,",
    "                                text: chOut,",
    "                                createdAt: Date.now()",
    "                            });",
    "                            saveDBNow();",
    "                            await sock.sendMessage(from, { text: '\\uD83D\\uDCD6 *CHAPTER: ' + monthLabel + '*\\n\\n' + chOut }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'chapters') {",
    "                    var chaps = (db.groupAutobiography && db.groupAutobiography[from] && db.groupAutobiography[from].chapters) || [];",
    "                    if (!chaps.length) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDCD6 No chapters yet. Run ' + PREFIX + 'autobiography first.' });",
    "                    } else {",
    "                        var chList = '\\uD83D\\uDCD6 *AUTOBIOGRAPHY CHAPTERS*\\n\\n';",
    "                        chaps.forEach(function(c, i){",
    "                            chList += (i+1) + '. ' + c.month + ' \\u2014 ' + new Date(c.createdAt).toLocaleDateString() + '\\n';",
    "                        });",
    "                        await sock.sendMessage(from, { text: chList });",
    "                    }",
    "                } else if (cmd === 'aboutme') {"
].join('\n');

patch('commands',
    () => s.includes("cmd === 'multiverse'"),
    "} else if (cmd === 'aboutme') {",
    newCommands
);

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function(x){ console.log('  ' + x); });
