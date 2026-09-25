function ensure(db) {
    if (!db.groupAutobiography) db.groupAutobiography = {};
    if (!db.oraclePredictions) db.oraclePredictions = {};
    if (!db.oracleScore) db.oracleScore = { hits: 0, misses: 0 };
}

async function multiverse(askAI, context, members, scenario) {
    return askAI(
        'Rewrite this WhatsApp group as if it existed in a DIFFERENT reality. ' +
        'Keep the SAME real names and SAME personalities, but change the setting completely to: ' + scenario + '.\n\n' +
        'Output 6-10 short lines that alternate between speakers, using their real names, ' +
        'keeping their real typing style. It should feel like THEM but in another world.\n' +
        'Add one dramatic narrator line at the end.\n\n' +
        'MEMBERS: ' + (members || []).join(', ') + '\n\n' +
        'REAL GROUP CHAT:\n' + (context || ''),
        { systemPrompt: 'You rewrite group chat as multiverse fiction, preserving each persons real voice. PG only.' }
    );
}

function detectiveSearch(db, groupId, keyword) {
    if (!keyword) return null;
    var arr = (db.groupChat && db.groupChat[groupId]) || [];
    var k = keyword.toLowerCase();
    var matches = arr.filter(function (x) {
        return x.text && x.text.toLowerCase().indexOf(k) !== -1;
    });
    if (!matches.length) return null;
    matches.sort(function (a, b) { return a.time - b.time; });

    var first = matches[0];
    var senders = {};
    matches.forEach(function (m) {
        senders[m.name] = (senders[m.name] || 0) + 1;
    });

    return {
        total: matches.length,
        firstAt: first.time,
        firstBy: first.name,
        firstText: first.text,
        senders: senders,
        recentSample: matches.slice(-5).map(function (m) {
            return { name: m.name, text: m.text, time: m.time };
        })
    };
}

async function detective(askAI, db, groupId, keyword) {
    var found = detectiveSearch(db, groupId, keyword);
    if (!found) return null;

    var summary = 'TOPIC: ' + keyword + '\n' +
                  'FIRST MENTION: ' + new Date(found.firstAt).toLocaleString() + ' by ' + found.firstBy + '\n' +
                  'FIRST TEXT: "' + found.firstText + '"\n' +
                  'TOTAL MENTIONS: ' + found.total + '\n' +
                  'TOP SPEAKERS: ' + Object.keys(found.senders).map(function(k){ return k + ' (' + found.senders[k] + ')'; }).join(', ') + '\n' +
                  'RECENT: ' + found.recentSample.map(function(m){ return m.name + ': ' + m.text; }).join(' | ');

    var narrative = await askAI(
        'Write a SHORT detective-report style summary of how this topic has lived inside the group. ' +
        'Format:\n' +
        '\\uD83D\\uDD0D *CASE FILE: <topic>*\n' +
        '_Opened by:_ @<name> on <date>\n' +
        '_Times discussed:_ <count>\n' +
        '_Main investigators:_ <names>\n' +
        '_Story so far:_ <2-3 sentences summarising the arc, based only on the messages>\n\n' +
        summary,
        { systemPrompt: 'You write short detective-report summaries. Never invent. Only use given data.' }
    );
    return { found: found, narrative: narrative };
}

async function oracleNewPrediction(askAI, context, memberNames) {
    return askAI(
        'You are THE ORACLE. Based on the recent group chat, make ONE specific, testable prediction about what will happen in this group within the next 7 days. ' +
        'Format exactly:\n' +
        'PREDICTION: <one sentence>\n' +
        'CONFIDENCE: <0-100>\n' +
        'REASON: <one short sentence>\n\n' +
        'MEMBERS: ' + (memberNames || []).join(', ') + '\n\n' +
        'CHAT:\n' + (context || ''),
        { systemPrompt: 'You make specific, testable predictions about WhatsApp group behaviour. Never predict harm, illegal activity, or personal crisis.' }
    );
}

function saveOracle(db, groupId, prediction, confidence) {
    if (!db.oraclePredictions[groupId]) db.oraclePredictions[groupId] = [];
    db.oraclePredictions[groupId].push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text: prediction,
        confidence: confidence || 50,
        madeAt: Date.now(),
        status: 'open',
        resolvedAt: null
    });
    while (db.oraclePredictions[groupId].length > 100) db.oraclePredictions[groupId].shift();
}

async function oracleResolve(askAI, db, groupId, recentContext) {
    if (!db.oraclePredictions || !db.oraclePredictions[groupId]) return [];
    var open = db.oraclePredictions[groupId].filter(function (p) { return p.status === 'open'; });
    if (!open.length) return [];
    var list = open.map(function (p, i) {
        return (i+1) + '. [' + p.id + '] ' + p.text;
    }).join('\n');

    var result = await askAI(
        'You are THE ORACLE, scoring your own past predictions against reality.\n\n' +
        'OPEN PREDICTIONS:\n' + list + '\n\n' +
        'RECENT CHAT:\n' + recentContext + '\n\n' +
        'For each prediction decide: hit, miss, or open. Output ONLY lines:\n' +
        '<id>|<hit|miss|open>|<short reason>',
        { systemPrompt: 'You score predictions honestly against evidence. Output only id|status|reason lines.' }
    );
    if (!result) return [];

    var lines = String(result).split('\n');
    var updates = [];
    for (var i = 0; i < lines.length; i++) {
        var m = lines[i].match(/^\s*([a-z0-9]+)\s*\|\s*(hit|miss|open)\s*\|\s*(.*)$/i);
        if (!m) continue;
        var id = m[1]; var status = m[2].toLowerCase(); var reason = m[3].substring(0, 200);
        if (status === 'open') continue;
        for (var j = 0; j < db.oraclePredictions[groupId].length; j++) {
            var p = db.oraclePredictions[groupId][j];
            if (p.id === id && p.status === 'open') {
                p.status = status;
                p.resolvedAt = Date.now();
                p.reason = reason;
                if (status === 'hit') db.oracleScore.hits++;
                else db.oracleScore.misses++;
                updates.push(p);
            }
        }
    }
    return updates;
}

function oracleScoreboard(db, groupId) {
    var all = (db.oraclePredictions && db.oraclePredictions[groupId]) || [];
    var hits = all.filter(function(p){ return p.status === 'hit'; }).length;
    var misses = all.filter(function(p){ return p.status === 'miss'; }).length;
    var open = all.filter(function(p){ return p.status === 'open'; }).length;
    var resolved = hits + misses;
    var acc = resolved > 0 ? Math.round(100 * hits / resolved) : 0;
    return { hits: hits, misses: misses, open: open, total: all.length, accuracy: acc };
}

function anomalyScan(db, groupId) {
    var arr = (db.groupChat && db.groupChat[groupId]) || [];
    if (arr.length < 50) return { reason: 'not enough history' };

    var now = Date.now();
    var oneHour = 60 * 60 * 1000;
    var fourHours = 4 * oneHour;
    var oneDay = 24 * oneHour;

    var recentHour = arr.filter(function(x){ return now - x.time < oneHour; });
    var lastFour = arr.filter(function(x){ return now - x.time < fourHours && now - x.time >= oneHour; });
    var yesterdaySame = arr.filter(function(x){
        var ago = now - x.time;
        return ago >= oneDay && ago < oneDay + oneHour;
    });

    // Historic hourly average across all recorded data
    if (arr.length < 20) return { reason: 'not enough history' };

    var spanHours = Math.max(1, (arr[arr.length-1].time - arr[0].time) / oneHour);
    var avgPerHour = arr.length / spanHours;

    var anomalies = [];

    // Sudden silence
    if (recentHour.length === 0 && avgPerHour > 3) {
        anomalies.push({
            kind: 'silence',
            text: 'The group has been silent for the last hour — usually there are about ' + Math.round(avgPerHour) + ' messages per hour.'
        });
    }

    // Activity spike
    if (recentHour.length > avgPerHour * 4 && recentHour.length >= 20) {
        anomalies.push({
            kind: 'spike',
            text: 'Activity spike: ' + recentHour.length + ' messages in the last hour vs usual ~' + Math.round(avgPerHour) + '.'
        });
    }

    // Who went quiet
    var sendersHistoric = {};
    var sendersRecent = {};
    arr.forEach(function(x){ sendersHistoric[x.name] = (sendersHistoric[x.name] || 0) + 1; });
    recentHour.forEach(function(x){ sendersRecent[x.name] = (sendersRecent[x.name] || 0) + 1; });

    var topHistoric = Object.keys(sendersHistoric).sort(function(a,b){ return sendersHistoric[b] - sendersHistoric[a]; }).slice(0, 5);
    topHistoric.forEach(function(name){
        if (!sendersRecent[name] && sendersHistoric[name] > 10) {
            anomalies.push({
                kind: 'quiet_member',
                text: name + ' is normally very active (' + sendersHistoric[name] + ' messages) but has been quiet in the last hour.'
            });
        }
    });

    return { anomalies: anomalies, recentHour: recentHour.length, avgPerHour: Math.round(avgPerHour) };
}

async function anomalyNarrative(askAI, anomalies) {
    if (!anomalies.length) return null;
    var list = anomalies.map(function(a){ return '- ' + a.text; }).join('\n');
    return askAI(
        'Write a short ANOMALY REPORT for a WhatsApp group. Be curious, not alarming. 2-3 sentences max.\n' +
        'Format:\n' +
        '\\uD83D\\uDEA8 *ANOMALY DETECTED*\\n\\n<observations>\\n\\n_Question:_ <one short curious question for the group>\n\n' +
        'Observations:\n' + list,
        { systemPrompt: 'You write short, curious, non-alarming anomaly reports.' }
    );
}

async function autobiographyChapter(askAI, context, groupName, previousChapterSummary, monthLabel) {
    return askAI(
        'You are writing THE AUTOBIOGRAPHY of a WhatsApp group. This is the chapter for ' + monthLabel + '.\n\n' +
        'GROUP: ' + groupName + '\n' +
        (previousChapterSummary ? 'PREVIOUS CHAPTERS SUMMARY:\n' + previousChapterSummary + '\n\n' : '') +
        'THIS MONTH CHAT:\n' + context + '\n\n' +
        'Write 3-5 short paragraphs of flowing narrative prose. ' +
        'Style: literary, warm, slightly funny. ' +
        'Mention real people and real moments from the chat. ' +
        'Do NOT invent. If the chat is thin, keep the chapter short.\n' +
        'End with one sentence that looks forward to the next chapter.',
        { systemPrompt: 'You write warm narrative autobiography chapters of a real chat group. Never invent.' }
    );
}

module.exports = {
    ensure,
    multiverse,
    detective,
    oracleNewPrediction,
    saveOracle,
    oracleResolve,
    oracleScoreboard,
    anomalyScan,
    anomalyNarrative,
    autobiographyChapter
};
