function ensure(db) {
    if (!db.groupOracle) db.groupOracle = {};
    if (!db.timeBank) db.timeBank = {};
    if (!db.livingArchive) db.livingArchive = {};
    if (!db.socialPhysics) db.socialPhysics = {};
    if (!db.interventions) db.interventions = {};
}

// ---------- GROUP ORACLE ----------
async function generateOracleQuestions(askAI, context, groupName) {
    return askAI(
        'You are the GROUP ORACLE. Generate THREE ritual questions for the group to answer this week.\n\n' +
        'Each question should:\n' +
        '- Be thoughtful, playful, or revealing\n' +
        '- Help members know each other better\n' +
        '- Be specific to THIS group\'s vibe, not generic\n\n' +
        'Format exactly:\n' +
        '1|<question one>\n' +
        '2|<question two>\n' +
        '3|<question three>\n\n' +
        'Rules: PG only. Nothing about money, religion, politics, or personal crisis. Warm and inclusive.\n\n' +
        'GROUP: ' + (groupName || 'this group') + '\n' +
        'RECENT CHAT:\n' + (context || ''),
        { systemPrompt: 'You generate warm, inclusive ritual questions for chat groups. Output only numbered|question lines.' }
    );
}

function saveOracle(db, groupId, questions) {
    db.groupOracle[groupId] = {
        week: db.groupOracle[groupId] ? (db.groupOracle[groupId].week || 0) + 1 : 1,
        questions: questions,
        askedAt: Date.now(),
        answers: {},
        closed: false
    };
}

function recordAnswer(db, groupId, questionIdx, memberJid, memberName, answer) {
    var o = db.groupOracle[groupId];
    if (!o || o.closed) return false;
    if (!o.answers[questionIdx]) o.answers[questionIdx] = [];
    o.answers[questionIdx].push({
        jid: memberJid,
        name: memberName,
        answer: String(answer).substring(0, 400),
        at: Date.now()
    });
    return true;
}

function renderOracle(db, groupId) {
    var o = db.groupOracle[groupId];
    if (!o) return '\uD83D\uDD2E No oracle this week. Use .oracleritual to start one.';
    var out = '\uD83D\uDD2E *GROUP ORACLE \u2014 Week ' + o.week + '*\n\n';
    o.questions.forEach(function (q, i) {
        out += '*' + (i + 1) + '.* ' + q + '\n';
        var answers = o.answers[i] || [];
        if (answers.length) {
            out += '   _Answers:_ ' + answers.length + '\n';
        } else {
            out += '   _No answers yet_\n';
        }
        out += '\n';
    });
    out += '_To answer: send ".answer <1|2|3> <your answer>" in the group._';
    return out;
}

function renderOracleSummary(db, groupId) {
    var o = db.groupOracle[groupId];
    if (!o) return null;
    var out = '\uD83D\uDD2E *ORACLE WEEK ' + o.week + ' \u2014 THE ANSWERS*\n\n';
    o.questions.forEach(function (q, i) {
        out += '*' + (i + 1) + '.* ' + q + '\n';
        var answers = o.answers[i] || [];
        if (!answers.length) {
            out += '   _Nobody answered this one._\n\n';
            return;
        }
        answers.forEach(function (a) {
            out += '   \u2022 *' + a.name + ':* ' + a.answer + '\n';
        });
        out += '\n';
    });
    return out;
}

// ---------- TIME BANK ----------
function logInteraction(db, groupId, giverJid, giverName, receiverJid, receiverName, kind) {
    if (!db.timeBank[groupId]) db.timeBank[groupId] = {};
    if (!db.timeBank[groupId][giverJid]) db.timeBank[groupId][giverJid] = { name: giverName, given: 0, received: 0, byReceiver: {} };
    if (!db.timeBank[groupId][receiverJid]) db.timeBank[groupId][receiverJid] = { name: receiverName, given: 0, received: 0, byReceiver: {} };

    db.timeBank[groupId][giverJid].name = giverName || db.timeBank[groupId][giverJid].name;
    db.timeBank[groupId][receiverJid].name = receiverName || db.timeBank[groupId][receiverJid].name;

    db.timeBank[groupId][giverJid].given++;
    db.timeBank[groupId][receiverJid].received++;
    if (!db.timeBank[groupId][giverJid].byReceiver[receiverJid]) {
        db.timeBank[groupId][giverJid].byReceiver[receiverJid] = 0;
    }
    db.timeBank[groupId][giverJid].byReceiver[receiverJid]++;
}

function renderTimeBank(db, groupId) {
    var tb = db.timeBank[groupId];
    if (!tb) return '\u23F3 Time Bank is empty.';
    var members = Object.keys(tb).map(function (k) {
        var m = tb[k];
        return { jid: k, name: m.name, given: m.given, received: m.received, net: (m.given || 0) - (m.received || 0) };
    });
    members.sort(function (a, b) { return b.net - a.net; });

    var out = '\u23F3 *TIME BANK*\n';
    out += '_Who gives more attention than they receive_\n\n';
    out += '*Most generous:*\n';
    members.slice(0, 5).forEach(function (m, i) {
        out += (i + 1) + '. ' + m.name + ' (+' + m.net + ' net attention)\n';
    });
    out += '\n*Most supported:*\n';
    members.slice(-3).reverse().forEach(function (m) {
        out += '\u2022 ' + m.name + ' (' + m.received + ' received)\n';
    });
    return out;
}

// ---------- LIVING ARCHIVE ----------
async function writePersonalChapter(askAI, memberName, facts, recentMsgs, groupName, year) {
    var factList = facts ? facts.split('\n').filter(function (l) { return l.trim(); }).slice(0, 20).join('\n') : '(nothing yet)';
    var msgList = (recentMsgs || []).slice(-15).join('\n');

    return askAI(
        'Write a CHAPTER about one member of the WhatsApp group "' + groupName + '" for the year ' + year + '.\n\n' +
        'Person: ' + memberName + '\n\n' +
        'WHAT I KNOW ABOUT THEM:\n' + factList + '\n\n' +
        'SOME OF THEIR RECENT MESSAGES:\n' + msgList + '\n\n' +
        'Format exactly:\n' +
        '\uD83D\uDCD6 *' + memberName + ' \u2014 A Chapter*\n' +
        '_The ' + year + ' edition_\n\n' +
        '<3-5 short paragraphs. Warm, literary, observational. Mention real moments, habits, and personality traits.>\n\n' +
        '_One line about them:_ <one sentence as a closing epigraph>\n\n' +
        'Rules: warm, PG, inclusive. Never invent facts. Only what can be inferred from the data given.',
        { systemPrompt: 'You write warm, literary personal chapters based only on given data. Never invent.' }
    );
}

// ---------- SOCIAL PHYSICS ----------
function computeGravity(db, groupId) {
    var rel = (db.relationshipGraph && db.relationshipGraph[groupId]) || {};
    var memories = (db.memory && db.memory[groupId]) || {};
    var scores = {};

    Object.keys(memories).forEach(function (jid) {
        var m = memories[jid];
        scores[jid] = {
            jid: jid,
            name: m.name || ('@' + String(jid).split('@')[0]),
            gravity: 0,
            messages: m.count || 0,
            incoming: 0,
            outgoing: 0
        };
    });

    Object.keys(rel).forEach(function (from) {
        Object.keys(rel[from]).forEach(function (to) {
            var e = rel[from][to];
            var w = (e.mentions || 0) + (e.replies || 0) * 2;
            if (!scores[from]) scores[from] = { jid: from, name: '@' + String(from).split('@')[0], gravity: 0, messages: 0, incoming: 0, outgoing: 0 };
            if (!scores[to]) scores[to] = { jid: to, name: '@' + String(to).split('@')[0], gravity: 0, messages: 0, incoming: 0, outgoing: 0 };
            scores[from].outgoing += w;
            scores[to].incoming += w;
            scores[to].gravity += w * 1.5; // being talked about = more gravity
            scores[from].gravity += w * 0.5;
        });
    });

    Object.keys(scores).forEach(function (jid) {
        scores[jid].gravity += Math.min(30, scores[jid].messages * 0.3);
    });

    var arr = Object.keys(scores).map(function (k) { return scores[k]; });
    arr.sort(function (a, b) { return b.gravity - a.gravity; });

    var max = arr[0] ? arr[0].gravity : 1;
    arr.forEach(function (s) { s.percent = Math.round((s.gravity / max) * 100); });

    return arr;
}

function renderGravity(list, groupName) {
    if (!list.length) return '\uD83C\uDF0C No social physics data yet.';
    var out = '\uD83C\uDF0C *SOCIAL PHYSICS \u2014 ' + (groupName || 'this group') + '*\n\n';
    out += '_Gravity = how much pull a member has over the group_\n\n';
    var suns = list.slice(0, 3);
    var planets = list.slice(3, 8);
    var moons = list.slice(8, 15);

    if (suns.length) {
        out += '\u2600\uFE0F *Suns (highest gravity)*\n';
        suns.forEach(function (s, i) { out += (i + 1) + '. ' + s.name + ' \u2014 ' + s.percent + '%\n'; });
        out += '\n';
    }
    if (planets.length) {
        out += '\uD83E\uDE90 *Planets (orbiting)*\n';
        planets.forEach(function (s) { out += '\u2022 ' + s.name + ' \u2014 ' + s.percent + '%\n'; });
        out += '\n';
    }
    if (moons.length) {
        out += '\uD83C\uDF11 *Moons (small orbits)*\n';
        moons.forEach(function (s) { out += '\u2022 ' + s.name + ' \u2014 ' + s.percent + '%\n'; });
    }
    return out;
}

// ---------- INTERVENTION ----------
function detectConflict(db, groupId) {
    var arr = (db.groupChat && db.groupChat[groupId]) || [];
    if (arr.length < 10) return null;
    var now = Date.now();
    var last15 = arr.filter(function (m) { return now - m.time < 15 * 60 * 1000; });
    if (last15.length < 6) return null;

    var conflictWords = ['stupid','idiot','shut up','fool','nonsense','useless','trash','hate','dumb','rubbish','mf','fuck','wtf','nonsense','yeye'];
    var hits = 0;
    var involved = {};
    last15.forEach(function (m) {
        var t = String(m.text || '').toLowerCase();
        for (var i = 0; i < conflictWords.length; i++) {
            if (t.indexOf(conflictWords[i]) !== -1) {
                hits++;
                involved[m.name] = (involved[m.name] || 0) + 1;
                break;
            }
        }
    });

    var senders = {};
    last15.forEach(function (m) { senders[m.name] = (senders[m.name] || 0) + 1; });
    var sendersCount = Object.keys(senders).length;

    if (hits >= 3 && sendersCount <= 3) {
        return {
            hits: hits,
            involved: Object.keys(involved),
            recentMsgs: last15.length,
            sendersCount: sendersCount
        };
    }
    return null;
}

function renderIntervention() {
    return '\uD83D\uDED1 *PAUSE RITUAL*\n\n' +
        'The air feels heavy in here. Take a breath, not a side.\n\n' +
        '\u2022 Everyone gets ONE message before replying again.\n' +
        '\u2022 No "@" tags.\n' +
        '\u2022 No screenshots of older messages.\n' +
        '\u2022 If it can wait until tomorrow, let it.\n\n' +
        '_This is a bot-generated pause. When the group is ready, keep talking \u2014 on purpose._';
}

module.exports = {
    ensure,
    generateOracleQuestions,
    saveOracle,
    recordAnswer,
    renderOracle,
    renderOracleSummary,
    logInteraction,
    renderTimeBank,
    writePersonalChapter,
    computeGravity,
    renderGravity,
    detectConflict,
    renderIntervention
};
