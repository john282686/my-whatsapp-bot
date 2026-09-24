const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
const changes = [];

// 1. Add qrcode require
if (!s.includes("require('qrcode')")) {
    s = s.replace(
        "const pino = require('pino');",
        "const pino = require('pino');\nconst QRCode = require('qrcode');"
    );
    changes.push('added qrcode require');
} else {
    changes.push('qrcode already required');
}

// 2. Add global QR variables
if (!s.includes('currentQRDataUrl')) {
    s = s.replace(
        "var metaCache = {};",
        "var currentQRDataUrl = null;\nvar currentQRTime = 0;\nvar metaCache = {};"
    );
    changes.push('added global QR vars');
} else {
    changes.push('global QR vars already present');
}

// 3. Insert QR capture after connection.update starts
var connMarker = "sock.ev.on('connection.update', async function (u) {";
if (s.includes(connMarker) && !s.includes('[QR] capture block present')) {
    var insertion = connMarker + "\n        // [QR] capture block present\n        if (u.qr) {\n            try {\n                currentQRDataUrl = await QRCode.toDataURL(u.qr, { width: 400, margin: 2 });\n                currentQRTime = Date.now();\n                console.log('[QR] new QR ready - open your Suga URL to scan');\n            } catch (e) {\n                console.log('[QR] error: ' + e.message);\n            }\n        }";
    s = s.replace(connMarker, insertion);
    changes.push('QR capture block added');
} else if (s.includes('[QR] capture block present')) {
    changes.push('QR block already added');
} else {
    changes.push('FAIL: connection.update marker not found');
}

// 4. Replace health server with QR page
var healthRe = /const http = require\('http'\);\s*http\.createServer\([\s\S]*?\}\)\.listen\([^)]+\);/;
if (healthRe.test(s) && !s.includes('Link WhatsApp Bot</title>')) {
    var newHealth = "const http = require('http');\n" +
        "http.createServer(function (req, res) {\n" +
        "    var url = req.url || '/';\n" +
        "    if (url.indexOf('/qr.png') === 0 || url === '/qr') {\n" +
        "        if (!currentQRDataUrl) {\n" +
        "            res.writeHead(404, { 'Content-Type': 'text/plain' });\n" +
        "            res.end('No QR currently available. Bot may already be linked.');\n" +
        "            return;\n" +
        "        }\n" +
        "        var b64 = currentQRDataUrl.split(',')[1];\n" +
        "        var buf = Buffer.from(b64, 'base64');\n" +
        "        res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' });\n" +
        "        res.end(buf);\n" +
        "        return;\n" +
        "    }\n" +
        "    var html = '<!doctype html><html><head><meta charset=\"utf-8\">';\n" +
        "    html += '<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">';\n" +
        "    html += '<title>Link WhatsApp Bot</title>';\n" +
        "    html += '<style>body{font-family:system-ui;background:#0b141a;color:#e9edef;text-align:center;padding:20px;margin:0}h1{font-size:20px}img{max-width:100%;border-radius:12px;background:white;padding:10px}.hint{color:#8696a0;font-size:14px;line-height:1.6;margin:14px 0}.card{max-width:440px;margin:0 auto;background:#111b21;padding:20px;border-radius:16px}ol{text-align:left;color:#8696a0;font-size:14px;line-height:1.8;padding-left:20px}</style>';\n" +
        "    html += '</head><body><div class=\"card\"><h1>Link WhatsApp Bot</h1>';\n" +
        "    html += '<p class=\"hint\">Scan this QR from WhatsApp on the phone that should host the bot.</p>';\n" +
        "    html += '<img src=\"/qr.png?t=' + Date.now() + '\" alt=\"QR loading...\" />';\n" +
        "    html += '<ol><li>Open WhatsApp</li><li>Settings - Linked Devices</li><li>Link a Device</li><li>Scan the QR above</li></ol>';\n" +
        "    html += '<p class=\"hint\">This page refreshes every 15 seconds. If the QR expired, wait for a new one.</p>';\n" +
        "    html += '</div><script>setTimeout(function(){location.reload();},15000);</script>';\n" +
        "    html += '</body></html>';\n" +
        "    res.writeHead(200, { 'Content-Type': 'text/html' });\n" +
        "    res.end(html);\n" +
        "}).listen(process.env.PORT || 3000, function () {\n" +
        "    console.log('[HEALTH] listening on ' + (process.env.PORT || 3000));\n" +
        "});";
    s = s.replace(healthRe, newHealth);
    changes.push('health server replaced with QR page');
} else if (s.includes('Link WhatsApp Bot</title>')) {
    changes.push('QR page already in place');
} else {
    changes.push('FAIL: health server not found');
}

fs.writeFileSync('index.js', s);
console.log('---');
changes.forEach(function(c){ console.log('  ' + c); });
