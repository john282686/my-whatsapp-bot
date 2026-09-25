function ensure(db) {
    if (!db.chorusHistory) db.chorusHistory = {};
    if (!db.deepTimeArchive) db.deepTimeArchive = {};
}

async function chorus(askAI, topic, context) {
    var prompt =
        'You are moderating a private CHORUS of 3 voices debating inside a WhatsApp group.\n' +
        'Each voice has a distinct personality:\n' +
        '- The Skeptic: sharp questions, doubts claims, demands evidence\n' +
        '- The Dreamer: imaginative, poetic, sees the bigger picture\n' +
        '- The Historian: recalls patterns, references past events, contextualizes\n\n' +
        'TOPIC: ' + (topic || 'the state of this group') + '\n\n' +
        'RECENT GROUP CHAT:\n' + (context || '') + '\n\n' +
        'Write the debate as 6-8 short lines. Format each EXACTLY as:\n' +
        'Skeptic: <line>\n' +
        'Dreamer: <line>\n' +
        'Historian: <line>\n\n' +
        'Keep it lively, clever, PG. End with a line starting "SYNTHESIS: ".';

    return askAI(prompt, {
        systemPrompt: 'You moderate a three-voice chorus. Each voice distinct. Output only Speaker: line format.'
    });
}

function rhythm(db, groupId) {
    var arr = (db.groupChat && db.groupChat[groupId]) || [];
    if (arr.length < 30) return null;

    var hours = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    arr.forEach(function (x) {
        var h = new Date(x.time).getHours();
        if (h >= 0 && h < 24) hours[h]++;
    });

    var peak = 0;
    for (var i = 0; i < 24; i++) if (hours[i] > peak) peak = hours[i];
    var total = 0;
    for (var j = 0; j < 24; j++) total += hours[j];

    return { hours: hours, peak: peak, total: total };
}

function rhythmArt(data) {
    if (!data) return '\uD83D\uDD70 Need more messages (minimum 30).';
    var bars = ['\u2581','\u2582','\u2583','\u2584','\u2585','\u2586','\u2587','\u2588'];
    var out = '\uD83D\uDD70 *GROUP RHYTHM*\n_A day in the life of this group_\n\n';
    out += '00    06    12    18    23\n';
    var line = '';
    for (var i = 0; i < 24; i++) {
        var h = data.hours[i];
        var idx = data.peak > 0 ? Math.min(7, Math.floor((h / data.peak) * 7.99)) : 0;
        line += bars[idx];
    }
    out += line + '\n\n';

    var peakH = 0, quietH = 0, quietV = 999999;
    for (var k = 0; k < 24; k++) {
        if (data.hours[k] > data.hours[peakH]) peakH = k;
        if (data.hours[k] < quietV) { quietV = data.hours[k]; quietH = k; }
    }
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    out += 'Peak hour: ' + pad(peakH) + ':00\n';
    out += 'Quietest hour: ' + pad(quietH) + ':00\n';
    out += 'Messages analysed: ' + data.total;
    return out;
}

async function weave(askAI, picked) {
    if (!picked || picked.length < 3) return null;
    var lines = '';
    for (var i = 0; i < picked.length; i++) {
        var m = picked[i];
        lines += (i+1) + '. ' + m.name + ' (' + new Date(m.time).toLocaleString() + '): "' + m.text + '"\n';
    }
    return askAI(
        'Here are THREE unrelated messages from different times and different people in the same WhatsApp group.\n\n' +
        lines + '\n\n' +
        'Write a SHORT, funny, poetic story that connects all three.\n' +
        'Keep the real names and real content but weave them into one narrative.\n' +
        '4-6 sentences. End with one line that ties them together.\n\n' +
        'Format exactly:\n' +
        '\uD83D\uDD78 *THE WEAVE*\n\n<story>',
        { systemPrompt: 'You weave unrelated chat messages into one short narrative. PG only. Never invent names or facts.' }
    );
}

async function remix(askAI, context, style) {
    return askAI(
        'Rewrite the following WhatsApp group conversation as if it happened in this style: ' + style + '\n\n' +
        'Keep the same people and same content, but change tone, diction, and rhythm to fit the style.\n' +
        'Output 5-8 short lines.\n\n' +
        'Format exactly:\n' +
        '\uD83C\uDFAD *REPLAY: ' + style + '*\n\n<rewritten lines>\n\n' +
        'CHAT:\n' + (context || ''),
        { systemPrompt: 'You rewrite chat conversations in different fictional styles. PG only.' }
    );
}

async function deepTime(askAI, context, groupName) {
    return askAI(
        'You are an archaeologist in the year 3026. You have excavated the digital remains of a WhatsApp group called "' + groupName + '".\n' +
        'Write a SHORT museum-plaque style report on this lost civilisation.\n\n' +
        'Format exactly:\n' +
        '\uD83C\uDFDB *DEEP TIME REPORT*\n' +
        '_Site: ' + groupName + ' (circa 2026 CE)_\n\n' +
        '\u2022 *Population:* <estimate>\n' +
        '\u2022 *Primary rituals:* <what they seemed to do>\n' +
        '\u2022 *Beliefs:* <what they valued>\n' +
        '\u2022 *Strange objects of desire:* <funny observation>\n' +
        '\u2022 *Cause of decline:* <playful guess>\n\n' +
        '*Summary:* <2 sentences as a museum caption>\n\n' +
        'CHAT REMAINS:\n' + (context || ''),
        { systemPrompt: 'You write playful archaeological reports about chat groups from the far future. PG only.' }
    );
}

module.exports = { ensure, chorus, rhythm, rhythmArt, weave, remix, deepTime };
