// Quick Replies — instant pre-written responses.

var QUICK_REPLIES = [
    // ============ GREETINGS ============
    { p: /^\s*(hi|hey|hello|yo|sup|wassup|whats up|what's up|howdy|helo|hii+)\s*[!.,]?\s*$/i,
      r: ['sup 👋', 'yo 😎', 'hey guy', 'how you dey?', 'wetin dey 👀', 'sup bro', 'hey 👋'] },

    { p: /^\s*(good\s*(morning|mrng|morn))\b/i,
      r: ['Morning 🌞 how you sleep?', 'Good morning 🌞', 'Morn don break 🌞', 'Morning o 😴'] },

    { p: /^\s*(good\s*(afternoon|aftn))\b/i,
      r: ['Good afternoon ☀️', 'Afternoon o', 'How the day dey go?'] },

    { p: /^\s*(good\s*(evening|eve|nite|night))\b/i,
      r: ['Good evening 🌙', 'Evening o', 'How the day go?'] },

    { p: /^\s*(how\s*(are\s*you|you dey|far|body)|how\s*una\s*dey|how\s*you\s*dey|hw\s*(r\s*u|are\s*you))/i,
      r: ['I dey o, u nko? 😎', 'I dey, you nko?', 'Body dey o, you?', 'I dey jare, u nko?'] },

    // ============ NIGERIAN-SPECIFIC ============
    { p: /^\s*(how far|howfa|how you far|hw far|how far na|how far class|how far guys|how far team)\b/i,
      r: ['I dey o, you nko? 😎', 'we dey o', 'body dey, you?', 'I dey jare 😎', 'chilling o'] },

    { p: /^\s*(wetin dey happen|wetin dey sup|wetin happen|wetin dey shele)\b/i,
      r: ['nothing much jare', 'we dey o', 'just dey chill', 'ehn we dey'] },

    { p: /^\s*(how una dey|how una dey na|una dey ok)\b/i,
      r: ['we dey o 😎', 'body dey', 'we dey jare', 'I dey, una nko?'] },

    { p: /^\s*(you dey ok|you dey)\b/i,
      r: ['I dey o', 'body dey', 'I dey jare 😎'] },

    { p: /^\s*(dey go|i dey go|am going|going out)\b/i,
      r: ['later 👋', 'safe journey', 'see you', 'later bro'] },

    { p: /^\s*(i dey come|coming)\b/i,
      r: ['ok na 👍', 'alright', 'sharp sharp'] },

    { p: /^\s*(oya|oya na|come on|make we)\b/i,
      r: ['oya na', 'sharp sharp', 'let us go 💪', 'ehn oya'] },

    { p: /^\s*(no wahala|no vex|no problem)\b/i,
      r: ['👍', 'no wahala', 'ehn o', 'sure'] },

    { p: /^\s*(sharp sharp|sharp)\b/i,
      r: ['sharp sharp 👍', 'ehn o', '💯'] },

    { p: /^\s*(serious|seriously|you serious)\b/i,
      r: ['seriously o 😳', 'I swear', 'on god', 'real talk'] },

    { p: /^\s*(wetin)\s*[!?.,]?\s*$/i,
      r: ['wetin?', 'you tell me now', 'wetin happen'] },

    // ============ LAUGHTER / AGREEMENT ============
    { p: /^\s*(lol|lmao|lmfao|😂+|🤣+|haha+|hehe+)\s*$/i,
      r: ['😂😂', '🤣🤣', 'lol', 'hahaha', '😂', 'ehn 😂'] },

    { p: /^\s*(ok|okay|k|kk|alright|ight|aight)\s*[!.,]?\s*$/i,
      r: ['👍', 'ok na', 'cool', 'alright', 'ehn 👍', 'sure'] },

    { p: /^\s*(yes|yeah|yea|yh|yep|yup)\s*$/i,
      r: ['💯', 'yes na', 'sure', 'ehen', '👍'] },

    { p: /^\s*(no|nope|nah|naw)\s*$/i,
      r: ['no be so', 'nah', 'no o', 'no na'] },

    { p: /^\s*(thanks|thank you|tanks|tnx|thx|tanx)\s*[!.,]?\s*$/i,
      r: ['No wahala 🙏', 'anytime 😊', 'no problem', 'bless 🙏'] },

    // ============ QUESTIONS ============
    { p: /^\s*(who\s*(dey|is)\s*(online|around|here)|anyone\s*(around|online|here)|anybody\s*here)\s*\??\s*$/i,
      r: ['I dey here 👀', 'me dey', 'here o', 'present 👋'] },

    { p: /^\s*(what'?s?\s*up|wetin\s*dey|wetin dey happen|whats good|wha?ts good|waddup)\s*[!.,]?\s*$/i,
      r: ['Nothing much jare', 'just dey chill', 'we dey o, you?', 'notin much, you nko?'] },

    { p: /^\s*(what\s*(are|r)\s*(you|u)\s*doing|what\s*you\s*doing|wetin\s*you\s*dey\s*do)\s*\??\s*$/i,
      r: ['Just dey o', 'nothing much', 'chilling 🌞', 'just dey watch'] },

    { p: /^\s*(where\s*(are|r)\s*(you|u)|where\s*you\s*dey|where\s*u\s*dey)\s*\??\s*$/i,
      r: ['I dey house', 'around o', 'just dey my side', 'inside'] },

    // ============ EMOJIS ONLY ============
    { p: /^\s*(👍+|❤️+|🔥+|💯+|👋+|😎+|🙏+|🙌+|👌+)\s*$/i,
      r: ['🔥', '💯', '👌', '🙏', 'same vibe'] },

    // ============ BOT-SPECIFIC ============
    { p: /^\s*(are\s*you\s*(a\s*)?(bot|ai|human|real)|you be (bot|ai|human)|u be ai)\s*\??\s*$/i,
      r: ['Na real person o 😂', 'I be human jare', 'wetin make u think say I be bot 😂', 'lol no be, na me dey here'] },

    { p: /^\s*(good\s*night|gn|goodnight)\b/i,
      r: ['Night 🌙', 'Good night o', 'sleep well 😴', 'later'] },

    { p: /^\s*(bye|goodbye|later|see\s*you|cya|peace)\b/i,
      r: ['later 👋', 'see you', 'peace ✌️', 'later bro'] },

    { p: /^\s*(welcome)\b/i,
      r: ['thanks 🙏', '🙏', 'no wahala'] },

    { p: /^\s*(sorry)\b/i,
      r: ['no wahala', "it's ok", 'no problem 🙏'] },

    { p: /^\s*(congrats|congratulations|congrats)\b/i,
      r: ['🎉🎉', 'congrats!', 'yes o! 🎉'] },

    { p: /^\s*(happy\s*birthday|hbd)\b/i,
      r: ['🎂🎉🥳', 'HBD! 🎂', 'happy birthday 🎉'] }
];

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function quickReply(text) {
    if (!text) return null;
    var t = String(text).trim();
    if (t.length < 1 || t.length > 60) return null;
    for (var i = 0; i < QUICK_REPLIES.length; i++) {
        if (QUICK_REPLIES[i].p.test(t)) {
            return pickRandom(QUICK_REPLIES[i].r);
        }
    }
    return null;
}

module.exports = { quickReply, QUICK_REPLIES };
