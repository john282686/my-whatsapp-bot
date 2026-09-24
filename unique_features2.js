async function whisper(askAI, context, groupName, username) {
    return askAI(
        'You are the group\'s private confidant. Give a SHORT, HONEST, PRIVATE take on the group ' +
        'to one member, based on the recent group chat. Be real, be funny, be kind. ' +
        'No insults about protected traits. No serious negative claims about individuals. ' +
        '3-4 sentences max. Start with "Between you and me, ..."\n\n' +
        'GROUP: ' + groupName + '\n' +
        'PERSON YOU ARE TALKING TO: ' + username + '\n\n' +
        'CHAT:\n' + context,
        { systemPrompt: 'You are a trustworthy, funny, kind private confidant. Keep everything PG and respectful.' }
    );
}

async function checkIn(askAI, username, ltmFacts, lastSeenMs) {
    var days = Math.max(1, Math.floor((Date.now() - lastSeenMs) / (1000 * 60 * 60 * 24)));
    return askAI(
        'Write a SHORT, warm, personal "we miss you" DM to a WhatsApp group member who has been silent for ' + days + ' days. ' +
        'Reference something specific you remember about them. ' +
        'Be friendly, not needy. 1-2 sentences. No pressure. No guilt-tripping.\n\n' +
        'NAME: ' + username + '\n' +
        'THINGS I REMEMBER ABOUT THEM:\n' + (ltmFacts || '(nothing specific)'),
        { systemPrompt: 'You write warm, brief, no-pressure check-in messages to silent friends.' }
    );
}

async function weatherMap(askAI, context, participants) {
    return askAI(
        'Read the recent group chat and produce a WEATHER MAP.\n' +
        'For each participant listed, assign ONE emoji that matches their current mood, ' +
        'followed by a very short label (2-4 words).\n' +
        'Format exactly:\n' +
        '🌡️ *GROUP WEATHER MAP*\n' +
        '• <name>: <emoji> <short label>\n' +
        '• <name>: <emoji> <short label>\n\n' +
        'PARTICIPANTS: ' + participants.join(', ') + '\n' +
        'CHAT:\n' + context,
        { systemPrompt: 'You read group mood. Output only a clean weather-map list, no extra text.' }
    );
}

async function tarot(askAI, groupName, context) {
    return askAI(
        'Draw ONE tarot card (major arcana preferred) for this group. ' +
        'Format exactly:\n' +
        '🎴 *<Card Name>*\n' +
        '_Reading:_ <2-3 sentences interpreting the card for THIS specific group, referencing real chat topics>\n' +
        '_Advice:_ <1 short sentence>\n\n' +
        'GROUP: ' + groupName + '\n' +
        'CHAT:\n' + context,
        { systemPrompt: 'You are a wise tarot reader. Keep readings playful, PG, and specific to the group.' }
    );
}

module.exports = { whisper, checkIn, weatherMap, tarot };
