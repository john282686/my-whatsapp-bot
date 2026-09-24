function ensure(db) {
    if (!db.groupLore) db.groupLore = {};
}

async function extract(askAI, conversation) {
    try {
        const text = String(conversation || '').trim();
        if (!text) return [];

        const result = await askAI(
            'From this group conversation, identify only recurring jokes, memorable events, nicknames, or harmless group facts that are explicitly present. Do not invent anything. Return 1-3 short bullet points, one per line, each starting with "- ". If there is nothing useful, return only the word NONE.\n\n' +
                text,
            {
                systemPrompt:
                    'You extract factual group lore. Never invent people, events, relationships, or facts. Output only short bullet points, or the word NONE.'
            }
        );

        if (!result) return [];

        const cleaned = String(result).trim();
        if (!cleaned || cleaned.toUpperCase() === 'NONE') return [];

        const lines = cleaned
            .split('\n')
            .map(function (l) {
                return l.replace(/^[\s\-\*\u2022\d\.\)]+/, '').trim();
            })
            .filter(function (l) {
                return l.length >= 4 && l.length <= 300;
            });

        return lines.slice(0, 5).map(function (t) {
            return { text: t, type: 'moment' };
        });
    } catch (e) {
        console.log('[LORE] ' + e.message);
        return [];
    }
}

module.exports = { ensure, extract };
