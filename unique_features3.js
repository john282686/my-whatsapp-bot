function ensure(db) {
    if (!db.groupDNA) db.groupDNA = {};
}

async function analyzeDNA(askAI, context, groupName, previousGenome) {
    var prev = previousGenome
        ? 'PREVIOUS GENOME:\n' + JSON.stringify(previousGenome, null, 2)
        : '(no previous genome — first analysis)';

    var prompt =
        'You are a group geneticist. Analyze this WhatsApp group as if it were a biological organism.\n\n' +
        'GROUP: ' + groupName + '\n\n' +
        prev + '\n\n' +
        'CHAT:\n' + context + '\n\n' +
        'Output STRICT JSON only (no markdown, no backticks):\n' +
        '{\n' +
        '  "species": "<2-3 word latin-ish name for the group>",\n' +
        '  "traits": [\n' +
        '    {"name": "<trait>", "pct": <0-100>, "note": "<6 word explanation>"}\n' +
        '  ],\n' +
        '  "mutations": ["<new trait that appeared recently>"],\n' +
        '  "dormant": ["<trait that used to exist but is fading>"],\n' +
        '  "generation": <number, increment from previous>,\n' +
        '  "survivalOutlook": "<one sentence>"\n' +
        '}\n\n' +
        'Rules:\n' +
        '- 5 to 7 traits, pct values should roughly sum to 100.\n' +
        '- Traits must reflect THIS group\'s actual culture, not generic things.\n' +
        '- If previous genome exists, keep stable traits and note new ones in mutations.\n' +
        '- No invented facts. Base everything on the chat.';

    var out;
    try {
        out = await askAI(prompt, {
            systemPrompt: 'You are a group geneticist. Output only valid JSON. Never invent people or events.'
        });
    } catch (e) {
        console.log('[DNA]', e.message);
        return null;
    }
    if (!out) return null;

    var cleaned = String(out).trim();
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```$/, '').trim();

    var parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch (e) {
        console.log('[DNA] JSON parse failed:', e.message);
        var m = cleaned.match(/\{[\s\S]*\}/);
        if (m) {
            try { parsed = JSON.parse(m[0]); } catch (e2) { return null; }
        } else {
            return null;
        }
    }

    if (!parsed || !parsed.traits || !Array.isArray(parsed.traits)) return null;
    parsed.updatedAt = Date.now();
    if (!parsed.generation || parsed.generation < 1) {
        parsed.generation = previousGenome ? (previousGenome.generation || 1) + 1 : 1;
    }
    return parsed;
}

function renderDNA(genome) {
    if (!genome) return '🧬 No genome yet. Run it once to sequence.';
    var out = '';
    out += '🧬 *GROUP DNA — Generation ' + (genome.generation || 1) + '*\n';
    out += '_Species: ' + (genome.species || 'unknown') + '_\n\n';

    (genome.traits || []).forEach(function (t) {
        var bars = Math.round((t.pct || 0) / 10);
        var barStr = '█'.repeat(Math.max(1, bars)) + '░'.repeat(Math.max(0, 10 - bars));
        out += '• ' + t.name + '  ' + (t.pct || 0) + '%\n';
        out += '   ' + barStr + '\n';
        if (t.note) out += '   _' + t.note + '_\n';
    });

    if (genome.mutations && genome.mutations.length) {
        out += '\n🧪 *Mutations:* ' + genome.mutations.join(' · ') + '\n';
    }
    if (genome.dormant && genome.dormant.length) {
        out += '💤 *Dormant:* ' + genome.dormant.join(' · ') + '\n';
    }
    if (genome.survivalOutlook) {
        out += '\n🌱 ' + genome.survivalOutlook;
    }
    return out;
}

async function alternateUniverse(askAI, context, twist) {
    return askAI(
        'You are a narrator. Rewrite the following group chat as if this counterfactual were true:\n' +
        'TWIST: ' + twist + '\n\n' +
        'Rules:\n' +
        '- Keep the same people and same energy, but change how events unfold based on the twist.\n' +
        '- 5-8 short lines. Alternate between speakers (use their names).\n' +
        '- Playful, PG, funny. No harm.\n' +
        '- End with one dramatic narrator line.\n\n' +
        'ORIGINAL CHAT:\n' + context,
        { systemPrompt: 'You rewrite chat scenes as playful alternate-universe fiction. Stay PG.' }
    );
}

async function echoChamber(askAI, userFacts, recentHistory, username, groupName) {
    return askAI(
        'You are predicting what ' + username + ' will type NEXT in the group "' + groupName + '".\n\n' +
        'WHAT YOU KNOW ABOUT ' + username + ' (long-term):\n' + (userFacts || '(nothing specific)') + '\n\n' +
        'THEIR RECENT MESSAGES:\n' + (recentHistory || '(none)') + '\n\n' +
        'Output exactly:\n' +
        '🔊 *Echo Chamber*\n' +
        '_Prediction for ' + username + ':_\n' +
        '"<their next message — 1-2 sentences, in their style, using their dialect if any>"\n' +
        '_Confidence:_ <XX>%\n' +
        '_Why:_ <one short sentence>',
        { systemPrompt: 'You predict a specific person\'s next message in their own voice. Be playful. Never insult.' }
    );
}

module.exports = { ensure, analyzeDNA, renderDNA, alternateUniverse, echoChamber };
