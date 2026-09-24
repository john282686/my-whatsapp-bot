const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
const changes = [];

// 1. Add WIPE_AUTH + logging before useMultiFileAuthState
const before1 = "var st = await useMultiFileAuthState(DATA_ROOT + '/auth_info');";
const after1 = `var st;

    // WIPE_AUTH: force-delete auth folder on boot
    if (process.env.WIPE_AUTH === 'true') {
        var authPath = DATA_ROOT + '/auth_info';
        console.log('[WIPE] deleting ' + authPath);
        try {
            if (fs.existsSync(authPath)) {
                fs.rmSync(authPath, { recursive: true, force: true });
                console.log('[WIPE] done');
            } else {
                console.log('[WIPE] folder did not exist');
            }
        } catch (e) {
            console.log('[WIPE] error: ' + e.message);
        }
    }

    console.log('[BOOT] DATA_ROOT=' + DATA_ROOT);
    console.log('[BOOT] auth folder exists: ' + fs.existsSync(DATA_ROOT + '/auth_info'));
    try {
        var authFiles = fs.existsSync(DATA_ROOT + '/auth_info') ? fs.readdirSync(DATA_ROOT + '/auth_info') : [];
        console.log('[BOOT] auth files: ' + (authFiles.join(', ') || '(empty)'));
    } catch (e) {}

    st = await useMultiFileAuthState(DATA_ROOT + '/auth_info');
    console.log('[BOOT] auth state loaded');`;

if (s.includes(before1) && !s.includes('WIPE_AUTH')) {
    s = s.replace(before1, after1);
    changes.push('wipe + boot logs added');
} else if (s.includes('WIPE_AUTH')) {
    changes.push('already has WIPE_AUTH');
} else {
    changes.push('FAIL: could not find useMultiFileAuthState line');
}

// 2. Add log after makeWASocket
const before2 = "runningSock = sock;";
if (s.includes(before2) && !s.includes('[BOOT] socket created')) {
    s = s.replace(
        before2,
        "console.log('[BOOT] socket created');\n    runningSock = sock;"
    );
    changes.push('socket log added');
}

// 3. Add log at connection.update start
const before3 = "if (u.qr && !sock.authState.creds.registered && !pairing) {";
if (s.includes(before3) && !s.includes('[CONN] update=')) {
    s = s.replace(
        before3,
        "console.log('[CONN] update: qr=' + (u.qr ? 'yes' : 'no') + ' conn=' + (u.connection || '-') + ' registered=' + sock.authState.creds.registered);\n        if (u.qr && !sock.authState.creds.registered && !pairing) {"
    );
    changes.push('conn log added');
}

// 4. Log pairing code request
const before4 = "var c = await sock.requestPairingCode(PHONE_NUMBER);";
if (s.includes(before4) && !s.includes('[PAIR] requesting')) {
    s = s.replace(
        before4,
        "console.log('[PAIR] requesting code for ' + PHONE_NUMBER);\n                var c = await sock.requestPairingCode(PHONE_NUMBER);\n                console.log('[PAIR] got code: ' + c);"
    );
    changes.push('pair log added');
}

fs.writeFileSync('index.js', s);
console.log('---');
changes.forEach(function(c){ console.log('  ' + c); });
