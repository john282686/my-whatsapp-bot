// ============================================================
// IDENTITY MANAGER
// Remembers every person the bot has ever interacted with —
// across groups AND DMs. Stores name, aliases, picture, about,
// groups they're in, first/last seen, message counts.
// ============================================================

function ensure(db) {
    if (!db.identities) db.identities = {};
}

function getUser(db, jid) {
    ensure(db);
    if (!db.identities[jid]) {
        db.identities[jid] = {
            jid: jid,
            name: null,
            aliases: [],
            picture: null,
            pictureFetchedAt: 0,
            about: null,
            aboutFetchedAt: 0,
            groups: [],
            dmsSeen: 0,
            messageCount: 0,
            firstSeen: Date.now(),
            lastSeen: Date.now()
        };
    }
    return db.identities[jid];
}

// Called on every message from a user
function observe(db, jid, pushName, groupId) {
    if (!jid) return;
    var u = getUser(db, jid);
    u.lastSeen = Date.now();
    u.messageCount++;

    // Track name and aliases
    if (pushName && pushName.length > 0 && pushName !== 'null') {
        if (!u.name) {
            u.name = pushName;
        } else if (pushName !== u.name && u.aliases.indexOf(pushName) === -1) {
            u.aliases.push(pushName);
            if (u.aliases.length > 8) u.aliases.shift();
        }
    }

    // Track group membership
    if (groupId) {
        if (u.groups.indexOf(groupId) === -1) {
            u.groups.push(groupId);
            if (u.groups.length > 30) u.groups.shift();
        }
    } else {
        u.dmsSeen++;
    }
}

// Fetch profile picture (rate-limited to once per week per user)
async function fetchPicture(sock, db, jid) {
    var u = getUser(db, jid);
    var now = Date.now();
    var week = 7 * 24 * 60 * 60 * 1000;
    if (u.pictureFetchedAt && (now - u.pictureFetchedAt) < week) {
        return u.picture;
    }
    try {
        var url = await sock.profilePictureUrl(jid, 'image');
        u.picture = url || null;
        u.pictureFetchedAt = now;
    } catch (e) {
        // 404 or not found → cache the "no picture" result for a week
        u.picture = null;
        u.pictureFetchedAt = now;
    }
    return u.picture;
}

// Fetch "about"/status text (rate-limited to once per week)
async function fetchAbout(sock, db, jid) {
    var u = getUser(db, jid);
    var now = Date.now();
    var week = 7 * 24 * 60 * 60 * 1000;
    if (u.aboutFetchedAt && (now - u.aboutFetchedAt) < week) {
        return u.about;
    }
    try {
        var res = await sock.fetchStatus(jid);
        // res can be an array of statuses
        if (Array.isArray(res) && res.length && res[0].status) {
            u.about = res[0].status;
        } else if (res && res.status) {
            u.about = res.status;
        } else {
            u.about = null;
        }
        u.aboutFetchedAt = now;
    } catch (e) {
        u.about = null;
        u.aboutFetchedAt = now;
    }
    return u.about;
}

// Build a readable profile string
function buildProfileText(db, jid) {
    var u = db.identities && db.identities[jid];
    if (!u) return 'No profile found for ' + jid;
    var lines = [];
    lines.push('*Name:* ' + (u.name || 'unknown'));
    if (u.aliases && u.aliases.length) lines.push('*Also known as:* ' + u.aliases.join(', '));
    if (u.about) lines.push('*About:* ' + u.about);
    lines.push('*Total messages:* ' + u.messageCount);
    lines.push('*Groups:* ' + (u.groups ? u.groups.length : 0));
    if (u.dmsSeen > 0) lines.push('*DM interactions:* ' + u.dmsSeen);
    if (u.firstSeen) lines.push('*First seen:* ' + new Date(u.firstSeen).toISOString().split('T')[0]);
    if (u.lastSeen) lines.push('*Last seen:* ' + new Date(u.lastSeen).toISOString().split('T')[0]);
    return lines.join('\n');
}

// Get all known JIDs (for stats)
function listAll(db) {
    if (!db.identities) return [];
    return Object.keys(db.identities).map(function(k) { return db.identities[k]; });
}

// Look up a JID by name (partial match)
function findByKeyword(db, keyword) {
    if (!db.identities || !keyword) return [];
    var k = String(keyword).toLowerCase();
    var results = [];
    Object.keys(db.identities).forEach(function(jid) {
        var u = db.identities[jid];
        if (u.name && u.name.toLowerCase().indexOf(k) !== -1) {
            results.push(u);
        } else if (u.aliases && u.aliases.some(function(a){ return a.toLowerCase().indexOf(k) !== -1; })) {
            results.push(u);
        }
    });
    return results;
}

module.exports = {
    ensure,
    getUser,
    observe,
    fetchPicture,
    fetchAbout,
    buildProfileText,
    listAll,
    findByKeyword
};
