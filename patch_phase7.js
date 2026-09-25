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
    () => s.includes("require('./unique_features6')"),
    "var uniqueFeatures5 = require('./unique_features5');",
    "var uniqueFeatures5 = require('./unique_features5');\nvar uniqueFeatures6 = require('./unique_features6');"
);

patch('db-keys',
    () => s.includes('chorusHistory:'),
    "    oracleScore: { hits: 0, misses: 0 }",
    "    oracleScore: { hits: 0, misses: 0 },\n    chorusHistory: {},\n    deepTimeArchive: {}"
);

patch('ensure',
    () => s.includes('uniqueFeatures6.ensure(db);'),
    "uniqueFeatures5.ensure(db);",
    "uniqueFeatures5.ensure(db);\nuniqueFeatures6.ensure(db);"
);

var newCommands = [
    "} else if (cmd === 'chorus') {",
    "                    var chTopic = args.join(' ').trim() || 'the state of this group';",
    "                    var chCtx = recentGroupContext(from, 50);",
    "                    await sock.sendMessage(from, { text: '\\uD83C\\uDFAD The Chorus is gathering...' }, { quoted: msg });",
    "                    var chOut = await uniqueFeatures6.chorus(askAI, chTopic, chCtx);",
    "                    if (chOut) {",
    "                        var chPretty = '\\uD83C\\uDFAD *CHORUS: ' + chTopic + '*\\n\\n' + chOut;",
    "                        await sock.sendMessage(from, { text: chPretty }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDFAD The Chorus fell silent.' }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'rhythm') {",
    "                    var rh = uniqueFeatures6.rhythm(db, from);",
    "                    await sock.sendMessage(from, { text: uniqueFeatures6.rhythmArt(rh) }, { quoted: msg });",
    "                } else if (cmd === 'weave') {",
    "                    var wvArr = groupBrain(from);",
    "                    if (!wvArr || wvArr.length < 10) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDD78 Need at least 10 recorded messages.' }, { quoted: msg });",
    "                    } else {",
    "                        var wvShuf = wvArr.slice().sort(function(){ return Math.random() - 0.5; });",
    "                        var wvPick = wvShuf.slice(0, 3);",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDD78 Weaving three random moments...' }, { quoted: msg });",
    "                        var wvOut = await uniqueFeatures6.weave(askAI, wvPick);",
    "                        if (wvOut) await sock.sendMessage(from, { text: wvOut }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'remix') {",
    "                    var rmStyle = args.join(' ').trim();",
    "                    if (!rmStyle) {",
    "                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'remix <style>\\nExamples: shakespeare, cyberpunk noir, disney musical, ancient rome' }, { quoted: msg });",
    "                    } else {",
    "                        var rmCtx = recentGroupContext(from, 40);",
    "                        if (!rmCtx) {",
    "                            await sock.sendMessage(from, { text: '\\uD83C\\uDFAD Need more recent chat.' }, { quoted: msg });",
    "                        } else {",
    "                            await sock.sendMessage(from, { text: '\\uD83C\\uDFAD Remixing in style: ' + rmStyle + '...' }, { quoted: msg });",
    "                            var rmOut = await uniqueFeatures6.remix(askAI, rmCtx, rmStyle);",
    "                            if (rmOut) await sock.sendMessage(from, { text: rmOut }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'deeptime' || cmd === 'dt') {",
    "                    var dtCtx = recentGroupContext(from, 60);",
    "                    if (!dtCtx || dtCtx.length < 80) {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDFDB Need more material to excavate.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDFDB Excavating...' }, { quoted: msg });",
    "                        var dtOut = await uniqueFeatures6.deepTime(askAI, dtCtx, meta.subject || 'this group');",
    "                        if (dtOut) await sock.sendMessage(from, { text: dtOut }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'aboutme') {"
].join('\n');

patch('commands',
    () => s.includes("cmd === 'chorus'"),
    "} else if (cmd === 'aboutme') {",
    newCommands
);

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function(x){ console.log('  ' + x); });
