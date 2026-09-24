async function whisperNetwork(askAI, context, memberProfiles) {
    return askAI(
        'You are a private matchmaker for a WhatsApp group.\n' +
        'Based on the recent chat AND the profiles listed, suggest 2-3 REAL connections between members ' +
        'who would likely vibe but don\\u2019t seem to talk much yet.\n\n' +
        'For each suggestion, output:\n' +
        '\\uD83D\\uDD17 *@<name1>* \\u2194 *@<name2>*\n' +
        '_why:_ <1 sentence, based on shared interests/humor/style>\n' +
        '_starter:_ "<one opening line one of them could send>"\n\n' +
        'Only suggest if there is a REAL reason from the data. Do not invent. Max 3 suggestions.\n' +
        'If nothing fits, output: NONE\n\n' +
        'PROFILES:\n' + (memberProfiles || '(none)') + '\n\n' +
        'RECENT CHAT:\n' + (context || ''),
        { systemPrompt: 'You suggest real, evidence-based connections between people. Never invent facts. Never match on protected traits.' }
    );
}

async function silentAgreement(askAI, context) {
    return askAI(
        'Read this group chat. Find ONE belief, opinion, or preference that the group collectively agreed on ' +
        'but NEVER SAID OUT LOUD \\u2014 things everyone quietly accepted.\n\n' +
        'Output exactly:\n' +
        '\\uD83D\\uDD4A\\uFE0F *SILENT AGREEMENT DETECTED*\n\n' +
        '_The unspoken consensus:_ <1 sentence>\n' +
        '_Evidence:_ <2 short bullet points showing the pattern>\n' +
        '_Nobody ever said it because:_ <1 sentence>\n\n' +
        'If you cannot find clear evidence, output: "The group has no clear silent agreement right now."\n' +
        'Do NOT invent. Only patterns with 2+ pieces of evidence.\n\n' +
        'CHAT:\n' + String(context || ''),
        { systemPrompt: 'You detect implicit group consensus from evidence only. Never invent.' }
    );
}

async function mirror(askAI, context, groupName, members) {
    return askAI(
        'You are an outsider who just joined this WhatsApp group for the first time and watched it silently. ' +
        'Give an HONEST, funny, slightly brutal impression of this group.\n\n' +
        'Group: ' + (groupName || 'the group') + '\n' +
        'Members: ' + ((members || []).slice(0, 20).join(', ') || 'unknown') + '\n\n' +
        'Format exactly:\n' +
        '\\uD83E\\uDE9E *GROUP MIRROR*\n' +
        '_An outsider\\u2019s first impression_\n\n' +
        '\\uD83C\\uDFAD *The vibe I walked into:* <1-2 sentences>\n' +
        '\\uD83D\\uDC65 *Who seems to be in charge:* @<name> \\u2014 <why, 1 sentence>\n' +
        '\\uD83D\\uDE02 *The group\\u2019s running joke:* <1 sentence>\n' +
        '\\uD83D\\uDE34 *What everybody quietly ignores:* <1 sentence>\n' +
        '\\uD83E\\uDD2A *The honest truth:* <1-2 sentences>\n\n' +
        'Rules: PG only. No insults about protected traits. No personal attacks. Be funny, not cruel.\n\n' +
        'CHAT:\n' + (context || ''),
        { systemPrompt: 'You give an honest but playful outsider view of the group. PG, funny, not cruel.' }
    );
}

function savePrediction(db, groupId, jid, name, text) {
    if (!db.predictionLedger) db.predictionLedger = {};
    if (!db.predictionLedger[groupId]) db.predictionLedger[groupId] = [];
    db.predictionLedger[groupId].push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        jid: jid,
        name: name || 'unknown',
        text: String(text).substring(0, 300),
        madeAt: Date.now(),
        status: 'open',
        resolvedAt: null,
        note: null
    });
    while (db.predictionLedger[groupId].length > 200) db.predictionLedger[groupId].shift();
}

async function resolvePredictions(askAI, db, groupId, recentContext) {
    if (!db.predictionLedger || !db.predictionLedger[groupId]) return [];
    var open = db.predictionLedger[groupId].filter(function (p) { return p.status === 'open'; });
    if (!open.length) return [];

    var list = open.map(function (p, i) {
        return (i + 1) + '. [' + p.id + '] ' + p.name + ' predicted: "' + p.text + '"';
    }).join('\n');

    var result = await askAI(
        'You are scoring predictions made by members of a WhatsApp group.\n\n' +
        'OPEN PREDICTIONS:\n' + list + '\n\n' +
        'RECENT CHAT:\n' + recentContext + '\n\n' +
        'For each prediction, decide based on the recent chat:\n' +
        '- "hit"     = the prediction was clearly correct\n' +
        '- "miss"    = the prediction was clearly wrong\n' +
        '- "open"    = still cannot tell\n\n' +
        'Output ONLY lines like:\n' +
        '<id>|<hit|miss|open>|<one short note>\n\n' +
        'Do not invent. Base only on evidence in the chat.',
        { systemPrompt: 'You resolve prediction outcomes from evidence. Output only lines like id|status|note.' }
    );

    if (!result) return [];
    var lines = String(result).split('\n');
    var updates = [];
    for (var i = 0; i < lines.length; i++) {
        var m = lines[i].match(/^\s*([a-z0-9]+)\s*\|\s*(hit|miss|open)\s*\|\s*(.*)$/i);
        if (!m) continue;
        var id = m[1].trim();
        var status = m[2].toLowerCase();
        var note = m[3].trim().substring(0, 200);
        if (status === 'open') continue;
        for (var j = 0; j < db.predictionLedger[groupId].length; j++) {
            var p = db.predictionLedger[groupId][j];
            if (p.id === id && p.status === 'open') {
                p.status = status;
                p.resolvedAt = Date.now();
                p.note = note;
                updates.push(p);
            }
        }
    }
    return updates;
}

function renderPredictionLedger(db, groupId, jid) {
    if (!db.predictionLedger || !db.predictionLedger[groupId]) return '\\uD83D\\uDCDC No predictions yet.';
    var all = db.predictionLedger[groupId];
    var mine = jid ? all.filter(function (p) { return p.jid === jid; }) : all;
    if (!mine.length) return '\\uD83D\\uDCDC No predictions from this person yet.';

    var hits = mine.filter(function (p) { return p.status === 'hit'; }).length;
    var misses = mine.filter(function (p) { return p.status === 'miss'; }).length;
    var open = mine.filter(function (p) { return p.status === 'open'; }).length;
    var resolved = hits + misses;
    var acc = resolved > 0 ? Math.round(100 * hits / resolved) : 0;

    var out = '\\uD83D\\uDCDC *PREDICTION LEDGER*\\n';
    if (jid) out += '_@' + String(jid).split('@')[0] + '_\\n';
    out += '\\uD83C\\uDFAF Accuracy: ' + acc + '% (' + hits + 'W / ' + misses + 'L / ' + open + ' open)\\n\\n';

    var show = mine.slice(-12).reverse();
    show.forEach(function (p) {
        var icon = p.status === 'hit' ? '\\u2705' : p.status === 'miss' ? '\\u274C' : '\\u23F3';
        out += icon + ' "' + p.text.substring(0, 90) + '"\\n';
        if (p.status !== 'open' && p.note) out += '   _' + p.note + '_\\n';
    });
    return out;
}

module.exports = {
    whisperNetwork,
    silentAgreement,
    mirror,
    savePrediction,
    resolvePredictions,
    renderPredictionLedger
};
