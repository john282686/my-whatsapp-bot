function ensure(db) {
    if (!db.memberProfiles) db.memberProfiles = {};
}

function get(db, groupId, senderId) {
    ensure(db);

    if (!db.memberProfiles[groupId]) {
        db.memberProfiles[groupId] = {};
    }

    if (!db.memberProfiles[groupId][senderId]) {
        db.memberProfiles[groupId][senderId] = {
            name: '',
            messages: 0,
            lastSeen: 0
        };
    }

    return db.memberProfiles[groupId][senderId];
}

function update(db, groupId, senderId, name) {
    const p = get(db, groupId, senderId);

    if (name) p.name = name;

    p.messages++;
    p.lastSeen = Date.now();

    return p;
}

module.exports = {
    ensure,
    get,
    update
};
