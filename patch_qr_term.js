const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');

// Print the raw QR data URL to terminal (you can copy it into any browser)
if (s.includes("console.log('[QR] new QR ready")) {
    s = s.replace(
        "console.log('[QR] new QR ready - open your Suga URL to scan');",
        "console.log('[QR] new QR ready');\n                fs.writeFileSync('./qr.html', '<html><body style=\"background:#111\"><h2 style=\"color:white\">Scan this QR</h2><img src=\"' + currentQRDataUrl + '\" style=\"width:400px\"/></body></html>');\n                console.log('[QR] saved to ./qr.html');"
    );
    fs.writeFileSync('index.js', s);
    console.log('✅ QR now saves to ./qr.html on every refresh');
} else {
    console.log('❌ marker not found');
}
