const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
const before = s;

// Gate the DM handler behind a flag (default: OFF)
const from = "if (isDM) {";
const to = "if (isDM && db.dmReplies === true) {";

if (s.includes(to)) {
    console.log('already patched');
} else if (s.includes(from)) {
    s = s.replace(from, to);
    console.log('✅ DM replies disabled by default');
} else {
    console.log('❌ could not find DM handler — send me the surrounding code');
}

// Make sure db has the flag
if (!s.includes('dmReplies: false')) {
    s = s.replace(
        "    predictionLedger: {}",
        "    predictionLedger: {},\n    dmReplies: false"
    );
    console.log('✅ dmReplies flag added to db');
}

fs.writeFileSync('index.js', s);
console.log('done');
