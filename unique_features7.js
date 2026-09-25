function ensure(db) {
    if (!db.confessions) db.confessions = {};
    if (!db.confessTargets) db.confessTargets = {};
}

async function unsaid(askAI, context, members) {
    return askAI(
        'You are a psychologist reading a WhatsApp group chat. Your job: identify the UNSAID.\n\n' +
        'Do NOT summarise. Instead, read BENEATH the surface. What is the group NOT saying out loud?\n' +
        'Look for:\n' +
        '- Topics everyone avoids\n' +
        '- Tension that shows up in jokes\n' +
        '- Something a specific person seems to want but won\u2019t ask\n' +
        '- Group emotions that no one has named\n\n' +
        'Format exactly:\n' +
        '\uD83E\uDEE5 *THE UNSAID*\n\n' +
        '1. _What\u2019s avoided:_ <one sentence>\n' +
        '2. _What\u2019s underneath the jokes:_ <one sentence>\n' +
        '3. _What someone wants but won\u2019t say:_ <one sentence, mention the name if clear>\n' +
        '4. _The unnamed feeling:_ <one sentence>\n\n' +
        '_Final thought:_ <one short sentence>\n\n' +
        'Only say what you can support with evidence from the chat. If you cannot read any of these, write "unclear" instead.\n\n' +
        'MEMBERS: ' + (members || []).join(', ') + '\n\n' +
        'CHAT:\n' + (context || ''),
        { systemPrompt: 'You read subtext in chat groups. Only make claims you can support with evidence. Never invent.' }
    );
}

async function mirrorBall(askAI, message, personas) {
    return askAI(
        'One message was sent in a WhatsApp group. You will reply to it AS IF you were FIVE different members of the group.\n\n' +
        'THE MESSAGE: "' + message + '"\n\n' +
        'PEOPLE IN THE GROUP: ' + (personas || []).join(', ') + '\n\n' +
        'Write 5 short replies, each from a different person above. Use their real names. ' +
        'Each reply should reflect a DIFFERENT personality (the sarcastic one, the kind one, the chaotic one, the philosopher, the one who never reads the whole message).\n\n' +
        'Format exactly:\n' +
        '\uD83E\uDE9E *MIRROR BALL*\n\n' +
        '@<name1>: <reply>\n' +
        '@<name2>: <reply>\n' +
        '@<name3>: <reply>\n' +
        '@<name4>: <reply>\n' +
        '@<name5>: <reply>\n\n' +
        'Keep every line PG, funny, and specific to the message.',
        { systemPrompt: 'You simulate multiple distinct voices replying to one chat message. PG only. Never insult anyone.' }
    );
}

async function secondLife(askAI, context, members, previousWorld) {
    var prev = previousWorld
        ? 'PREVIOUS WORLD STATE:\n' + JSON.stringify(previousWorld, null, 2) + '\n\n'
        : '(no previous world — this is the origin story)\n\n';

    var prompt =
        'You are building a SECOND LIFE for this WhatsApp group — an alternate society with its own rules.\n\n' +
        'GROUP MEMBERS: ' + (members || []).join(', ') + '\n\n' +
        prev +
        'RECENT CHAT:\n' + (context || '') + '\n\n' +
        'Output STRICT JSON only (no markdown):\n' +
        '{\n' +
        '  "worldName": "<name of this fictional society>",\n' +
        '  "currency": "<what they trade in>",\n' +
        '  "roles": [{"name": "<member name>", "role": "<their role>", "power": <1-10>}],\n' +
        '  "factions": [{"name": "<faction>", "purpose": "<one line>"}],\n' +
        '  "currentEvent": "<one sentence about what is happening right now in this world>",\n' +
        '  "generation": <number, increment from previous>,\n' +
        '  "nextChapter": "<one sentence hinting at what will happen next>"\n' +
        '}\n\n' +
        'Rules:\n' +
        '- Assign roles based on what you know about the real people (from chat).\n' +
        '- 3-6 roles, 2-3 factions.\n' +
        '- Playful, PG, inclusive.\n' +
        '- If previous world exists, evolve it — keep continuity.';

    var out;
    try {
        out = await askAI(prompt, { systemPrompt: 'You build playful alternate-world simulations of chat groups. Output strict JSON.' });
    } catch (e) { console.log('[2LIFE]', e.message); return null; }
    if (!out) return null;

    var cleaned = String(out).trim().replace(/^```json\s*/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    var parsed;
    try { parsed = JSON.parse(cleaned); }
    catch (e) {
        var m = cleaned.match(/\{[\s\S]*\}/);
        if (m) { try { parsed = JSON.parse(m[0]); } catch (e2) { return null; } }
        else return null;
    }
    if (!parsed || !parsed.worldName) return null;
    parsed.updatedAt = Date.now();
    if (!parsed.generation || parsed.generation < 1) {
        parsed.generation = previousWorld ? (previousWorld.generation || 1) + 1 : 1;
    }
    return parsed;
}

function renderSecondLife(world) {
    if (!world) return '\uD83C\uDF06 No world exists yet.';
    var out = '\uD83C\uDF06 *' + world.worldName + '*\n';
    out += '_Generation ' + (world.generation || 1) + '_\n\n';
    out += '\uD83D\uDCB0 Currency: ' + (world.currency || 'unknown') + '\n\n';

    if (world.roles && world.roles.length) {
        out += '*Citizens:*\n';
        world.roles.forEach(function (r) {
            var bars = '\u2588'.repeat(Math.max(1, Math.round((r.power || 1))));
            out += '\u2022 ' + r.name + ' \u2014 _' + r.role + '_\n   ' + bars + ' (power ' + (r.power || 1) + '/10)\n';
        });
        out += '\n';
    }

    if (world.factions && world.factions.length) {
        out += '*Factions:*\n';
        world.factions.forEach(function (f) {
            out += '\u2022 *' + f.name + '* \u2014 ' + f.purpose + '\n';
        });
        out += '\n';
    }

    if (world.currentEvent) out += '\uD83D\uDCF0 _Now:_ ' + world.currentEvent + '\n';
    if (world.nextChapter) out += '\u23E9 _Next:_ ' + world.nextChapter;
    return out;
}

async function coldOpen(askAI, context, groupName, cast) {
    return askAI(
        'You are writing a TV SHOW. This WhatsApp group is the cast. ' +
        'Write the COLD OPEN — the opening scene before the title card.\n\n' +
        'Show: "' + groupName + '"\n' +
        'Cast: ' + (cast || []).join(', ') + '\n\n' +
        'Format exactly:\n' +
        '\uD83D\uDCFA *' + groupName.toUpperCase() + '*\n_Episode ' + (Math.floor(Math.random() * 9) + 1) + '\n\n' +
        'FADE IN:\n\n' +
        '<3-5 short screenplay beats, alternating dialogue from real cast members>\n\n' +
        'CLOSE ON: <one dramatic final image or line>\n\n' +
        'SMASH CUT TO TITLE.\n\n' +
        'Rules:\n' +
        '- Screenplay format ("NAME: line" for dialogue; italic action lines)\n' +
        '- Base on real chat content, real topics\n' +
        '- PG only, no harm, no violence\n' +
        '- 6-10 lines total\n\n' +
        'CHAT:\n' + (context || ''),
        { systemPrompt: 'You write short, warm, funny TV cold-opens based on real chat content. PG only.' }
    );
}

function queueConfession(db, targetGroupId, senderJid, senderName, text) {
    if (!db.confessions[targetGroupId]) db.confessions[targetGroupId] = [];
    db.confessions[targetGroupId].push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        senderJid: senderJid,
        senderName: senderName,
        text: String(text).substring(0, 500),
        at: Date.now()
    });
    while (db.confessions[targetGroupId].length > 200) db.confessions[targetGroupId].shift();
}

function pickConfession(db, targetGroupId) {
    var arr = (db.confessions && db.confessions[targetGroupId]) || [];
    if (!arr.length) return null;
    var pick = arr[Math.floor(Math.random() * arr.length)];
    return pick;
}

async function rewriteConfession(askAI, text) {
    return askAI(
        'A group member submitted an anonymous confession. Rewrite it once for tone and anonymity: ' +
        'strip any personally identifying details (names, places, jobs, dates). ' +
        'Keep the meaning and emotion. One or two sentences only. If it cannot be made safe, output "SKIP".\n\n' +
        'CONFESSION: ' + text,
        { systemPrompt: 'You anonymize confessions. Remove identifying details. If unsafe, output SKIP.' }
    );
}

module.exports = {
    ensure,
    unsaid,
    mirrorBall,
    secondLife,
    renderSecondLife,
    coldOpen,
    queueConfession,
    pickConfession,
    rewriteConfession
};
