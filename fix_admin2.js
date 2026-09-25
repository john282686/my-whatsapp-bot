const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');

// 1. Ensure isSenderAdmin declaration exists (add if missing)
if (!s.includes('var isSenderAdmin = isAdmin(earlyMeta')) {
    const marker = "var earlyBl = sock.user.lid ? num(sock.user.lid) : null;";
    const i = s.indexOf(marker);
    if (i === -1) { console.log('❌ earlyBl marker not found'); process.exit(1); }
    const insert = "\n                var earlySn = num(sender);\n                var isSenderAdmin = isAdmin(earlyMeta, sender, earlySn, earlyBn, earlyBl, msg.key.fromMe);\n                console.log('[ADMIN] sn=' + earlySn + ' isAdmin=' + isSenderAdmin);";
    s = s.slice(0, i + marker.length) + insert + s.slice(i + marker.length);
    console.log('✅ isSenderAdmin declaration added');
} else {
    console.log('✓ isSenderAdmin already present');
}

// 2. Patch the FAST LINK DELETE block — main culprit
// Match flexibly with regex to handle spacing variations
const fastRe = /if\s*\(\s*!\s*msg\.key\.fromMe\s*\)\s*\{[\s\S]*?if\s*\(\s*hasLink\s*\([^)]+\)\s*\)/;

const fastMatch = s.match(fastRe);
if (fastMatch && fastMatch[0].indexOf('isSenderAdmin') === -1) {
    const fixed = fastMatch[0].replace(
        /if\s*\(\s*!\s*msg\.key\.fromMe\s*\)/,
        "if (!msg.key.fromMe && !isSenderAdmin)"
    );
    s = s.replace(fastMatch[0], fixed);
    console.log('✅ FAST LINK DELETE block now checks admin');
} else if (fastMatch) {
    console.log('✓ FAST LINK DELETE already checks admin');
} else {
    console.log('⚠ could not locate FAST LINK DELETE — showing lines with hasLink');
}

// 3. Patch the second moderation block
if (s.includes("if (!msg.key.fromMe) {\n                    if (mt === 'groupInviteMessage')")) {
    s = s.replace(
        "if (!msg.key.fromMe) {\n                    if (mt === 'groupInviteMessage')",
        "if (!msg.key.fromMe && !isSenderAdmin) {\n                    if (mt === 'groupInviteMessage')"
    );
    console.log('✅ second moderation block now checks admin');
} else if (s.includes("if (!msg.key.fromMe && !isSenderAdmin) {\n                    if (mt === 'groupInviteMessage')")) {
    console.log('✓ second moderation block already checks admin');
}

// 4. Patch forwarded-message delete
if (s.includes("var wasFwd = await deleteForwardedMessage(sock, msg, from);\n                if (wasFwd) continue;")) {
    s = s.replace(
        "var wasFwd = await deleteForwardedMessage(sock, msg, from);\n                if (wasFwd) continue;",
        "if (!isSenderAdmin) {\n                    var wasFwd = await deleteForwardedMessage(sock, msg, from);\n                    if (wasFwd) continue;\n                }"
    );
    console.log('✅ forwarded-message filter now checks admin');
}

fs.writeFileSync('index.js', s);
console.log('--- done ---');
