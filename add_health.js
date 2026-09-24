const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
if (s.includes('HEALTH] listening')) {
    console.log('already added');
    process.exit(0);
}
const health = `
// Health server for Railway/Render/Suga
const http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
}).listen(process.env.PORT || 3000, function () {
    console.log('[HEALTH] listening on ' + (process.env.PORT || 3000));
});

`;
s = health + s;
fs.writeFileSync('index.js', s);
console.log('health server injected');
