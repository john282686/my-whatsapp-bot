// ============================================================
// EMOTION ENGINE — clean rebuild
// ============================================================
var EMOTIONS = {
    happy: [
        /\b(happy|glad|excited|great news|amazing|wonderful|awesome|fantastic|joyful|delighted|blessed|celebrating|celebration)\b/i,
        /\b(yay|whoop|finally|yes!|🎉|😄|😊|🥳|❤️)\b/i,
        /\bi\s+(\w+\s+)?(got|won|passed|landed|made)\b/i,
        /\b(got|getting)\s+(promoted|a\s+promotion|the\s+job|married|engaged|accepted|selected)\b/i,
        /\b(i\s+)?(bought|purchased)\b/i,
        /\b(promoted|graduated|selected|chosen|accepted|earned|won)\b/i,
        /\b(success|victory|achievement|milestone|breakthrough)\b/i
    ],
    sad: [
        /\b(sad|depressed|heartbroken|lonely|crying|cried|tears|broken|devastated|hurt|miss|missing)\b/i,
        /\b(bad news|lost|passed away|rip|died|death)\b/i,
        /\b(😢|😭|💔|😔)\b/i
    ],
    angry: [
        /\b(angry|mad|furious|vexed|pissed|frustrated|annoyed|annoying|irritated|irritating|disgusting)\b/i,
        /\b(nonsense|rubbish|stupid|idiot|fool|useless|trash)\b/i,
        /\b(wtf|what the hell|damn|shit|fuck)\b/i,
        /\b(😡|🤬|😠)\b/i
    ],
    tired: [
        /\b(tired|exhausted|drained|fatigued|weary|stressed|burned out|fed up)\b/i,
        /\b(sleepy|yawning|need sleep|want sleep)\b/i,
        /\b(😴|🥱)\b/i
    ],
    worried: [
        /\b(worried|scared|afraid|anxious|nervous|panic)\b/i,
        /\b(what if|i hope|please help)\b/i,
        /\b(😰|😨|😟)\b/i
    ],
    bored: [
        /\b(bored|boring|nothing to do|idle)\b/i,
        /\b(😐|😑)\b/i
    ],
    love: [
        /\b(i love you|i like you|you are amazing|you are the best|miss you)\b/i,
        /\b(i love|love you|love this|love that|adore|favourite|favorite)\b/i,
        /\b(sweetheart|babe|boo)\b/i
    ],
    laughing: [
        /\b(lol|lmao|lmfao|haha|hehe)\b/i,
        /\b(funny|hilarious|comedian|comedy)\b/i,
        /\b(😂|🤣)\b/i
    ]
};

function detectEmotion(text) {
    if (!text) return null;
    var t = String(text);
    var best = null;
    var bestCount = 0;
    Object.keys(EMOTIONS).forEach(function (emo) {
        var count = 0;
        EMOTIONS[emo].forEach(function (re) {
            if (re.test(t)) count++;
        });
        if (count > bestCount) {
            bestCount = count;
            best = emo;
        }
    });
    return bestCount > 0 ? best : null;
}

var EMOTION_REPLIES = {
    happy: {
        en: ["🎉🎉 That's amazing!", 'So happy for you!', "That's wonderful!", 'Yes! Love that', 'Great news!', 'Congratulations! 🎉', 'You deserve it', 'Awesome!', 'Ehen! That is huge!'],
        pg: ['🎉🎉 e sweet o', 'nice one o!', 'yes o! 🎉', 'ehen na', 'congrats o!', 'blessing dey o', 'see joy o', 'ehen na! e sweet o']
    },
    sad: {
        en: ['So sorry 😢', "That's really hard", 'Sorry to hear that', 'Take heart o', 'It will get better', 'Sending you hugs', 'Stay strong 💪'],
        pg: ['sorry o 😢', 'e go better o', 'take heart', 'God dey o', 'sorry jare', 'no worry o']
    },
    angry: {
        en: ['Chill out 😅', 'Take it easy o', 'Relax', 'Breathe small', 'Calm down', 'What happened?'],
        pg: ['chill o 😅', 'take am easy', 'calm down na', 'wetyn happen?', 'no vex jare', 'relax small']
    },
    tired: {
        en: ['Same here 😴', 'You should rest', 'Take it easy', 'Get some sleep', 'Rest well'],
        pg: ['same here o 😴', 'go rest o', 'take am easy', 'sleep dey sweet o', 'rest small']
    },
    worried: {
        en: ["It'll be okay 🙏", 'Try not to worry', "You've got this", 'Stay calm', "We'll figure it out"],
        pg: ['e go be o 🙏', 'no worry', 'God dey o', 'chill small', 'we go see']
    },
    bored: {
        en: ['Same here!', "Let's talk then", 'Tell me something', "What's on your mind?", 'Gist me'],
        pg: ['same here o!', 'make we gist na', 'talk to me', 'wetyn dey?', 'wetin dey happen?']
    },
    love: {
        en: ['Aww 😊', "That's sweet", 'Appreciate you 🙏', '❤️', 'You too kind'],
        pg: ['aww 😊', 'na you jare ❤️', '🙏', 'ehen o 😏']
    },
    laughing: {
        en: ['😂😂', 'Right? So funny', 'Haha!', '🤣🤣', "You're funny"],
        pg: ['😂😂 ewo', 'chai 😂', 'ewo!', 'hahaha same', 'you too funny o']
    }
};

function getEmotionReply(emotion, isPidgin) {
    var pool = EMOTION_REPLIES[emotion];
    if (!pool) return null;
    var arr = isPidgin ? pool.pg : pool.en;
    return arr[Math.floor(Math.random() * arr.length)];
}

function shouldOverrideEmotion(emotion) {
    return !!emotion;
}

module.exports = {
    detectEmotion: detectEmotion,
    getEmotionReply: getEmotionReply,
    shouldOverrideEmotion: shouldOverrideEmotion,
    EMOTIONS: EMOTIONS,
    EMOTION_REPLIES: EMOTION_REPLIES
};
