const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
const before = s;

// Find the mangled "undefined" line that sits right before the @bot handler
const badRe = /^([ \t]*)undefined(\s*\n[ \t]*var q = text\.replace\('@bot')/m;

const repl =
    "$1if (msg.key.fromMe === false && " +
    "(text.indexOf('@bot') !== -1 || isReplyToBot)) {" +
    "$2";

if (!badRe.test(s)) {
    console.log('❌ pattern not found. Showing lines 800-810:');
    const lines = s.split('\n');
    for (let i = 799; i < 810; i++) console.log((i+1) + ': ' + lines[i]);
    process.exit(1);
}

s = s.replace(badRe, repl);
fs.writeFileSync('index.js', s);
console.log('✅ repair done');

// Show the fixed area
const lines = s.split('\n');
console.log('--- lines 800-812 ---');
for (let i = 799; i < 812 && i < lines.length; i++) {
    console.log((i+1) + ': ' + lines[i]);
}
