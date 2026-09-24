const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
const steps = [];

function patch(name, condition, from, to) {
    if (condition()) { steps.push('skip ' + name); return; }
    if (!s.includes(from)) { steps.push('FAIL ' + name); return; }
    s = s.split(from).join(to);
    steps.push('ok ' + name);
}

// 1. require
patch('require',
    () => s.includes("require('./unique_features')"),
    "var longTermMemory = require('./long_term_memory');",
    "var longTermMemory = require('./long_term_memory');\nvar uniqueFeatures = require('./unique_features');"
);

// 2. Bump groupChat cap from 80 to 500 so onThisDay has history
patch('chat-cap',
    () => s.includes('arr.length > 500'),
    'while (arr.length > 80) arr.shift();',
    'while (arr.length > 500) arr.shift();'
);

// 3. Add the 5 new commands right before the .aboutme block
patch('commands',
    () => s.includes("cmd === 'dream'"),
    "} else if (cmd === 'aboutme') {",
    "} else if (cmd === 'dream') {\n" +
    "                    var dreamCtx = recentGroupContext(from, 50);\n" +
    "                    if (!dreamCtx || dreamCtx.length < 50) {\n" +
    "                        await sock.sendMessage(from, { text: '🌙 Not enough recent chat to dream about yet.' }, { quoted: msg });\n" +
    "                    } else {\n" +
    "                        var dreamText = await uniqueFeatures.dream(askAI, dreamCtx);\n" +
    "                        await sock.sendMessage(from, { text: '🌙 *GROUP DREAM*\\n\\n' + (dreamText || 'The dream faded...'), }, { quoted: msg });\n" +
    "                    }\n" +
    "                } else if (cmd === 'onthisday' || cmd === 'otd') {\n" +
    "                    var otd = uniqueFeatures.onThisDay(db, from);\n" +
    "                    var otdOut = '⏳ *ON THIS DAY*\\n\\n';\n" +
    "                    var any = false;\n" +
    "                    otd.forEach(function (bucket) {\n" +
    "                        if (!bucket.messages.length) return;\n" +
    "                        any = true;\n" +
    "                        otdOut += '*' + bucket.label + '*\\n';\n" +
    "                        bucket.messages.forEach(function (m) {\n" +
    "                            otdOut += '  • ' + m.name + ': ' + m.text.substring(0, 100) + '\\n';\n" +
    "                        });\n" +
    "                        otdOut += '\\n';\n" +
    "                    });\n" +
    "                    if (!any) otdOut += 'No messages from 7 days, 30 days, or 1 year ago yet. Keep chatting.';\n" +
    "                    await sock.sendMessage(from, { text: otdOut }, { quoted: msg });\n" +
    "                } else if (cmd === 'vibe') {\n" +
    "                    var vibeCtx = recentGroupContext(from, 30);\n" +
    "                    if (!vibeCtx) {\n" +
    "                        await sock.sendMessage(from, { text: '🌡️ Nothing to read yet.' }, { quoted: msg });\n" +
    "                    } else {\n" +
    "                        var vibeOut = await uniqueFeatures.vibe(askAI, vibeCtx);\n" +
    "                        await sock.sendMessage(from, { text: vibeOut || '🌡️ No reading.' }, { quoted: msg });\n" +
    "                    }\n" +
    "                } else if (cmd === 'predict') {\n" +
    "                    var predCtx = recentGroupContext(from, 40);\n" +
    "                    var memberNames = (meta.participants || []).map(function (p) {\n" +
    "                        return (p.notify || '').split('@')[0];\n" +
    "                    }).filter(Boolean).slice(0, 30);\n" +
    "                    if (!predCtx) {\n" +
    "                        await sock.sendMessage(from, { text: '🔮 Need more chat before I can predict.' }, { quoted: msg });\n" +
    "                    } else {\n" +
    "                        var predOut = await uniqueFeatures.predict(askAI, predCtx, memberNames);\n" +
    "                        await sock.sendMessage(from, { text: '🔮 *GROUP PREDICTIONS*\\n\\n' + (predOut || 'Not clear.'), }, { quoted: msg });\n" +
    "                    }\n" +
    "                } else if (cmd === 'ritual') {\n" +
    "                    var ritCtx = recentGroupContext(from, 50);\n" +
    "                    var ritName = meta.subject || 'this group';\n" +
    "                    if (!ritCtx || ritCtx.length < 50) {\n" +
    "                        await sock.sendMessage(from, { text: '🕯️ Not enough culture here yet. Chat more!' }, { quoted: msg });\n" +
    "                    } else {\n" +
    "                        var ritOut = await uniqueFeatures.ritual(askAI, ritCtx, ritName);\n" +
    "                        await sock.sendMessage(from, { text: ritOut || '🕯️ No ritual found.' }, { quoted: msg });\n" +
    "                    }\n" +
    "                } else if (cmd === 'aboutme') {"
);

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function(x){ console.log('  ' + x); });
