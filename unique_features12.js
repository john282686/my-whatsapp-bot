function ensure(db) {
    if (!db.groupNovel) db.groupNovel = {};
    if (!db.memoryLeaks) db.memoryLeaks = {};
    if (!db.foundersArchive) db.foundersArchive = {};
    if (!db.deepMirror) db.deepMirror = {};
    if (!db.watcherArchive) db.watcherArchive = {};
}

async function novelChapter(askAI, context, groupName, chapterNum, prevSummary) {
    return askAI(
        'You are writing a NOVEL about the WhatsApp group "' + groupName + '".\n' +
        'This is Chapter ' + chapterNum + '.\n\n' +
        (prevSummary ? 'PREVIOUS CHAPTERS SUMMARY:\n' + prevSummary + '\n\n' : '') +
        'RECENT CHAT:\n' + (context || '') + '\n\n' +
        'Write 3-5 paragraphs of narrative prose. Style: literary fiction, warm but sharp.\n' +
        'Use REAL names and REAL moments from the chat. Invent nothing.\n' +
        'Each chapter should feel like it stands alone but also connects to a longer arc.\n\n' +
        'Format exactly:\n' +
        '\uD83D\uDCDA *' + groupName + '*\n' +
        '*Chapter ' + chapterNum + '*\n\n' +
        '<the chapter>\n\n' +
        '_To be continued..._',
        { systemPrompt: 'You write a literary novel about a real chat group. Only use real names and real events. Never invent.' }
    );
}

function saveChapter(db, groupId, text, chapterNum) {
    if (!db.groupNovel[groupId]) db.groupNovel[groupId] = { chapters: [] };
    db.groupNovel[groupId].chapters.push({
        num: chapterNum,
        text: text,
        writtenAt: Date.now()
    });
}

function renderNovelTOC(db, groupId, groupName) {
    var novel = db.groupNovel[groupId];
    if (!novel || !novel.chapters.length) return null;
    var out = '\uD83D\uDCDA *' + (groupName || 'GROUP NOVEL') + '*\n';
    out += '_Table of contents_\n\n';
    novel.chapters.forEach(function (c) {
        out += 'Chapter ' + c.num + ' \u2014 _' + new Date(c.writtenAt).toLocaleDateString() + '_\n';
    });
    out += '\nTotal chapters: ' + novel.chapters.length;
    return out;
}

async function memoryLeak(askAI, db, groupId, groupName) {
    // Pull scattered fragments from across the bot's own memory
    var fragments = [];

    if (db.groupLore && db.groupLore[groupId]) {
        var lore = db.groupLore[groupId].events || db.groupLore[groupId] || [];
        if (Array.isArray(lore)) {
            lore.slice(-5).forEach(function (l) {
                fragments.push('[lore] ' + (l.text || l));
            });
        }
    }
    if (db.groupDNA && db.groupDNA[groupId]) {
        var dna = db.groupDNA[groupId];
        if (dna.species) fragments.push('[dna] species: ' + dna.species);
        (dna.traits || []).slice(0, 3).forEach(function (t) {
            fragments.push('[dna] trait: ' + t.name + ' ' + t.pct + '%');
        });
    }
    if (db.oraclePredictions && db.oraclePredictions[groupId]) {
        var oracle = db.oraclePredictions[groupId];
        var resolved = oracle.filter(function (p) { return p.status !== 'open'; }).slice(-3);
        resolved.forEach(function (p) {
            fragments.push('[oracle ' + p.status + '] ' + p.text);
        });
    }
    if (db.memory && db.memory[groupId]) {
        var members = Object.keys(db.memory[groupId]);
        members.slice(0, 3).forEach(function (jid) {
            var m = db.memory[groupId][jid];
            if (m.summaries && m.summaries.length) {
                fragments.push('[about ' + (m.name || jid) + '] ' + m.summaries[m.summaries.length - 1]);
            }
        });
    }
    if (db.groupSecondLife && db.groupSecondLife[groupId]) {
        fragments.push('[2life] ' + db.groupSecondLife[groupId].worldName + ' (gen ' + db.groupSecondLife[groupId].generation + ')');
    }

    if (!fragments.length) return null;

    var sample = fragments.slice(0, 15).join('\n');
    var out = await askAI(
        'You are the bot. You have accumulated memories of this group. ' +
        'You are having a moment of MEMORY LEAK \u2014 fragments of what you remember leak out as poetic, quiet reflections.\n\n' +
        'Format exactly:\n' +
        '\uD83D\uDCAD *MEMORY LEAKS*\n' +
        '_things I remember that you might have forgotten_\n\n' +
        '<5-8 short lines. Each line is a fragment. Poetic, vivid, sometimes funny.>\n\n' +
        'Rules: only use what is given. Never invent. The tone is quiet, observant, warm. ' +
        'GROUP: ' + (groupName || 'this group') + '\n\n' +
        'FRAGMENTS:\n' + sample,
        { systemPrompt: 'You write short poetic memory fragments from given data. Never invent.' }
    );
    return out;
}

async function foundersStory(askAI, context, groupName, oldestMembers) {
    return askAI(
        'You are reconstructing the ORIGIN STORY of the WhatsApp group "' + groupName + '".\n\n' +
        'You know these facts:\n' +
        '- The oldest active members are: ' + (oldestMembers || []).join(', ') + '\n' +
        '- The group chat begins with the following records:\n' + (context || '') + '\n\n' +
        'Write the FOUNDERS narrative. Style: origin-myth but grounded in real data.\n' +
        '3-4 short paragraphs. Mention real member names. If certain details are unknown, be honest ("the early days are lost").\n\n' +
        'Format exactly:\n' +
        '\uD83D\uDD0E *THE FOUNDERS*\n' +
        '_how this group began_\n\n' +
        '<narrative>\n\n' +
        '_Ending:_ <one sentence about where the group is now>',
        { systemPrompt: 'You write origin stories of chat groups from real data. Never invent people. Honest about gaps.' }
    );
}

async function deepMirror(askAI, memberName, memberFacts, context, groupName) {
    return askAI(
        'You will show what the WhatsApp group "' + groupName + '" looks like from the perspective of ONE member.\n\n' +
        'MEMBER: ' + memberName + '\n' +
        'WHAT YOU KNOW ABOUT THEM:\n' + (memberFacts || '(nothing specific yet)') + '\n\n' +
        'RECENT CHAT:\n' + (context || '') + '\n\n' +
        'Write a SHORT REFLECTION from their point of view. First person. Warm, honest, quiet.\n' +
        'Format exactly:\n' +
        '\uD83E\uDE9E *DEEP MIRROR \u2014 ' + memberName + '*\n\n' +
        '"<3-4 sentences as if they are thinking, not typing. What do they notice? What do they wish for? Who do they feel closest to?>"\n\n' +
        '_What they show:_ <one short sentence>\n' +
        '_What they hide:_ <one short sentence>\n\n' +
        'Rules: never make claims you cannot support with the given data. PG. Never negative or hostile.',
        { systemPrompt: 'You write quiet reflective first-person views of a chat group from one members perspective. Only from given data.' }
    );
}

async function watcherTimeLapse(askAI, context, groupName, messageCount) {
    return askAI(
        'Create a CINEMATIC 30-DAY TIME-LAPSE of the WhatsApp group "' + groupName + '".\n\n' +
        'You observed about ' + messageCount + ' messages over 30 days. This is the trailer.\n\n' +
        'Format exactly:\n' +
        '\uD83C\uDF9E *THE WATCHER*\n' +
        '_30 days in 10 messages_\n\n' +
        '1. <single line>\n' +
        '2. <single line>\n' +
        '...\n' +
        '10. <single line>\n\n' +
        'Final line (italic): _What will the next 30 days hold?_\n\n' +
        'Each line must be SHORT (max 15 words) and feel like a movie caption.\n' +
        'Mention real names, real moments. Chronologically ordered.\n' +
        'Rules: only from real data. Never invent. PG.\n\n' +
        'CHAT:\n' + (context || ''),
        { systemPrompt: 'You write short cinematic time-lapse captions from real chat. Never invent. Max 15 words per line.' }
    );
}

module.exports = {
    ensure,
    novelChapter,
    saveChapter,
    renderNovelTOC,
    memoryLeak,
    foundersStory,
    deepMirror,
    watcherTimeLapse
};
