function ensure(db) {
    if (!db.cultureVault) db.cultureVault = {};
    if (!db.matchSuggestions) db.matchSuggestions = {};
    if (!db.weeklyReplayLast) db.weeklyReplayLast = {};
    if (!db.ghostAlerts) db.ghostAlerts = {};
}

async function findMatches(askAI, relationships, memberNames, recentChat) {
    var lines = '';
    Object.keys(relationships || {}).forEach(function(from) {
        Object.keys(relationships[from]).forEach(function(to) {
            var e = relationships[from][to];
            var weight = (e.mentions || 0) + (e.replies || 0) * 2;
            if (weight >= 5) {
                lines += from + ' -> ' + to + ' (' + weight + ' pts)\n';
            }
        });
    });
    if (!lines) return null;

    return askAI(
        'You are a subtle matchmaker inside a WhatsApp group. Based on interaction patterns, suggest 1-2 REAL friendships worth encouraging.\n\n' +
        'INTERACTION PATTERNS (who replies to who):\n' + lines + '\n\n' +
        'RECENT CHAT:\n' + recentChat + '\n\n' +
        'For each suggestion, output:\n' +
        'MATCH: <name1> + <name2>\n' +
        'WHY: <one sentence, based on shared topics or mutual interest>\n' +
        'SUGGESTION: <one conversation starter they could bond over>\n\n' +
        'Rules: only suggest if there is real pattern evidence. Max 2 matches. If nothing clear, output NONE.\n' +
        'Members: ' + (memberNames || []).join(', '),
        { systemPrompt: 'You suggest real connections based on evidence. Never invent. Max 2 matches.' }
    );
}

async function weeklyReplay(askAI, memberName, memberMessages, groupName) {
    if (!memberMessages || !memberMessages.length) return null;
    var sample = memberMessages.slice(-15).map(function(m){ return m.text; }).join('\n');

    return askAI(
        'Write a PERSONAL WEEKLY REPLAY DM for a member of the WhatsApp group "' + groupName + '". ' +
        'It should feel like a private note from a thoughtful friend.\n\n' +
        'Name: ' + memberName + '\n' +
        'Their recent messages in the group:\n' + sample + '\n\n' +
        'Format exactly:\n' +
        '📬 *Your week in ' + groupName + '*\n\n' +
        '• *Highlight:* <one specific moment you had>\n' +
        '• *Your energy:* <2-3 words describing their vibe this week>\n' +
        '• *One to watch:* <a topic they raised that the group liked>\n\n' +
        '_See you next week._\n\n' +
        'Rules: specific, warm, 4-6 lines total. Never invent moments. Base only on real messages.',
        { systemPrompt: 'You write short, warm, personalised weekly replays from real message content.' }
    );
}

function detectGhosts(db, groupId, hoursThreshold) {
    hoursThreshold = hoursThreshold || 72;
    var memories = (db.memory && db.memory[groupId]) || {};
    var now = Date.now();
    var threshold = hoursThreshold * 60 * 60 * 1000;
    var ghosts = [];

    Object.keys(memories).forEach(function (jid) {
        var m = memories[jid];
        if (!m || !m.lastSeen) return;
        var totalMsgs = m.count || 0;
        if (totalMsgs < 15) return; // ignore low-volume members

        var silence = now - m.lastSeen;
        if (silence > threshold) {
            ghosts.push({
                jid: jid,
                name: m.name || ('@' + String(jid).split('@')[0]),
                lastSeen: m.lastSeen,
                daysSilent: Math.floor(silence / (24 * 60 * 60 * 1000)),
                totalMsgs: totalMsgs
            });
        }
    });

    ghosts.sort(function (a, b) { return b.daysSilent - a.daysSilent; });
    return ghosts;
}

async function welcomeRitual(askAI, newMemberName, groupName, groupCulture) {
    return askAI(
        'A new member joined the WhatsApp group "' + groupName + '". ' +
        'Create a PERSONALISED WELCOME RITUAL that the bot will perform for them.\n\n' +
        'New member: ' + newMemberName + '\n\n' +
        'Group culture (based on recent chat):\n' + (groupCulture || '(unknown)') + '\n\n' +
        'Format exactly:\n' +
        '🎁 *WELCOME RITUAL*\n\n' +
        '_Name:_ ' + newMemberName + '\n' +
        '_Rite:_ <one playful initiation action the group can do>\n' +
        '_First question:_ <one question the group asks new joiners>\n' +
        '_Little gift:_ <one small digital thing they get — emoji, sticker tradition, nickname suggestion>\n' +
        '_Rule of the house:_ <the single most important group rule, personalised>\n\n' +
        'Rules: warm, playful, inclusive. Never anything embarrassing or hazing-like. PG only. ' +
        'Base the ritual on THIS group\'s actual culture, not generic.',
        { systemPrompt: 'You write warm, personalised welcome rituals for new group members. PG only. Never hazing.' }
    );
}

function addLore(db, groupId, text, category) {
    if (!db.cultureVault[groupId]) db.cultureVault[groupId] = [];
    db.cultureVault[groupId].push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text: String(text).substring(0, 400),
        category: category || 'general',
        addedAt: Date.now()
    });
    while (db.cultureVault[groupId].length > 500) db.cultureVault[groupId].shift();
}

function searchVault(db, groupId, keyword) {
    if (!db.cultureVault[groupId]) return [];
    if (!keyword) return db.cultureVault[groupId].slice(-20).reverse();
    var k = keyword.toLowerCase();
    return db.cultureVault[groupId]
        .filter(function (x) { return x.text.toLowerCase().indexOf(k) !== -1 || (x.category || '').toLowerCase().indexOf(k) !== -1; })
        .slice(-20)
        .reverse();
}

async function extractCulture(askAI, context, groupName) {
    return askAI(
        'From the following group chat, extract 1-3 pieces of PERMANENT group culture. ' +
        'Only extract things that are recurring, memorable, or culturally defining for the group.\n\n' +
        'Categories to look for:\n' +
        '- JOKE (inside joke that keeps coming back)\n' +
        '- LEGEND (a memorable moment)\n' +
        '- NICKNAME (special name for a member)\n' +
        '- TRADITION (a recurring action)\n' +
        '- RIVALRY (a friendly ongoing banter)\n\n' +
        'Output ONLY lines in this exact format:\n' +
        'CATEGORY|short description of the piece of culture\n\n' +
        'If nothing clear, output NONE.\n' +
        'GROUP: ' + groupName + '\n\n' +
        'CHAT:\n' + (context || ''),
        { systemPrompt: 'You extract permanent cultural artifacts from chat. Never invent. Output only CATEGORY|description lines.' }
    );
}

module.exports = {
    ensure,
    findMatches,
    weeklyReplay,
    detectGhosts,
    welcomeRitual,
    addLore,
    searchVault,
    extractCulture
};
