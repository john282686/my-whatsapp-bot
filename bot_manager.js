const fs = require('fs');
const path = require('path');
const { startBotFor } = require('./bot_logic');

const DATA_DIR = './data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(path.join(DATA_DIR, 'sessions'))) {
    fs.mkdirSync(path.join(DATA_DIR, 'sessions'), { recursive: true });
}

function loadUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) return {};
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (e) {
        console.log('[USERS] load error:', e.message);
        return {};
    }
}

function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (e) {
        console.log('[USERS] save error:', e.message);
    }
}

const users = loadUsers();           // { userId: { phone, createdAt, status } }
const instances = {};                // { userId: { sock, status, code } }

function newUserId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function pairUser(phone, emit) {
    // strip spaces, +, dashes
    const clean = String(phone).replace(/\D/g, '');
    if (clean.length < 8 || clean.length > 15) {
        throw new Error('Invalid phone number');
    }

    // one pairing per phone number
    for (const uid of Object.keys(users)) {
        if (users[uid].phone === clean && users[uid].status === 'linked') {
            throw new Error('This number is already linked to the bot');
        }
    }

    const userId = newUserId();
    users[userId] = { phone: clean, createdAt: Date.now(), status: 'pairing' };
    saveUsers(users);
    instances[userId] = { sock: null, status: 'pairing', code: null };

    const authFolder = './auth_info/' + userId;
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder, { recursive: true });
    const userDataDir = './data/' + userId;
    if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

    try {
        const sock = await startBotFor({
            userId,
            phone: clean,
            onPairingCode: function(code) {
                instances[userId].code = code;
                instances[userId].status = 'awaiting_link';
                users[userId].status = 'awaiting_link';
                saveUsers(users);
                try { emit({ userId, status: 'awaiting_link', code }); } catch(e){}
                console.log('[PAIR] ' + userId + ' code=' + code);
            },
            onConnected: function() {
                instances[userId].status = 'linked';
                users[userId].status = 'linked';
                users[userId].linkedAt = Date.now();
                saveUsers(users);
                try { emit({ userId, status: 'linked' }); } catch(e){}
                console.log('[PAIR] ' + userId + ' linked');
            },
            onDisconnected: function() {
                instances[userId].status = 'disconnected';
                users[userId].status = 'disconnected';
                saveUsers(users);
                try { emit({ userId, status: 'disconnected' }); } catch(e){}
                console.log('[PAIR] ' + userId + ' disconnected');
            }
        });
        instances[userId].sock = sock;
        return { userId, status: instances[userId].status };
    } catch (e) {
        delete users[userId];
        delete instances[userId];
        saveUsers(users);
        throw e;
    }
}

function getStatus(userId) {
    if (!users[userId]) return { error: 'unknown user' };
    return {
        userId,
        status: users[userId].status,
        phone: users[userId].phone,
        code: instances[userId] ? instances[userId].code : null,
        linkedAt: users[userId].linkedAt || null
    };
}

function unlinkUser(userId) {
    if (!users[userId]) return false;
    try {
        if (instances[userId] && instances[userId].sock) {
            instances[userId].sock.logout().catch(function(){});
        }
    } catch(e){}
    delete instances[userId];
    delete users[userId];
    saveUsers(users);
    // keep auth_info/<userId> for forensics but mark for cleanup
    return true;
}

function listUsers() {
    return Object.keys(users).map(function(uid){
        return {
            userId: uid,
            phone: users[uid].phone,
            status: users[uid].status,
            createdAt: users[uid].createdAt,
            linkedAt: users[uid].linkedAt || null
        };
    });
}

// On boot: reconnect every user that was linked
async function resumeAll() {
    const ids = Object.keys(users);
    console.log('[BOOT] resuming ' + ids.length + ' user(s)...');
    for (const uid of ids) {
        const u = users[uid];
        if (u.status !== 'linked' && u.status !== 'disconnected') continue;
        try {
            await pairUserInternally(uid);
        } catch (e) {
            console.log('[BOOT] ' + uid + ' failed:', e.message);
        }
    }
}

async function pairUserInternally(userId) {
    const u = users[userId];
    if (!u) return;
    instances[userId] = { sock: null, status: u.status, code: null };

    const sock = await startBotFor({
        userId,
        phone: u.phone,
        onPairingCode: function(){},   // already linked, no code needed
        onConnected: function() {
            instances[userId].status = 'linked';
            users[userId].status = 'linked';
            saveUsers(users);
            console.log('[BOOT] ' + userId + ' connected');
        },
        onDisconnected: function() {
            instances[userId].status = 'disconnected';
            users[userId].status = 'disconnected';
            saveUsers(users);
            console.log('[BOOT] ' + userId + ' disconnected');
        }
    });
    instances[userId].sock = sock;
}

module.exports = {
    pairUser,
    getStatus,
    unlinkUser,
    listUsers,
    resumeAll,
    users,
    instances
};
