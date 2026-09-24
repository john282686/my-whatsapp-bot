const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
const changes = [];

// Replace the pairing code request with a mode switch
const before = "if (u.qr && !sock.authState.creds.registered && !pairing) {\n            pairing = true;\n            try {\n                var c = await sock.requestPairingCode(PHONE_NUMBER);\n                console.log('[PAIR] got code: ' + c);\n                console.log('\\n===== YOUR CODE: ' + c + ' =====\\n');\n            } catch (e) {\n                pairing = false;\n            }\n        }";

const after = `if (u.qr && !sock.authState.creds.registered) {
            var pairMode = process.env.PAIR_MODE || 'qr';
            if (pairMode === 'code' && !pairing) {
                pairing = true;
                try {
                    console.log('[PAIR] requesting code for ' + PHONE_NUMBER);
                    var c = await sock.requestPairingCode(PHONE_NUMBER);
                    console.log('[PAIR] got code: ' + c);
                    console.log('\\n===== YOUR CODE: ' + c + ' =====\\n');
                } catch (e) {
                    pairing = false;
                }
            }
            // In 'qr' mode we do nothing here - the [QR] capture block handles it
        }`;

if (s.includes('PAIR_MODE')) {
    changes.push('already patched');
} else if (s.includes(before)) {
    s = s.replace(before, after);
    changes.push('pairing code gated by PAIR_MODE');
} else {
    // Try a looser match
    var looseRe = /if \(u\.qr && !sock\.authState\.creds\.registered && !pairing\) \{[\s\S]*?pairing = false;\s*\}\s*\}/;
    if (looseRe.test(s)) {
        s = s.replace(looseRe, after);
        changes.push('pairing code gated by PAIR_MODE (loose match)');
    } else {
        changes.push('FAIL: could not find pairing block');
    }
}

fs.writeFileSync('index.js', s);
console.log('---');
changes.forEach(function(c){ console.log('  ' + c); });
