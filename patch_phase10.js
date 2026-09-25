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
    () => s.includes("require('./unique_features9')"),
    "var uniqueFeatures8 = require('./unique_features8');",
    "var uniqueFeatures8 = require('./unique_features8');\nvar uniqueFeatures9 = require('./unique_features9');"
);

patch('db-keys',
    () => s.includes('healthPulse:'),
    "    weeklyReplayLast: {},\n    ghostAlerts: {}",
    "    weeklyReplayLast: {},\n    ghostAlerts: {},\n    healthPulse: {},\n    moodTide: {},\n    trendHistory: {},\n    adminBriefLast: {}"
);

patch('ensure',
    () => s.includes('uniqueFeatures9.ensure(db);'),
    "uniqueFeatures8.ensure(db);",
    "uniqueFeatures8.ensure(db);\nuniqueFeatures9.ensure(db);"
);

var newCommands = [
    "} else if (cmd === 'pulse' || cmd === 'health') {",
    "                    var pCtx = recentGroupContext(from, 60);",
    "                    await sock.sendMessage(from, { text: '\\uD83D\\uDC93 Reading the pulse...' }, { quoted: msg });",
    "                    var pOut = await uniqueFeatures9.healthPulse(askAI, db, from, pCtx);",
    "                    var pRender = uniqueFeatures9.renderPulse(pOut, meta.subject || 'this group');",
    "                    await sock.sendMessage(from, { text: pRender }, { quoted: msg });",
    "                } else if (cmd === 'churn' || cmd === 'churnradar') {",
    "                    if (!isA) continue;",
    "                    var chData = uniqueFeatures9.churnRisk(db, from);",
    "                    await sock.sendMessage(from, { text: uniqueFeatures9.renderChurn(chData) }, { quoted: msg });",
    "                } else if (cmd === 'trends' || cmd === 'trendradar') {",
    "                    var tCtx = recentGroupContext(from, 60);",
    "                    if (tCtx && tCtx.length > 100) {",
    "                        var tFound = await uniqueFeatures9.extractTrends(askAI, tCtx);",
    "                        if (tFound && tFound.length) uniqueFeatures9.recordTrends(db, from, tFound);",
    "                        saveDBNow();",
    "                    }",
    "                    await sock.sendMessage(from, { text: uniqueFeatures9.renderTrends(db, from) }, { quoted: msg });",
    "                } else if (cmd === 'mood' || cmd === 'tide' || cmd === 'moodtide') {",
    "                    var mCtx = recentGroupContext(from, 60);",
    "                    if (!mCtx || mCtx.length < 100) {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDF0A Need more chat to read the mood.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDF0A Reading the mood tide...' }, { quoted: msg });",
    "                        var mNow = await uniqueFeatures9.moodTide(askAI, mCtx);",
    "                        var mRender = uniqueFeatures9.renderMoodTide(db, from, mNow);",
    "                        saveDBNow();",
    "                        await sock.sendMessage(from, { text: mRender }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'brief' || cmd === 'adminbrief') {",
    "                    if (!isA) continue;",
    "                    var bCtx = recentGroupContext(from, 60);",
    "                    await sock.sendMessage(from, { text: '\\uD83D\\uDCCB Preparing admin brief...' }, { quoted: msg });",
    "                    var bData = await uniqueFeatures9.adminBrief(askAI, db, from, meta.subject || 'this group', bCtx);",
    "                    await sock.sendMessage(from, { text: uniqueFeatures9.renderBrief(bData) }, { quoted: msg });",
    "                } else if (cmd === 'sendbrief') {",
    "                    if (!isA) continue;",
    "                    var sbCtx = recentGroupContext(from, 60);",
    "                    var sbData = await uniqueFeatures9.adminBrief(askAI, db, from, meta.subject || 'this group', sbCtx);",
    "                    var sbText = uniqueFeatures9.renderBrief(sbData);",
    "                    var adminsList = (meta.participants || []).filter(function (p) { return p.admin; }).map(function (p) { return p.id; });",
    "                    var sent = 0;",
    "                    for (var ai = 0; ai < adminsList.length; ai++) {",
    "                        try { await sock.sendMessage(adminsList[ai], { text: sbText }); sent++; } catch (e) {}",
    "                    }",
    "                    await sock.sendMessage(from, { text: '\\u2705 Brief sent to ' + sent + ' admin(s).' }, { quoted: msg });",
    "                } else if (cmd === 'aboutme') {"
].join('\n');

patch('commands',
    () => s.includes("cmd === 'pulse'"),
    "} else if (cmd === 'aboutme') {",
    newCommands
);

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function(x){ console.log('  ' + x); });
