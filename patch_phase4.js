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
    () => s.includes("require('./power_features')"),
    "var uniqueFeatures3 = require('./unique_features3');",
    "var uniqueFeatures3 = require('./unique_features3');\nvar power = require('./power_features');"
);

// 2. db keys
patch('db-keys',
    () => s.includes('guardianLog:'),
    "    timeCapsules: [],\n    groupDNA: {}",
    "    timeCapsules: [],\n    groupDNA: {},\n    relationshipGraph: {},\n    guardianLog: {},\n    guardianCooldown: {}"
);

// 3. ensure
patch('ensure',
    () => s.includes('power.ensure(db);'),
    "uniqueFeatures3.ensure(db);",
    "uniqueFeatures3.ensure(db);\npower.ensure(db);"
);

// 4. relationship tracking + guardian — inject right after addGroupMessage call
patch('tracker',
    () => s.includes('power.trackRelation('),
    "addGroupMessage(from, pn || '@' + sn, text);\n                    scanGroupLore(from).catch(function () {});",
    "addGroupMessage(from, pn || '@' + sn, text);\n                    scanGroupLore(from).catch(function () {});\n                    // Relationship: mentions\n                    if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.mentionedJid) {\n                        msg.message.extendedTextMessage.contextInfo.mentionedJid.forEach(function (mj) {\n                            if (mj !== sender) power.trackRelation(db, from, sender, mj, 'mention');\n                        });\n                    }\n                    // Relationship: reply\n                    if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.participant) {\n                        var rp = msg.message.extendedTextMessage.contextInfo.participant;\n                        if (rp !== sender) power.trackRelation(db, from, sender, rp, 'reply');\n                    }"
);

// 5. Guardian — after relationship tracking
patch('guardian',
    () => s.includes('power.guardianCheck('),
    "if (rp !== sender) power.trackRelation(db, from, sender, rp, 'reply');\n                    }",
    "if (rp !== sender) power.trackRelation(db, from, sender, rp, 'reply');\n                    }\n                    // Silent Guardian\n                    if (!msg.key.fromMe && text.length > 6) {\n                        power.guardianCheck(sock, db, from, sender, pn || null, text).catch(function (e) { console.log('[GUARDIAN]', e.message); });\n                    }"
);

// 6. commands
var newCommands = [
    "} else if (cmd === 'relations' || cmd === 'rel') {",
    "                    var relWho = tgt || sender;",
    "                    var relData = power.getRelations(db, from, relWho);",
    "                    var relOut = '\\uD83D\\uDD78 *RELATIONSHIPS for @' + num(relWho) + '*\\n\\n';",
    "                    if (!relData.outgoing.length && Object.keys(relData.incoming).length === 0) {",
    "                        relOut += 'No relationship data yet. Chat more!';",
    "                    } else {",
    "                        if (relData.outgoing.length) {",
    "                            relOut += '*Talks to:*\\n';",
    "                            relData.outgoing.slice(0, 5).forEach(function (p) {",
    "                                relOut += '\\u2022 @' + num(p.jid) + ' \\u2014 ' + p.score + ' pts (' + p.mentions + ' mentions, ' + p.replies + ' replies)\\n';",
    "                            });",
    "                        }",
    "                        var incomingKeys = Object.keys(relData.incoming);",
    "                        if (incomingKeys.length) {",
    "                            incomingKeys.sort(function (a, b) { return relData.incoming[b] - relData.incoming[a]; });",
    "                            relOut += '\\n*Talked about by:*\\n';",
    "                            incomingKeys.slice(0, 5).forEach(function (j) {",
    "                                relOut += '\\u2022 @' + num(j) + ' \\u2014 ' + relData.incoming[j] + ' pts\\n';",
    "                            });",
    "                        }",
    "                    }",
    "                    var relMentions = [relWho];",
    "                    relData.ids.slice(0, 8).forEach(function (j) { if (relMentions.indexOf(j) === -1) relMentions.push(j); });",
    "                    await sock.sendMessage(from, { text: relOut, mentions: relMentions }, { quoted: msg });",
    "                } else if (cmd === 'connectors' || cmd === 'hubs') {",
    "                    var conn = power.findConnectors(db, from, 10);",
    "                    if (!conn.length) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDD78 No connection data yet.' });",
    "                    } else {",
    "                        var connOut = '\\uD83D\\uDD78 *TOP CONNECTORS*\\n\\n_The people who hold this group together_\\n\\n';",
    "                        var connMentions = [];",
    "                        conn.forEach(function (c, i) {",
    "                            connOut += (i + 1) + '. @' + num(c.jid) + ' \\u2014 ' + c.score + ' pts\\n';",
    "                            connMentions.push(c.jid);",
    "                        });",
    "                        await sock.sendMessage(from, { text: connOut, mentions: connMentions });",
    "                    }",
    "                } else if (cmd === 'judge') {",
    "                    var jCtx = recentGroupContext(from, 50);",
    "                    if (!jCtx || jCtx.length < 80) {",
    "                        await sock.sendMessage(from, { text: '\\u2696\\uFE0F Need more context to judge.' });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\u2696\\uFE0F Reading the room...' });",
    "                        var jParts = meta.participants ? meta.participants.slice(0, 20).map(function (p) { return '@' + num(p.id); }) : [];",
    "                        var jOut = await power.judge(askAI, jCtx, jParts);",
    "                        await sock.sendMessage(from, { text: jOut || '\\u2696\\uFE0F No verdict.' }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'whois') {",
    "                    var whoisTarget = tgt || sender;",
    "                    var wprofile = power.buildCrossGroupProfile(db, whoisTarget);",
    "                    if (!wprofile) {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDF10 No cross-group data on this person yet.' });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: wprofile, mentions: [whoisTarget] }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'guardianlog') {",
    "                    if (!isA) continue;",
    "                    var gLog = (db.guardianLog && db.guardianLog[from]) || [];",
    "                    if (!gLog.length) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDEE1\\uFE0F No guardian alerts for this group yet. That\\'s good news.' });",
    "                    } else {",
    "                        var gOut = '\\uD83D\\uDEE1\\uFE0F *GUARDIAN LOG (last ' + Math.min(10, gLog.length) + ')*\\n\\n';",
    "                        gLog.slice(-10).reverse().forEach(function (entry, i) {",
    "                            gOut += (i + 1) + '. [' + entry.kind + '] ' + entry.senderName + ' \\u2014 ' + new Date(entry.at).toLocaleString() + '\\n';",
    "                            gOut += '   _' + entry.text.substring(0, 80) + '_\\n';",
    "                        });",
    "                        await sock.sendMessage(from, { text: gOut });",
    "                    }",
    "                } else if (cmd === 'aboutme') {"
].join('\n');

patch('commands',
    () => s.includes("cmd === 'judge'"),
    "} else if (cmd === 'aboutme') {",
    newCommands
);

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function (x) { console.log('  ' + x); });
