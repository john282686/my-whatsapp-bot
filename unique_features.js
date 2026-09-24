async function dream(askAI, context) {
    return askAI(
        'You are the group\'s sleeping mind. Turn this group chat into a SHORT SURREAL DREAM. ' +
        'Mix real names, real topics and real jokes from the chat with dream logic ' +
        '(shifting scenes, impossible objects, floating themes). ' +
        'Keep it 4-6 sentences, poetic but funny. Never invent harm. End with one weird question.\n\nCHAT:\n' +
        String(context || ''),
        { systemPrompt: 'You produce short, surreal, funny dream sequences based on real chat content. Keep it PG.' }
    );
}

function onThisDay(db, groupId) {
    var arr = (db.groupChat && db.groupChat[groupId]) || [];
    var now = Date.now();
    var targets = [
        { label: '7 days ago', ms: 7 * 24 * 60 * 60 * 1000 },
        { label: '30 days ago', ms: 30 * 24 * 60 * 60 * 1000 },
        { label: '1 year ago', ms: 365 * 24 * 60 * 60 * 1000 }
    ];
    var results = [];
    targets.forEach(function (t) {
        var target = now - t.ms;
        var windowMs = 12 * 60 * 60 * 1000;
        var match = arr.filter(function (x) {
            return Math.abs(x.time - target) < windowMs;
        });
        results.push({ label: t.label, messages: match.slice(0, 6) });
    });
    return results;
}

async function vibe(askAI, recentMessages) {
    return askAI(
        'Read these group messages and describe the current VIBE as a WEATHER REPORT. ' +
        'Format exactly:\n' +
        '🌡️ *Today: <weather word>* — <one-line explanation>\n' +
        '• Dominant emotion: <word>\n' +
        '• Main topic: <phrase>\n' +
        '• Who is dominating: <name or "no one">\n' +
        'Max 5 lines. Punchy. No fluff.\n\nCHAT:\n' +
        String(recentMessages || ''),
        { systemPrompt: 'You are a chat-vibe meteorologist. Short, punchy, no fluff.' }
    );
}

async function predict(askAI, context, memberNames) {
    return askAI(
        'Based on the recent group chat, make 3 SPECIFIC, FUNNY predictions of what will happen next in this group. ' +
        'Format each as: "🔮 <prediction> (XX%)"\n' +
        'Predictions should reference real names and real topics from the chat. ' +
        'No harm, no illegal activity, no serious negative events. Keep it playful.\n\n' +
        'MEMBERS: ' + (memberNames || []).join(', ') + '\n\nCHAT:\n' + String(context || ''),
        { systemPrompt: 'You are a fun, safe group-prophet. Only playful predictions.' }
    );
}

async function ritual(askAI, context, groupName) {
    return askAI(
        'Invent a UNIQUE, quirky RITUAL for this WhatsApp group based on its inside culture, jokes, and habits. ' +
        'Format exactly:\n' +
        '🕯️ *<Ritual Name>*\n' +
        '_when:_ <trigger moment>\n' +
        '_what we do:_ <1-2 sentences>\n' +
        '_meaning:_ <1 sentence>\n\n' +
        'It must feel specific to THIS group, not generic. Keep it PG, fun, inclusive.\n\n' +
        'GROUP: ' + (groupName || 'this group') + '\n\nCHAT:\n' + String(context || ''),
        { systemPrompt: 'You invent quirky, PG, group-specific rituals. Never propose anything harmful or exclusive.' }
    );
}

module.exports = { dream, onThisDay, vibe, predict, ritual };
