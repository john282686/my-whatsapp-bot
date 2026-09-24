const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const botManager = require('./bot_manager');

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Simple API ---

app.post('/api/pair', async function (req, res) {
    const phone = req.body && req.body.phone;
    if (!phone) return res.status(400).json({ error: 'phone required' });

    try {
        const result = await botManager.pairUser(phone, function (update) {
            // push live updates to the specific socket for this phone
            io.emit('pair_update', update);
        });
        res.json(result);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.get('/api/status/:userId', function (req, res) {
    res.json(botManager.getStatus(req.params.userId));
});

app.post('/api/unlink/:userId', function (req, res) {
    const ok = botManager.unlinkUser(req.params.userId);
    res.json({ ok });
});

// Admin-only (put a token in .env to protect)
app.get('/api/admin/users', function (req, res) {
    const token = req.headers['x-admin-token'];
    if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
        return res.status(403).json({ error: 'forbidden' });
    }
    res.json(botManager.listUsers());
});

// --- Socket.IO for live pairing code ---
io.on('connection', function (socket) {
    console.log('[WS] client connected', socket.id);
});

// --- Boot: reconnect every previously linked user ---
botManager.resumeAll().then(function () {
    server.listen(PORT, function () {
        console.log('================================');
        console.log('  Bot host running on port ' + PORT);
        console.log('  Open http://<your-server-ip>:' + PORT);
        console.log('================================');
    });
}).catch(function (e) {
    console.error('[BOOT]', e);
    process.exit(1);
});
