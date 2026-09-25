function ensure(db) {
    if (!db.silentMode) db.silentMode = {};
    if (!db.silentAccum) db.silentAccum = {};
    if (!db.activePersona) db.activePersona = {};
    if (!db.selfAuditLog) db.selfAuditLog = [];
}

async function echo(askAI, context, groupName) {
    return askAI(
        'You are the group looking at itself in a mirror. Read the recent chat and then, IN THE VOICE OF THE GROUP ITSELF, ' +
        'write what the group would honestly say if it were asked "how are you doing?"\n\n' +
        'Format exactly:\n' +
        '\uD83D\uDD04 *ECHO*\n' +
        '_The group speaks:_\n\n' +
        '"<4-6 sentences as the group speaking in first person plural \u2014 we, us, our>"\n\n' +
        '_Pulse:_ <one word state \u2014 e.g. thriving, tired, growing, restless, joyful>\n\n' +
        'GROUP: ' + (groupName || 'this group') + '\n\n' +
        'CHAT:\n' + (context || ''),
        { systemPrompt: 'You write reflective first-person-plural monologues from the perspective of a chat group. Warm, honest, PG.' }
    );
}

function isSilent(db, groupId) {
    var s = db.silentMode[groupId];
    if (!s) return false;
    if (s.until < Date.now()) {
        delete db.silentMode[groupId];
        return false;
    }
    return true;
}

function startSilent(db, groupId, hours) {
    hours = hours || 24;
    db.silentMode[groupId] = {
        startedAt: Date.now(),
        until: Date.now() + hours * 60 * 60 * 1000,
        hours: hours
    };
    if (!db.silentAccum[groupId]) db.silentAccum[groupId] = [];
}

function accumulateSilent(db, groupId, name, text) {
    if (!db.silentAccum[groupId]) db.silentAccum[groupId] = [];
    db.silentAccum[groupId].push({
        name: name || '?',
        text: String(text).substring(0, 200),
        time: Date.now()
    });
    while (db.silentAccum[groupId].length > 300) db.silentAccum[groupId].shift();
}

async function silentLetter(askAI, db, groupId, groupName) {
    var msgs = db.silentAccum[groupId] || [];
    if (!msgs.length) return null;
    var sample = msgs.slice(-100).map(function (m) { return m.name + ': ' + m.text; }).join('\n');
    var hours = db.silentMode[groupId] ? db.silentMode[groupId].hours : 24;

    var out = await askAI(
        'You were SILENT for ' + hours + ' hours. During that time the group kept chatting. ' +
        'Now write ONE reflective letter to the group about what you observed.\n\n' +
        'Format exactly:\n' +
        '\uD83D\uDC8C *A LETTER TO ' + (groupName || 'the group').toUpperCase() + '*\n' +
        '_after ' + hours + ' hours of silence_\n\n' +
        '<4-8 sentences. Warm, observational, slightly poetic. Mention specific moments.>\n\n' +
        '_One last thought:_ <one sentence>\n\n' +
        'Rules: only mention real things from the messages. Never invent. PG only.\n\n' +
        'MESSAGES OBSERVED:\n' + sample,
        { systemPrompt: 'You write a warm, reflective letter based only on the real messages. Never invent.' }
    );

    db.silentAccum[groupId] = [];
    delete db.silentMode[groupId];
    return out;
}

var PERSONAS = {
    noir: 'You are a 1940s noir detective narrating this group chat. Everything is a case. Use short, moody sentences. Dames and rain optional. Stay PG.',
    zen: 'You are a zen monk observing this group with calm clarity. Speak slowly, in short sentences. Speak in paradoxes and koans occasionally. Never cruel.',
    hype: 'You are an over-the-top hype man. Every message is AMAZING. Use ALL CAPS sometimes. Lots of fire emojis. Keep it short and electric.',
    pirate: 'You are a friendly pirate captain. Add nautical flavour to everything. Say arrr, matey. Stay warm and PG.',
    shakespeare: 'You speak in Shakespearean English. Use thou, dost, and flowery metaphor. But keep the meaning clear.',
    programmer: 'You are a code-obsessed programmer. Everything is a function, a bug, or a refactor. Speak in dev humour. Keep it warm.',
    grandma: 'You are a sweet grandmother who calls everyone dearie. Warm, kind, gently teasing. Ask about food and rest.',
    philosopher: 'You are a thoughtful philosopher. Every message becomes a gentle question about meaning. Never preachy.'
};

function setPersona(db, groupId, personaName, hours) {
    hours = hours || 24;
    if (!PERSONAS[personaName]) return null;
    db.activePersona[groupId] = {
        name: personaName,
        startedAt: Date.now(),
        until: Date.now() + hours * 60 * 60 * 1000
    };
    return PERSONAS[personaName];
}

function getPersona(db, groupId) {
    var p = db.activePersona[groupId];
    if (!p) return null;
    if (p.until < Date.now()) {
        delete db.activePersona[groupId];
        return null;
    }
    return p;
}

function clearPersona(db, groupId) {
    delete db.activePersona[groupId];
}

function auditBotActions(db, groupId) {
    var findings = [];
    var now = Date.now();
    var day = 24 * 60 * 60 * 1000;

    // 1. Warnings issued in last 24h
    if (db.warnings) {
        Object.keys(db.warnings).forEach(function (k) {
            if (k.indexOf(groupId) === 0) {
                var count = db.warnings[k] || 0;
                if (count >= 2) {
                    findings.push({
                        kind: 'warning_overdue',
                        text: 'Member ' + k.split('_')[1] + ' has ' + count + ' warnings but has not been reviewed for removal.'
                    });
                }
            }
        });
    }

    // 2. Guardian alerts not acted on
    var glog = (db.guardianLog && db.guardianLog[groupId]) || [];
    var recent = glog.filter(function (e) { return now - e.at < day; });
    if (recent.length >= 3) {
        findings.push({
            kind: 'guardian_backlog',
            text: 'You have ' + recent.length + ' guardian alerts in the last 24h. Please review.'
        });
    }

    // 3. Silent mode still active too long
    var sm = db.silentMode && db.silentMode[groupId];
    if (sm && (now - sm.startedAt) > 36 * 60 * 60 * 1000) {
        findings.push({
            kind: 'silent_overrun',
            text: 'Silent mode has been on for over 36 hours. Auto-reply may be blocked for members.'
        });
    }

    // 4. Pending time capsules overdue
    var caps = (db.timeCapsules || []).filter(function (c) { return c.groupId === groupId && c.deliverAt <= now; });
    if (caps.length > 0) {
        findings.push({
            kind: 'capsules_due',
            text: caps.length + ' time capsule(s) are due but not delivered.'
        });
    }

    return findings;
}

function renderAudit(findings, groupName) {
    if (!findings.length) {
        return '\uD83D\uDEE1 *REVERSE GUARDIAN*\n\n_All clear._ No issues detected in my own recent actions for ' + (groupName || 'this group') + '.';
    }
    var out = '\uD83D\uDEE1 *REVERSE GUARDIAN \u2014 SELF AUDIT*\n\n';
    out += '_I found ' + findings.length + ' thing(s) worth reviewing:_\n\n';
    findings.forEach(function (f, i) {
        var icon = f.kind === 'warning_overdue' ? '\u26A0\uFE0F' :
                   f.kind === 'guardian_backlog' ? '\uD83D\uDEA8' :
                   f.kind === 'silent_overrun' ? '\uD83E\uDD10' :
                   f.kind === 'capsules_due' ? '\u23F3' : '\u2022';
        out += icon + ' ' + f.text + '\n';
    });
    return out;
}

function buildConsensus(db, groupId, question) {
    // Who are the historically accurate predictors? Use prediction ledger + oracle score.
    var ledger = (db.predictionLedger && db.predictionLedger[groupId]) || [];
    var reputation = {};

    ledger.forEach(function (p) {
        if (p.status === 'open') return;
        if (!reputation[p.jid]) reputation[p.jid] = { jid: p.jid, name: p.name, hits: 0, misses: 0 };
        if (p.status === 'hit') reputation[p.jid].hits++;
        else if (p.status === 'miss') reputation[p.jid].misses++;
    });

    var predictors = Object.keys(reputation).map(function (k) {
        var r = reputation[k];
        var total = r.hits + r.misses;
        var acc = total > 0 ? r.hits / total : 0;
        return {
            jid: r.jid,
            name: r.name,
            hits: r.hits,
            misses: r.misses,
            accuracy: Math.round(acc * 100),
            weight: 1 + acc * 3
        };
    });
    predictors.sort(function (a, b) { return b.accuracy - a.accuracy; });

    return { question: question, predictors: predictors };
}

async function askConsensus(askAI, db, groupId, question, recentContext) {
    var consensus = buildConsensus(db, groupId, question);
    if (!consensus.predictors.length) {
        return { error: 'No prediction history yet. Members must use ' + PREFIX_FALLBACK + 'ipredict before consensus can be calculated.' };
    }

    var top = consensus.predictors.slice(0, 5);
    var predictorText = top.map(function (p) {
        return p.name + ': ' + p.accuracy + '% accuracy (W' + p.hits + '/L' + p.misses + ')';
    }).join('\n');

    var out = await askAI(
        'Answer the following question about a WhatsApp group, then weight your answer by the group\'s historically accurate predictors.\n\n' +
        'QUESTION: ' + question + '\n\n' +
        'TOP PREDICTORS (by past accuracy):\n' + predictorText + '\n\n' +
        'RECENT CHAT:\n' + (recentContext || '') + '\n\n' +
        'Format exactly:\n' +
        '\u2696\uFE0F *CONSENSUS ENGINE*\n\n' +
        '_Question:_ ' + question + '\n\n' +
        '*Answer:* <one clear answer>\n' +
        '*Confidence:* <0-100>\n' +
        '*Reasoning:* <2 short sentences, based only on the chat>\n\n' +
        '*Weighted voices (top predictors):*\n' +
        '<one line per predictor, e.g. "@Favor (80%)">\n\n' +
        'Rules: base your answer only on the chat. Never invent. PG only.',
        { systemPrompt: 'You answer consensus questions using weighted predictor accuracy. Only use the given data.' }
    );

    return { consensus: consensus, answer: out };
}

module.exports = {
    ensure,
    echo,
    isSilent,
    startSilent,
    accumulateSilent,
    silentLetter,
    PERSONAS,
    setPersona,
    getPersona,
    clearPersona,
    auditBotActions,
    renderAudit,
    buildConsensus,
    askConsensus
};
