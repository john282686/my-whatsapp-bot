const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');

// 1. Remove any existing (broken) declaration to avoid duplicates
s = s.replace(/[ \t]*var\s+isSenderAdmin\s*=\s*[^;]+;\s*\n/g, '');

// 2. Find first "var earlyBl = ..." (after earlyMeta is fetched) and add the declaration
const marker = "var earlyBl = sock.user.lid ? num(sock.user.lid) : null;";
const idx = s.indexOf(marker);
if (idx === -1) {
    console.log('❌ marker not found');
    process.exit(1);
}

const after = idx + marker.length;
const insert = "\n                var earlySn = num(sender);\n                var isSenderAdmin = isAdmin(earlyMeta, sender, earlySn, earlyBn, earlyBl, msg.key.fromMe);\n                console.log('[ADMIN] sn=' + earlySn + ' isAdmin=' + isSenderAdmin);";

s = s.slice(0, after) + insert + s.slice(after);

fs.writeFileSync('index.js', s);
console.log('✅ isSenderAdmin declaration added');
