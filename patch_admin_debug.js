const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');

if (s.includes('[ADMIN-DEBUG]')) {
    console.log('already patched');
    process.exit(0);
}

const marker = "var isSenderAdmin = isAdmin(earlyMeta, sender, earlySn, earlyBn, earlyBl, msg.key.fromMe);";
const replacement = `var isSenderAdmin = isAdmin(earlyMeta, sender, earlySn, earlyBn, earlyBl, msg.key.fromMe);
                console.log('[ADMIN-DEBUG] sender=' + sender + ' sn=' + earlySn + ' botN=' + earlyBn + ' isAdmin=' + isSenderAdmin + ' participants=' + JSON.stringify((earlyMeta.participants || []).slice(0, 3).map(function(p){ return { id: p.id, admin: p.admin }; })));`;

if (!s.includes(marker)) {
    console.log('❌ marker not found — patch_admin_exempt.js probably did not run. Run it first.');
    process.exit(1);
}

s = s.replace(marker, replacement);
fs.writeFileSync('index.js', s);
console.log('✅ admin debug logging added');
