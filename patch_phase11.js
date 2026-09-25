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
    () => s.includes("require('./unique_features10')"),
    "var uniqueFeatures9 = require('./unique_features9');",
    "var uniqueFeatures9 = require('./unique_features9');\nvar uniqueFeatures10 = require('./unique_features10');"
);

patch('db-keys',
    () => s.includes('silentMode:'),
    "    healthPulse: {},\n    moodTide: {},\n    trendHistory: {},\n    adminBriefLast: {}",
    "    healthPulse: {},\n    moodTide: {},\n    trendHistory: {},\n    adminBriefLast: {},\n    silentMode: {},\n    silentAccum: {},\n    activePersona: {},\n    selfAuditLog: []"
);

patch('ensure',
    () => s.includes('uniqueFeatures10.ensure(db);'),
    "uniqueFeatures9.ensure(db);",
    "uniqueFeatures9.ensure(db);\nuniqueFeatures10.ensure(db);"
);

// Hook: silent accumulate + persona awareness
// Insert into the auto-reply path — before it fires, check silent mode and persona
patch('silent-hook',
    () => s.includes('uniqueFeatures10.isSilent('),
    "var shouldAutoReply =\n                    db.autoReply[from] !== false &&",
    "var shouldAutoReply =\n                    db.autoReply[from] !== false &&\n                    !uniqueFeatures10.isSilent(db, from) &&"
);

// Accumulate silent messages: hook into the groupBrain capture block
patch('accumulate',
    () => s.includes('uniqueFeatures10.accumulateSilent('),
    "addGroupMessage(from, pn || '@' + sn, text);",
    "addGroupMessage(from, pn || '@' + sn, text);\n                    if (uniqueFeatures10.isSilent(db, from)) uniqueFeatures10.accumulateSilent(db, from, pn || ('@' + sn), text);"
);

var newCommands = [
    "} else if (cmd === 'echo') {",
    "                    var eCtx = recentGroupContext(from, 50);",
    "                    if (!eCtx || eCtx.length < 80) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDD04 Need more chat first.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDD04 Listening...' }, { quoted: msg });",
    "                        var eOut = await uniqueFeatures10.echo(askAI, eCtx, meta.subject || 'this group');",
    "                        if (eOut) await sock.sendMessage(from, { text: eOut }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'silent' || cmd === 'silentmode') {",
    "                    if (!isA) continue;",
    "                    if (args[0] === 'off' || args[0] === 'cancel') {",
    "                        delete db.silentMode[from];",
    "                        db.silentAccum[from] = [];",
    "                        saveDBNow();",
    "                        await sock.sendMessage(from, { text: '\\uD83E\\uDD10 Silent mode cancelled.' }, { quoted: msg });",
    "                    } else {",
    "                        var sHours = args[0] ? parseInt(args[0], 10) : 24;",
    "                        if (isNaN(sHours) || sHours < 1 || sHours > 168) sHours = 24;",
    "                        uniqueFeatures10.startSilent(db, from, sHours);",
    "                        saveDBNow();",
    "                        await sock.sendMessage(from, { text: '\\uD83E\\uDD10 Silent mode ON for ' + sHours + ' hours. I will not reply until then, but I will listen.\\nAfter ' + sHours + 'h I will post a letter to the group.' }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'letter' || cmd === 'silentletter') {",
    "                    if (!isA) continue;",
    "                    var lNow = uniqueFeatures10.isSilent(db, from);",
    "                    if (lNow) {",
    "                        var lRemaining = Math.max(0, Math.round((db.silentMode[from].until - Date.now()) / (60 * 60 * 1000)));",
    "                        await sock.sendMessage(from, { text: '\\uD83E\\uDD10 Still silent. ' + lRemaining + 'h remaining. Use ' + PREFIX + 'silent off to cancel and post immediately.' }, { quoted: msg });",
    "                    } else {",
    "                        var lOut = await uniqueFeatures10.silentLetter(askAI, db, from, meta.subject || 'this group');",
    "                        if (!lOut) {",
    "                            await sock.sendMessage(from, { text: '\\uD83D\\uDC8C No accumulated messages to write a letter from.' }, { quoted: msg });",
    "                        } else {",
    "                            saveDBNow();",
    "                            await sock.sendMessage(from, { text: lOut });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'persona') {",
    "                    if (!isA) continue;",
    "                    var pArg = (args[0] || '').toLowerCase();",
    "                    if (pArg === 'off' || pArg === 'clear') {",
    "                        uniqueFeatures10.clearPersona(db, from);",
    "                        saveDBNow();",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDFAD Persona cleared. Back to normal Chidi.' }, { quoted: msg });",
    "                    } else if (pArg === 'list') {",
    "                        var pList = Object.keys(uniqueFeatures10.PERSONAS).join(', ');",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDFAD Available personas:\\n' + pList + '\\n\\nUsage: ' + PREFIX + 'persona <name> [hours]' }, { quoted: msg });",
    "                    } else if (uniqueFeatures10.PERSONAS[pArg]) {",
    "                        var pHours = args[1] ? parseInt(args[1], 10) : 24;",
    "                        if (isNaN(pHours) || pHours < 1 || pHours > 168) pHours = 24;",
    "                        uniqueFeatures10.setPersona(db, from, pArg, pHours);",
    "                        saveDBNow();",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDFAD Persona switched to *' + pArg + '* for ' + pHours + ' hours.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDFAD Unknown persona. Try: ' + PREFIX + 'persona list' }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'selfaudit' || cmd === 'audit') {",
    "                    if (!isA) continue;",
    "                    var aFindings = uniqueFeatures10.auditBotActions(db, from);",
    "                    await sock.sendMessage(from, { text: uniqueFeatures10.renderAudit(aFindings, meta.subject || 'this group') }, { quoted: msg });",
    "                } else if (cmd === 'consensus') {",
    "                    var cQuestion = args.join(' ').trim();",
    "                    if (!cQuestion) {",
    "                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'consensus <question>\\nExample: ' + PREFIX + 'consensus will Ali come back to the group?' }, { quoted: msg });",
    "                    } else {",
    "                        var cCtx = recentGroupContext(from, 50);",
    "                        await sock.sendMessage(from, { text: '\\u2696\\uFE0F Consulting weighted voices...' }, { quoted: msg });",
    "                        var cResult = await uniqueFeatures10.askConsensus(askAI, db, from, cQuestion, cCtx);",
    "                        if (cResult && cResult.error) {",
    "                            await sock.sendMessage(from, { text: '\\u2696\\uFE0F ' + cResult.error }, { quoted: msg });",
    "                        } else if (cResult && cResult.answer) {",
    "                            await sock.sendMessage(from, { text: cResult.answer }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'aboutme') {"
].join('\n');

patch('commands',
    () => s.includes("cmd === 'echo'"),
    "} else if (cmd === 'aboutme') {",
    newCommands
);

// Persona should override PERSONA_EN / PERSONA_PIDGIN in auto-reply & @bot reply
// Simplest: append persona instruction to sp
patch('persona-override',
    () => s.includes('uniqueFeatures10.getPersona(db, from)'),
    "var sp = pid ? PERSONA_PIDGIN + cx : PERSONA_EN + cx;",
    "var activeP = uniqueFeatures10.getPersona(db, from);\n                        var personaAdd = activeP ? ('\\n\\nPERSONA MODE: ' + activeP.name + ' \\u2014 ' + uniqueFeatures10.PERSONAS[activeP.name]) : '';\n                        var sp = (pid ? PERSONA_PIDGIN + cx : PERSONA_EN + cx) + personaAdd;"
);

patch('persona-override-2',
    () => s.includes('uniqueFeatures10.getPersona(db, from)') && s.indexOf('activeP') !== -1,
    "var sp2 = pid2 ? PERSONA_PIDGIN + cx2 : PERSONA_EN + cx2;",
    "var activeP2 = uniqueFeatures10.getPersona(db, from);\n                        var personaAdd2 = activeP2 ? ('\\n\\nPERSONA MODE: ' + activeP2.name + ' \\u2014 ' + uniqueFeatures10.PERSONAS[activeP2.name]) : '';\n                        var sp2 = (pid2 ? PERSONA_PIDGIN + cx2 : PERSONA_EN + cx2) + personaAdd2;"
);

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function(x){ console.log('  ' + x); });
