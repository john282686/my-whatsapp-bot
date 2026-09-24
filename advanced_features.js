const fs = require('fs');

function ensure(db) {
    if (!db.xp) db.xp = {};
    if (!db.groupModes) db.groupModes = {};
    if (!db.groupStats) db.groupStats = {};
    if (!db.userProfiles) db.userProfiles = {};
    if (!db.memberProfiles) db.memberProfiles = {};
    if (!db.groupLore) db.groupLore = {};
    if (!db.warnings) db.warnings = {};
}

function track(db, groupId, senderId, type) {
    ensure(db);

    if (!db.userProfiles[groupId]) db.userProfiles[groupId] = {};
    if (!db.userProfiles[groupId][senderId]) {
        db.userProfiles[groupId][senderId] = {
            messages: 0, commands: 0, games: 0, roasts: 0,
            xp: 0, level: 1,
            firstSeen: Date.now(), lastSeen: Date.now()
        };
    }
    var p = db.userProfiles[groupId][senderId];
    if (typeof p.messages !== 'number') p.messages = 0;
    if (typeof p.commands !== 'number') p.commands = 0;
    if (typeof p.games !== 'number') p.games = 0;
    if (typeof p.roasts !== 'number') p.roasts = 0;
    if (typeof p.xp !== 'number') p.xp = 0;
    if (typeof p.level !== 'number') p.level = 1;
    if (!p.firstSeen) p.firstSeen = Date.now();

    p.lastSeen = Date.now();

    if (type === 'message') {
        p.messages++;
        p.xp++;
        p.level = Math.floor(p.xp / 100) + 1;
    } else if (type === 'command') {
        p.commands++;
    } else if (type === 'game') {
        p.games++;
    } else if (type === 'roast') {
        p.roasts++;
    }

    if (!db.groupStats[groupId]) {
        db.groupStats[groupId] = { messages: 0, games: 0, roasts: 0, lastActivity: 0 };
    }
    var g = db.groupStats[groupId];
    if (typeof g.messages !== 'number') g.messages = 0;
    if (typeof g.games !== 'number') g.games = 0;
    if (typeof g.roasts !== 'number') g.roasts = 0;

    if (type === 'message') g.messages++;
    else if (type === 'game') g.games++;
    else if (type === 'roast') g.roasts++;
    g.lastActivity = Date.now();
}

function profile(db, groupId, senderId) {
    ensure(db);
    var p = db.userProfiles[groupId] && db.userProfiles[groupId][senderId];
    if (!p) {
        return {
            senderId: senderId,
            messages: 0, commands: 0, games: 0, roasts: 0,
            xp: 0, level: 1,
            firstSeen: Date.now(), lastSeen: 0
        };
    }
    return {
        senderId: senderId,
        messages: p.messages || 0,
        commands: p.commands || 0,
        games: p.games || 0,
        roasts: p.roasts || 0,
        xp: p.xp || 0,
        level: p.level || 1,
        firstSeen: p.firstSeen || Date.now(),
        lastSeen: p.lastSeen || 0
    };
}

function stats(db, groupId) {
    ensure(db);
    var g = db.groupStats[groupId] || { messages: 0, games: 0, roasts: 0 };
    var profiles = db.userProfiles[groupId] || {};
    var arr = [];
    var totalXp = 0;
    Object.keys(profiles).forEach(function(id){
        arr.push([id, profiles[id].messages || 0]);
        totalXp += profiles[id].xp || 0;
    });
    arr.sort(function(a,b){ return b[1] - a[1]; });

    return {
        members: Object.keys(profiles).length,
        messages: g.messages || 0,
        games: g.games || 0,
        roasts: g.roasts || 0,
        xp: totalXp,
        top: arr
    };
}

function setMode(db, groupId, mode) {
    ensure(db);
    db.groupModes[groupId] = mode || 'normal';
}

function getMode(db, groupId) {
    ensure(db);
    return db.groupModes[groupId] || 'normal';
}

function lore(db, groupId) {
    ensure(db);
    var data = db.groupLore[groupId];
    if (!data) return { created: 0, events: [] };
    if (Array.isArray(data)) return { created: 0, events: data };
    if (!Array.isArray(data.events)) data.events = [];
    return data;
}

function buildContext(db, groupId) {
    ensure(db);
    var mode = getMode(db, groupId);
    var s = stats(db, groupId);
    return [
        'Group mode: ' + mode,
        'Tracked members: ' + s.members,
        'Messages tracked: ' + s.messages,
        'Games: ' + s.games,
        'Roasts: ' + s.roasts,
        'Total XP: ' + s.xp
    ].join('\n');
}

module.exports = {
    ensure, track, profile, stats,
    setMode, getMode, lore, buildContext
};
