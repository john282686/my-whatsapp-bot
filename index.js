const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage, getContentType } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { franc } = require('franc');

// --- SETTINGS ---
const PREFIX = '.';
const GEMINI_KEY = process.env.GEMINI_KEY || "YOUR_API_KEY_HERE";
const PHONE_NUMBER = '233206391674';

// --- DATABASE ---
let db = { 
    warnings: {}, bannedUsers: [], mutedGroups: {}, welcomeSettings: {}, 
    floodLimits: {}, blocklists: {}, notes: {}, captchaSettings: {}, 
    nsfwEnabled: {}, protectedGroups: {}, 
    xp: {}, afk: {}, autoDelete: {}, pollCount: {} 
};
if (fs.existsSync('./database.json')) { try { db = { ...db, ...JSON.parse(fs.readFileSync('./database.json')) }; } catch (e) {} }
function saveDB() { fs.writeFileSync('./database.json', JSON.stringify(db, null, 2)); }

// --- STRICT DELETE & WARN ---
async function deleteAndWarn(sock, from, msg, sender, reason) {
    try {
        await sock.sendMessage(from, { delete: msg.key });
        let mentionText = `@${sender.split('@')[0]}`;
        const sentMsg = await sock.sendMessage(from, { 
            text: `⚠️ *Scam Alert / Message Deleted*\n${mentionText}, your message was removed because: *${reason}*`, 
            mentions: [sender] 
        });
        
        if (db.autoDelete[from] && db.autoDelete[from] > 0) {
            setTimeout(() => sock.sendMessage(from, { delete: sentMsg.key }).catch(()=>{}), db.autoDelete[from] * 1000);
        }
    } catch (e) { console.log('Delete & Warn error:', e.message); }
}

// --- SEND MESSAGE WITH AUTO-DELETE ---
async function sendMessageWithAutoDelete(sock, from, text, options = {}) {
    try {
        const sentMsg = await sock.sendMessage(from, { text, ...options });
        if (db.autoDelete[from] && db.autoDelete[from] > 0) {
            setTimeout(() => sock.sendMessage(from, { delete: sentMsg.key }).catch(()=>{}), db.autoDelete[from] * 1000);
        }
        return sentMsg;
    } catch(e) { console.log('Send error:', e.message); }
}

const captchaPending = {};
const groupCache = {}; 
const activeTrivia = {};
const triviaQuestions = [
    { q: "What is the capital of France?", a: "paris" },
    { q: "What is 5 + 7?", a: "12" },
    { q: "Which planet is known as the Red Planet?", a: "mars" }
];

async function getGroupMetadata(sock, jid) {
    const now = Date.now();
    if (groupCache[jid] && (now - groupCache[jid].timestamp < 300000)) return groupCache[jid].data;
    try {
        const metadata = await sock.groupMetadata(jid);
        groupCache[jid] = { data: metadata, timestamp: now };
        return metadata;
    } catch (error) { if (groupCache[jid]) return groupCache[jid].data; throw error; }
}

async function askGemini(query, key) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: query }] }] })
        });
        const data = await response.json();
        if (data.error) return "Sorry, Gemini error.";
        return data.candidates[0].content.parts[0].text;
    } catch (error) { return "Sorry, network error."; }
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    // FIX: Added browser config to stabilize connection
    const sock = makeWASocket({ 
        auth: state, 
        logger: pino({ level: 'silent' }),
        browser: ["WhatsApp Bot", "Chrome", "1.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr && !sock.authState.creds.registered) {
            const code = await sock.requestPairingCode(PHONE_NUMBER);
            console.log(`\n\nYOUR PAIRING CODE: ${code}\n\n`);
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('Connection lost. Reconnecting...');
                setTimeout(() => startBot(), 5000); // Wait 5 seconds before reconnecting
            }
        } else if (connection === 'open') { console.log('Bot connected successfully!'); }
    });

    sock.ev.on('group-participants.update', async (update) => {
        try {
            const metadata = await getGroupMetadata(sock, update.id);
            for (let pObj of update.participants) {
                let p = typeof pObj === 'string' ? pObj : pObj.id;
                if (update.action === 'add' && db.welcomeSettings[update.id] !== false) {
                    await sendMessageWithAutoDelete(sock, update.id, `Welcome @${p.split('@')[0]}!`, { mentions: [p] });
                } else if (update.action === 'remove') {
                    await sendMessageWithAutoDelete(sock, update.id, `Goodbye @${p.split('@')[0]}.`, { mentions: [p] });
                }
            }
        } catch (e) {}
    });

    sock.ev.on('messages.upsert', async (m) => {
        for (const msg of m.messages) {
            if (!msg.message) return;
            const from = msg.key.remoteJid;
            const isGroup = from.endsWith('@g.us');
            const sender = msg.key.participant || msg.key.remoteJid;
            let text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
            
            // --- FIX: HARD STOP FOR BOT'S OWN MESSAGES AND WARNINGS ---
            if (msg.key.fromMe) return;
            if (text.startsWith('⚠️ *Scam Alert') || text.includes('Only English messages are allowed') || text.includes('Bot is NOT admin')) return;
            
            // --- AFK SYSTEM ---
            if (db.afk && db.afk[sender]) {
                delete db.afk[sender];
                saveDB();
                await sendMessageWithAutoDelete(sock, from, `👋 Welcome back @${sender.split('@')[0]}! Your AFK has been removed.`, { mentions: [sender] });
            }
            
            const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            for (const jid of mentionedJid) {
                if (db.afk && db.afk[jid]) {
                    await sendMessageWithAutoDelete(sock, from, `💤 @${jid.split('@')[0]} is AFK: ${db.afk[jid].reason}`, { mentions: [jid] });
                }
            }

            if (text) console.log(`[MSG] From: ${sender.split('@')[0]} | Text: "${text}"`);
            if (msg.message?.groupStatusMentionMessage) { await sock.sendMessage(from, { delete: msg.key }); return; }
            if (!isGroup) return; 

            let groupMetadata;
            try { groupMetadata = await getGroupMetadata(sock, from); } catch (e) { return; }
            
            const botNumber = sock.user.id.split(':')[0].split('@')[0]; 
            const botLidNumber = sock.user.lid ? sock.user.lid.split(':')[0].split('@')[0] : null; 
            
            const isBotAdmin = groupMetadata.participants.some(p => {
                const pNum = p.id.split(':')[0].split('@')[0];
                return pNum === botNumber || (botLidNumber && pNum === botLidNumber);
            });
            
            const senderNumber = sender.split(':')[0].split('@')[0];
            const isAdmin = groupMetadata.participants.some(p => {
                const pNum = p.id.split(':')[0].split('@')[0];
                return pNum === senderNumber;
            });

            const isProtected = db.protectedGroups && db.protectedGroups[from];
            const msgType = getContentType(msg.message);

            // --- XP SYSTEM ---
            if (text && !text.startsWith(PREFIX) && !db.afk[sender]) {
                if (!db.xp[from]) db.xp[from] = {};
                if (!db.xp[from][sender]) db.xp[from][sender] = { xp: 0, level: 1 };
                db.xp[from][sender].xp += 1;
                if (db.xp[from][sender].xp % 10 === 0) { 
                    db.xp[from][sender].level += 1; 
                    await sendMessageWithAutoDelete(sock, from, `🎉 @${sender.split('@')[0]} leveled up to Level ${db.xp[from][sender].level}!`, { mentions: [sender] });
                }
                saveDB();
            }

            if (isBotAdmin) { 
                if (msgType === 'contactMessage' || msgType === 'contactsArrayMessage') {
                    await deleteAndWarn(sock, from, msg, sender, "Sharing contacts is not allowed (Scam Alert 🚨).");
                    return;
                }
                
                // Phone Number Detector
                const phoneRegex = /(\+?\d{1,4}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3,4}[\s-]?\d{4}/g;
                if (phoneRegex.test(text) && !text.startsWith(PREFIX)) {
                    await deleteAndWarn(sock, from, msg, sender, "Sharing phone numbers is not allowed (Scam Alert 🚨).");
                    return;
                }

                // DM/Private Message Detector
                const dmRegex = /\b(dm|inbox|message me|text me|pm me|private message|chat me|contact me|check my|check me)\b/i;
                if (dmRegex.test(text)) {
                    await deleteAndWarn(sock, from, msg, sender, "Asking members to DM/Private Message is not allowed (Scam Alert 🚨).");
                    return;
                }

                // Link Detector
                const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|net|org|me|io|co|us|uk|ru|in|br|fr|de|jp|cn|tk|ml|ga|cf|gq|xyz|online|site|top|info|biz))/gi;
                if (linkRegex.test(text)) { 
                    await deleteAndWarn(sock, from, msg, sender, "Links are strictly prohibited."); 
                    return; 
                }

                // --- FIX: SMARTER LANGUAGE DETECTOR ---
                // Only check if message is longer than 10 words and doesn't contain common English slang
                if (isProtected && text.length > 5) {
                    const cleanText = text.replace(/@\d+/g, '').replace(/\d+/g, '').replace(/[^a-zA-Z\s]/g, '').trim();
                    const wordCount = cleanText.split(/\s+/).length;
                    
                    // Skip short messages and common English phrases
                    const englishWhitelist = ['bro', 'fuck', 'hey', 'hi', 'hello', 'yes', 'no', 'okay', 'lol', 'what', 'how', 'why', 'who', 'my', 'you', 'your', 'mom', 'dad', 'sister', 'brother', 'come', 'go', 'good', 'bad', 'just', 'normal', 'message', 'help'];
                    const isWhitelisted = englishWhitelist.some(word => cleanText.toLowerCase().includes(word));

                    if (wordCount > 5 && !isWhitelisted) {
                        const langCode = franc(cleanText, { minLength: 3 });
                        if (langCode !== 'eng' && langCode !== 'und') { 
                            await deleteAndWarn(sock, from, msg, sender, "Only English messages are allowed."); 
                            return; 
                        }
                    }
                }

                // Anti-Forward
                if (isProtected && msg.message?.extendedTextMessage?.contextInfo?.isForwarded) {
                    await deleteAndWarn(sock, from, msg, sender, "Forwarded messages are not allowed."); return;
                }

                // Anti-Flood
                if (!isAdmin) {
                    const now = Date.now();
                    if (!db.floodTracker) db.floodTracker = {};
                    if (!db.floodTracker[sender]) db.floodTracker[sender] = [];
                    db.floodTracker[sender].push(now);
                    db.floodTracker[sender] = db.floodTracker[sender].filter(t => now - t < 5000);
                    const limit = isProtected ? 3 : (db.floodLimits[from] || 5);
                    if (db.floodTracker[sender].length > limit) { await deleteAndWarn(sock, from, msg, sender, "Anti-Flood: Sending too fast."); return; }
                }
            }

            if (db.bannedUsers.includes(sender) && !isAdmin) { await sock.sendMessage(from, { delete: msg.key }); return; }

            if (text.startsWith('#')) {
                const noteName = text.slice(1).trim().toLowerCase();
                if (db.notes[from] && db.notes[from][noteName]) { await sendMessageWithAutoDelete(sock, from, db.notes[from][noteName], { quoted: msg }); return; }
            }

            if (text.includes('@bot')) {
                const query = text.replace('@bot', '').trim();
                if (query) { await sock.sendMessage(from, { text: await askGemini(query, GEMINI_KEY) }, { quoted: msg }); }
                return;
            }

            if (text.startsWith(PREFIX)) {
                const args = text.slice(PREFIX.length).trim().split(/ +/);
                const command = args.shift().toLowerCase();
                const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                const target = mentioned[0];

                if (command === 'afk') {
                    const reason = args.join(' ') || 'No reason given';
                    if (!db.afk) db.afk = {};
                    db.afk[sender] = { reason, time: Date.now() };
                    saveDB();
                    await sendMessageWithAutoDelete(sock, from, `💤 @${sender.split('@')[0]} is now AFK: ${reason}`, { mentions: [sender] });
                }
                else if (command === 'rank') {
                    const userXp = db.xp[from] && db.xp[from][sender] ? db.xp[from][sender] : { xp: 0, level: 1 };
                    await sock.sendMessage(from, { text: `🏆 *Rank for @${sender.split('@')[0]}*\nLevel: ${userXp.level}\nXP: ${userXp.xp}`, mentions: [sender] });
                }
                else if (command === 'leaderboard') {
                    if (!db.xp[from]) db.xp[from] = {};
                    const sorted = Object.entries(db.xp[from]).sort((a, b) => b[1].xp - a[1].xp).slice(0, 5);
                    let lbText = "🏆 *Top 5 Active Members*\n\n";
                    sorted.forEach((u, i) => { lbText += `${i+1}. @${u[0].split('@')[0]} - Level ${u[1].level} (${u[1].xp} XP)\n`; });
                    await sock.sendMessage(from, { text: lbText, mentions: sorted.map(s => s[0]) });
                }
                else if (command === 'poll' && isAdmin) {
                    const pollText = text.slice(PREFIX.length + 4).trim();
                    const parts = pollText.split('|').map(p => p.trim());
                    if (parts.length >= 3) {
                        const question = parts[0];
                        const options = parts.slice(1);
                        let pollMsg = `📊 *POLL: ${question}*\n\n`;
                        options.forEach((opt, i) => { pollMsg += `${i+1}️⃣ ${opt}\n`; });
                        pollMsg += `\nVote by replying with the number!`;
                        await sock.sendMessage(from, { text: pollMsg });
                    } else {
                        await sendMessageWithAutoDelete(sock, from, `❌ Usage: .poll "Question" | "Option 1" | "Option 2"`);
                    }
                }
                else if (command === 'broadcast' && senderNumber === PHONE_NUMBER) {
                    const bcastText = args.join(' ');
                    if (!bcastText) return;
                    const groups = await sock.groupFetchAllParticipating();
                    let count = 0;
                    for (const jid of Object.keys(groups)) {
                        try { await sock.sendMessage(jid, { text: `📢 *Broadcast from Admin:*\n\n${bcastText}` }); count++; } catch (e) {}
                    }
                    await sock.sendMessage(from, { text: `✅ Broadcast sent to ${count} groups.` });
                }
                else if (command === 'setautodelete' && isAdmin) {
                    const seconds = parseInt(args[0]);
                    if (!isNaN(seconds)) {
                        if (!db.autoDelete) db.autoDelete = {};
                        db.autoDelete[from] = seconds;
                        saveDB();
                        await sock.sendMessage(from, { text: seconds > 0 ? `✅ Bot messages will auto-delete after ${seconds} seconds.` : `✅ Auto-delete disabled.` });
                    }
                }
                else if (command === 'ping') {
                    await sock.sendMessage(from, { text: `🏓 Pong! Bot is alive.` });
                }
                else if (command === 'debug' && isAdmin) {
                    await sock.sendMessage(from, { text: `🔍 *Debug Info*\nBot Number: ${botNumber}\nBot LID: ${botLidNumber}\nIs Bot Admin: ${isBotAdmin}\nProtection: ${isProtected ? 'ON' : 'OFF'}` });
                }
                else if (command === 'protect' && isAdmin) {
                    if (args[0] === 'on') {
                        if (!isBotAdmin) { await sock.sendMessage(from, { text: '⚠️ Make the bot an Admin first!' }); return; }
                        db.protectedGroups[from] = true; db.nsfwEnabled[from] = true; saveDB();
                        await sock.sendMessage(from, { text: '🛡️ *PROTECTION MODE: ON*' });
                    } else if (args[0] === 'off') { db.protectedGroups[from] = false; saveDB(); await sock.sendMessage(from, { text: '🛡️ Protection Mode turned OFF.' }); }
                }
                else if (command === 'help') {
                    await sock.sendMessage(from, { text: `🤖 *Bot Commands*\n\n*Admin:*\n.protect on/off\n.nsfw on/off\n.setflood <num>\n.addblocklist <word>\n.removeblocklist <word>\n.save <name> <text>\n.clear <name>\n.captcha on/off\n.welcome on/off\n.setwelcome <text>\n.trivia\n.setautodelete <seconds>\n.poll "Question" | "Opt1" | "Opt2"\n\n*Everyone:*\n.afk [reason]\n.rank\n.leaderboard\n.ping\n.sticker (reply to image)\n#noteName\n@bot <question>` });
                }
                else if (command === 'sticker') {
                    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                    if (quoted && (quoted.imageMessage || quoted.videoMessage)) {
                        try {
                            const type = quoted.imageMessage ? 'image' : 'video';
                            const stream = await downloadContentFromMessage(quoted[type === 'image' ? 'imageMessage' : 'videoMessage'], type);
                            let buffer = Buffer.from([]); for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
                            fs.writeFileSync('./temp_media', buffer);
                            await execPromise(`ffmpeg -i ./temp_media -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p ./temp_sticker.webp`);
                            const stickerBuffer = fs.readFileSync('./temp_sticker.webp');
                            await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
                            fs.unlinkSync('./temp_media'); fs.unlinkSync('./temp_sticker.webp');
                        } catch (e) { await sendMessageWithAutoDelete(sock, from, '❌ Failed to make sticker.'); }
                    } else { await sendMessageWithAutoDelete(sock, from, '❌ Reply to an image with .sticker'); }
                }
                else if (command === 'trivia' && isAdmin) {
                    const q = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
                    activeTrivia[from] = { answer: q.a.toLowerCase(), winner: null };
                    await sock.sendMessage(from, { text: `🧠 *TRIVIA TIME!*\n\n${q.q}\n\nType your answer!` });
                }
                else if (command === 'tagall' && isAdmin) {
                    let tagMsg = "📢 *Attention!* 📢\n\n"; groupMetadata.participants.forEach(p => { tagMsg += `@${p.id.split('@')[0]} `; });
                    await sock.sendMessage(from, { text: tagMsg, mentions: groupMetadata.participants.map(p => p.id) });
                }
                else if (command === 'mute' && isAdmin) { db.mutedGroups[from] = true; saveDB(); await sendMessageWithAutoDelete(sock, from, '🔇 Muted.'); }
                else if (command === 'unmute' && isAdmin) { delete db.mutedGroups[from]; saveDB(); await sendMessageWithAutoDelete(sock, from, '🔊 Unmuted.'); }
                else if (command === 'ban' && isAdmin && target) { db.bannedUsers.push(target); saveDB(); await sock.sendMessage(from, { text: `🚫 Banned.`, mentions: [target] }); }
                else if (command === 'unban' && isAdmin && target) { db.bannedUsers = db.bannedUsers.filter(u => u !== target); saveDB(); await sock.sendMessage(from, { text: `✅ Unbanned.`, mentions: [target] }); }
                else if (command === 'promote' && isAdmin && target) { await sock.groupParticipantsUpdate(from, [target], 'promote'); await sock.sendMessage(from, { text: `✅ Promoted.`, mentions: [target] }); }
                else if (command === 'demote' && isAdmin && target) { await sock.groupParticipantsUpdate(from, [target], 'demote'); await sock.sendMessage(from, { text: `✅ Demoted.`, mentions: [target] }); }
                else if (command === 'kick' && isAdmin && target) { await sock.groupParticipantsUpdate(from, [target], 'remove'); await sock.sendMessage(from, { text: `✅ Kicked.`, mentions: [target] }); }
                else if (command === 'warn' && isAdmin && target) {
                    const key = `${from}_${target}`; db.warnings[key] = (db.warnings[key] || 0) + 1;
                    if (db.warnings[key] >= 3) { await sock.groupParticipantsUpdate(from, [target], 'remove'); await sock.sendMessage(from, { text: `🚫 Kicked after 3 warnings.`, mentions: [target] }); delete db.warnings[key]; }
                    else { await sock.sendMessage(from, { text: `⚠️ Warned (${db.warnings[key]}/3).`, mentions: [target] }); } saveDB();
                }
                else if (command === 'resetwarn' && isAdmin && target) { delete db.warnings[`${from}_${target}`]; saveDB(); await sock.sendMessage(from, { text: `✅ Warnings reset.`, mentions: [target] }); }
            }
        }
    });
}
startBot();
