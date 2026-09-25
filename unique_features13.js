function ensure(db) {
    if (!db.stockMarket) db.stockMarket = {};
    if (!db.futureLetters) db.futureLetters = {};
    if (!db.reversePolls) db.reversePolls = {};
    if (!db.anthropologist) db.anthropologist = {};
}

// ---------- GROUP STOCK MARKET ----------
function updatePrices(db, groupId) {
    if (!db.stockMarket[groupId]) db.stockMarket[groupId] = { stocks: {}, lastUpdated: 0 };
    var sm = db.stockMarket[groupId];
    var memories = (db.memory && db.memory[groupId]) || {};
    var rel = (db.relationshipGraph && db.relationshipGraph[groupId]) || {};
    var now = Date.now();
    var day = 24 * 60 * 60 * 1000;

    // Incoming mentions
    var incoming = {};
    Object.keys(rel).forEach(function (from) {
        Object.keys(rel[from]).forEach(function (to) {
            var w = (rel[from][to].mentions || 0) + (rel[from][to].replies || 0) * 2;
            incoming[to] = (incoming[to] || 0) + w;
        });
    });

    Object.keys(memories).forEach(function (jid) {
        var m = memories[jid];
        if (!m || (m.count || 0) < 5) return;
        var name = m.name || ('@' + String(jid).split('@')[0]);
        if (!sm.stocks[jid]) {
            sm.stocks[jid] = {
                jid: jid,
                name: name,
                price: 100,
                prevPrice: 100,
                history: [100],
                holders: {},
                created: now
            };
        }
        var stock = sm.stocks[jid];

        var recentActivity = 0;
        var lastSeen = m.lastSeen || 0;
        if (now - lastSeen < day) recentActivity = 1;
        else if (now - lastSeen < 3 * day) recentActivity = 0.5;

        var sentimentLift = (m.count || 0) > 50 ? 1.15 : 1.0;
        var incomingLift = 1 + Math.min(0.5, (incoming[jid] || 0) / 200);

        stock.prevPrice = stock.price;
        var drift = (recentActivity * 8) + ((m.count || 0) % 5);
        stock.price = Math.max(20, Math.min(1000, Math.round(stock.price * 0.92 + drift * sentimentLift * incomingLift)));
        stock.history.push(stock.price);
        while (stock.history.length > 30) stock.history.shift();
        if (!stock.name || stock.name.indexOf('@') === 0) stock.name = name;
    });

    sm.lastUpdated = now;
}

function renderStockMarket(db, groupId) {
    var sm = db.stockMarket[groupId];
    if (!sm || !sm.stocks) return '📈 Stock market not initialized. Use .market to open it.';
    var stocks = Object.keys(sm.stocks).map(function (k) { return sm.stocks[k]; });
    stocks.sort(function (a, b) { return b.price - a.price; });
    if (!stocks.length) return '📈 No stocks yet.';

    var out = '📈 *GROUP STOCK MARKET*\n\n';
    out += '_Prices update with real activity_\n\n';
    stocks.slice(0, 10).forEach(function (s, i) {
        var change = s.prevPrice ? Math.round(((s.price - s.prevPrice) / s.prevPrice) * 100) : 0;
        var arrow = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
        out += (i + 1) + '. ' + s.name + ' — *' + s.price + '* ' + arrow + ' ' + (change >= 0 ? '+' : '') + change + '%\n';
    });
    return out;
}

function buyStock(db, groupId, buyerJid, buyerName, targetJid, shares) {
    if (!db.stockMarket[groupId]) return null;
    var stock = db.stockMarket[groupId].stocks[targetJid];
    if (!stock) return null;
    if (!buyerJid) return null;

    var coins = getUserCoins(db, groupId, buyerJid, buyerName);
    var cost = shares * stock.price;
    if (coins < cost) return { error: 'insufficient', need: cost, have: coins };

    subtractCoins(db, groupId, buyerJid, cost);
    stock.holders[buyerJid] = stock.holders[buyerJid] || { name: buyerName, shares: 0, paid: 0 };
    stock.holders[buyerJid].shares += shares;
    stock.holders[buyerJid].paid += cost;
    return { ok: true, shares: shares, cost: cost, newBalance: getUserCoins(db, groupId, buyerJid) };
}

function getUserCoins(db, groupId, jid, name) {
    if (!db.stockMarket[groupId]) db.stockMarket[groupId] = { stocks: {}, wallets: {} };
    if (!db.stockMarket[groupId].wallets) db.stockMarket[groupId].wallets = {};
    if (!db.stockMarket[groupId].wallets[jid]) {
        db.stockMarket[groupId].wallets[jid] = { name: name, coins: 1000 };
    }
    return db.stockMarket[groupId].wallets[jid].coins;
}

function addCoins(db, groupId, jid, amount) {
    getUserCoins(db, groupId, jid);
    db.stockMarket[groupId].wallets[jid].coins += amount;
}

function subtractCoins(db, groupId, jid, amount) {
    getUserCoins(db, groupId, jid);
    db.stockMarket[groupId].wallets[jid].coins -= amount;
}

function renderWallet(db, groupId, jid) {
    var c = getUserCoins(db, groupId, jid);
    var port = '';
    var sm = db.stockMarket[groupId];
    if (sm && sm.stocks) {
        Object.keys(sm.stocks).forEach(function (k) {
            var s = sm.stocks[k];
            if (s.holders[jid] && s.holders[jid].shares > 0) {
                var value = s.holders[jid].shares * s.price;
                port += '• ' + s.name + ': ' + s.holders[jid].shares + ' shares (~' + value + ' coins)\n';
            }
        });
    }
    var out = '💰 *YOUR WALLET*\n\n';
    out += 'Coins: *' + c + '*\n\n';
    if (port) out += 'Portfolio:\n' + port;
    else out += '_No shares held._\n';
    return out;
}

// ---------- TIME TRAVEL LETTERS ----------
function queueFutureLetter(db, groupId, senderJid, senderName, text, days) {
    if (!db.futureLetters) db.futureLetters = [];
    db.futureLetters.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        groupId: groupId,
        senderJid: senderJid,
        senderName: senderName,
        text: String(text).substring(0, 1500),
        createdAt: Date.now(),
        deliverAt: Date.now() + days * 24 * 60 * 60 * 1000,
        days: days
    });
}

async function deliverDueLetters(sock, db) {
    if (!db.futureLetters || !db.futureLetters.length) return 0;
    var now = Date.now();
    var due = db.futureLetters.filter(function (l) { return l.deliverAt <= now; });
    if (!due.length) return 0;
    db.futureLetters = db.futureLetters.filter(function (l) { return l.deliverAt > now; });
    var delivered = 0;
    for (var i = 0; i < due.length; i++) {
        var letter = due[i];
        try {
            var msg = '💌 *A LETTER FROM YOUR PAST SELF*\n\n' +
                      '_Written ' + letter.days + ' days ago (' + new Date(letter.createdAt).toLocaleDateString() + ')_\n\n' +
                      '"' + letter.text + '"';
            await sock.sendMessage(letter.senderJid, { text: msg });
            delivered++;
        } catch (e) { console.log('[LETTER]', e.message); }
    }
    return delivered;
}

// ---------- REVERSE POLLS ----------
async function predictPolls(askAI, db, groupId, question, options, members) {
    var memStr = JSON.stringify(members);
    var optStr = (options || []).join(', ');
    var out = await askAI(
        'You will predict how each member of a WhatsApp group will vote.\n\n' +
        'QUESTION: ' + question + '\n' +
        'OPTIONS: ' + optStr + '\n\n' +
        'MEMBERS: ' + memStr + '\n\n' +
        'For each member, output one line:\n' +
        '<name>|<option>\n\n' +
        'Base predictions ONLY on what you know about them (long-term memory is not available here, so be honest and pick a likely option). ' +
        'If unsure, still pick one — it is a prediction, not a claim.\n' +
        'Do NOT include reasoning, only the pipe lines.',
        { systemPrompt: 'You predict votes for chat members. Output only name|option lines.' }
    );
    return out;
}

function saveReversePoll(db, groupId, question, options, predictions) {
    if (!db.reversePolls[groupId]) db.reversePolls[groupId] = [];
    var id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    db.reversePolls[groupId].push({
        id: id,
        question: question,
        options: options,
        predictions: predictions,
        actual: {},
        createdAt: Date.now(),
        closed: false
    });
    while (db.reversePolls[groupId].length > 30) db.reversePolls[groupId].shift();
    return id;
}

function recordPollVote(db, groupId, pollId, memberName, choice) {
    var polls = (db.reversePolls[groupId] || []).filter(function (p) { return p.id === pollId; });
    if (!polls.length) return false;
    polls[0].actual[memberName] = choice;
    return true;
}

function scoreReversePoll(db, groupId, pollId) {
    var polls = (db.reversePolls[groupId] || []).filter(function (p) { return p.id === pollId; });
    if (!polls.length) return null;
    var poll = polls[0];
    var hits = 0, total = 0;
    Object.keys(poll.actual).forEach(function (name) {
        var pred = poll.predictions[name];
        if (!pred) return;
        total++;
        if (String(pred).toLowerCase() === String(poll.actual[name]).toLowerCase()) hits++;
    });
    return { hits: hits, total: total, accuracy: total > 0 ? Math.round(100 * hits / total) : 0 };
}

// ---------- ANTHROPOLOGIST ----------
async function anthropologist(askAI, db, groupId, targetJid, targetName, groupName) {
    var mem = db.memory && db.memory[groupId] && db.memory[groupId][targetJid];
    var facts = '';
    if (mem) {
        if (mem.summaries && mem.summaries.length) facts += mem.summaries.slice(-3).join('\n');
        if (mem.recent && mem.recent.length) facts += '\n\nRecent messages:\n' + mem.recent.slice(-10).join('\n');
    }
    if (db.longTermMemory && db.longTermMemory[targetJid] && db.longTermMemory[targetJid].facts) {
        var ltf = db.longTermMemory[targetJid].facts.slice(0, 15).map(function (f) { return '- ' + f.text; }).join('\n');
        facts += '\n\nLong-term facts:\n' + ltf;
    }

    return askAI(
        'You are THE ANTHROPOLOGIST. Study one member of the WhatsApp group "' + groupName + '".\n\n' +
        'SUBJECT: ' + targetName + '\n\n' +
        'FIELD NOTES:\n' + (facts || '(very little data yet)') + '\n\n' +
        'Write a formal academic-style observation report.\n' +
        'Format exactly:\n' +
        '🔬 *THE ANTHROPOLOGIST*\n' +
        '_Subject: ' + targetName + '_\n\n' +
        '*Behavioral pattern:* <one sentence>\n' +
        '*Communication style:* <one sentence>\n' +
        '*Signature moves:* <one sentence>\n' +
        '*Peak activity:* <when do they show up?>\n' +
        '*Unexpected finding:* <one sentence \u2014 something surprising>\n' +
        '*Field conclusion:* <one warm sentence>\n\n' +
        'Rules: warm, playful, PG. Only from given data. Never invent. If data is thin, say so honestly.',
        { systemPrompt: 'You write warm, playful anthropological reports of chat members. Only from given data.' }
    );
}

// ---------- THE FORGOTTEN ----------
function forgetRandom(db, groupId) {
    var arr = (db.groupChat && db.groupChat[groupId]) || [];
    if (arr.length < 20) return null;
    // Only look at messages older than 14 days
    var cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
    var old = arr.filter(function (m) { return m.time < cutoff; });
    if (old.length < 5) return null;
    var pick = old[Math.floor(Math.random() * old.length)];
    return pick;
}

function renderForgotten(pick) {
    if (!pick) return null;
    var daysAgo = Math.floor((Date.now() - pick.time) / (24 * 60 * 60 * 1000));
    return '🕰️ *THE FORGOTTEN*\n\n' +
        '_' + daysAgo + ' days ago, ' + pick.name + ' said:_\n\n' +
        '"' + pick.text + '"\n\n' +
        '_Nobody remembers why._';
}

module.exports = {
    ensure,
    updatePrices,
    renderStockMarket,
    buyStock,
    renderWallet,
    getUserCoins,
    addCoins,
    subtractCoins,
    queueFutureLetter,
    deliverDueLetters,
    predictPolls,
    saveReversePoll,
    recordPollVote,
    scoreReversePoll,
    anthropologist,
    forgetRandom,
    renderForgotten
};
