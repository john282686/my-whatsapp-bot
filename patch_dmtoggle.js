const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
let changed = 0;

// 1. Make sure dmReplies flag exists in db
if (!s.includes('dmReplies: false')) {
    s = s.replace(
        "    predictionLedger: {}",
        "    predictionLedger: {},\n    dmReplies: true"
    );
    changed++;
    console.log('✓ dmReplies flag added (default ON)');
}

// 2. Make sure the DM handler checks the flag
if (!s.includes("if (isDM && db.dmReplies === true)")) {
    if (s.includes("if (isDM) {")) {
        s = s.replace("if (isDM) {", "if (isDM && db.dmReplies === true) {");
        changed++;
        console.log('✓ DM handler gated by dmReplies flag');
    }
}

// 3. Add the toggle commands before .aboutme
var toggleCmds = [
    "} else if (cmd === 'dmon' || cmd === 'dms-on') {",
    "                    if (!isA) continue;",
    "                    db.dmReplies = true;",
    "                    saveDBNow();",
    "                    await sock.sendMessage(from, { text: '\\u2705 DM replies turned ON' }, { quoted: msg });",
    "                } else if (cmd === 'dmoff' || cmd === 'dms-off') {",
    "                    if (!isA) continue;",
    "                    db.dmReplies = false;",
    "                    saveDBNow();",
    "                    await sock.sendMessage(from, { text: '\\u274C DM replies turned OFF' }, { quoted: msg });",
    "                } else if (cmd === 'dmstatus') {",
    "                    var dmState = db.dmReplies === false ? 'OFF' : 'ON';",
    "                    await sock.sendMessage(from, { text: '\\uD83D\\uDCE8 DM replies are *' + dmState + '*' }, { quoted: msg });",
    "                } else if (cmd === 'aboutme') {"
].join('\n');

if (!s.includes("cmd === 'dmon'")) {
    if (s.includes("} else if (cmd === 'aboutme') {")) {
        s = s.replace("} else if (cmd === 'aboutme') {", toggleCmds);
        changed++;
        console.log('✓ dmon / dmoff / dmstatus commands added');
    } else {
        console.log('❌ could not find insertion point for commands');
    }
} else {
    console.log('✓ commands already exist');
}

fs.writeFileSync('index.js', s);
console.log('---');
console.log('Total changes: ' + changed);
