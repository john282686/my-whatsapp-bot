const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
const guard = "msg.key.fromMe === false";

const patterns = [
    /if\s*\(\s*&&\s*\(text\.indexOf\('@bot'\)/g,
    /if\s*\(msg\.key\.fromMe\s*&&\s*\(text\.indexOf\('@bot'\)/g,
    /if\s*\(text\.indexOf\('@bot'\)\s*!==\s*-1\s*\|\|\s*isReplyToBot\)\s*\{/g,
    /if\s*\(text\.indexOf\('@bot'\)\s*>=\s*0\s*\|\|\s*isReplyToBot\)\s*\{/g
];

for (const p of patterns) {
    s = s.replace(p, "if (" + guard + " && (text.indexOf('@bot') >= 0 || isReplyToBot)) {");
}

fs.writeFileSync('index.js', s);

const lines = s.split('\n');
console.log('--- lines around 820-840 ---');
for (let i = 819; i < Math.min(840, lines.length); i++) {
    console.log((i+1) + ': ' + lines[i]);
}
console.log('--- @bot if lines ---');
let found = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].indexOf("text.indexOf('@bot')") !== -1 && lines[i].indexOf("if") !== -1) {
        console.log((i+1) + ': ' + lines[i].trim());
        found = true;
    }
}
if (found) console.log('✅ repair done');
else console.log('❌ no @bot if-line found');
