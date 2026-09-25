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
    () => s.includes("require('./unique_features7')"),
    "var uniqueFeatures6 = require('./unique_features6');",
    "var uniqueFeatures6 = require('./unique_features6');\nvar uniqueFeatures7 = require('./unique_features7');"
);

patch('db-keys',
    () => s.includes('confessions:'),
    "    chorusHistory: {},\n    deepTimeArchive: {}",
    "    chorusHistory: {},\n    deepTimeArchive: {},\n    confessions: {},\n    confessTargets: {},\n    groupSecondLife: {}"
);

patch('ensure',
    () => s.includes('uniqueFeatures7.ensure(db);'),
    "uniqueFeatures6.ensure(db);",
    "uniqueFeatures6.ensure(db);\nuniqueFeatures7.ensure(db);"
);

// Hook into DM handler — insert confess handling before AI reply
patch('dm-confess',
    () => s.includes("dmText.indexOf('.confess')"),
    "var dmText = (msg.message.conversation) || (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) || '';",
    "var dmText = (msg.message.conversation) || (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) || '';\n" +
    "                    if (dmText && dmText.trim().toLowerCase().indexOf('.confess') === 0) {\n" +
    "                        var confText = dmText.replace(/^\\.confess/i, '').trim();\n" +
    "                        if (!confText) {\n" +
    "                            await sock.sendMessage(from, { text: '\uD83D\uDD6F\uFE0F Usage: .confess <your confession>\\nI will post it anonymously in the group.' });\n" +
    "                            continue;\n" +
    "                        }\n" +
    "                        var targetGroup = db.confessTargets && db.confessTargets.__active;\n" +
    "                        if (!targetGroup) {\n" +
    "                            await sock.sendMessage(from, { text: '\uD83D\uDD6F\uFE0F No confession room is open right now.' });\n" +
    "                            continue;\n" +
    "                        }\n" +
    "                        try {\n" +
    "                            var safe = await uniqueFeatures7.rewriteConfession(askAI, confText);\n" +
    "                            if (!safe || safe.trim().toUpperCase() === 'SKIP') {\n" +
    "                                await sock.sendMessage(from, { text: '\uD83D\uDD6F\uFE0F This confession cannot be shared safely. Try rewording it without identifying details.' });\n" +
    "                            } else {\n" +
    "                                uniqueFeatures7.queueConfession(db, targetGroup, from, pn || 'Anonymous', safe);\n" +
    "                                saveDBNow();\n" +
    "                                await sock.sendMessage(from, { text: '\uD83D\uDD6F\uFE0F Received. Your confession is in the queue.' });\n" +
    "                                console.log('[CONFESS] queued from ' + from);\n" +
    "                            }\n" +
    "                        } catch (e) {\n" +
    "                            console.log('[CONFESS]', e.message);\n" +
    "                            await sock.sendMessage(from, { text: '\uD83D\uDD6F\uFE0F Something went wrong. Try again later.' });\n" +
    "                        }\n" +
    "                        continue;\n" +
    "                    }"
);

// Add commands before .aboutme
var newCommands = [
    "} else if (cmd === 'unsaid') {",
    "                    var unCtx = recentGroupContext(from, 60);",
    "                    if (!unCtx || unCtx.length < 100) {",
    "                        await sock.sendMessage(from, { text: '\\uD83E\\uDEE5 Need more chat to read between the lines.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83E\\uDEE5 Reading the subtext...' }, { quoted: msg });",
    "                        var unMembers = meta.participants ? meta.participants.slice(0, 20).map(function(p){ return p.notify || ('@' + num(p.id)); }) : [];",
    "                        var unOut = await uniqueFeatures7.unsaid(askAI, unCtx, unMembers);",
    "                        if (unOut) await sock.sendMessage(from, { text: unOut }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'mirrorball' || cmd === 'mb') {",
    "                    var mbText = '';",
    "                    if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.quotedMessage) {",
    "                        var qm = msg.message.extendedTextMessage.contextInfo.quotedMessage;",
    "                        mbText = qm.conversation || (qm.extendedTextMessage && qm.extendedTextMessage.text) || '';",
    "                    }",
    "                    if (!mbText) mbText = args.join(' ').trim();",
    "                    if (!mbText) {",
    "                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'mirrorball (reply to a message) or ' + PREFIX + 'mirrorball <text>' }, { quoted: msg });",
    "                    } else {",
    "                        var mbPeople = meta.participants ? meta.participants.slice(0, 20).map(function(p){ return p.notify || ('@' + num(p.id)); }) : [];",
    "                        await sock.sendMessage(from, { text: '\\uD83E\\uDE9E The mirror is spinning...' }, { quoted: msg });",
    "                        var mbOut = await uniqueFeatures7.mirrorBall(askAI, mbText, mbPeople);",
    "                        if (mbOut) await sock.sendMessage(from, { text: mbOut }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'secondlife' || cmd === '2life') {",
    "                    var slCtx = recentGroupContext(from, 50);",
    "                    if (!slCtx || slCtx.length < 80) {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDF06 Need more chat to build a world.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDF06 Building the next generation...' }, { quoted: msg });",
    "                        if (!db.groupSecondLife) db.groupSecondLife = {};",
    "                        var slPrev = db.groupSecondLife[from] || null;",
    "                        var slMembers = meta.participants ? meta.participants.slice(0, 20).map(function(p){ return p.notify || ('@' + num(p.id)); }) : [];",
    "                        var slWorld = await uniqueFeatures7.secondLife(askAI, slCtx, slMembers, slPrev);",
    "                        if (slWorld) {",
    "                            db.groupSecondLife[from] = slWorld;",
    "                            saveDBNow();",
    "                            await sock.sendMessage(from, { text: uniqueFeatures7.renderSecondLife(slWorld) }, { quoted: msg });",
    "                        } else {",
    "                            await sock.sendMessage(from, { text: '\\uD83C\\uDF06 World generation failed.' }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'coldopen' || cmd === 'co') {",
    "                    var coCtx = recentGroupContext(from, 50);",
    "                    if (!coCtx || coCtx.length < 60) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDCFA Need more chat for a scene.' }, { quoted: msg });",
    "                    } else {",
    "                        var coCast = meta.participants ? meta.participants.slice(0, 20).map(function(p){ return p.notify || ('@' + num(p.id)); }) : [];",
    "                        var coOut = await uniqueFeatures7.coldOpen(askAI, coCtx, meta.subject || 'this group', coCast);",
    "                        if (coOut) await sock.sendMessage(from, { text: coOut }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'confessroom') {",
    "                    if (!isA) continue;",
    "                    if (!db.confessTargets) db.confessTargets = {};",
    "                    if (args[0] === 'on') {",
    "                        db.confessTargets.__active = from;",
    "                        saveDBNow();",
    "                        await sock.sendMessage(from, { text: '\uD83D\uDD6F\uFE0F Confession room OPEN.\\nMembers can DM the bot with: .confess <text>\\nPost confessions with: ' + PREFIX + 'revealconfession' }, { quoted: msg });",
    "                    } else if (args[0] === 'off') {",
    "                        if (db.confessTargets.__active === from) delete db.confessTargets.__active;",
    "                        saveDBNow();",
    "                        await sock.sendMessage(from, { text: '\uD83D\uDD6F\uFE0F Confession room CLOSED.' }, { quoted: msg });",
    "                    } else {",
    "                        var active = db.confessTargets.__active === from ? 'ON' : 'OFF';",
    "                        await sock.sendMessage(from, { text: '\uD83D\uDD6F\uFE0F Confession room: *' + active + '*\\nUsage: ' + PREFIX + 'confessroom on/off' }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'revealconfession' || cmd === 'rc') {",
    "                    if (!isA) continue;",
    "                    var conf = uniqueFeatures7.pickConfession(db, from);",
    "                    if (!conf) {",
    "                        await sock.sendMessage(from, { text: '\uD83D\uDD6F\uFE0F No confessions in the queue.' }, { quoted: msg });",
    "                    } else {",
    "                        var confOut = '\uD83D\uDD6F\uFE0F *ANONYMOUS CONFESSION*\\n\\n\"' + conf.text + '\"\\n\\n_Submitted anonymously._';",
    "                        await sock.sendMessage(from, { text: confOut });",
    "                        var arr = db.confessions[from] || [];",
    "                        db.confessions[from] = arr.filter(function(c){ return c.id !== conf.id; });",
    "                        saveDBNow();",
    "                    }",
    "                } else if (cmd === 'aboutme') {"
].join('\n');

patch('commands',
    () => s.includes("cmd === 'unsaid'"),
    "} else if (cmd === 'aboutme') {",
    newCommands
);

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function(x){ console.log('  ' + x); });
