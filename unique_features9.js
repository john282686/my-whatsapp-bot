function ensure(db) {
    if (!db.healthPulse) db.healthPulse = {};
    if (!db.moodTide) db.moodTide = {};
    if (!db.trendHistory) db.trendHistory = {};
    if (!db.adminBriefLast) db.adminBriefLast = {};
}

function scoreActivity(db, groupId) {
    var arr = (db.groupChat && db.groupChat[groupId]) || [];
    if (arr.length < 20) return { score: 0, reason: 'too few messages' };
    var day = 24 * 60 * 60 * 1000;
    var now = Date.now();
    var last24 = arr.filter(function (m) { return now - m.time < day; }).length;
    var last7 = arr.filter(function (m) { return now - m.time < 7 * day; }).length;
    var avgPerDay = last7 / 7;
    var score = Math.min(100, Math.round((last24 / Math.max(1, avgPerDay)) * 50 + (avgPerDay > 15 ? 50 : avgPerDay * 3)));
    return { score: score, last24: last24, avgPerDay: Math.round(avgPerDay) };
}

function scoreDiversity(db, groupId) {
    var arr = (db.groupChat && db.groupChat[groupId]) || [];
    if (arr.length < 20) return 0;
    var day = 24 * 60 * 60 * 1000;
    var now = Date.now();
    var senders = {};
    var total = 0;
    arr.forEach(function (m) {
        if (now - m.time < 7 * day) {
            senders[m.name] = (senders[m.name] || 0) + 1;
            total++;
        }
    });
    if (total === 0) return 0;
    var counts = Object.keys(senders).map(function (k) { return senders[k]; });
    var topShare = Math.max.apply(null, counts) / total;
    // Diversity score: 100 when evenly spread, lower when one person dominates
    return Math.round((1 - topShare) * 130);
}

function scoreEngagement(db, groupId) {
    var rel = (db.relationshipGraph && db.relationshipGraph[groupId]) || {};
    var pairs = 0;
    Object.keys(rel).forEach(function (from) {
        Object.keys(rel[from]).forEach(function (to) {
            var e = rel[from][to];
            if ((e.mentions || 0) + (e.replies || 0) * 2 >= 3) pairs++;
        });
    });
    return Math.min(100, pairs * 4);
}

async function scoreSentiment(askAI, recentContext) {
    if (!recentContext || recentContext.length < 50) return 50;
    try {
        var out = await askAI(
            'Rate the OVERALL SENTIMENT of this group chat on a scale of 0-100.\n' +
            '0 = toxic, hostile, everyone arguing\n' +
            '50 = neutral, mixed\n' +
            '100 = warm, positive, everyone vibing\n\n' +
            'Output ONLY a single number (the score). No words, no explanation.\n\n' +
            'CHAT:\n' + recentContext,
            { systemPrompt: 'You rate chat sentiment. Output only a number 0-100.' }
        );
        if (!out) return 50;
        var m = String(out).match(/\b(\d{1,3})\b/);
        if (!m) return 50;
        var n = parseInt(m[1], 10);
        if (n < 0) n = 0; if (n > 100) n = 100;
        return n;
    } catch (e) { return 50; }
}

async function healthPulse(askAI, db, groupId, recentContext) {
    var act = scoreActivity(db, groupId);
    var div = scoreDiversity(db, groupId);
    var eng = scoreEngagement(db, groupId);
    var sen = await scoreSentiment(askAI, recentContext);

    var composite = Math.round(
        (act.score || 0) * 0.35 +
        div * 0.20 +
        eng * 0.20 +
        sen * 0.25
    );

    var grade = 'F';
    if (composite >= 85) grade = 'S';
    else if (composite >= 70) grade = 'A';
    else if (composite >= 55) grade = 'B';
    else if (composite >= 40) grade = 'C';
    else if (composite >= 25) grade = 'D';

    return {
        score: composite,
        grade: grade,
        activity: act,
        diversity: div,
        engagement: eng,
        sentiment: sen,
        generatedAt: Date.now()
    };
}

function renderPulse(p, groupName) {
    if (!p) return '💓 No pulse yet.';
    var bar = '█'.repeat(Math.round(p.score / 5)) + '░'.repeat(20 - Math.round(p.score / 5));
    var out = '💓 *HEALTH PULSE — ' + (groupName || 'this group') + '*\n\n';
    out += 'Score: *' + p.score + '/100* (Grade ' + p.grade + ')\n';
    out += '`' + bar + '`\n\n';
    out += '• Activity: ' + p.activity.score + '/100 (' + (p.activity.last24 || 0) + ' msgs/24h, avg ' + (p.activity.avgPerDay || 0) + '/day)\n';
    out += '• Diversity: ' + p.diversity + '/100 ' + (p.diversity < 30 ? '⚠ one voice dominating' : '') + '\n';
    out += '• Engagement: ' + p.engagement + '/100\n';
    out += '• Sentiment: ' + p.sentiment + '/100\n';

    var advice = '';
    if (p.diversity < 30) advice = 'Encourage quieter members to speak up.';
    else if (p.activity.score < 30) advice = 'Group is quiet — consider a conversation starter.';
    else if (p.sentiment < 35) advice = 'Sentiment is low — check in on tensions.';
    else if (p.engagement < 30) advice = 'Members aren\'t connecting — try a group activity.';
    else if (p.score >= 80) advice = 'Strong and healthy. Keep doing what you\'re doing.';
    else advice = 'Looks stable.';

    out += '\n_Advice:_ ' + advice;
    return out;
}

function churnRisk(db, groupId) {
    var memories = (db.memory && db.memory[groupId]) || {};
    var now = Date.now();
    var day = 24 * 60 * 60 * 1000;
    var risky = [];

    Object.keys(memories).forEach(function (jid) {
        var m = memories[jid];
        if (!m || !m.count) return;
        var msgs = m.count;
        if (msgs < 10) return;
        var silence = m.lastSeen ? (now - m.lastSeen) : Infinity;
        var silenceDays = silence / day;

        // Frequency: messages per day since first seen
        var lifetime = ((m.lastSeen || now) - (m.firstSeen || now)) / day;
        var freq = lifetime > 1 ? (msgs / lifetime) : msgs;

        // Risk: silent + used to be active
        var risk = 0;
        if (silenceDays > 7) risk += 40;
        else if (silenceDays > 3) risk += 20;
        else if (silenceDays > 1) risk += 5;

        if (freq > 10 && silenceDays > 2) risk += 30;
        if (freq > 20 && silenceDays > 1) risk += 20;

        if (risk > 0) {
            risky.push({
                jid: jid,
                name: m.name || ('@' + String(jid).split('@')[0]),
                silenceDays: Math.floor(silenceDays),
                totalMsgs: msgs,
                risk: Math.min(100, risk)
            });
        }
    });

    risky.sort(function (a, b) { return b.risk - a.risk; });
    return risky;
}

function renderChurn(risky) {
    if (!risky.length) return '📉 No churn risk detected. Good sign.';
    var out = '📉 *CHURN RADAR*\n\n_Members showing early signs of leaving:_\n\n';
    risky.slice(0, 8).forEach(function (r, i) {
        var emoji = r.risk >= 60 ? '🔴' : r.risk >= 30 ? '🟡' : '🟢';
        out += (i + 1) + '. ' + emoji + ' ' + r.name + ' — risk ' + r.risk + '%\n';
        out += '    Silent ' + r.silenceDays + 'd, historically ' + r.totalMsgs + ' msgs\n';
    });
    out += '\n_Consider reaching out to high-risk members._';
    return out;
}

async function extractTrends(askAI, context) {
    if (!context || context.length < 100) return [];
    var out = await askAI(
        'Extract the TOP 3 emerging topics from this chat. Only ones that appear MULTIPLE times recently and feel fresh.\n\n' +
        'Format each as:\n' +
        'TOPIC|one short phrase\n\n' +
        'If nothing fresh, output NONE.\n\n' +
        'CHAT:\n' + context,
        { systemPrompt: 'You extract emerging topics from chat. Output only TOPIC|phrase lines. Never invent.' }
    );
    if (!out) return [];
    var lines = String(out).split('\n');
    var topics = [];
    lines.forEach(function (l) {
        var i = l.indexOf('|');
        if (i === -1) return;
        var t = l.slice(i + 1).trim();
        if (t.length > 2 && t.length < 60) topics.push(t);
    });
    return topics;
}

function recordTrends(db, groupId, topics) {
    if (!db.trendHistory[groupId]) db.trendHistory[groupId] = {};
    var now = Date.now();
    topics.forEach(function (t) {
        var key = t.toLowerCase();
        if (!db.trendHistory[groupId][key]) {
            db.trendHistory[groupId][key] = { text: t, firstSeen: now, count: 1, lastSeen: now };
        } else {
            db.trendHistory[groupId][key].count++;
            db.trendHistory[groupId][key].lastSeen = now;
        }
    });
}

function renderTrends(db, groupId) {
    var all = (db.trendHistory && db.trendHistory[groupId]) || {};
    var arr = Object.keys(all).map(function (k) { return all[k]; });
    arr.sort(function (a, b) { return b.lastSeen - a.lastSeen; });
    if (!arr.length) return '🎯 No trends detected yet.';

    var out = '🎯 *TREND RADAR*\n\n_Emerging topics in this group:_\n\n';
    var now = Date.now();
    var day = 24 * 60 * 60 * 1000;
    arr.slice(0, 10).forEach(function (t) {
        var age = Math.floor((now - t.firstSeen) / day);
        var emoji = age <= 1 ? '🔥' : age <= 7 ? '📈' : '📌';
        out += emoji + ' ' + t.text + ' — seen ' + t.count + '×' + (age > 0 ? ' (first ' + age + 'd ago)' : '') + '\n';
    });
    return out;
}

async function moodTide(askAI, recentContext) {
    if (!recentContext || recentContext.length < 100) return null;
    var out = await askAI(
        'Rate the sentiment of this group chat for the last 7 days on a scale 0-100.\n' +
        '0 = very negative, 50 = neutral, 100 = very positive.\n\n' +
        'Output exactly:\n' +
        'SCORE|<number>\n' +
        'TREND|<rising|stable|falling>\n' +
        'NOTE|<one short sentence about the mood>\n\n' +
        'CHAT:\n' + recentContext,
        { systemPrompt: 'You rate chat sentiment. Output only SCORE|/TREND|/NOTE| lines.' }
    );
    if (!out) return null;
    var result = { score: 50, trend: 'stable', note: '', at: Date.now() };
    String(out).split('\n').forEach(function (l) {
        var m = l.match(/^\s*(SCORE|TREND|NOTE)\s*\|\s*(.+)$/i);
        if (!m) return;
        var k = m[1].toUpperCase();
        var v = m[2].trim();
        if (k === 'SCORE') { var n = parseInt(v, 10); if (!isNaN(n)) result.score = Math.max(0, Math.min(100, n)); }
        else if (k === 'TREND') result.trend = v.toLowerCase();
        else if (k === 'NOTE') result.note = v;
    });
    return result;
}

function renderMoodTide(db, groupId, current) {
    if (!db.moodTide[groupId]) db.moodTide[groupId] = [];
    if (current) {
        db.moodTide[groupId].push({ score: current.score, at: current.at });
        while (db.moodTide[groupId].length > 30) db.moodTide[groupId].shift();
    }
    var hist = db.moodTide[groupId] || [];
    if (!hist.length) return '🌊 No tide data yet.';

    var line = '';
    var bars = ['▁','▂','▃','▄','▅','▆','▇','█'];
    hist.forEach(function (h) {
        var idx = Math.min(7, Math.max(0, Math.round((h.score / 100) * 7)));
        line += bars[idx];
    });

    var out = '🌊 *MOOD TIDE*\n\n';
    out += '`' + line + '`\n';
    out += '0 ────── 50 ────── 100\n\n';
    if (current) {
        out += 'Now: *' + current.score + '/100* (' + current.trend + ')\n';
        if (current.note) out += '_' + current.note + '_\n';
    }
    out += '_Trend over last ' + hist.length + ' readings_';
    return out;
}

async function adminBrief(askAI, db, groupId, groupName, recentContext) {
    var pulse = await healthPulse(askAI, db, groupId, recentContext);
    var churn = churnRisk(db, groupId);
    var ghosts = [];
    var memories = (db.memory && db.memory[groupId]) || {};
    var now = Date.now();
    Object.keys(memories).forEach(function (jid) {
        var m = memories[jid];
        if (!m || !m.lastSeen) return;
        if ((m.count || 0) < 15) return;
        var silenceDays = (now - m.lastSeen) / (24 * 60 * 60 * 1000);
        if (silenceDays >= 3 && silenceDays < 30) {
            ghosts.push({ name: m.name || ('@' + String(jid).split('@')[0]), days: Math.floor(silenceDays) });
        }
    });
    ghosts.sort(function (a, b) { return b.days - a.days; });

    var stats = { messages: 0, games: 0, roasts: 0 };
    if (db.groupStats[groupId]) {
        stats.messages = db.groupStats[groupId].messages || 0;
        stats.games = db.groupStats[groupId].games || 0;
        stats.roasts = db.groupStats[groupId].roasts || 0;
    }

    return {
        groupName: groupName,
        pulse: pulse,
        churn: churn.slice(0, 5),
        ghosts: ghosts.slice(0, 5),
        stats: stats,
        generatedAt: now
    };
}

function renderBrief(brief) {
    var out = '📋 *DAILY ADMIN BRIEF*\n';
    out += '_' + brief.groupName + ' — ' + new Date(brief.generatedAt).toLocaleString() + '_\n\n';
    out += '💓 *Health:* ' + brief.pulse.score + '/100 (Grade ' + brief.pulse.grade + ')\n\n';

    if (brief.churn.length) {
        out += '📉 *Churn risk:*\n';
        brief.churn.forEach(function (c) {
            out += '• ' + c.name + ' — ' + c.risk + '%\n';
        });
        out += '\n';
    }

    if (brief.ghosts.length) {
        out += '👻 *Quiet members:*\n';
        brief.ghosts.forEach(function (g) {
            out += '• ' + g.name + ' — ' + g.days + 'd silent\n';
        });
        out += '\n';
    }

    out += '📊 *Group totals:*\n';
    out += '• Messages: ' + brief.stats.messages + '\n';
    out += '• Games: ' + brief.stats.games + '\n';
    out += '• Roasts: ' + brief.stats.roasts + '\n';

    return out;
}

module.exports = {
    ensure,
    healthPulse,
    renderPulse,
    churnRisk,
    renderChurn,
    extractTrends,
    recordTrends,
    renderTrends,
    moodTide,
    renderMoodTide,
    adminBrief,
    renderBrief
};
