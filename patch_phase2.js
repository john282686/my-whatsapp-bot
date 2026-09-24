const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
const steps = [];

function patch(name, cond, from, to) {
    if (cond()) { steps.push('skip ' + name); return; }
    if (!s.includes(from)) {
        steps.push('FAIL ' + name);
        return;
    }
    s = s.split(from).join(to);
    steps.push('ok ' + name);
}

// ============ PATCH 1 — require ============
patch('require',
    () => s.includes("require('./unique_features2')"),
    "var uniqueFeatures = require('./unique_features');",
    "var uniqueFeatures = require('./unique_features');\nvar uniqueFeatures2 = require('./unique_features2');\nvar runningSock = null;"
);

// ============ PATCH 2 — db keys ============
patch('db-keys',
    () => s.includes('timeCapsules:'),
    "    longTermMemory: {},\n    ltmInbox: {}",
    "    longTermMemory: {},\n    ltmInbox: {},\n    timeCapsules: []"
);

// ============ PATCH 3 — DM handler ============
patch('dm-handler',
    () => s.includes('var isDM = '),
    "if (!from) continue;\n                if (!String(from).endsWith('@g.us')) continue;",
    "if (!from) continue;\n                var isDM = !String(from).endsWith('@g.us');\n                if (isDM) {\n                    if (msg.key.fromMe) continue;\n                    var dmText = (msg.message.conversation) || (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) || '';\n                    if (dmText && dmText.length > 0) {\n                        try {\n                            var dmCtx = longTermMemory.recall(db, from, dmText);\n                            var dmHist = getChatHistory(from, from);\n                            var dmPrompt = (dmCtx ? 'THINGS YOU REMEMBER ABOUT THIS PERSON (long-term):\\n' + dmCtx + '\\n\\n' : '') + (dmHist ? 'RECENT DM HISTORY:\\n' + dmHist + '\\n\\n' : '') + 'Person just said: ' + dmText;\n                            rememberChat(from, from, pn || null, 'user', dmText);\n                            var dmReply = await askAI(dmPrompt, { systemPrompt: PERSONA_EN + 'This is a PRIVATE DM. Be warm, chill, honest, brief.' });\n                            if (dmReply) {\n                                await sock.sendMessage(from, { text: dmReply });\n                                rememberChat(from, from, null, 'assistant', dmReply);\n                            }\n                        } catch (e) { console.log('[DM]', e.message); }\n                    }\n                    continue;\n                }\n                if (!String(from).endsWith('@g.us')) continue;"
);

// ============ PATCH 4 — commands ============
const newCommands = [
    "} else if (cmd === 'whisper') {",
    "                    var wCtx = recentGroupContext(from, 40);",
    "                    if (!wCtx || wCtx.length < 50) {",
    "                        await sock.sendMessage(from, { text: '\\uD83E\\uDD2B Not enough recent chat for a whisper yet.' });",
    "                    } else {",
    "                        var wUname = pn || ('@' + sn);",
    "                        var wText = await uniqueFeatures2.whisper(askAI, wCtx, meta.subject || 'this group', wUname);",
    "                        if (wText) {",
    "                            try {",
    "                                await sock.sendMessage(sender, { text: '\\uD83E\\uDD2B *Whisper from ' + (meta.subject || 'the group') + '*\\n\\n' + wText });",
    "                                await sock.sendMessage(from, { text: '\\uD83E\\uDD2B Check your DMs @' + sn + '.', mentions: [sender] });",
    "                            } catch (e) {",
    "                                await sock.sendMessage(from, { text: '\\uD83E\\uDD2B I cannot DM you. Send me any message in private first, then try again.' });",
    "                            }",
    "                        }",
    "                    }",
    "                } else if (cmd === 'checkin' && tgt) {",
    "                    var ciName = '@' + num(tgt);",
    "                    var ciFacts = longTermMemory.recall(db, tgt, 'personality interests recent', 8);",
    "                    var ciLast = (db.memory[from] && db.memory[from][tgt] && db.memory[from][tgt].lastSeen) || (Date.now() - 7 * 24 * 60 * 60 * 1000);",
    "                    var ciText = await uniqueFeatures2.checkIn(askAI, ciName, ciFacts, ciLast);",
    "                    if (ciText) {",
    "                        try {",
    "                            await sock.sendMessage(tgt, { text: ciText });",
    "                            await sock.sendMessage(from, { text: '\\u2705 Sent a warm check-in to @' + num(tgt), mentions: [tgt] });",
    "                        } catch (e) {",
    "                            await sock.sendMessage(from, { text: '\\u274C Could not DM @' + num(tgt) + '.' });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'weathermap' || cmd === 'wm') {",
    "                    var wmCtx = recentGroupContext(from, 40);",
    "                    if (!wmCtx || wmCtx.length < 30) {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDF21 Need more chat first.' });",
    "                    } else {",
    "                        var wmSeen = {};",
    "                        var wmParts = [];",
    "                        groupBrain(from).slice(-30).forEach(function (x) {",
    "                            if (x.name && !wmSeen[x.name]) { wmSeen[x.name] = true; wmParts.push(x.name); }",
    "                        });",
    "                        var wmOut = await uniqueFeatures2.weatherMap(askAI, wmCtx, wmParts.slice(0, 15));",
    "                        await sock.sendMessage(from, { text: wmOut || '\\uD83C\\uDF21 No reading.' });",
    "                    }",
    "                } else if (cmd === 'tarot') {",
    "                    var tcCtx = recentGroupContext(from, 30);",
    "                    var tcOut = await uniqueFeatures2.tarot(askAI, meta.subject || 'this group', tcCtx || '(no recent chat)');",
    "                    if (tcOut) await sock.sendMessage(from, { text: tcOut });",
    "                } else if (cmd === 'capsule') {",
    "                    var capText = args.join(' ').trim();",
    "                    if (!capText) {",
    "                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'capsule <message to deliver in 30 days>' });",
    "                    } else {",
    "                        if (!db.timeCapsules) db.timeCapsules = [];",
    "                        db.timeCapsules.push({ groupId: from, senderId: sender, senderName: pn || ('@' + sn), text: capText, createdAt: Date.now(), deliverAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });",
    "                        saveDBNow();",
    "                        await sock.sendMessage(from, { text: '\\u23F3 Time capsule saved. I will deliver it in 30 days.' });",
    "                    }",
    "                } else if (cmd === 'aboutme') {"
].join('\n');

patch('commands',
    () => s.includes("cmd === 'whisper'"),
    "} else if (cmd === 'aboutme') {",
    newCommands
);

// ============ PATCH 5 — set runningSock inside startBot ============
patch('running-sock',
    () => s.includes('runningSock = sock;'),
    "var sock = makeWASocket({\n        auth: st.state,",
    "var sock = makeWASocket({\n        auth: st.state,"
);
// manually set it after socket creation:
if (!s.includes('runningSock = sock;')) {
    s = s.replace(
        "sock.ev.on('creds.update', st.saveCreds);",
        "runningSock = sock;\n    sock.ev.on('creds.update', st.saveCreds);"
    );
    steps.push('ok running-sock-assign');
}

// ============ PATCH 6 — capsule loop at module level ============
const capsuleLoop = `

// ===== TIME CAPSULE LOOP =====
setInterval(async function () {
    try {
        if (!runningSock) return;
        if (!db.timeCapsules || !db.timeCapsules.length) return;
        var nowC = Date.now();
        var dueC = db.timeCapsules.filter(function (c) { return c.deliverAt <= nowC; });
        if (!dueC.length) return;
        db.timeCapsules = db.timeCapsules.filter(function (c) { return c.deliverAt > nowC; });
        saveDBNow();
        for (var ci = 0; ci < dueC.length; ci++) {
            var cap = dueC[ci];
            try {
                var daysAgo = Math.floor((nowC - cap.createdAt) / (1000 * 60 * 60 * 24));
                var head = '\\u23F3 *TIME CAPSULE OPENED*\\n\\nA message from ' + (cap.senderName || 'someone') + ' (' + daysAgo + ' days ago):\\n\\n';
                var body = '\\u201C' + cap.text + '\\u201D';
                await runningSock.sendMessage(cap.groupId, { text: head + body });
            } catch (e) { console.log('[CAPSULE]', e.message); }
        }
        console.log('[CAPSULE] delivered ' + dueC.length);
    } catch (e) { console.log('[CAPSULE-LOOP]', e.message); }
}, 60 * 60 * 1000);
`;

if (!s.includes('TIME CAPSULE LOOP')) {
    s = s + capsuleLoop;
    steps.push('ok capsule-loop');
} else {
    steps.push('skip capsule-loop');
}

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function (x) { console.log('  ' + x); });
