// ============================================================
// HUMAN CONVERSATION ENGINE
// Not AI. Just thousands of human reply patterns, curated.
// ============================================================

function r(a) { return a[Math.floor(Math.random() * a.length)]; }

// ============ RECENT REPLIES MEMORY ============
var recentByUser = {};
function remember(userId, text) {
    if (!recentByUser[userId]) recentByUser[userId] = [];
    recentByUser[userId].push(text);
    if (recentByUser[userId].length > 8) recentByUser[userId].shift();
}
function isRecent(userId, text) {
    return recentByUser[userId] && recentByUser[userId].indexOf(text) !== -1;
}
function pickFresh(userId, arr) {
    for (var i = 0; i < 10; i++) {
        var c = r(arr);
        if (!isRecent(userId, c)) { remember(userId, c); return c; }
    }
    return r(arr);
}

// ============ PATTERNS ============
// Each entry: { p: regex, r: [replies], q: [optional follow-up questions] }
var PATTERNS = [
    // ----- GREETINGS -----
    { p: /^\s*(hi|hey|hello|yo|sup|wassup|whats up|what's up|howdy|helo|hii+|hiiii+)\s*[!.,]?\s*$/i,
      r: ['sup 👋','yo 😎','hey','hey guy','wetin dey','how you dey?','sup bro','heyyy','hi hi','yo yo','hey hey 😄','ehen','whats good'] },

    { p: /^\s*(good\s*(morning|mrng|morn))\b/i,
      r: ['Morning 🌞','Morning o ☀️','Morn don break 🌞','Good morning 😊','Morning! how you sleep?','Mornin 🌞','Morning chief ☀️'] },

    { p: /^\s*(good\s*(afternoon|aftn|aft))\b/i,
      r: ['Good afternoon ☀️','Afternoon o','Afternoon 🌞','How the day dey go?','Afternoon chief'] },

    { p: /^\s*(good\s*(evening|eve))\b/i,
      r: ['Good evening 🌙','Evening o','Evening 🌆','How the day go?','Good evening chief'] },

    { p: /^\s*(good\s*(night|nite)|gn|goodnight)\b/i,
      r: ['Night 🌙','Good night o','sleep well 😴','later','night night','ok good night'] },

    // ----- HOW ARE YOU -----
    { p: /^\s*(how\s*(are\s*you|you dey|far|body)|how\s*una\s*dey|hw\s*(r\s*u|are\s*you)|how you dey na)/i,
      r: ['I dey o, u nko? 😎','I dey, you nko?','Body dey, you?','I dey jare, u nko?','Chilling o, you?','We dey o, you nko?','I dey small, you?'] },

    { p: /^\s*(how far|howfa|how you far|hw far|how far na|how far class|how far guys|how far team|how far una|how far you)/i,
      r: ['I dey o, you nko? 😎','we dey o','body dey, you?','I dey jare 😎','chilling o','nothing much, you?','I dey small o'] },

    // ----- WHATS UP -----
    { p: /^\s*(what'?s?\s*up|wetin\s*dey|wetin dey happen|whats good|wha?ts good|waddup|wtw)/i,
      r: ['Nothing much jare','just dey chill','we dey o, you?','notin much, you nko?','all good, you?','just dey o','same old, you?'] },

    // ----- YES / AGREEMENT -----
    { p: /^\s*(yes|yeah|yea|yh|yep|yup|yh|yhh|ehen|ehn|ok|okay|k|kk|alright|ight|aight)\s*[!.,]?\s*$/i,
      r: ['💯','yes na','sure','ehen','👍','ehn ehn','ok na','cool','sure sure','alright','facts'] },

    { p: /^\s*(no|nope|nah|naw|no o|no na)\s*[!.,]?\s*$/i,
      r: ['no be so','nah','no o','no na','never','no way','hmm no'] },

    // ----- LAUGHTER -----
    { p: /^\s*(lol|lmao|lmfao|😂+|🤣+|haha+|hehe+|hehehe+|loool)\s*$/i,
      r: ['😂😂','🤣🤣','lol','hahaha','😂','ehn 😂','😅','funny','hahaha same','😂😂😂'] },

    { p: /\b(lol|lmao|😂|🤣|haha)\b/i,
      r: ['😂','right?! 😂','lol same','ehn 😅','😆','funny guy'] },

    // ----- THANKS -----
    { p: /^\s*(thanks|thank you|tanks|tnx|thx|tanx|thank u|thank yu)\s*[!.,]?\s*$/i,
      r: ['No wahala 🙏','anytime 😊','no problem','bless 🙏','👍','ehn nothing','sure','no issue'] },

    // ----- SORRY -----
    { p: /^\s*(sorry|my bad|my fault)\b/i,
      r: ['no wahala','it\'s ok','no problem 🙏','ehn no issue','no vex','no worry','all good'] },

    // ----- CONGRATS -----
    { p: /^\s*(congrats|congratulations|congrats|happy for you)\b/i,
      r: ['🎉🎉','congrats!','yes o! 🎉','🔥🔥','well done','nice one! 🎉','proud of you'] },

    { p: /^\s*(happy\s*birthday|hbd|hpy bday)\b/i,
      r: ['🎂🎉🥳','HBD! 🎂','happy birthday 🎉','🎉🎂🥳','happy bday!'] },

    // ----- WHO'S ONLINE -----
    { p: /^\s*(who\s*(dey|is)\s*(online|around|here)|anyone\s*(around|online|here)|anybody\s*here|who dey house|who dey)/i,
      r: ['I dey here 👀','me dey','here o','present 👋','I dey o','right here 😎','we dey'] },

    // ----- WHAT ARE YOU DOING -----
    { p: /^\s*(what\s*(are|r)\s*(you|u)\s*doing|what\s*you\s*doing|wetin\s*you\s*dey\s*do|wetin you dey do|what you dey do)/i,
      r: ['Just dey o','nothing much','chilling 🌞','just dey watch','nothing jare, you?','dey o, you nko?','just dey vibe'] },

    // ----- WHERE ARE YOU -----
    { p: /^\s*(where\s*(are|r)\s*(you|u)|where\s*you\s*dey|where\s*u\s*dey)\s*\??\s*$/i,
      r: ['I dey house','around o','just dey my side','inside o','my area, you?','house jare'] },

    // ----- BYE -----
    { p: /^\s*(bye|goodbye|later|see\s*you|cya|peace|dey go|i dey go|am going|going out|comot)\b/i,
      r: ['later 👋','see you','peace ✌️','later bro','safe journey','take care','later o'] },

    // ----- EMOJI ONLY -----
    { p: /^\s*(👍+|❤️+|🔥+|💯+|🙏+|👌+|🙌+|😎+|👋+|😊+|😂+|🤔+)\s*$/i,
      r: ['🔥','💯','👌','🙏','😎','same vibe','❤️','😄','yes'] },

    // ----- ARE YOU BOT -----
    { p: /^\s*(are\s*you\s*(a\s*)?(bot|ai|human|real)|you be (bot|ai|human)|u be (bot|ai)|is this a bot|who is this|who are you)\b/i,
      r: ['Na real person o 😂','I be human jare','wetin make u think say I be bot 😂','lol no be, na me dey here','normal person o','I be guy na 😎','just me jare'] },

    // ----- COMPLIMENTS -----
    { p: /^\s*(you\s*(are|r)\s*(funny|nice|good|smart|sweet)|u (funny|nice|good|smart)|you too much)/i,
      r: ['🙏🙏','aww thanks','ehen na 😎','you too much pass me','🙏','you sef','omo na you'] },

    // ----- QUESTIONS (general "?" ending) -----
    { p: /\?\s*$/,
      r: ['hmm I no know o 🤔','I think so','maybe na','not sure o','you tell me','ehn wetin you think?','good question o','hmm sha'], 
      q: ['what you think?','you nko?','who sabi?','why you ask?','wetin happen?'] },

    // ----- RANDOM STATEMENTS (long messages) -----
    { p: /.{30,}/,
      r: ['ehn ehn','na wa o','that one strong o','serious?','omo','chai','see talk','hmm','ok o','interesting 🤔'],
      q: ['you sure?','how you mean?','wetin happen?'] },

    // ----- SPORTS/FOOTBALL -----
    { p: /\b(football|match|chelsea|arsenal|man u|man utd|liverpool|madrid|barca|barcelona|messi|ronaldo|premier league|super eagles|efootball|dls|freefire)\b/i,
      r: ['that match sweet o','which team you dey support?','football dey cause wahala 😂','we go see','na so o','⚽🔥','the thing pain me o'] },

    // ----- MONEY -----
    { p: /\b(money|naira|dollar|dollars|cash|paid|broke|investment|hustle)\b/i,
      r: ['money na water 💧','hustle dey go o','chai 💸','who no get money?','God go provide 🙏','same here o','let\'s grind 💪'] },

    // ----- LOVE/RELATIONSHIP -----
    { p: /\b(girlfriend|boyfriend|babe|bobo|crush|love|relationship|single|dating)\b/i,
      r: ['ehen 😏','love na sweet thing o','chai','omo see talk','who be the person?','story for another day','🙈'] },

    // ----- FOOD -----
    { p: /\b(food|hungry|chop|jollof|rice|eat|eating|beans|swallow|egusi)\b/i,
      r: ['make I come chop? 😋','hungry dey worry me o','jollof na the best 😋','food don ready?','send am come 😂','I dey fast o'] },

    // ----- TIRED/SLEEPY -----
    { p: /\b(tired|sleepy|sleep|resting|stress|stressed|exhausted|fatigue)\b/i,
      r: ['same here o 😴','go rest o','sleep sweet o','you work too much','take it easy','no wahala, rest small'] }
];

// ============ MESSAGE PROCESSING ============
function normalize(text) {
    return String(text || '').trim();
}

// Returns { text: '...', question: '...' } or null
function generateReply(userId, incomingText) {
    var t = normalize(incomingText);
    if (!t || t.length < 2) return null;

    // Skip commands
    if (t.startsWith('.')) return null;
    if (t.indexOf('@bot') !== -1) return null;

    for (var i = 0; i < PATTERNS.length; i++) {
        var pat = PATTERNS[i];
        if (pat.p.test(t)) {
            var main = pickFresh(userId, pat.r);
            // 30% chance to add a follow-up question
            if (pat.q && Math.random() < 0.3) {
                var q = pickFresh(userId, pat.q);
                main = main + ' ' + q;
            }
            return { text: main };
        }
    }

    return null;
}

// Decide if the bot should even reply.
// Real humans don't reply to everything — this makes it feel natural.
function shouldReplyIncoming(userId, incomingText) {
    var t = normalize(incomingText);
    if (!t || t.length < 2) return false;
    if (t.startsWith('.')) return false;
    if (t.indexOf('@bot') !== -1) return false;

    // Messages that match strong patterns → almost always reply
    for (var i = 0; i < 5; i++) {  // first 5 are greetings / how are you
        if (PATTERNS[i].p.test(t)) return Math.random() < 0.9;  // 90%
    }

    // Medium patterns (thanks, sorry, who online, etc.) → often reply
    for (var j = 5; j < 14; j++) {
        if (PATTERNS[j].p.test(t)) return Math.random() < 0.7;  // 70%
    }

    // Long statements / questions → reply sometimes
    for (var k = 14; k < PATTERNS.length; k++) {
        if (PATTERNS[k].p.test(t)) return Math.random() < 0.35;  // 35%
    }

    // No match → 15% chance to react with a short filler
    return Math.random() < 0.15;
}

module.exports = { generateReply, shouldReplyIncoming, PATTERNS };
