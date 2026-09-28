// ============================================================
// PERSONALIZER — makes replies feel personal using stored identity
// ============================================================

function ensure(db) {
    if (!db.identities) db.identities = {};
}

// Get the display name for a JID (first name only, no emojis)
function getDisplayName(db, jid) {
    var u = db.identities && db.identities[jid];
    if (!u || !u.name) return null;
    // Take first word of their name (before space, emoji, etc)
    var n = String(u.name).trim();
    // Remove emojis and weird chars
    n = n.replace(/[^\w\s'-]/g, '').trim();
    var first = n.split(/\s+/)[0];
    if (!first || first.length < 2) return null;
    return first;
}

// Is this the user's first message we've ever seen?
function isFirstTime(db, jid) {
    var u = db.identities && db.identities[jid];
    if (!u) return true;
    return u.messageCount <= 1;
}

// Personalize a reply: sometimes prepend the user's name
// Only in specific patterns, only 1 in 4 times
function personalize(userId, userText, botReply, db) {
    if (!botReply || !userText || !db) return botReply;

    var name = getDisplayName(db, userId);
    if (!name) return botReply;

    // Don't personalize these replies
    if (/^(😂|🤣|👍|💯|🙏|🔥|❤️|😎|👌)/.test(botReply)) return botReply;
    if (botReply.length < 3) return botReply;

    // Only personalize ~25% of the time — feels more natural
    if (Math.random() > 0.25) return botReply;

    // Don't add name if the reply already contains it
    if (botReply.toLowerCase().indexOf(name.toLowerCase()) !== -1) return botReply;

    // Don't add name to very short replies like "yes na", "ehen o"
    var stripped = botReply.replace(/[^\w\s]/g, '').trim();
    if (stripped.split(/\s+/).length < 2) return botReply;

    // Add the name at the start (with comma for English, space for pidgin)
    var isPidginReply = /dey|jare|wahala|wetin|abeg|sha|nko|omo|chale|ehen o/.test(botReply.toLowerCase());
    if (isPidginReply) {
        return name + ', ' + botReply;
    }
    return name + ', ' + botReply;
}

// Special greeting for first-time users
function firstGreeting(db, jid, pushName) {
    if (!pushName) return null;
    var n = String(pushName).replace(/[^\w\s'-]/g, '').trim().split(/\s+/)[0];
    if (!n || n.length < 2) return null;
    var greets = [
        'Hey ' + n + ' 👋',
        'Welcome ' + n,
        'Oh ' + n + ', first time here! Welcome',
        'Hey ' + n + ', nice to meet you',
        'Welcome aboard ' + n + ' 🎉'
    ];
    return greets[Math.floor(Math.random() * greets.length)];
}

module.exports = {
    ensure,
    getDisplayName,
    isFirstTime,
    personalize,
    firstGreeting
};
