function ensure(db) {
    if (!db.longTermMemory) db.longTermMemory = {};
    if (!db.ltmInbox) db.ltmInbox = {};
}

function getUser(db, jid) {
    ensure(db);
    if (!db.longTermMemory[jid]) {
        db.longTermMemory[jid] = {
            jid: jid,
            name: null,
            aliases: [],
            facts: [],
            groups: [],
            firstSeen: Date.now(),
            lastSeen: Date.now(),
            totalMessages: 0,
            lastConsolidated: 0
        };
    }
    return db.longTermMemory[jid];
}

function getInbox(db, jid) {
    ensure(db);
    if (!db.ltmInbox[jid]) db.ltmInbox[jid] = [];
    return db.ltmInbox[jid];
}

function observe(db, jid, name, text, groupId) {
    ensure(db);
    if (!jid) return;
    var user = getUser(db, jid);
    user.lastSeen = Date.now();
    user.totalMessages++;
    if (name && !user.name) user.name = name;
    if (name && user.name && name !== user.name && user.aliases.indexOf(name) === -1) {
        user.aliases.push(name);
        if (user.aliases.length > 5) user.aliases.shift();
    }
    if (groupId && user.groups.indexOf(groupId) === -1) {
        user.groups.push(groupId);
        if (user.groups.length > 20) user.groups.shift();
    }
    var inbox = getInbox(db, jid);
    inbox.push({ text: String(text).substring(0, 300), time: Date.now(), name: name });
    while (inbox.length > 40) inbox.shift();
}

function needsConsolidation(db, jid) {
    var user = getUser(db, jid);
    var inbox = getInbox(db, jid);
    if (inbox.length < 15) return false;
    if (Date.now() - user.lastConsolidated < 60 * 60 * 1000) return false;
    return true;
}

async function consolidate(db, jid, askAI) {
    var user = getUser(db, jid);
    var inbox = getInbox(db, jid);
    if (!inbox.length) return;

    var existingFacts = user.facts.map(function(f){ return '- ' + f.text; }).join('\n');
    var conversation = inbox.map(function(x){ return (x.name || 'User') + ': ' + x.text; }).join('\n');

    var prompt =
        'You are building a LONG-TERM MEMORY profile for a WhatsApp user.\n\n' +
        'EXISTING FACTS ABOUT THIS USER:\n' + (existingFacts || '(none yet)') + '\n\n' +
        'NEW MESSAGES FROM THIS USER:\n' + conversation + '\n\n' +
        'Task: identify NEW durable facts worth remembering about this user (things still true a year from now).\n' +
        'Categories:\n' +
        '- identity: name, age, location, job, school, family\n' +
        '- trait: personality, humor style, habits\n' +
        '- interest: hobbies, favourite things, teams, music\n' +
        '- relationship: who they know, who they talk to\n' +
        '- event: life events (birthday, moved, new job)\n' +
        '- preference: likes/dislikes\n\n' +
        'Rules:\n' +
        '- DO NOT repeat facts already listed.\n' +
        '- DO NOT invent anything.\n' +
        '- Only durable facts. Skip momentary statements like "I am eating rice".\n' +
        '- Output ONLY lines like: CATEGORY: fact\n' +
        '- If nothing durable, output exactly: NONE\n' +
        'Max 8 facts.';

    var result;
    try {
        result = await askAI(prompt, {
            systemPrompt: 'You extract durable long-term facts about a person. Never invent. Output one fact per line as CATEGORY: fact. If nothing durable, output NONE.'
        });
    } catch (e) {
        console.log('[LTM] AI error:', e.message);
        return;
    }

    user.lastConsolidated = Date.now();
    db.ltmInbox[jid] = [];

    if (!result) return;
    var cleaned = String(result).trim();
    if (!cleaned || cleaned.toUpperCase() === 'NONE') return;

    var lines = cleaned.split('\n');
    var added = 0;
    for (var i = 0; i < lines.length; i++) {
        var ln = lines[i].replace(/^[\s\-\*\u2022\d\.\)]+/, '').trim();
        if (!ln) continue;
        var m = ln.match(/^(identity|trait|interest|relationship|event|preference|summary)\s*:\s*(.+)$/i);
        var category = 'fact';
        var text = ln;
        if (m) { category = m[1].toLowerCase(); text = m[2].trim(); }
        if (text.length < 4 || text.length > 250) continue;

        var norm = text.toLowerCase().replace(/[^a-z0-9 ]/g, '');
        var isDup = user.facts.some(function(f){
            return f.text.toLowerCase().replace(/[^a-z0-9 ]/g, '') === norm;
        });
        if (isDup) continue;

        user.facts.push({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            text: text,
            category: category,
            added: Date.now(),
            weight: 1
        });
        added++;
    }

    user.facts.sort(function(a, b){ return (b.weight || 1) - (a.weight || 1) || b.added - a.added; });
    if (user.facts.length > 120) user.facts = user.facts.slice(0, 120);

    console.log('[LTM] ' + jid + ' +' + added + ' facts (total ' + user.facts.length + ')');
}

function tokenize(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(function(w){ return w.length > 2; });
}

function recall(db, jid, currentText, limit) {
    ensure(db);
    var user = db.longTermMemory[jid];
    if (!user || !user.facts || !user.facts.length) return '';
    limit = limit || 12;

    var words = tokenize(currentText);
    var wSet = {};
    words.forEach(function(w){ wSet[w] = true; });

    var scored = user.facts.map(function(f){
        var fWords = tokenize(f.text);
        var overlap = 0;
        fWords.forEach(function(w){ if (wSet[w]) overlap++; });
        var ageDays = (Date.now() - f.added) / (1000 * 60 * 60 * 24);
        var recency = Math.max(0, 3 - ageDays / 30);
        var score = overlap * 3 + (f.weight || 1) * 1 + recency;
        return { fact: f, score: score, overlap: overlap };
    });

    scored.sort(function(a, b){ return b.score - a.score; });

    var picked = scored.filter(function(s){ return s.overlap > 0; }).slice(0, limit);
    if (picked.length < 5) {
        var seen = {};
        picked.forEach(function(p){ seen[p.fact.id] = true; });
        scored.forEach(function(p){
            if (picked.length >= limit) return;
            if (seen[p.fact.id]) return;
            picked.push(p);
            seen[p.fact.id] = true;
        });
    }

    return picked.map(function(p){ return '- ' + p.fact.text; }).join('\n');
}

function buildProfileText(db, jid) {
    var user = db.longTermMemory[jid];
    if (!user) return '';
    var lines = [];
    if (user.name) lines.push('Name: ' + user.name);
    if (user.aliases && user.aliases.length) lines.push('Also known as: ' + user.aliases.join(', '));
    lines.push('Total messages: ' + user.totalMessages);
    if (user.firstSeen) lines.push('First seen: ' + new Date(user.firstSeen).toISOString().split('T')[0]);
    if (user.lastSeen) lines.push('Last seen: ' + new Date(user.lastSeen).toISOString().split('T')[0]);
    if (user.groups && user.groups.length) lines.push('Active in ' + user.groups.length + ' group(s)');
    return lines.join('\n');
}

function seedFromExisting(db) {
    if (!db.memory) return 0;
    var added = 0;
    Object.keys(db.memory).forEach(function(g){
        var users = db.memory[g] || {};
        Object.keys(users).forEach(function(u){
            var m = users[u];
            if (!m) return;
            var user = getUser(db, u);
            if (m.name && !user.name) user.name = m.name;
            if (!m.summaries || !m.summaries.length) return;
            m.summaries.forEach(function(sum){
                var text = String(sum).replace(/^\[\d{4}-\d{2}-\d{2}\]\s*/, '').trim();
                if (text.length < 20 || text.length > 400) return;
                var norm = text.toLowerCase().replace(/[^a-z0-9 ]/g, '');
                var isDup = user.facts.some(function(f){
                    return f.text.toLowerCase().replace(/[^a-z0-9 ]/g, '') === norm;
                });
                if (isDup) return;
                user.facts.push({
                    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                    text: text,
                    category: 'summary',
                    added: Date.now(),
                    weight: 0.5
                });
                added++;
            });
        });
    });
    if (added) console.log('[LTM] seeded ' + added + ' facts from existing memory');
    return added;
}

module.exports = {
    ensure,
    observe,
    needsConsolidation,
    consolidate,
    recall,
    buildProfileText,
    getUser,
    seedFromExisting
};
