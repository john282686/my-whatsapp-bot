
// Health server for Railway/Render/Suga
const http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
}).listen(process.env.PORT || 3000, function () {
    console.log('[HEALTH] listening on ' + (process.env.PORT || 3000));
});

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    getContentType
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

const PREFIX = '.';
const PHONE_NUMBER = '233205347689';
const DATA_ROOT = process.env.DATA_ROOT || '.';

const KEY_POOL = {
    groq: [
        process.env.GROQ_KEY || ''
    ],
    cerebras: [
        process.env.CEREBRAS_KEY_1 || '',
        process.env.CEREBRAS_KEY_2 || '',
        process.env.CEREBRAS_KEY_3 || '',
        process.env.CEREBRAS_KEY_4 || ''
    ],
    cohere: [
        process.env.COHERE_KEY || ''
    ],
    mistral: [
        process.env.MISTRAL_KEY || ''
    ]
};

var advanced = require('./advanced_features');
var aiFeatures = require('./ai_features');
var memberProfiles = require('./member_profiles');
var longTermMemory = require('./long_term_memory');
var uniqueFeatures = require('./unique_features');
var uniqueFeatures2 = require('./unique_features2');
var uniqueFeatures3 = require('./unique_features3');
var power = require('./power_features');
var uniqueFeatures4 = require('./unique_features4');
var runningSock = null;
var loreEngine = require('./lore_engine');

var db = {
    warnings: {},
    welcomeSettings: {},
    protectedGroups: {},
    xp: {},
    afk: {},
    autoReply: {},
    memory: {},
    chatHistory: {},
    groupChat: {},
    groupLore: {},
    groupStats: {},
    userProfiles: {},
    groupModes: {},
    loreScan: {},
    longTermMemory: {},
    ltmInbox: {},
    timeCapsules: [],
    groupDNA: {},
    relationshipGraph: {},
    guardianLog: {},
    guardianCooldown: {},
    predictionLedger: {},
    dmReplies: false
};

try {
    if (fs.existsSync(DATA_ROOT + '/database.json')) {
        var loaded = JSON.parse(fs.readFileSync(DATA_ROOT + '/database.json'));
        Object.assign(db, loaded);
    }
} catch (e) {
    console.log('[DB] load error:', e.message);
}

advanced.ensure(db);
memberProfiles.ensure(db);
longTermMemory.ensure(db);
longTermMemory.seedFromExisting(db);
uniqueFeatures3.ensure(db);
power.ensure(db);

var _saveTimer = null;
function saveDB() {
    if (_saveTimer) return;
    _saveTimer = setTimeout(function () {
        _saveTimer = null;
        try {
            fs.writeFileSync(DATA_ROOT + '/database.json', JSON.stringify(db, null, 2));
        } catch (e) {
            console.log('[DB] save error:', e.message);
        }
    }, 1500);
}
function saveDBNow() {
    if (_saveTimer) {
        clearTimeout(_saveTimer);
        _saveTimer = null;
    }
    try {
        fs.writeFileSync(DATA_ROOT + '/database.json', JSON.stringify(db, null, 2));
    } catch (e) {
        console.log('[DB] save error:', e.message);
    }
}

function num(j) {
    if (!j) return '';
    return String(j).split(':')[0].split('@')[0].replace(/\D/g, '');
}

var metaCache = {};
async function getMeta(sock, jid) {
    var c = metaCache[jid];
    if (c && Date.now() - c.t < 15000) return c.meta;
    var meta = await sock.groupMetadata(jid);
    metaCache[jid] = { meta: meta, t: Date.now() };
    return meta;
}

function isBotAdmin(meta, bn, bl) {
    if (!meta || !Array.isArray(meta.participants)) return false;
    var bot = meta.participants.find(function (p) {
        var pn = num(p.id);
        if (bn && pn === bn) return true;
        if (bl && pn === bl) return true;
        return false;
    });
    return !!(bot && bot.admin);
}

function isAdmin(meta, senderJid, senderNum, bn, bl, fromMe) {
    if (fromMe) return true;
    if (!meta || !Array.isArray(meta.participants)) return false;
    var p = meta.participants.find(function (x) {
        return num(x.id) === senderNum;
    });
    return !!(p && p.admin);
}

async function delWarn(sock, from, msg, sender, reason) {
    try {
        await sock.sendMessage(from, { delete: msg.key });
    } catch (e) {
        console.log('[DEL] failed:', e.message);
    }
    try {
        var key = from + '_' + num(sender);
        db.warnings[key] = (db.warnings[key] || 0) + 1;
        saveDB();

        if (db.warnings[key] >= 3) {
            try {
                await sock.groupParticipantsUpdate(from, [sender], 'remove');
                delete db.warnings[key];
                saveDBNow();
                await sock.sendMessage(from, {
                    text: '🚫 @' + num(sender) + ' removed after 3 warnings (' + reason + ').',
                    mentions: [sender]
                });
            } catch (e) {
                console.log('[WARN-KICK] failed:', e.message);
            }
        } else {
            await sock.sendMessage(from, {
                text: '⚠️ @' + num(sender) + ' warning ' + db.warnings[key] + '/3: ' + reason,
                mentions: [sender]
            });
        }
    } catch (e) {
        console.log('[WARN] err:', e.message);
    }
}

var PIDGIN = [
    'abeg','wahala','sha','jare','oya','chai','wetin','abi','sef','nko',
    'una','make','shey','nna','omo','waka','gbam','yarn','sabi','japa',
    'oyibo','akata','wey','don','na','dey','no wahala'
];
function isPidgin(t) {
    if (!t) return false;
    var l = ' ' + String(t).toLowerCase() + ' ';
    return PIDGIN.some(function (w) {
        return l.indexOf(' ' + w + ' ') !== -1;
    });
}

function hasLink(text) {
    if (!text) return false;
    var t = String(text).toLowerCase();
    if (t.indexOf('http://') !== -1) return true;
    if (t.indexOf('https://') !== -1) return true;
    if (t.indexOf('www.') !== -1) return true;
    var exts = [
        'com','net','org','io','co','me','tv','xyz','top','online','site','app','dev','ai','info',
        'biz','link','click','ng','gh','ke','za','uk','us','ru','in','tk','ml','ga','cf','gq',
        'club','live','shop','tech','store','space','cloud'
    ];
    for (var i = 0; i < exts.length; i++) {
        if (t.indexOf('.' + exts[i]) !== -1) return true;
    }
    return false;
}

function rememberChat(groupId, senderId, senderName, role, text) {
    try {
        if (!db.chatHistory) db.chatHistory = {};
        if (!db.chatHistory[groupId]) db.chatHistory[groupId] = {};
        if (!db.chatHistory[groupId][senderId]) {
            db.chatHistory[groupId][senderId] = { name: '', messages: [] };
        }
        var h = db.chatHistory[groupId][senderId];

        if (senderName && !h.name) h.name = senderName;
        if (!Array.isArray(h.messages)) h.messages = [];

        if (text) {
            h.messages.push({
                role: role,
                text: String(text).slice(0, 1000),
                time: Date.now()
            });
        }

        if (h.messages.length > 20) h.messages = h.messages.slice(-20);
        saveDB();
    } catch (e) {}
}

function getChatHistory(groupId, senderId) {
    try {
        var h = db.chatHistory && db.chatHistory[groupId] && db.chatHistory[groupId][senderId];
        if (!h || !Array.isArray(h.messages)) return '';
        return h.messages
            .map(function (x) {
                return (x.role === 'user' ? '[them]' : '[me]') + ' ' + x.text;
            })
            .join('\n');
    } catch (e) {
        return '';
    }
}

function groupBrain(g) {
    if (!db.groupChat) db.groupChat = {};
    if (!db.groupChat[g]) db.groupChat[g] = [];
    return db.groupChat[g];
}

function addGroupMessage(g, name, text) {
    try {
        if (!g || !text || text.length < 1) return;
        var arr = groupBrain(g);
        arr.push({
            name: String(name || 'Member').substring(0, 80),
            text: String(text).substring(0, 500),
            time: Date.now()
        });
        while (arr.length > 500) arr.shift();
        saveDB();
    } catch (e) {
        console.log('[GROUP BRAIN]', e.message);
    }
}

function recentGroupContext(g, limit) {
    var arr = groupBrain(g);
    if (!arr || !arr.length) return '';
    limit = limit || 30;
    return arr
        .slice(-limit)
        .map(function (x) {
            return x.name + ': ' + x.text;
        })
        .join('\n');
}

function getLoreObj(g) {
    if (!db.groupLore) db.groupLore = {};
    if (!db.groupLore[g]) db.groupLore[g] = { created: Date.now(), events: [] };
    if (Array.isArray(db.groupLore[g])) {
        db.groupLore[g] = { created: Date.now(), events: db.groupLore[g] };
    }
    if (!Array.isArray(db.groupLore[g].events)) db.groupLore[g].events = [];
    return db.groupLore[g];
}

function addGroupLore(g, text, type) {
    try {
        if (!text || text.length < 4) return;
        var obj = getLoreObj(g);
        obj.events.push({
            type: type || 'moment',
            text: String(text).substring(0, 500),
            time: Date.now()
        });
        while (obj.events.length > 50) obj.events.shift();
        saveDB();
    } catch (e) {
        console.log('[LORE]', e.message);
    }
}

function loreContext(g) {
    var obj = getLoreObj(g);
    if (!obj.events.length) return '';
    return obj.events
        .slice(-10)
        .map(function (x) {
            return '[' + (x.type || 'moment') + '] ' + x.text;
        })
        .join(' | ');
}

async function scanGroupLore(g) {
    try {
        if (!g || !String(g).endsWith('@g.us')) return;
        var arr = groupBrain(g);
        if (!arr || arr.length < 25) return;

        if (!db.loreScan) db.loreScan = {};
        var last = db.loreScan[g] || 0;
        if (Date.now() - last < 30 * 60 * 1000) return;

        db.loreScan[g] = Date.now();
        saveDB();

        var conversation = recentGroupContext(g, 35);
        var memories = await loreEngine.extract(askAI, conversation);
        if (!memories || !memories.length) return;

        memories.forEach(function (x) {
            addGroupLore(g, x.text, x.type);
        });
        console.log('[LORE] Saved ' + memories.length + ' memories');
    } catch (e) {
        console.log('[LORE SCAN]', e.message);
    }
}

function isForwardedMessage(msg) {
    try {
        var m = msg && msg.message;
        if (!m) return false;
        var types = [
            'conversation','extendedTextMessage','imageMessage','videoMessage',
            'documentMessage','audioMessage','stickerMessage'
        ];
        for (var i = 0; i < types.length; i++) {
            var x = m[types[i]];
            if (x && x.contextInfo) {
                if (x.contextInfo.isForwarded === true) return true;
                if (Number(x.contextInfo.forwardingScore || 0) > 0) return true;
            }
        }
        return false;
    } catch (e) {
        return false;
    }
}

async function deleteForwardedMessage(sock, msg, from) {
    try {
        if (!from || !String(from).endsWith('@g.us')) return false;
        if (!isForwardedMessage(msg)) return false;
        try {
            await sock.sendMessage(from, { delete: msg.key });
            console.log('[FWD] deleted in', from);
            return true;
        } catch (e) {
            console.log('[FWD] delete failed:', e.message);
            return false;
        }
    } catch (e) {
        return false;
    }
}

async function askAI(q, opts) {
    opts = opts || {};

    var rules =
        '\n\nIMPORTANT RULES:\n' +
        '- Read the recent conversation before replying.\n' +
        '- Do NOT repeat a question you already asked.\n' +
        '- Do NOT repeat an answer or use nearly identical wording.\n' +
        '- Respond directly to what the person just said.\n' +
        '- Keep replies SHORT (1-2 sentences).\n' +
        '- NEVER start your reply with a label (no You:, Person:, me:, them:, Chidi:).\n';

    var sp = (opts.systemPrompt || '') + rules;

    var moods = [
        'You are feeling cheerful and playful today.',
        'You are feeling a bit sassy and bold today.',
        'You are feeling chill and laid back today.',
        'You are feeling shy and sweet today.',
        'You are feeling energetic and excited today.',
        'You are feeling a bit moody today.',
        'You are feeling flirty and fun today.',
        'You are feeling curious and chatty today.'
    ];
    sp = moods[Math.floor(Math.random() * moods.length)] + ' ' + sp;

    var messages = [];
    if (sp) messages.push({ role: 'system', content: sp });
    messages.push({ role: 'user', content: q });

    // 1. Groq
    for (var g = 0; g < KEY_POOL.groq.length; g++) {
        if (!KEY_POOL.groq[g]) continue;
        try {
            var rG = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + KEY_POOL.groq[g], 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: messages, max_tokens: 300, temperature: 0.9 })
            });
            var dG = await rG.json();
            if (dG.choices && dG.choices[0] && dG.choices[0].message && dG.choices[0].message.content) {
                console.log('[AI] OK via Groq');
                return dG.choices[0].message.content;
            }
            if (dG.error) console.log('[AI] Groq err:', JSON.stringify(dG.error).substring(0, 120));
        } catch (e) { console.log('[AI] Groq:', e.message); }
    }

    // 2. Cerebras (4 keys, try each)
    var cModels = ['llama-3.3-70b', 'llama3.1-8b'];
    for (var c = 0; c < KEY_POOL.cerebras.length; c++) {
        if (!KEY_POOL.cerebras[c]) continue;
        for (var cm = 0; cm < cModels.length; cm++) {
            try {
                var rC = await fetch('https://api.cerebras.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + KEY_POOL.cerebras[c], 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: cModels[cm], messages: messages, max_tokens: 300, temperature: 0.9 })
                });
                var dC = await rC.json();
                if (dC.choices && dC.choices[0] && dC.choices[0].message && dC.choices[0].message.content) {
                    console.log('[AI] OK via Cerebras key#' + c);
                    return dC.choices[0].message.content;
                }
                if (dC.error) console.log('[AI] Cerebras err:', JSON.stringify(dC.error).substring(0, 120));
            } catch (e) { console.log('[AI] Cerebras:', e.message); }
        }
    }

    // 3. Mistral
    for (var m = 0; m < KEY_POOL.mistral.length; m++) {
        if (!KEY_POOL.mistral[m]) continue;
        try {
            var rM = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + KEY_POOL.mistral[m], 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'mistral-small-latest', messages: messages, max_tokens: 300, temperature: 0.9 })
            });
            var dM = await rM.json();
            if (dM.choices && dM.choices[0] && dM.choices[0].message && dM.choices[0].message.content) {
                console.log('[AI] OK via Mistral');
                return dM.choices[0].message.content;
            }
            if (dM.error) console.log('[AI] Mistral err:', JSON.stringify(dM.error).substring(0, 120));
        } catch (e) { console.log('[AI] Mistral:', e.message); }
    }

    // 4. Cohere
    for (var co = 0; co < KEY_POOL.cohere.length; co++) {
        if (!KEY_POOL.cohere[co]) continue;
        try {
            var rCo = await fetch('https://api.cohere.com/v2/chat', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + KEY_POOL.cohere[co], 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'command-r-08-2024', messages: messages, max_tokens: 300 })
            });
            var dCo = await rCo.json();
            if (dCo.message && dCo.message.content && dCo.message.content[0] && dCo.message.content[0].text) {
                console.log('[AI] OK via Cohere');
                return dCo.message.content[0].text;
            }
            if (dCo.error) console.log('[AI] Cohere err:', JSON.stringify(dCo.error).substring(0, 120));
        } catch (e) { console.log('[AI] Cohere:', e.message); }
    }

    console.log('[AI] ALL PROVIDERS FAILED');
    return null;
}

function mem(g, u) {
    if (!db.memory[g]) db.memory[g] = {};
    if (!db.memory[g][u]) {
        db.memory[g][u] = {
            name: null,
            count: 0,
            recent: [],
            summaries: [],
            firstSeen: Date.now(),
            lastSeen: Date.now()
        };
    }
    var m = db.memory[g][u];
    if (!Array.isArray(m.recent)) m.recent = [];
    if (!Array.isArray(m.summaries)) m.summaries = [];
    return m;
}

async function addMem(g, u, n, t) {
    try {
        var m = mem(g, u);
        m.count++;
        m.lastSeen = Date.now();
        if (n && !m.name) m.name = n;

        if (t && t.length > 3) {
            m.recent.push(t.substring(0, 200));
            if (m.recent.length > 20) m.recent.shift();
        }

        if (m.count > 0 && m.count % 15 === 0 && m.recent.length >= 10) {
            try {
                var sample = m.recent.join('\n');
                var prev =
                    m.summaries.length > 0
                        ? 'Previous summaries: ' + m.summaries.slice(-3).join(' | ') + ' '
                        : '';
                var prompt =
                    prev +
                    'Summarize in 2 sentences what you know about this WhatsApp user (name, personality, interests). Messages: ' +
                    sample;
                var summary = await askAI(prompt);
                if (summary && summary.length > 10) {
                    var dateStr = new Date().toISOString().split('T')[0];
                    m.summaries.push('[' + dateStr + '] ' + summary.substring(0, 400));
                    if (m.summaries.length > 30) m.summaries.shift();
                    m.recent = [];
                }
            } catch (e) {
                console.log('[MEMORY]', e.message);
            }
        }
        saveDB();
    } catch (e) {
        console.log('[MEMORY]', e.message);
    }
}

function ctx(g, u) {
    var m = db.memory[g] && db.memory[g][u];
    if (!m) return '';
    var s = '';
    if (m.name) s += 'Name: ' + m.name + '. ';
    if (m.summaries && m.summaries.length) s += 'Past memories: ' + m.summaries.slice(-3).join(' | ') + '. ';
    if (m.recent && m.recent.length) s += 'Recent: ' + m.recent.slice(-5).join(' | ') + '. ';
    s += 'Messages total: ' + (m.count || 0) + '. ';
    return s;
}

var PERSONA_EN =
    'You are Chidi, a real adult Nigerian guy on WhatsApp. You are NOT an AI, NOT a bot, NOT an assistant. You are a REAL human being. Rules: never say you are a bot or AI. Never offer help like customer service. Talk casual and cool. Keep replies SHORT, 1 to 2 sentences. Use contractions and emojis sometimes. React naturally. If asked your gender, say you are male. If asked if you are real, say yes and laugh. If someone is rude, be bold back. Context: ';

var PERSONA_PIDGIN =
    'You be Chidi, real adult Nigerian guy wey dey chat on WhatsApp. You NO be AI, NO be bot, NO be assistant. You be REAL human being. Never talk say you be bot or AI. No dey talk like customer service. Gist casual and cool. Keep am SHORT, 1 to 2 sentences. Use pidgin: abeg, wahala, sha, no wahala, chai, jare, oya, na so, my guy, bro. Use emojis small small. If person ask whether you be man or woman, say you be man. Context: ';

var processedMsgs = {};
setInterval(function () {
    var now = Date.now();
    for (var id in processedMsgs) {
        if (now - processedMsgs[id] > 300000) delete processedMsgs[id];
    }
}, 300000);

var cooldown = {};
var pairing = false;

async function startBot() {
    var st;

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
    console.log('[BOOT] auth state loaded');

    var sock = makeWASocket({
        auth: st.state,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    });

    console.log('[BOOT] socket created');
    runningSock = sock;
    sock.ev.on('creds.update', st.saveCreds);

    sock.ev.on('connection.update', async function (u) {
        console.log('[CONN] update: qr=' + (u.qr ? 'yes' : 'no') + ' conn=' + (u.connection || '-') + ' registered=' + sock.authState.creds.registered);
        if (u.qr && !sock.authState.creds.registered && !pairing) {
            pairing = true;
            try {
                console.log('[PAIR] requesting code for ' + PHONE_NUMBER);
                var c = await sock.requestPairingCode(PHONE_NUMBER);
                console.log('[PAIR] got code: ' + c);
                console.log('\n===== YOUR CODE: ' + c + ' =====\n');
            } catch (e) {
                pairing = false;
            }
        }
        if (u.connection === 'close') {
            pairing = false;
            var ld = u.lastDisconnect;
            var rc =
                ld &&
                ld.error &&
                ld.error.output &&
                ld.error.output.statusCode !== DisconnectReason.loggedOut;
            if (rc) setTimeout(startBot, 5000);
        } else if (u.connection === 'open') {
            pairing = false;
            console.log('Bot connected!');
            try {
                var allGroups = await sock.groupFetchAllParticipating();
                Object.keys(allGroups).forEach(function (gid) {
                    var g = allGroups[gid];
                    var botN = num(sock.user.id);
                    var botL = sock.user.lid ? num(sock.user.lid) : null;
                    var isAdm = isBotAdmin(g, botN, botL);
                    console.log('[ADMIN] ' + gid + ' (' + (g.subject || '?') + ') -> bot admin: ' + isAdm);
                });
            } catch (e) {
                console.log('[ADMIN CHECK]', e.message);
            }
        }
    });

    sock.ev.on('group-participants.update', async function (u) {
        try {
            var m = await getMeta(sock, u.id);
            var bn = num(sock.user.id);
            var bl = sock.user.lid ? num(sock.user.lid) : null;
            if (!isBotAdmin(m, bn, bl)) return;
            if (db.welcomeSettings[u.id] === false) return;

            var gn = m.subject || 'this group';

            for (var i = 0; i < u.participants.length; i++) {
                var p =
                    typeof u.participants[i] === 'string'
                        ? u.participants[i]
                        : u.participants[i].id;

                if (u.action === 'add') {
                    if (num(p) === bn) {
                        await sock.sendMessage(u.id, {
                            text:
                                'Hi everyone! I am Chidi. This group is now protected.\n\n' +
                                'Anti-Link: ON\nWelcome: ON\nAI chat: ON\n\n' +
                                'Type ' + PREFIX + 'menu to see commands.'
                        });
                        continue;
                    }
                    await sock.sendMessage(u.id, {
                        text:
                            'Welcome to ' + gn + ', @' + p.split('@')[0] + '!\n\n' +
                            'This group is for friendship and fun. Please keep posts relevant and respectful. ' +
                            'No spam, scams, hate speech, porn, or illegal content.',
                        mentions: [p]
                    });
                } else if (u.action === 'remove') {
                    var remover = u.author || null;
                    var wasKicked = remover && remover !== p;
                    if (wasKicked) {
                        await sock.sendMessage(u.id, {
                            text: 'User @' + p.split('@')[0] + ' was removed.',
                            mentions: [p]
                        });
                    } else {
                        await sock.sendMessage(u.id, {
                            text: 'Goodbye @' + p.split('@')[0] + '!',
                            mentions: [p]
                        });
                    }
                }
            }
        } catch (e) {
            console.log('[PARTICIPANTS]', e.message);
        }
    });

    sock.ev.on('messages.upsert', async function (m) {
        for (var i = 0; i < m.messages.length; i++) {
            var msg = m.messages[i];
            try {
                if (!msg.message) continue;

                var from = msg.key.remoteJid;
                if (!from) continue;
                var isDM = !String(from).endsWith('@g.us');
                if (isDM && db.dmReplies === true) {
                    if (msg.key.fromMe) continue;
                    var dmText = (msg.message.conversation) || (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) || '';
                    if (dmText && dmText.length > 0) {
                        try {
                            var dmCtx = longTermMemory.recall(db, from, dmText);
                            var dmHist = getChatHistory(from, from);
                            var dmPrompt = (dmCtx ? 'THINGS YOU REMEMBER ABOUT THIS PERSON (long-term):\n' + dmCtx + '\n\n' : '') + (dmHist ? 'RECENT DM HISTORY:\n' + dmHist + '\n\n' : '') + 'Person just said: ' + dmText;
                            rememberChat(from, from, pn || null, 'user', dmText);
                            var dmReply = await askAI(dmPrompt, { systemPrompt: PERSONA_EN + 'This is a PRIVATE DM. Be warm, chill, honest, brief.' });
                            if (dmReply) {
                                await sock.sendMessage(from, { text: dmReply });
                                rememberChat(from, from, null, 'assistant', dmReply);
                            }
                        } catch (e) { console.log('[DM]', e.message); }
                    }
                    continue;
                }
                if (!String(from).endsWith('@g.us')) continue;

                if (!msg.key.fromMe && !msg.key.participant) continue;

                var sender = msg.key.fromMe ? sock.user.id : msg.key.participant;
                var text =
                    msg.message.conversation ||
                    (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) ||
                    '';
                var pn = msg.pushName || null;

                console.log('[MSG] from=' + from + ' fromMe=' + msg.key.fromMe + ' text=' + JSON.stringify(text).substring(0, 80));

                if (msg.message.groupStatusMentionMessage) {
                    sock.sendMessage(from, { delete: msg.key }).catch(function () {});
                    continue;
                }

                var earlyMeta;
                try {
                    earlyMeta = await getMeta(sock, from);
                } catch (e) {
                    console.log('[META] failed for ' + from + ': ' + e.message);
                    continue;
                }

                var earlyBn = num(sock.user.id);
                var earlyBl = sock.user.lid ? num(sock.user.lid) : null;
                if (!isBotAdmin(earlyMeta, earlyBn, earlyBl)) {
                    console.log('[SKIP] bot not admin in ' + from);
                    continue;
                }

                var msgId = msg.key.id;
                if (processedMsgs[msgId]) continue;
                processedMsgs[msgId] = Date.now();

                if (!msg.key.fromMe) {
                    var fastText = text;
                    if (
                        msg.message.extendedTextMessage &&
                        msg.message.extendedTextMessage.matchedText
                    ) {
                        fastText += ' ' + msg.message.extendedTextMessage.matchedText;
                    }
                    if (hasLink(fastText)) {
                        await delWarn(sock, from, msg, sender, 'Links not allowed');
                        continue;
                    }
                }

                var meta = earlyMeta;
                var bn = num(sock.user.id);
                var bl = sock.user.lid ? num(sock.user.lid) : null;
                var sn = num(sender);
                var botA = isBotAdmin(meta, bn, bl);
                var isA = isAdmin(meta, sender, sn, bn, bl, msg.key.fromMe);
                var mt = getContentType(msg.message);
                if (!botA) continue;

                var wasFwd = await deleteForwardedMessage(sock, msg, from);
                if (wasFwd) continue;

                if (!msg.key.fromMe && text) {
                    advanced.track(db, from, sender, 'message');
                    saveDB();
                }

                if (!msg.key.fromMe) {
                    if (mt === 'groupInviteMessage') {
                        await delWarn(sock, from, msg, sender, 'Group invites not allowed');
                        continue;
                    }
                    if (mt === 'contactMessage' || mt === 'contactsArrayMessage') {
                        await delWarn(sock, from, msg, sender, 'Contacts not allowed');
                        continue;
                    }
                    var allText = text;
                    if (
                        msg.message.extendedTextMessage &&
                        msg.message.extendedTextMessage.matchedText
                    ) {
                        allText += ' ' + msg.message.extendedTextMessage.matchedText;
                    }
                    if (hasLink(allText)) {
                        await delWarn(sock, from, msg, sender, 'Links not allowed');
                        continue;
                    }
                    var tn = text.replace(/@[\+\d]+/g, '').trim();
                    if (
                        tn.length > 0 &&
                        /(\+?\d{1,4}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3,4}[\s-]?\d{4}/.test(tn)
                    ) {
                        await delWarn(sock, from, msg, sender, 'Phone numbers not allowed');
                        continue;
                    }
                    if (/\b(dm|inbox|message me|text me|pm me|private message|chat me)\b/i.test(text)) {
                        await delWarn(sock, from, msg, sender, 'DM requests not allowed');
                        continue;
                    }
                }

                if (text && !text.startsWith(PREFIX) && !msg.key.fromMe) {
                    await addMem(from, sender, pn, text);
                    addGroupMessage(from, pn || '@' + sn, text);
                    scanGroupLore(from).catch(function () {});
                    // Relationship: mentions
                    if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.mentionedJid) {
                        msg.message.extendedTextMessage.contextInfo.mentionedJid.forEach(function (mj) {
                            if (mj !== sender) power.trackRelation(db, from, sender, mj, 'mention');
                        });
                    }
                    // Relationship: reply
                    if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.participant) {
                        var rp = msg.message.extendedTextMessage.contextInfo.participant;
                        if (rp !== sender) power.trackRelation(db, from, sender, rp, 'reply');
                    }
                    // Silent Guardian
                    if (!msg.key.fromMe && text.length > 6) {
                        power.guardianCheck(sock, db, from, sender, pn || null, text).catch(function (e) { console.log('[GUARDIAN]', e.message); });
                    }
                    longTermMemory.observe(db, sender, pn, text, from);
                    if (longTermMemory.needsConsolidation(db, sender)) {
                        longTermMemory.consolidate(db, sender, askAI).then(function(){ saveDB(); }).catch(function(e){ console.log('[LTM]', e.message); });
                    }
                }

                if (db.afk && db.afk[sender]) {
                    delete db.afk[sender];
                    saveDB();
                    await sock.sendMessage(from, {
                        text: 'Welcome back @' + sn + '!',
                        mentions: [sender]
                    });
                }

                var pid = isPidgin(text);

                var mentioned =
                    (msg.message.extendedTextMessage &&
                        msg.message.extendedTextMessage.contextInfo &&
                        msg.message.extendedTextMessage.contextInfo.mentionedJid) ||
                    [];
                var hasOtherTag = mentioned.length > 0;
                var quotedParticipant =
                    msg.message.extendedTextMessage &&
                    msg.message.extendedTextMessage.contextInfo &&
                    msg.message.extendedTextMessage.contextInfo.participant;
                var botNum = num(sock.user.id);
                var botLidNum = sock.user.lid ? num(sock.user.lid) : null;
                var quotedNum = quotedParticipant ? num(quotedParticipant) : null;
                var quotedFullJid = quotedParticipant || '';

                var isReplyToBot = false;
                if (quotedParticipant) {
                    if (quotedNum === botNum) isReplyToBot = true;
                    if (botLidNum && quotedNum === botLidNum) isReplyToBot = true;
                    if (quotedFullJid === sock.user.id) isReplyToBot = true;
                    if (sock.user.lid && quotedFullJid === sock.user.lid) isReplyToBot = true;
                    if (
                        sock.user.id &&
                        quotedFullJid.indexOf(sock.user.id.split(':')[0]) === 0
                    )
                        isReplyToBot = true;
                }
                var isReplyToHuman = quotedParticipant && !isReplyToBot;
                var startsWithMention = /^(@|>)/.test(text.trim());

                var shortTrigger = /^(hi|hey|hello|yo|sup|wassup|what's up|good (morning|afternoon|evening|night)|how (are|you)|wyd|hru|gm|gn)\b/i;

                var looksDirectedAtBot =
                    isReplyToBot ||
                    shortTrigger.test(text.trim()) ||
                    (text.length >= 4 &&
                        !hasOtherTag &&
                        !isReplyToHuman &&
                        !startsWithMention);

                var shouldAutoReply =
                    db.autoReply[from] !== false &&
                    !msg.key.fromMe &&
                    text.length > 1 &&
                    !text.startsWith(PREFIX) &&
                    text.indexOf('@bot') === -1 &&
                    looksDirectedAtBot;

                if (shouldAutoReply) {
                    var now = Date.now();
                    if (!cooldown[sender] || now - cooldown[sender] > 15000) {
                        cooldown[sender] = now;
                        var cx = ctx(from, sender);
                        var sp = pid ? PERSONA_PIDGIN + cx : PERSONA_EN + cx;
                        var history = getChatHistory(from, sender);
                        var prompt =
                            (history ? 'CONTEXT (do not repeat this format):\n' + history + '\n\n' : '') +
                            'Person just said: ' +
                            text;
                        rememberChat(from, sender, pn || null, 'user', text);
                        console.log('[AI] auto-reply for ' + sn);
                        var r = await askAI(prompt, { systemPrompt: sp });
                        if (r) {
                            await sock.sendMessage(from, { text: r }, { quoted: msg });
                            rememberChat(from, sender, null, 'assistant', r);
                        }
                        continue;
                    } else {
                        console.log('[SKIP] cooldown for ' + sn);
                    }
                }

                if (msg.key.fromMe === false && (text.indexOf('@bot') !== -1 || isReplyToBot)) {
                    var q = text.replace('@bot', '').trim();
                    var lq = q.toLowerCase();
                    if (/male|female|boy|girl|man or woman/.test(lq)) {
                        await sock.sendMessage(
                            from,
                            { text: 'I be man na 💪 My name na Chidi 😎' },
                            { quoted: msg }
                        );
                        continue;
                    }
                    if (q) {
                        var cx2 = ctx(from, sender);
                        var pid2 = isPidgin(q);
                        var sp2 = pid2 ? PERSONA_PIDGIN + cx2 : PERSONA_EN + cx2;
                        var hist2 = getChatHistory(from, sender);
                        var prompt2 =
                            (hist2 ? 'CONTEXT (do not repeat this format):\n' + hist2 + '\n\n' : '') +
                            'Person just said: ' +
                            q;
                        rememberChat(from, sender, pn || null, 'user', q);
                        console.log('[AI] @bot reply for ' + sn);
                        var r2 = await askAI(prompt2, { systemPrompt: sp2 });
                        if (r2) {
                            await sock.sendMessage(from, { text: r2 }, { quoted: msg });
                            rememberChat(from, sender, null, 'assistant', r2);
                        }
                    }
                    continue;
                }

                if (!text.startsWith(PREFIX)) continue;

                var args = text.slice(PREFIX.length).trim().split(/\s+/);
                var cmd = (args.shift() || '').toLowerCase();
                var ment =
                    (msg.message.extendedTextMessage &&
                        msg.message.extendedTextMessage.contextInfo &&
                        msg.message.extendedTextMessage.contextInfo.mentionedJid) ||
                    [];
                var tgt = ment[0];

                if (!msg.key.fromMe) advanced.track(db, from, sender, 'command');

                console.log('[CMD] ' + cmd + ' from ' + sn);

                if (cmd === 'ping') {
                    await sock.sendMessage(from, { text: 'Pong! 🏓' });
                } else if (cmd === 'menu' || cmd === 'help') {
                    var menuText =
                        '🤖 *CHIDI BOT* 🤖\n\n' +
                        '💬 *AI Chat*\n' +
                        '• @bot <question>\n' +
                        '• Auto-replies in group\n\n' +
                        '🧠 *Memory*\n' +
                        '• ' + PREFIX + 'mymemory\n' +
                        '• ' + PREFIX + 'clearmymemory\n\n' +
                        '📊 *Group*\n' +
                        '• ' + PREFIX + 'stats\n' +
                        '• ' + PREFIX + 'profile [@user]\n' +
                        '• ' + PREFIX + 'recap\n' +
                        '• ' + PREFIX + 'digest\n' +
                        '• ' + PREFIX + 'lore\n' +
                        '• ' + PREFIX + 'makelore\n' +
                        '• ' + PREFIX + 'brain\n\n' +
                        '🎮 *Fun*\n' +
                        '• ' + PREFIX + 'game [type]\n' +
                        '• ' + PREFIX + 'quiz\n' +
                        '• ' + PREFIX + 'riddle\n' +
                        '• ' + PREFIX + 'emoji\n' +
                        '• ' + PREFIX + 'wouldyourather\n' +
                        '• ' + PREFIX + 'roast @user\n' +
                        '• ' + PREFIX + 'debate <topic>\n\n' +
                        '⚙️ *Settings (admin)*\n' +
                        '• ' + PREFIX + 'autoreply on/off\n' +
                        '• ' + PREFIX + 'protect on/off\n' +
                        '• ' + PREFIX + 'welcome on/off\n' +
                        '• ' + PREFIX + 'mode <normal|chill|comedy|debate|quiz>\n' +
                        '• ' + PREFIX + 'mymode\n\n' +
                        '🛡️ *Moderation (admin)*\n' +
                        '• ' + PREFIX + 'tagall\n' +
                        '• ' + PREFIX + 'kick @user\n' +
                        '• ' + PREFIX + 'promote @user\n' +
                        '• ' + PREFIX + 'demote @user\n' +
                        '• ' + PREFIX + 'warn @user\n';
                    await sock.sendMessage(from, { text: menuText }, { quoted: msg });
                } else if (cmd === 'autoreply') {
                    if (!isA) continue;
                    if (args[0] === 'on') {
                        db.autoReply[from] = true;
                        saveDBNow();
                        await sock.sendMessage(from, { text: '✅ Auto-Reply ON' });
                    } else if (args[0] === 'off') {
                        db.autoReply[from] = false;
                        saveDBNow();
                        await sock.sendMessage(from, { text: '❌ Auto-Reply OFF' });
                    } else {
                        await sock.sendMessage(from, {
                            text: 'Usage: ' + PREFIX + 'autoreply on|off'
                        });
                    }
                } else if (cmd === 'protect') {
                    if (!isA) continue;
                    if (args[0] === 'on') {
                        db.protectedGroups[from] = true;
                        saveDBNow();
                        await sock.sendMessage(from, { text: '✅ Protection ON' });
                    } else if (args[0] === 'off') {
                        db.protectedGroups[from] = false;
                        saveDBNow();
                        await sock.sendMessage(from, { text: '❌ Protection OFF' });
                    } else {
                        await sock.sendMessage(from, {
                            text: 'Usage: ' + PREFIX + 'protect on|off'
                        });
                    }
                } else if (cmd === 'welcome') {
                    if (!isA) continue;
                    if (args[0] === 'on') {
                        db.welcomeSettings[from] = true;
                        saveDBNow();
                        await sock.sendMessage(from, { text: '✅ Welcome ON' });
                    } else if (args[0] === 'off') {
                        db.welcomeSettings[from] = false;
                        saveDBNow();
                        await sock.sendMessage(from, { text: '❌ Welcome OFF' });
                    } else {
                        await sock.sendMessage(from, {
                            text: 'Usage: ' + PREFIX + 'welcome on|off'
                        });
                    }
                } else if (cmd === 'tagall') {
                    if (!isA) continue;
                    var t = 'Everyone!\n\n';
                    meta.participants.forEach(function (p) {
                        t += '@' + p.id.split('@')[0] + ' ';
                    });
                    await sock.sendMessage(from, {
                        text: t,
                        mentions: meta.participants.map(function (p) {
                            return p.id;
                        })
                    });
                } else if (cmd === 'kick' && tgt) {
                    var targetPart = meta.participants.find(function (p) {
                        return num(p.id) === num(tgt);
                    });
                    var targetIsAdmin = !!(targetPart && targetPart.admin);
                    var senderPart = meta.participants.find(function (p) {
                        return num(p.id) === num(sender);
                    });
                    var senderIsAdmin = !!(senderPart && senderPart.admin) || msg.key.fromMe;
                    if (!senderIsAdmin) {
                        await sock.sendMessage(
                            from,
                            { text: 'Only group admins can use ' + PREFIX + 'kick' },
                            { quoted: msg }
                        );
                    } else if (targetIsAdmin) {
                        await sock.sendMessage(
                            from,
                            { text: 'I cannot remove a group admin.' },
                            { quoted: msg }
                        );
                    } else {
                        try {
                            await sock.groupParticipantsUpdate(from, [tgt], 'remove');
                        } catch (e) {
                            console.log('[KICK]', e.message);
                        }
                    }
                } else if (cmd === 'promote' && tgt) {
                    var ps = meta.participants.find(function (p) {
                        return num(p.id) === num(sender);
                    });
                    var pt = meta.participants.find(function (p) {
                        return num(p.id) === num(tgt);
                    });
                    var sIsAdmin = !!(ps && ps.admin) || msg.key.fromMe;
                    if (!sIsAdmin) {
                        await sock.sendMessage(
                            from,
                            { text: 'Only group admins can use ' + PREFIX + 'promote' },
                            { quoted: msg }
                        );
                    } else if (!pt) {
                        await sock.sendMessage(
                            from,
                            { text: 'That member is not in this group.' },
                            { quoted: msg }
                        );
                    } else {
                        try {
                            await sock.groupParticipantsUpdate(from, [tgt], 'promote');
                        } catch (e) {
                            console.log('[PROMOTE]', e.message);
                        }
                    }
                } else if (cmd === 'demote' && tgt) {
                    var ds = meta.participants.find(function (p) {
                        return num(p.id) === num(sender);
                    });
                    var dt = meta.participants.find(function (p) {
                        return num(p.id) === num(tgt);
                    });
                    var dsAdmin = !!(ds && ds.admin) || msg.key.fromMe;
                    if (!dsAdmin) {
                        await sock.sendMessage(
                            from,
                            { text: 'Only group admins can use ' + PREFIX + 'demote' },
                            { quoted: msg }
                        );
                    } else if (!dt || !dt.admin) {
                        await sock.sendMessage(
                            from,
                            { text: 'That member is not a group admin.' },
                            { quoted: msg }
                        );
                    } else {
                        try {
                            await sock.groupParticipantsUpdate(from, [tgt], 'demote');
                        } catch (e) {
                            console.log('[DEMOTE]', e.message);
                        }
                    }
                } else if (cmd === 'warn' && tgt) {
                    var ws = meta.participants.find(function (p) {
                        return num(p.id) === num(sender);
                    });
                    var wt = meta.participants.find(function (p) {
                        return num(p.id) === num(tgt);
                    });
                    var wsAdmin = !!(ws && ws.admin) || msg.key.fromMe;
                    if (!wsAdmin) {
                        await sock.sendMessage(
                            from,
                            { text: 'Only group admins can use ' + PREFIX + 'warn' },
                            { quoted: msg }
                        );
                    } else if (!wt) {
                        await sock.sendMessage(
                            from,
                            { text: 'That member is not in this group.' },
                            { quoted: msg }
                        );
                    } else if (wt.admin) {
                        await sock.sendMessage(
                            from,
                            { text: 'I cannot warn a group admin.' },
                            { quoted: msg }
                        );
                    } else {
                        var k = from + '_' + num(tgt);
                        db.warnings[k] = (db.warnings[k] || 0) + 1;
                        if (db.warnings[k] >= 3) {
                            try {
                                await sock.groupParticipantsUpdate(from, [tgt], 'remove');
                                delete db.warnings[k];
                                await sock.sendMessage(from, {
                                    text: '🚫 @' + num(tgt) + ' removed after 3 warnings.',
                                    mentions: [tgt]
                                });
                            } catch (e) {
                                console.log('[WARN-KICK]', e.message);
                            }
                        } else {
                            await sock.sendMessage(from, {
                                text: '⚠️ Warned (' + db.warnings[k] + '/3)',
                                mentions: [tgt]
                            });
                        }
                        saveDBNow();
                    }
                } else if (cmd === 'mode') {
                    var mode = (args[0] || 'normal').toLowerCase();
                    if (['normal', 'chill', 'comedy', 'debate', 'quiz'].indexOf(mode) === -1) {
                        await sock.sendMessage(from, {
                            text: 'Modes: normal, chill, comedy, debate, quiz'
                        });
                    } else {
                        advanced.setMode(db, from, mode);
                        saveDBNow();
                        await sock.sendMessage(from, {
                            text: '🎭 Group mode changed to *' + mode + '*'
                        }, { quoted: msg });
                    }
                } else if (cmd === 'mymode') {
                    await sock.sendMessage(from, {
                        text: '🎭 Current group mode: *' + advanced.getMode(db, from) + '*'
                    });
                } else if (cmd === 'stats') {
                    var st = advanced.stats(db, from);
                    var out = '📊 *GROUP STATS*\n\n';
                    out += '👥 Members tracked: ' + st.members + '\n';
                    out += '💬 Messages: ' + st.messages + '\n';
                    out += '🎮 Games: ' + st.games + '\n';
                    out += '😈 Roasts: ' + st.roasts + '\n';
                    out += '⭐ Total XP: ' + st.xp + '\n';
                    var topMentions = [];
                    if (st.top && st.top.length) {
                        out += '\n🏆 *Most active:*\n';
                        st.top.slice(0, 5).forEach(function (x, idx) {
                            out += idx + 1 + '. @' + num(x[0]) + ' — ' + x[1] + ' messages\n';
                            topMentions.push(x[0]);
                        });
                    }
                    await sock.sendMessage(from, { text: out, mentions: topMentions });
                } else if (cmd === 'profile') {
                    var who = tgt || sender;
                    var pp = advanced.profile(db, from, who);
                    var pi = '👤 *MEMBER PROFILE*\n\n';
                    pi += 'Messages: ' + pp.messages + '\n';
                    pi += 'Commands: ' + pp.commands + '\n';
                    pi += 'Games: ' + pp.games + '\n';
                    pi += 'Roasts: ' + pp.roasts + '\n';
                    pi += 'XP: ' + pp.xp + ' (Lvl ' + pp.level + ')\n';
                    pi += 'First seen: ' + new Date(pp.firstSeen).toLocaleDateString();
                    await sock.sendMessage(from, { text: pi, mentions: [who] });
                } else if (cmd === 'recap') {
                    var recapContext = recentGroupContext(from, 40);
                    if (loreContext(from)) recapContext += '\nGROUP LORE:\n' + loreContext(from);
                    var rr = await aiFeatures.recap(askAI, recapContext);
                    await sock.sendMessage(
                        from,
                        { text: rr || 'I need more group activity 😅' },
                        { quoted: msg }
                    );
                } else if (cmd === 'digest') {
                    var dgCtx = recentGroupContext(from, 60);
                    if (loreContext(from)) dgCtx += '\nGROUP LORE:\n' + loreContext(from);
                    var dg = await aiFeatures.digest(askAI, dgCtx);
                    await sock.sendMessage(
                        from,
                        { text: dg || 'Nothing to digest yet.' },
                        { quoted: msg }
                    );
                } else if (
                    cmd === 'game' ||
                    cmd === 'quiz' ||
                    cmd === 'riddle' ||
                    cmd === 'emoji' ||
                    cmd === 'wouldyourather'
                ) {
                    var gameType = cmd === 'game' ? args[0] || 'trivia' : cmd;
                    var gr = await aiFeatures.game(askAI, gameType);
                    if (gr) {
                        advanced.track(db, from, sender, 'game');
                        saveDB();
                        await sock.sendMessage(
                            from,
                            { text: '🎮 *' + gameType.toUpperCase() + '*\n\n' + gr },
                            { quoted: msg }
                        );
                    }
                } else if (cmd === 'roast') {
                    if (!tgt) {
                        await sock.sendMessage(from, {
                            text: '😈 Reply to someone or mention them with ' + PREFIX + 'roast @member.'
                        });
                    } else {
                        var roastName = '@' + num(tgt);
                        var ro = await aiFeatures.roast(askAI, roastName);
                        if (ro) {
                            advanced.track(db, from, sender, 'roast');
                            saveDB();
                            await sock.sendMessage(
                                from,
                                { text: '😈 ' + ro, mentions: [tgt] },
                                { quoted: msg }
                            );
                        }
                    }
                } else if (cmd === 'debate') {
                    var topic = args.join(' ').trim();
                    if (!topic) {
                        await sock.sendMessage(from, {
                            text: '🗣️ Usage: ' + PREFIX + 'debate <topic>'
                        });
                    } else {
                        var dr = await aiFeatures.debate(askAI, topic);
                        await sock.sendMessage(
                            from,
                            { text: '🗣️ *DEBATE*\n\n' + dr },
                            { quoted: msg }
                        );
                    }
                } else if (cmd === 'makelore') {
                    var gc = recentGroupContext(from, 40);
                    if (!gc || gc.length < 100) {
                        await sock.sendMessage(
                            from,
                            { text: '🧠 I need more recent group conversation.' },
                            { quoted: msg }
                        );
                    } else {
                        await sock.sendMessage(
                            from,
                            { text: '🧠 Studying recent group chat...' },
                            { quoted: msg }
                        );
                        var found = await loreEngine.extract(askAI, gc);
                        if (!found || !found.length) {
                            await sock.sendMessage(
                                from,
                                { text: '📚 No strong lore moments found yet.' },
                                { quoted: msg }
                            );
                        } else {
                            found.forEach(function (x) {
                                addGroupLore(from, x.text, x.type);
                            });
                            var out2 = '📚 *NEW GROUP LORE*\n\n';
                            found.forEach(function (x, idx) {
                                out2 += idx + 1 + '. ' + x.text + '\n';
                            });
                            await sock.sendMessage(from, { text: out2 }, { quoted: msg });
                        }
                    }
                } else if (cmd === 'lore') {
                    var lr = advanced.lore(db, from);
                    var events = lr.events.slice(-10);
                    if (!events.length) {
                        await sock.sendMessage(from, {
                            text: "📚 Group Lore is still empty. Chat more and I'll build it up."
                        });
                    } else {
                        var lt = '📚 *GROUP LORE*\n\n';
                        events.forEach(function (e, idx) {
                            lt += idx + 1 + '. ' + e.text + '\n';
                        });
                        await sock.sendMessage(from, { text: lt });
                    }
                } else if (cmd === 'brain') {
                    await sock.sendMessage(from, {
                        text: '🧠 *GROUP BRAIN*\n\n' + advanced.buildContext(db, from)
                    });
                } else if (cmd === 'mymemory') {
                    var mm = db.memory[from] && db.memory[from][sender];
                    if (!mm) {
                        await sock.sendMessage(from, {
                            text: 'Hmm we never really talk much, so I no sabi you well yet 😅'
                        });
                    } else {
                        var info = 'What I remember about you:\n\n';
                        info += 'Name: ' + (mm.name || 'Unknown') + '\n';
                        info += 'Total messages: ' + (mm.count || 0) + '\n';
                        info +=
                            'First seen: ' +
                            new Date(mm.firstSeen).toLocaleDateString() +
                            '\n';
                        if (mm.summaries && mm.summaries.length > 0) {
                            info += '\nMemories (' + mm.summaries.length + '):\n';
                            info += mm.summaries.slice(-3).join('\n');
                        }
                        await sock.sendMessage(from, { text: info });
                    }
                } else if (cmd === 'dream') {
                    var dreamCtx = recentGroupContext(from, 50);
                    if (!dreamCtx || dreamCtx.length < 50) {
                        await sock.sendMessage(from, { text: '🌙 Not enough recent chat to dream about yet.' }, { quoted: msg });
                    } else {
                        var dreamText = await uniqueFeatures.dream(askAI, dreamCtx);
                        await sock.sendMessage(from, { text: '🌙 *GROUP DREAM*\n\n' + (dreamText || 'The dream faded...'), }, { quoted: msg });
                    }
                } else if (cmd === 'onthisday' || cmd === 'otd') {
                    var otd = uniqueFeatures.onThisDay(db, from);
                    var otdOut = '⏳ *ON THIS DAY*\n\n';
                    var any = false;
                    otd.forEach(function (bucket) {
                        if (!bucket.messages.length) return;
                        any = true;
                        otdOut += '*' + bucket.label + '*\n';
                        bucket.messages.forEach(function (m) {
                            otdOut += '  • ' + m.name + ': ' + m.text.substring(0, 100) + '\n';
                        });
                        otdOut += '\n';
                    });
                    if (!any) otdOut += 'No messages from 7 days, 30 days, or 1 year ago yet. Keep chatting.';
                    await sock.sendMessage(from, { text: otdOut }, { quoted: msg });
                } else if (cmd === 'vibe') {
                    var vibeCtx = recentGroupContext(from, 30);
                    if (!vibeCtx) {
                        await sock.sendMessage(from, { text: '🌡️ Nothing to read yet.' }, { quoted: msg });
                    } else {
                        var vibeOut = await uniqueFeatures.vibe(askAI, vibeCtx);
                        await sock.sendMessage(from, { text: vibeOut || '🌡️ No reading.' }, { quoted: msg });
                    }
                } else if (cmd === 'predict') {
                    var predCtx = recentGroupContext(from, 40);
                    var memberNames = (meta.participants || []).map(function (p) {
                        return (p.notify || '').split('@')[0];
                    }).filter(Boolean).slice(0, 30);
                    if (!predCtx) {
                        await sock.sendMessage(from, { text: '🔮 Need more chat before I can predict.' }, { quoted: msg });
                    } else {
                        var predOut = await uniqueFeatures.predict(askAI, predCtx, memberNames);
                        await sock.sendMessage(from, { text: '🔮 *GROUP PREDICTIONS*\n\n' + (predOut || 'Not clear.'), }, { quoted: msg });
                    }
                } else if (cmd === 'ritual') {
                    var ritCtx = recentGroupContext(from, 50);
                    var ritName = meta.subject || 'this group';
                    if (!ritCtx || ritCtx.length < 50) {
                        await sock.sendMessage(from, { text: '🕯️ Not enough culture here yet. Chat more!' }, { quoted: msg });
                    } else {
                        var ritOut = await uniqueFeatures.ritual(askAI, ritCtx, ritName);
                        await sock.sendMessage(from, { text: ritOut || '🕯️ No ritual found.' }, { quoted: msg });
                    }
                } else if (cmd === 'whisper') {
                    var wCtx = recentGroupContext(from, 40);
                    if (!wCtx || wCtx.length < 50) {
                        await sock.sendMessage(from, { text: '\uD83E\uDD2B Not enough recent chat for a whisper yet.' });
                    } else {
                        var wUname = pn || ('@' + sn);
                        var wText = await uniqueFeatures2.whisper(askAI, wCtx, meta.subject || 'this group', wUname);
                        if (wText) {
                            try {
                                await sock.sendMessage(sender, { text: '\uD83E\uDD2B *Whisper from ' + (meta.subject || 'the group') + '*\n\n' + wText });
                                await sock.sendMessage(from, { text: '\uD83E\uDD2B Check your DMs @' + sn + '.', mentions: [sender] });
                            } catch (e) {
                                await sock.sendMessage(from, { text: '\uD83E\uDD2B I cannot DM you. Send me any message in private first, then try again.' });
                            }
                        }
                    }
                } else if (cmd === 'checkin' && tgt) {
                    var ciName = '@' + num(tgt);
                    var ciFacts = longTermMemory.recall(db, tgt, 'personality interests recent', 8);
                    var ciLast = (db.memory[from] && db.memory[from][tgt] && db.memory[from][tgt].lastSeen) || (Date.now() - 7 * 24 * 60 * 60 * 1000);
                    var ciText = await uniqueFeatures2.checkIn(askAI, ciName, ciFacts, ciLast);
                    if (ciText) {
                        try {
                            await sock.sendMessage(tgt, { text: ciText });
                            await sock.sendMessage(from, { text: '\u2705 Sent a warm check-in to @' + num(tgt), mentions: [tgt] });
                        } catch (e) {
                            await sock.sendMessage(from, { text: '\u274C Could not DM @' + num(tgt) + '.' });
                        }
                    }
                } else if (cmd === 'weathermap' || cmd === 'wm') {
                    var wmCtx = recentGroupContext(from, 40);
                    if (!wmCtx || wmCtx.length < 30) {
                        await sock.sendMessage(from, { text: '\uD83C\uDF21 Need more chat first.' });
                    } else {
                        var wmSeen = {};
                        var wmParts = [];
                        groupBrain(from).slice(-30).forEach(function (x) {
                            if (x.name && !wmSeen[x.name]) { wmSeen[x.name] = true; wmParts.push(x.name); }
                        });
                        var wmOut = await uniqueFeatures2.weatherMap(askAI, wmCtx, wmParts.slice(0, 15));
                        await sock.sendMessage(from, { text: wmOut || '\uD83C\uDF21 No reading.' });
                    }
                } else if (cmd === 'tarot') {
                    var tcCtx = recentGroupContext(from, 30);
                    var tcOut = await uniqueFeatures2.tarot(askAI, meta.subject || 'this group', tcCtx || '(no recent chat)');
                    if (tcOut) await sock.sendMessage(from, { text: tcOut });
                } else if (cmd === 'capsule') {
                    var capText = args.join(' ').trim();
                    if (!capText) {
                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'capsule <message to deliver in 30 days>' });
                    } else {
                        if (!db.timeCapsules) db.timeCapsules = [];
                        db.timeCapsules.push({ groupId: from, senderId: sender, senderName: pn || ('@' + sn), text: capText, createdAt: Date.now(), deliverAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });
                        saveDBNow();
                        await sock.sendMessage(from, { text: '\u23F3 Time capsule saved. I will deliver it in 30 days.' });
                    }
                } else if (cmd === 'dna' || cmd === 'groupdna') {
                    var dnaCtx = recentGroupContext(from, 60);
                    if (!dnaCtx || dnaCtx.length < 80) {
                        await sock.sendMessage(from, { text: '\uD83E\uDDEC Not enough chat to sequence the group DNA yet.' }, { quoted: msg });
                    } else {
                        await sock.sendMessage(from, { text: '\uD83E\uDDEC Sequencing group DNA...' }, { quoted: msg });
                        var prevGenome = (db.groupDNA && db.groupDNA[from]) || null;
                        var newGenome = await uniqueFeatures3.analyzeDNA(askAI, dnaCtx, meta.subject || 'this group', prevGenome);
                        if (!newGenome) {
                            await sock.sendMessage(from, { text: '\u274C DNA analysis failed.' }, { quoted: msg });
                        } else {
                            db.groupDNA[from] = newGenome;
                            saveDBNow();
                            await sock.sendMessage(from, { text: uniqueFeatures3.renderDNA(newGenome) }, { quoted: msg });
                        }
                    }
                } else if (cmd === 'universe' || cmd === 'au') {
                    var auTwist = args.join(' ').trim();
                    if (!auTwist) {
                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'universe <what if ...>' }, { quoted: msg });
                    } else {
                        var auCtx = recentGroupContext(from, 40);
                        if (!auCtx) {
                            await sock.sendMessage(from, { text: '\uD83C\uDF00 Not enough chat yet.' }, { quoted: msg });
                        } else {
                            var auOut = await uniqueFeatures3.alternateUniverse(askAI, auCtx, auTwist);
                            if (auOut) await sock.sendMessage(from, { text: '\uD83C\uDF00 *ALTERNATE UNIVERSE*\n_' + auTwist + '_\n\n' + auOut }, { quoted: msg });
                        }
                    }
                } else if (cmd === 'echo') {
                    var echoWho = tgt || sender;
                    var echoName = '@' + num(echoWho);
                    var echoFacts = longTermMemory.recall(db, echoWho, 'personality interests habits', 10);
                    var echoHist = getChatHistory(from, echoWho);
                    var echoOut = await uniqueFeatures3.echoChamber(askAI, echoFacts, echoHist, echoName, meta.subject || 'this group');
                    if (echoOut) await sock.sendMessage(from, { text: echoOut, mentions: [echoWho] }, { quoted: msg });
                } else if (cmd === 'relations' || cmd === 'rel') {
                    var relWho = tgt || sender;
                    var relData = power.getRelations(db, from, relWho);
                    var relOut = '\uD83D\uDD78 *RELATIONSHIPS for @' + num(relWho) + '*\n\n';
                    if (!relData.outgoing.length && Object.keys(relData.incoming).length === 0) {
                        relOut += 'No relationship data yet. Chat more!';
                    } else {
                        if (relData.outgoing.length) {
                            relOut += '*Talks to:*\n';
                            relData.outgoing.slice(0, 5).forEach(function (p) {
                                relOut += '\u2022 @' + num(p.jid) + ' \u2014 ' + p.score + ' pts (' + p.mentions + ' mentions, ' + p.replies + ' replies)\n';
                            });
                        }
                        var incomingKeys = Object.keys(relData.incoming);
                        if (incomingKeys.length) {
                            incomingKeys.sort(function (a, b) { return relData.incoming[b] - relData.incoming[a]; });
                            relOut += '\n*Talked about by:*\n';
                            incomingKeys.slice(0, 5).forEach(function (j) {
                                relOut += '\u2022 @' + num(j) + ' \u2014 ' + relData.incoming[j] + ' pts\n';
                            });
                        }
                    }
                    var relMentions = [relWho];
                    relData.ids.slice(0, 8).forEach(function (j) { if (relMentions.indexOf(j) === -1) relMentions.push(j); });
                    await sock.sendMessage(from, { text: relOut, mentions: relMentions }, { quoted: msg });
                } else if (cmd === 'connectors' || cmd === 'hubs') {
                    var conn = power.findConnectors(db, from, 10);
                    if (!conn.length) {
                        await sock.sendMessage(from, { text: '\uD83D\uDD78 No connection data yet.' });
                    } else {
                        var connOut = '\uD83D\uDD78 *TOP CONNECTORS*\n\n_The people who hold this group together_\n\n';
                        var connMentions = [];
                        conn.forEach(function (c, i) {
                            connOut += (i + 1) + '. @' + num(c.jid) + ' \u2014 ' + c.score + ' pts\n';
                            connMentions.push(c.jid);
                        });
                        await sock.sendMessage(from, { text: connOut, mentions: connMentions });
                    }
                } else if (cmd === 'judge') {
                    var jCtx = recentGroupContext(from, 50);
                    if (!jCtx || jCtx.length < 80) {
                        await sock.sendMessage(from, { text: '\u2696\uFE0F Need more context to judge.' });
                    } else {
                        await sock.sendMessage(from, { text: '\u2696\uFE0F Reading the room...' });
                        var jParts = meta.participants ? meta.participants.slice(0, 20).map(function (p) { return '@' + num(p.id); }) : [];
                        var jOut = await power.judge(askAI, jCtx, jParts);
                        await sock.sendMessage(from, { text: jOut || '\u2696\uFE0F No verdict.' }, { quoted: msg });
                    }
                } else if (cmd === 'whois') {
                    var whoisTarget = tgt || sender;
                    var wprofile = power.buildCrossGroupProfile(db, whoisTarget);
                    if (!wprofile) {
                        await sock.sendMessage(from, { text: '\uD83C\uDF10 No cross-group data on this person yet.' });
                    } else {
                        await sock.sendMessage(from, { text: wprofile, mentions: [whoisTarget] }, { quoted: msg });
                    }
                } else if (cmd === 'guardianlog') {
                    if (!isA) continue;
                    var gLog = (db.guardianLog && db.guardianLog[from]) || [];
                    if (!gLog.length) {
                        await sock.sendMessage(from, { text: '\uD83D\uDEE1\uFE0F No guardian alerts for this group yet. That\'s good news.' });
                    } else {
                        var gOut = '\uD83D\uDEE1\uFE0F *GUARDIAN LOG (last ' + Math.min(10, gLog.length) + ')*\n\n';
                        gLog.slice(-10).reverse().forEach(function (entry, i) {
                            gOut += (i + 1) + '. [' + entry.kind + '] ' + entry.senderName + ' \u2014 ' + new Date(entry.at).toLocaleString() + '\n';
                            gOut += '   _' + entry.text.substring(0, 80) + '_\n';
                        });
                        await sock.sendMessage(from, { text: gOut });
                    }
                } else if (cmd === 'network' || cmd === 'match') {
                    var nCtx = recentGroupContext(from, 40);
                    if (!nCtx || nCtx.length < 80) {
                        await sock.sendMessage(from, { text: '\uD83C\uDF10 Need more chat before I can match.' }, { quoted: msg });
                    } else {
                        var nProfiles = [];
                        if (meta.participants) {
                            meta.participants.slice(0, 25).forEach(function (p) {
                                var facts = longTermMemory.recall(db, p.id, 'personality interests habits', 5);
                                var nm = p.notify || '@' + num(p.id);
                                nProfiles.push(nm + ': ' + (facts ? facts.replace(/\n/g, ' ') : 'no profile yet'));
                            });
                        }
                        await sock.sendMessage(from, { text: '\uD83C\uDF10 Looking for connections...' }, { quoted: msg });
                        var netOut = await uniqueFeatures4.whisperNetwork(askAI, nCtx, nProfiles.join('\n'));
                        if (!netOut || netOut.trim().toUpperCase() === 'NONE') {
                            await sock.sendMessage(from, { text: '\uD83C\uDF10 No clear connections right now.' }, { quoted: msg });
                        } else {
                            await sock.sendMessage(from, { text: '\uD83C\uDF10 *WHISPER NETWORK*\n\n' + netOut }, { quoted: msg });
                        }
                    }
                } else if (cmd === 'silent' || cmd === 'agreement') {
                    var sCtx = recentGroupContext(from, 50);
                    if (!sCtx || sCtx.length < 100) {
                        await sock.sendMessage(from, { text: '\uD83D\uDD4A\uFE0F Need more chat first.' }, { quoted: msg });
                    } else {
                        var sOut = await uniqueFeatures4.silentAgreement(askAI, sCtx);
                        await sock.sendMessage(from, { text: sOut || '\uD83D\uDD4A\uFE0F No reading.' }, { quoted: msg });
                    }
                } else if (cmd === 'mirror') {
                    var mCtx = recentGroupContext(from, 60);
                    if (!mCtx || mCtx.length < 80) {
                        await sock.sendMessage(from, { text: '\uD83E\uDE9E Need more chat for a mirror.' }, { quoted: msg });
                    } else {
                        var mMembers = meta.participants ? meta.participants.slice(0, 20).map(function (p) { return p.notify || '@' + num(p.id); }) : [];
                        var mOut = await uniqueFeatures4.mirror(askAI, mCtx, meta.subject || 'this group', mMembers);
                        await sock.sendMessage(from, { text: mOut || '\uD83E\uDE9E No reflection.' }, { quoted: msg });
                    }
                } else if (cmd === 'predict2' || cmd === 'ipredict') {
                    var myPred = args.join(' ').trim();
                    if (!myPred) {
                        await sock.sendMessage(from, { text: 'Usage: ' + PREFIX + 'ipredict <your prediction about this group>' }, { quoted: msg });
                    } else {
                        uniqueFeatures4.savePrediction(db, from, sender, pn || ('@' + sn), myPred);
                        saveDBNow();
                        await sock.sendMessage(from, { text: '\uD83D\uDCDC Prediction logged. I will score it as the group chats.' });
                    }
                } else if (cmd === 'scoreboard' || cmd === 'ledger') {
                    var lWho = tgt || null;
                    var lOut = uniqueFeatures4.renderPredictionLedger(db, from, lWho);
                    await sock.sendMessage(from, { text: lOut, mentions: lWho ? [lWho] : [] });
                } else if (cmd === 'resolvepredictions' || cmd === 'rp') {
                    if (!isA) continue;
                    var rpCtx = recentGroupContext(from, 60);
                    if (!rpCtx || rpCtx.length < 100) {
                        await sock.sendMessage(from, { text: '\uD83D\uDCDC Need more chat to score predictions.' });
                    } else {
                        var updates = await uniqueFeatures4.resolvePredictions(askAI, db, from, rpCtx);
                        if (!updates.length) {
                            await sock.sendMessage(from, { text: '\uD83D\uDCDC No predictions resolved this round.' });
                        } else {
                            saveDBNow();
                            var uOut = '\uD83D\uDCDC *PREDICTIONS RESOLVED*\n\n';
                            updates.forEach(function (u) {
                                var icon = u.status === 'hit' ? '\u2705' : '\u274C';
                                uOut += icon + ' ' + u.name + ': "' + u.text.substring(0, 80) + '"\n   _' + (u.note || '') + '_\n';
                            });
                            await sock.sendMessage(from, { text: uOut });
                        }
                    }
                } else if (cmd === 'dmon' || cmd === 'dms-on') {
                    if (!isA) continue;
                    db.dmReplies = true;
                    saveDBNow();
                    await sock.sendMessage(from, { text: '\u2705 DM replies turned ON' }, { quoted: msg });
                } else if (cmd === 'dmoff' || cmd === 'dms-off') {
                    if (!isA) continue;
                    db.dmReplies = false;
                    saveDBNow();
                    await sock.sendMessage(from, { text: '\u274C DM replies turned OFF' }, { quoted: msg });
                } else if (cmd === 'dmstatus') {
                    var dmState = db.dmReplies === false ? 'OFF' : 'ON';
                    await sock.sendMessage(from, { text: '\uD83D\uDCE8 DM replies are *' + dmState + '*' }, { quoted: msg });
                } else if (cmd === 'aboutme') {
                    var ltmUser = longTermMemory.getUser(db, sender);
                    var aboutOut = '📌 *LONG-TERM MEMORY*\n\n';
                    aboutOut += longTermMemory.buildProfileText(db, sender) + '\n\n';
                    if (ltmUser.facts && ltmUser.facts.length) {
                        aboutOut += 'Facts I remember (' + ltmUser.facts.length + '):\n';
                        ltmUser.facts.slice(0, 25).forEach(function(f, i){
                            aboutOut += (i+1) + '. [' + f.category + '] ' + f.text + '\n';
                        });
                        if (ltmUser.facts.length > 25) aboutOut += '... +' + (ltmUser.facts.length - 25) + ' more\n';
                    } else {
                        aboutOut += 'No long-term facts saved yet. Talk to me more!';
                    }
                    await sock.sendMessage(from, { text: aboutOut });
                } else if (cmd === 'forget') {
                    if (db.longTermMemory[sender]) {
                        delete db.longTermMemory[sender];
                        if (db.ltmInbox) delete db.ltmInbox[sender];
                        saveDBNow();
                        await sock.sendMessage(from, { text: '🗑️ Long-term memory about you cleared.' });
                    } else {
                        await sock.sendMessage(from, { text: 'No long-term memory to clear.' });
                    }
                } else if (cmd === 'clearmymemory') {
                    if (db.memory[from] && db.memory[from][sender]) {
                        delete db.memory[from][sender];
                        saveDBNow();
                        await sock.sendMessage(from, {
                            text: 'Your memory has been cleared.'
                        });
                    } else {
                        await sock.sendMessage(from, { text: 'No memory to clear.' });
                    }
                }
            } catch (err) {
                console.log('[ERROR]', err.message);
            }
        }
    });
}

startBot().catch(function (e) {
    console.log('[START]', e.message);
});


// ===== TIME CAPSULE LOOP =====
setInterval(async function () {
    try {
        if (!runningSock) return;
        if (!db.timeCapsules || !db.timeCapsules.length) return;
        var nowC = Date.now();
        var dueC = db.timeCapsules.filter(function (c) { return c.deliverAt <= nowC; });
        if (!dueC.length) return;
        db.timeCapsules = db.timeCapsules.filter(function (c) { return c.deliverAt > nowC; });
        saveDBNow();
        for (var ci = 0; ci < dueC.length; ci++) {
            var cap = dueC[ci];
            try {
                var daysAgo = Math.floor((nowC - cap.createdAt) / (1000 * 60 * 60 * 24));
                var head = '\u23F3 *TIME CAPSULE OPENED*\n\nA message from ' + (cap.senderName || 'someone') + ' (' + daysAgo + ' days ago):\n\n';
                var body = '\u201C' + cap.text + '\u201D';
                await runningSock.sendMessage(cap.groupId, { text: head + body });
            } catch (e) { console.log('[CAPSULE]', e.message); }
        }
        console.log('[CAPSULE] delivered ' + dueC.length);
    } catch (e) { console.log('[CAPSULE-LOOP]', e.message); }
}, 60 * 60 * 1000);
