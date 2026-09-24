const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
const before = s;

// Remove the corrupted rule (anything from the SHORT line up to its terminating ; )
const bad = /'- Keep replies SHORT \(1-2 sentences\)\.[\s\S]*?';\n/m;

if (!bad.test(s)) {
    console.log('❌ pattern not found, showing context:');
    const lines = s.split('\n');
    for (let i = 348; i < 362; i++) console.log((i+1)+': '+lines[i]);
    process.exit(1);
}

s = s.replace(bad, "'- Keep replies SHORT (1-2 sentences).' +\n            ' NEVER start your reply with a label (no You:, Person:, me:, them:, Chidi:). Just reply naturally as if texting.\\n';\n");

fs.writeFileSync('index.js', s);
console.log('✅ rule repaired');
console.log('--- around 348-360 ---');
const lines = s.split('\n');
for (let i = 347; i < 362 && i < lines.length; i++) console.log((i+1)+': '+lines[i]);
