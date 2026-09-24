async function ask(askAI, prompt, systemPrompt) {
    try {
        const result = await askAI(prompt, {
            systemPrompt: systemPrompt || 'Be concise, funny, friendly, and conversational. Do not pretend to be a human.'
        });
        return result || '';
    } catch (e) {
        console.log('[AI FEATURES] ' + e.message);
        return '';
    }
}

async function recap(askAI, context) {
    return ask(
        askAI,
        'Give a short, entertaining recap of this group conversation. Mention the main topics and funny moments without inventing facts:\n\n' + String(context || ''),
        'You summarize group conversations accurately. Keep it short and entertaining.'
    );
}

async function digest(askAI, context) {
    return ask(
        askAI,
        'Give a short, punchy digest of this group chat. Use 3-5 bullet points. Only mention things that actually happened. No invention:\n\n' + String(context || ''),
        'You produce short, factual bullet-point digests of group chats.'
    );
}

async function game(askAI, gameType) {
    return ask(
        askAI,
        'Create one quick group game or challenge for: ' + String(gameType || 'general') + '. Give clear rules and make it fun.',
        'You create short, safe, engaging games for a WhatsApp group.'
    );
}

async function roast(askAI, name) {
    return ask(
        askAI,
        'Give a playful, harmless roast for the person named "' + String(name || 'this person') + '". Do not use protected traits, threats, sexual humiliation, or cruel insults.',
        'You write lighthearted jokes and playful roasts. Keep them friendly.'
    );
}

async function debate(askAI, topic) {
    return ask(
        askAI,
        'Start a short, balanced group debate about: ' + String(topic || 'a fun topic') + '. Give both sides fairly and end with one question for the group.',
        'You facilitate balanced, respectful discussions without pushing people toward a political or personal viewpoint.'
    );
}

module.exports = {
    recap,
    digest,
    game,
    roast,
    debate
};
