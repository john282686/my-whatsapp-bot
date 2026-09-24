function ensure(db) {
    if (!db.personality) db.personality = {};
}

function get(db, groupId) {
    ensure(db);
    return db.personality[groupId] || 'friendly';
}

function set(db, groupId, personality) {
    ensure(db);
    db.personality[groupId] = personality || 'friendly';
}

module.exports = {
    ensure,
    get,
    set
};
