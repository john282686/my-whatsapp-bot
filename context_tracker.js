// ============================================================
// CONTEXT TRACKER — remembers last topic per user
// ============================================================

function ensure(db) {
    if (!db.contextThreads) db.contextThreads = {};
}

function observe(db, userId, chatId, messageText) {
    ensure(db);
    var key = chatId + '|' + userId;
    if (!db.contextThreads[key]) {
        db.contextThreads[key] = {
            userId: userId,
            chatId: chatId,
            recent: [],
            topics: {},
            lastUpdate: Date.now()
        };
    }
    var thread = db.contextThreads[key];
    thread.lastUpdate = Date.now();

    thread.recent.push({
        text: String(messageText).substring(0, 200),
        time: Date.now()
    });
    if (thread.recent.length > 5) thread.recent.shift();

    var stopwords = ['that','this','what','which','when','where','have','has','had','will','would','could','should','about','their','there','them','they','with','from','just','very','like','also','been','were','your','yours','into','upon','some','more','most','many','much','then','than','only','back','still','ever','never','always','because','okay','yeah','make','going'];
    var words = String(messageText).toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
    words.forEach(function (w) {
        if (w.length < 4) return;
        if (stopwords.indexOf(w) !== -1) return;
        if (/^\d+$/.test(w)) return;
        if (!thread.topics[w]) thread.topics[w] = { count: 0, firstSeen: Date.now(), lastSeen: 0 };
        thread.topics[w].count++;
        thread.topics[w].lastSeen = Date.now();
    });

    var keys = Object.keys(thread.topics);
    if (keys.length > 20) {
        keys.sort(function(a,b){ return thread.topics[b].lastSeen - thread.topics[a].lastSeen; });
        var keep = {};
        keys.slice(0, 20).forEach(function(k){ keep[k] = thread.topics[k]; });
        thread.topics = keep;
    }
}

function getCurrentTopic(db, userId, chatId) {
    ensure(db);
    var key = chatId + '|' + userId;
    var thread = db.contextThreads[key];
    if (!thread) return null;
    if (Date.now() - thread.lastUpdate > 3 * 60 * 1000) return null;

    var keys = Object.keys(thread.topics);
    if (!keys.length) return null;

    keys.sort(function (a, b) {
        var aScore = thread.topics[a].count * 10 + Math.max(0, 60 - Math.floor((Date.now() - thread.topics[a].lastSeen) / 60000));
        var bScore = thread.topics[b].count * 10 + Math.max(0, 60 - Math.floor((Date.now() - thread.topics[b].lastSeen) / 60000));
        return bScore - aScore;
    });

    return keys[0];
}

function shouldAddContext(db, userId, chatId, currentMessage) {
    ensure(db);
    if (!currentMessage) return false;
    var t = String(currentMessage).trim();
    if (t.length > 30) return false;
    var words = t.split(/\s+/).filter(function (w) { return w.length > 3; });
    if (words.length > 4) return false;
    var topic = getCurrentTopic(db, userId, chatId);
    return !!topic;
}

module.exports = {
    ensure: ensure,
    observe: observe,
    getCurrentTopic: getCurrentTopic,
    shouldAddContext: shouldAddContext
};
