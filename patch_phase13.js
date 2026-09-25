const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
const steps = [];

function patch(name, cond, from, to) {
    if (cond()) { steps.push('skip ' + name); return; }
    if (!s.includes(from)) { steps.push('FAIL ' + name); return; }
    s = s.split(from).join(to);
    steps.push('ok ' + name);
}

patch('require',
    () => s.includes("require('./unique_features12')"),
    "var uniqueFeatures11 = require('./unique_features11');",
    "var uniqueFeatures11 = require('./unique_features11');\nvar uniqueFeatures12 = require('./unique_features12');"
);

patch('db-keys',
    () => s.includes('groupNovel:'),
    "    groupOracle: {},\n    timeBank: {},\n    livingArchive: {},\n    socialPhysics: {},\n    interventions: {}",
    "    groupOracle: {},\n    timeBank: {},\n    livingArchive: {},\n    socialPhysics: {},\n    interventions: {},\n    groupNovel: {},\n    memoryLeaks: {},\n    foundersArchive: {},\n    deepMirror: {},\n    watcherArchive: {}"
);

patch('ensure',
    () => s.includes('uniqueFeatures12.ensure(db);'),
    "uniqueFeatures11.ensure(db);",
    "uniqueFeatures11.ensure(db);\nuniqueFeatures12.ensure(db);"
);

var newCommands = [
    "} else if (cmd === 'novel' || cmd === 'nextchapter') {",
    "                    var nCtx = recentGroupContext(from, 80);",
    "                    if (!nCtx || nCtx.length < 100) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDCDA Need more chat before writing the next chapter.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDCDA Writing the next chapter...' }, { quoted: msg });",
    "                        if (!db.groupNovel[from]) db.groupNovel[from] = { chapters: [] };",
    "                        var prevChapSummary = db.groupNovel[from].chapters.slice(-1).map(function(c){ return c.text.substring(0, 500); }).join(' ');",
    "                        var nextNum = db.groupNovel[from].chapters.length + 1;",
    "                        var chapOut = await uniqueFeatures12.novelChapter(askAI, nCtx, meta.subject || 'this group', nextNum, prevChapSummary);",
    "                        if (chapOut) {",
    "                            uniqueFeatures12.saveChapter(db, from, chapOut, nextNum);",
    "                            saveDBNow();",
    "                            await sock.sendMessage(from, { text: chapOut }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'noveltoc' || cmd === 'chapters') {",
    "                    var toc = uniqueFeatures12.renderNovelTOC(db, from, meta.subject || 'this group');",
    "                    if (!toc) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDCDA No chapters yet. Use ' + PREFIX + 'novel to write the first.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: toc }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'leaks' || cmd === 'memoryleaks') {",
    "                    await sock.sendMessage(from, { text: '\\uD83D\\uDCAD Listening for leaks...' }, { quoted: msg });",
    "                    var lkOut = await uniqueFeatures12.memoryLeak(askAI, db, from, meta.subject || 'this group');",
    "                    if (!lkOut) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDCAD No leaks yet. Keep chatting and I will remember more.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: lkOut }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'founders') {",
    "                    var fCtx = recentGroupContext(from, 60);",
    "                    var fMembers = [];",
    "                    if (db.memory && db.memory[from]) {",
    "                        var allMem = Object.keys(db.memory[from]).map(function(k){",
    "                            var m = db.memory[from][k];",
    "                            return { name: m.name || k, firstSeen: m.firstSeen || Date.now() };",
    "                        });",
    "                        allMem.sort(function(a,b){ return a.firstSeen - b.firstSeen; });",
    "                        fMembers = allMem.slice(0, 6).map(function(x){ return x.name; });",
    "                    }",
    "                    if (!fCtx || fCtx.length < 60) {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDD0E Need more group history.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83D\\uDD0E Reconstructing origin...' }, { quoted: msg });",
    "                        var fOut = await uniqueFeatures12.foundersStory(askAI, fCtx, meta.subject || 'this group', fMembers);",
    "                        if (fOut) await sock.sendMessage(from, { text: fOut }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'deepmirror' || cmd === 'dm2') {",
    "                    var dmWho = tgt || sender;",
    "                    var dmMem = db.memory[from] && db.memory[from][dmWho];",
    "                    var dmName = (dmMem && dmMem.name) || ('@' + num(dmWho));",
    "                    var dmFacts = longTermMemory.recall(db, dmWho, 'personality interests feelings habits', 12);",
    "                    var dmCtx = recentGroupContext(from, 40);",
    "                    await sock.sendMessage(from, { text: '\\uD83E\\uDE9E Opening the deep mirror for @' + num(dmWho) + '...', mentions: [dmWho] }, { quoted: msg });",
    "                    var dmOut = await uniqueFeatures12.deepMirror(askAI, dmName, dmFacts, dmCtx, meta.subject || 'this group');",
    "                    if (dmOut) {",
    "                        if (!db.deepMirror[from]) db.deepMirror[from] = {};",
    "                        db.deepMirror[from][dmWho] = { text: dmOut, at: Date.now() };",
    "                        saveDBNow();",
    "                        await sock.sendMessage(from, { text: dmOut, mentions: [dmWho] }, { quoted: msg });",
    "                    }",
    "                } else if (cmd === 'watcher' || cmd === 'timelapse') {",
    "                    var wCtx = recentGroupContext(from, 80);",
    "                    if (!wCtx || wCtx.length < 100) {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDF9E Need more history for a time-lapse.' }, { quoted: msg });",
    "                    } else {",
    "                        await sock.sendMessage(from, { text: '\\uD83C\\uDF9E The Watcher observes...' }, { quoted: msg });",
    "                        var wCount = ((db.groupChat && db.groupChat[from]) || []).length;",
    "                        var wOut = await uniqueFeatures12.watcherTimeLapse(askAI, wCtx, meta.subject || 'this group', wCount);",
    "                        if (wOut) {",
    "                            if (!db.watcherArchive[from]) db.watcherArchive[from] = [];",
    "                            db.watcherArchive[from].push({ text: wOut, at: Date.now() });",
    "                            saveDBNow();",
    "                            await sock.sendMessage(from, { text: wOut }, { quoted: msg });",
    "                        }",
    "                    }",
    "                } else if (cmd === 'aboutme') {"
].join('\n');

patch('commands',
    () => s.includes("cmd === 'novel'"),
    "} else if (cmd === 'aboutme') {",
    newCommands
);

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function(x){ console.log('  ' + x); });
