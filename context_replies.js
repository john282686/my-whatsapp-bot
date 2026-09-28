// ============================================================
// CONTEXT-AWARE REPLIES — reference last topic for short replies
// ============================================================

function ensure(db) {
    if (!db.contextThreads) db.contextThreads = {};
}

// Given a short reply and a topic, produce a context-aware reply
function addContextToReply(reply, topic, isPidgin) {
    if (!reply || !topic) return reply;
    // Don't add if reply already contains the topic
    if (reply.toLowerCase().indexOf(topic.toLowerCase()) !== -1) return reply;

    var templates = {
        en: [
            reply + ' — that ' + topic + ' thing was fire 🔥',
            reply + ', especially about that ' + topic,
            reply + '! The ' + topic + ' talk was interesting',
            reply + ', hope ' + topic + ' goes well',
            reply + ' — you still on that ' + topic + '?'
        ],
        pg: [
            reply + ' — that ' + topic + ' thing sweet o',
            reply + ', that ' + topic + ' talk na correct',
            reply + '! ' + topic + ' dey your mind?',
            reply + ', hope ' + topic + ' go better',
            reply + ' — you still dey on that ' + topic + '?'
        ]
    };
    var arr = isPidgin ? templates.pg : templates.en;
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
    ensure: ensure,
    addContextToReply: addContextToReply
};
