function ensure(db) {
    if (!db.relationshipGraph) db.relationshipGraph = {};
    if (!db.guardianLog) db.guardianLog = {};
    if (!db.guardianCooldown) db.guardianCooldown = {};
}

var SCAM_PATTERNS = [
    /\b(send|transfer|deposit)\s+(me|us)?\s*(money|cash|funds|btc|usdt|crypto|naira|cedi|\$|₦)/i,
    /\b(guaranteed|100%)\s+(profit|return|roi|gain)/i,
    /\b(double|triple)\s+your\s+(money|investment|crypto)/i,
    /\b(invest|investment)\s+(opportunity|plan)\s+(fast|quick|urgent)/i,
    /\bairdrop\b.*\b(claim|connect|wallet)/i,
    /\b(seed phrase|private key|recovery phrase)\b/i,
    /\bcrypto\s+(giveaway|airdrop|mining)\b/i,
    /\b(pay|send)\s+\S+\s+(processing|release|activation)\s+fee/i,
    /\b(click|tap)\s+this\s+link\s+to\s+(claim|win|receive)/i,
    /\b(won|winner)\s+(a\s+)?(prize|iphone|giveaway)/i
];

var GROOMING_PATTERNS = [
    /\bdon'?t\s+(tell|inform)\s+(your\s+)?(parents|mum|mom|dad|guardian|anyone)/i,
    /\b(keep\s+(this|it)\s+(our\s+)?secret)/i,
    /\b(how\s+old\s+are\s+you|are\s+you\s+(13|14|15|16|17))\b/i,
    /\b(meet\s+me\s+(alone|privately|in\s+private))/i,
    /\b(send\s+(nudes|pics|photos|naked))/i
];

var THREAT_PATTERNS = [
    /\b(i\s+will|i'?ll)\s+(kill|hurt|beat|find|destroy|ruin)\s+(you|him|her|them)/i,
    /\b(i\s+know\s+where\s+you\s+live)/i,
    /\b(leak|expose|dox)\s+(your|his|her|their)/i
];

function classifyMessage(text) {
    if (!text) return null;
    var t = String(text);
    for (var i = 0; i < SCAM_PATTERNS.length; i++) {
        if (SCAM_PATTERNS[i].test(t)) return { kind: 'scam', confidence: 0.8 };
    }
    for (var j = 0; j < GROOMING_PATTERNS.length; j++) {
        if (GROOMING_PATTERNS[j].test(t)) return { kind: 'grooming', confidence: 0.85 };
    }
    for (var k = 0; k < THREAT_PATTERNS.length; k++) {
        if (THREAT_PATTERNS[k].test(t)) return { kind: 'threat', confidence: 0.8 };
    }
    return null;
}

async function guardianCheck(sock, db, groupId, senderId, senderName, text, isAdminFn, msg) {
    var verdict = classifyMessage(text);
    if (!verdict) return false;

    var cdKey = groupId + ':' + senderId + ':' + verdict.kind;
    var now = Date.now();
    if (db.guardianCooldown[cdKey] && now - db.guardianCooldown[cdKey] < 10 * 60 * 1000) {
        return false;
    }
    db.guardianCooldown[cdKey] = now;

    if (!db.guardianLog[groupId]) db.guardianLog[groupId] = [];
    db.guardianLog[groupId].push({
        sender: senderId,
        senderName: senderName || 'unknown',
        kind: verdict.kind,
        confidence: verdict.confidence,
        text: text.substring(0, 300),
        at: now
    });
    while (db.guardianLog[groupId].length > 50) db.guardianLog[groupId].shift();

    var admins = [];
    try {
        var meta = await sock.groupMetadata(groupId);
        (meta.participants || []).forEach(function (p) {
            if (p.admin) admins.push(p.id);
        });
    } catch (e) { console.log('[GUARDIAN] meta:', e.message); }

    if (!admins.length) return true;

    var icon = verdict.kind === 'scam' ? '🚨' : verdict.kind === 'grooming' ? '🛡️' : '⚠️';
    var groupName = '';
    try { groupName = (await sock.groupMetadata(groupId)).subject || 'the group'; } catch (e) {}

    var alert =
        icon + ' *SILENT GUARDIAN ALERT*\n\n' +
        '*Group:* ' + groupName + '\n' +
        '*Sender:* ' + (senderName || '@' + String(senderId).split('@')[0]) + '\n' +
        '*Detected:* ' + verdict.kind.toUpperCase() + ' (confidence ' + Math.round(verdict.confidence * 100) + '%)\n\n' +
        '*Message:*\n"' + text.substring(0, 300) + '"\n\n' +
        '_This alert is private. No action was taken automatically._';

    for (var a = 0; a < admins.length; a++) {
        try {
            await sock.sendMessage(admins[a], { text: alert });
        } catch (e) { console.log('[GUARDIAN] DM fail:', e.message); }
    }
    console.log('[GUARDIAN] ' + verdict.kind + ' from ' + senderId + ' — alerted ' + admins.length + ' admins');
    return true;
}

function trackRelation(db, groupId, senderJid, targetJid, kind) {
    if (!senderJid || !targetJid || senderJid === targetJid) return;
    if (!db.relationshipGraph[groupId]) db.relationshipGraph[groupId] = {};
    var g = db.relationshipGraph[groupId];
    if (!g[senderJid]) g[senderJid] = {};
    if (!g[senderJid][targetJid]) g[senderJid][targetJid] = { mentions: 0, replies: 0, lastAt: 0 };
    if (kind === 'mention') g[senderJid][targetJid].mentions++;
    else if (kind === 'reply') g[senderJid][targetJid].replies++;
    g[senderJid][targetJid].lastAt = Date.now();
}

function getRelations(db, groupId, jid) {
    var g = db.relationshipGraph[groupId] || {};
    var outgoing = g[jid] || {};

    var pairs = [];
    Object.keys(outgoing).forEach(function (to) {
        var e = outgoing[to];
        pairs.push({ jid: to, score: (e.mentions || 0) * 1 + (e.replies || 0) * 2, mentions: e.mentions, replies: e.replies });
    });
    pairs.sort(function (a, b) { return b.score - a.score; });

    var incoming = {};
    Object.keys(g).forEach(function (from) {
        if (g[from][jid]) {
            var e = g[from][jid];
            incoming[from] = (e.mentions || 0) + (e.replies || 0) * 2;
        }
    });

    var topJids = pairs.slice(0, 8).map(function (p) { return p.jid; });
    Object.keys(incoming).forEach(function (j) {
        if (topJids.indexOf(j) === -1 && incoming[j] >= 3) topJids.push(j);
    });

    return { outgoing: pairs, incoming: incoming, ids: topJids };
}

function findConnectors(db, groupId, limit) {
    var g = db.relationshipGraph[groupId] || {};
    var score = {};
    Object.keys(g).forEach(function (from) {
        Object.keys(g[from]).forEach(function (to) {
            var e = g[from][to];
            var w = (e.mentions || 0) + (e.replies || 0) * 2;
            score[from] = (score[from] || 0) + w;
            score[to] = (score[to] || 0) + w;
        });
    });
    var arr = Object.keys(score).map(function (k) { return { jid: k, score: score[k] }; });
    arr.sort(function (a, b) { return b.score - a.score; });
    return arr.slice(0, limit || 10);
}

async function judge(askAI, context, participants) {
    return askAI(
        'You are an IMPARTIAL DEBATE JUDGE. Read the recent chat and identify an ongoing disagreement or debate. ' +
        'If there is no real argument, say so honestly.\n\n' +
        'Format exactly (or just say "No active debate detected"):\n' +
        '⚖️ *DEBATE VERDICT*\n\n' +
        '*Issue:* <1 sentence>\n' +
        '*Side A (@<name>):* <their core argument, 1 sentence>\n' +
        '*Side B (@<name>):* <their core argument, 1 sentence>\n' +
        '*Common ground:* <1 sentence>\n' +
        '*Evidence for A:* <1-2 sentences>\n' +
        '*Evidence for B:* <1-2 sentences>\n' +
        '*Verdict:* <who has stronger logic, by how much, in one sentence>\n' +
        '*Confidence:* <XX>%\n\n' +
        'Rules:\n' +
        '- Fair to both sides.\n' +
        '- Base ONLY on what was actually said.\n' +
        '- Do not push personal opinions or politics.\n' +
        '- If a side made a claim without evidence, note that.\n\n' +
        'PARTICIPANTS: ' + (participants || []).join(', ') + '\n\n' +
        'CHAT:\n' + String(context || ''),
        { systemPrompt: 'You are a fair, evidence-based debate judge. Never take sides based on opinion. Only on argument quality.' }
    );
}

function buildCrossGroupProfile(db, jid) {
    var ltm = (db.longTermMemory && db.longTermMemory[jid]) || null;
    if (!ltm) return null;
    var groups = ltm.groups || [];
    var out = '🌐 *CROSS-GROUP PROFILE*\n\n';
    out += '*Name:* ' + (ltm.name || 'unknown') + '\n';
    if (ltm.aliases && ltm.aliases.length) out += '*Also known as:* ' + ltm.aliases.join(', ') + '\n';
    out += '*Total messages:* ' + (ltm.totalMessages || 0) + '\n';
    out += '*Active in:* ' + groups.length + ' group(s)\n';
    if (ltm.firstSeen) out += '*First seen:* ' + new Date(ltm.firstSeen).toISOString().split('T')[0] + '\n';
    if (ltm.lastSeen) out += '*Last seen:* ' + new Date(ltm.lastSeen).toISOString().split('T')[0] + '\n';
    out += '\n*Facts (' + ((ltm.facts && ltm.facts.length) || 0) + '):*\n';
    (ltm.facts || []).slice(0, 20).forEach(function (f) {
        out += '• [' + f.category + '] ' + f.text + '\n';
    });
    if ((ltm.facts || []).length > 20) out += '... +' + ((ltm.facts.length) - 20) + ' more\n';
    return out;
}

module.exports = {
    ensure,
    guardianCheck,
    classifyMessage,
    trackRelation,
    getRelations,
    findConnectors,
    judge,
    buildCrossGroupProfile
};
