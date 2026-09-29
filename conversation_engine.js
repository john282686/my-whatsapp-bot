// ==== ctx tracker lazy loader ====
var __ctxInstance = null;
function __getCtxTracker() {
    if (__ctxInstance) return __ctxInstance;
    try { __ctxInstance = require('./context_tracker'); } catch(e) { console.log('[CTX] load fail:', e.message); }
    return __ctxInstance;
}
// ==== end ====

var __ctxReplies = null;
try { __ctxReplies = require('./context_replies'); } catch(e) { console.log("[CTX] load fail: " + e.message); }

var __emotion = null;
try { __emotion = require('./emotion_engine'); } catch(e) {}

var __timeAware = null;
try { __timeAware = require('./time_aware'); } catch(e) {}

var __personalizer = null;
try { __personalizer = require('./personalizer'); } catch(e) {}

// ============================================================
// CONVERSATION ENGINE — v2 (clean rebuild)
// ============================================================

var PATTERNS = [
    // ----- CORE GREETINGS -----
    { p: /^\s*(hi|hey|hello|yo|sup|wassup|whats up|what's up|howdy|helo|hii+|hiiii+)\s*[!.,]?\s*$/i,
      r: ['sup 👋','yo 😎','hey','hey guy','wetin dey','how you dey?','sup bro','heyyy','hi hi','yo yo','hey hey 😄','ehen','whats good'] },
    { p: /^\s*(good\s*(morning|mrng|morn))\b/i,
      r: ['Morning 🌞','Morning o ☀️','Morn don break 🌞','Good morning 😊','Morning! how you sleep?','Mornin 🌞','Morning chief ☀️'] },
    { p: /^\s*(good\s*(afternoon|aftn))\b/i,
      r: ['Good afternoon ☀️','Afternoon o','Afternoon 🌞','How the day dey go?','Afternoon chief'] },
    { p: /^\s*(good\s*(evening|eve))\b/i,
      r: ['Good evening 🌙','Evening o','Evening 🌆','How the day go?','Good evening chief'] },
    { p: /^\s*(good\s*(night|nite)|gn|goodnight)\b/i,
      r: ['Night 🌙','Good night o','sleep well 😴','later','night night','ok good night'] },
    { p: /^\s*(how\s*(are\s*you|you dey|far|body)|how\s*una\s*dey|hw\s*(r\s*u|are\s*you))/i,
      r: ['I dey o, u nko? 😎','I dey, you nko?','Body dey, you?','I dey jare, u nko?','Chilling o, you?','We dey o, you nko?'] },
    { p: /^\s*(how far|howfa|how you far|hw far|how far na|how far class|how far guys|how far team|how far una|how far you)/i,
      r: ['I dey o, you nko? 😎','we dey o','body dey, you?','I dey jare 😎','chilling o','nothing much, you?'] },
    { p: /^\s*(what'?s?\s*up|wetin\s*dey|wetin dey happen|whats good|wha?ts good|waddup|wtw)/i,
      r: ['Nothing much jare','just dey chill','we dey o, you?','notin much, you nko?','all good, you?','just dey o'] },

    // ----- YES / OK / NO -----
    { p: /^\s*(yes|yeah|yea|yh|yep|yup|yhh|ehen|ehn|ok|okay|k|kk|alright|ight|aight)\s*[!.,]?\s*$/i,
      r: ['💯','yes na','sure','ehen','👍','ehn ehn','ok na','cool','sure sure','alright','facts'] },
    { p: /^\s*(no|nope|nah|naw|no o|no na)\s*[!.,]?\s*$/i,
      r: ['no be so','nah','no o','no na','never','no way','hmm no'] },

    // ----- LAUGHTER -----
    { p: /^\s*(lol|lmao|lmfao|😂+|🤣+|haha+|hehe+|hehehe+|loool)\s*$/i,
      r: ['😂😂','🤣🤣','lol','hahaha','😂','ehn 😂','😅','funny','hahaha same','😂😂😂'] },
    { p: /\b(lol|lmao|😂|🤣|haha)\b/i,
      r: ['😂','right?! 😂','lol same','ehn 😅','😆','funny guy'] },

    // ----- THANKS / SORRY -----
    { p: /^\s*(thanks|thank you|tanks|tnx|thx|tanx|thank u|thank yu)\s*[!.,]?\s*$/i,
      r: ['No wahala 🙏','anytime 😊','no problem','bless 🙏','👍','ehn nothing','sure','no issue'] },
    { p: /^\s*(sorry|my bad|my fault)\b/i,
      r: ['no wahala',"it's ok",'no problem 🙏','ehn no issue','no vex','no worry','all good'] },

    // ----- CONGRATS -----
    { p: /^\s*(congrats|congratulations|happy for you)\b/i,
      r: ['🎉🎉','congrats!','yes o! 🎉','🔥🔥','well done','nice one! 🎉','proud of you'] },
    { p: /^\s*(happy\s*birthday|hbd|hpy bday)\b/i,
      r: ['🎂🎉🥳','HBD! 🎂','happy birthday 🎉','🎉🎂🥳','happy bday!'] },

    // ----- WHO'S ONLINE -----
    { p: /^\s*(who\s*(dey|is)\s*(online|around|here)|anyone\s*(around|online|here)|anybody\s*here|who dey house|who dey)/i,
      r: ['I dey here 👀','me dey','here o','present 👋','I dey o','right here 😎','we dey'] },

    // ----- WHAT ARE YOU DOING -----
    { p: /^\s*(what\s*(are|r)\s*(you|u)\s*doing|what\s*you\s*doing|wetin\s*you\s*dey\s*do|wetin you dey do)/i,
      r: ['Just dey o','nothing much','chilling 🌞','just dey watch','nothing jare, you?','dey o, you nko?'] },

    // ----- WHERE ARE YOU -----
    { p: /^\s*(where\s*(are|r)\s*(you|u)|where\s*you\s*dey|where\s*u\s*dey)\s*\??\s*$/i,
      r: ['I dey house','around o','just dey my side','inside o','my area, you?','house jare'] },

    // ----- BYE -----
    { p: /^\s*(bye|goodbye|later|see\s*you|cya|peace|dey go|i dey go|am going|going out|comot)\b/i,
      r: ['later 👋','see you','peace ✌️','later bro','safe journey','take care','later o'] },

    // ----- EMOJIS -----
    { p: /^\s*(👍+|❤️+|🔥+|💯+|🙏+|👌+|🙌+|😎+|👋+|😊+|😂+|🤔+)\s*$/i,
      r: ['🔥','💯','👌','🙏','😎','same vibe','❤️','😄','yes'] },

    // ----- ARE YOU BOT -----
    { p: /\b(are\s*you\s*(a\s*)?(bot|ai|human|real)|you be (bot|ai|human)|u be (bot|ai)|is this a bot|who is this)\b/i,
      r: ['Na real person o 😂','I be human jare','wetin make u think say I be bot 😂','lol no be, na me dey here','normal person o','I be guy na 😎'] },

    // ----- COMPLIMENTS -----
    { p: /^\s*(you\s*(are|r)\s*(funny|nice|good|smart|sweet)|u (funny|nice|good|smart)|you too much)/i,
      r: ['🙏🙏','aww thanks','ehen na 😎','you too much pass me','🙏','you sef','omo na you'] },

    // ----- INSULTS (light) -----
    { p: /^\s*(you foolish|you mad|idiot|stupid|fool)\b/i,
      r: ['chill na 😅','wetin happen now?','no vex','ehn ok','we no dey do that here','no insult o'] },

    // ----- QUESTIONS -----
    { p: /\?\s*$/,
      r: ['hmm I no know o 🤔','I think so','maybe na','not sure o','you tell me','ehn wetin you think?','good question o','hmm sha'] },

    // ----- SPORTS -----
    { p: /\b(football|match|chelsea|arsenal|man u|man utd|liverpool|madrid|barca|barcelona|messi|ronaldo|premier league|super eagles|efootball|dls|freefire)\b/i,
      r: ['that match sweet o','which team you dey support?','football dey cause wahala 😂','we go see','na so o','⚽🔥','the thing pain me o'] },

    // ----- MUSIC -----
    { p: /\b(music|song|listen|playlist|artist|album|afrobeats|wizkid|burna|davido|rema|tems|asake)\b/i,
      r: ['music na life o 🎶','which song?','that track dey sweet','na my vibe','🔥🎶','you sabi music o'] },

    // ----- MOVIES -----
    { p: /\b(movie|film|netflix|series|show|watch|episode|season)\b/i,
      r: ['which movie?','na good one?','I dey watch one sef','series na life o 🎬','you watch am finish?'] },

    // ----- FOOD -----
    { p: /\b(food|hungry|chop|jollof|rice|eat|eating|beans|swallow|egusi|amala|fufu|eba|pounded yam|garri|plantain|indomie|shawarma)\b/i,
      r: ['make I come chop? 😋','hungry dey worry me o','jollof na the best 😋','food don ready?','send am come 😂','I dey fast o'] },

    // ----- MONEY -----
    { p: /\b(money|naira|dollar|dollars|cash|paid|broke|investment|hustle|wealth|rich|salary)\b/i,
      r: ['money na water 💧','hustle dey go o','chai 💸','who no get money?','God go provide 🙏','same here o','let\'s grind 💪'] },

    // ----- WORK / SCHOOL -----
    { p: /\b(work|working|job|office|boss|school|class|exam|test|teacher|student|assignment)\b/i,
      r: ['work dey go o','school na wahala','exam don come','chai 😩','we go manage','how e dey go?','no be small thing o'] },

    // ----- WEATHER -----
    { p: /\b(rain|raining|sun|hot|cold|weather|cloudy|sunny)\b/i,
      r: ['rain dey here too o','sun dey kill person','cold dey o','weather no good today','🌧️','☀️','💨'] },

    // ----- TRAFFIC -----
    { p: /\b(traffic|go-slow|hold up|transport|bus|keke|uber)\b/i,
      r: ['traffic na wahala o','go-slow dey o','chai 😩','how you take reach?','no be small thing o'] },

    // ----- TECH -----
    { p: /\b(phone|android|iphone|app|whatsapp|internet|data|wifi|charge|battery)\b/i,
      r: ['data dey finish me o','phone dey slow','my battery low o','internet no good here','Android or iPhone?','tech na wahala'] },

    // ----- RELATIONSHIPS -----
    { p: /\b(girlfriend|boyfriend|babe|bobo|crush|love|relationship|single|dating|wifey|hubby|ex)\b/i,
      r: ['ehen 😏','love na sweet thing o','chai','omo see talk','who be the person?','story for another day','🙈'] },

    // ----- MOODS -----
    { p: /\b(tired|sleepy|sleep|resting|stress|stressed|exhausted|fatigue)\b/i,
      r: ['same here o 😴','go rest o','sleep sweet o','you work too much','take it easy'] },

    // ----- AGREEMENT -----
    { p: /^\s*(exactly|fact|facts|true|real talk|you right|you dey right|you\s*correct|very true)\s*[!.,]?\s*$/i,
      r: ['💯','exactly 💯','fact!','real talk','you sabi','na true o','ehen na 💯'] },

    // ----- REACTIONS -----
    { p: /^\s*(wow|omg|damn|chai|wahala|omo|oya|ehen|sheesh|ayeee|yooo|ohh?|na wa)\s*[!.,]?\s*$/i,
      r: ['omo 😳','chai!','wahala o','see this thing','na wa o','ehen!','serious?','😱','ah ah'] },

    { p: /^\s*(nice|sweet|cool|great|beautiful|lovely|fine|great job)\s*[!.,]?\s*$/i,
      r: ['🙏','thanks','ehn o 😎','na you','nice one 🔥','💯','appreciate'] },

    { p: /^\s*(interesting|serious|really|for real|you serious)\s*[!.,]?\s*$/i,
      r: ['seriously o','I swear','on god','real talk','na so o','you think so?','🤔'] },

    // ----- CRYPTO -----
    { p: /\b(crypto|bitcoin|btc|eth|ethereum|usdt|binance|bybit|okx|trading|forex)\b/i,
      r: ['crypto dey do people o','you dey trade?','which coin?','no lose money o','crypto na risky thing'] },

    // ----- GAMES -----
    { p: /\b(efootball|e-football|pes|fifa|ea fc|ea sports|dream league|dls|pubg|cod|mini militia)\b/i,
      r: ['my team dey strong o','which team you dey use?','make we play','efootball na my game','pass the ball na'] },

    // ----- LONG GENERIC -----
    { p: /.{30,}/,
      r: ['ehn ehn','na wa o','that one strong o','serious?','omo','chai','see talk','hmm','ok o','interesting 🤔'] },

    // ----- ULTIMATE FALLBACK -----
    { p: /.{2,}/,
      r: ['ehn','hmm','ok o','sure','we dey o','chill','na so','I hear you','ehen','alright','talk am','continue','wetin happen?','see talk'] }
];

// ============================================================
// MEMORY + UTILITIES
// ============================================================
function r(a) { return a[Math.floor(Math.random() * a.length)]; }

var recentByUser = {};
function remember(userId, text) {
    if (!recentByUser[userId]) recentByUser[userId] = [];
    recentByUser[userId].push(text);
    if (recentByUser[userId].length > 30) recentByUser[userId].shift();
}
function isRecent(userId, text) {
    return recentByUser[userId] && recentByUser[userId].indexOf(text) !== -1;
}
function pickFresh(userId, arr) {
    if (!arr || !arr.length) return null;
    var period = __timeAware ? __timeAware.getPeriod() : null;

    // Filter to time-appropriate replies first
    var valid = arr;
    if (__timeAware) {
        valid = arr.filter(function(r) {
            return !__timeAware.isTimeInappropriate(r, period) && !__timeAware.isTimeMismatch(r, period);
        });
        if (!valid.length) valid = arr;
    }

    // Exclude recently used
    var fresh = valid.filter(function(r) { return !isRecent(userId, r); });

    // If enough fresh ones, pick from those
    var pick;
    if (fresh.length > 0) {
        pick = fresh[Math.floor(Math.random() * fresh.length)];
    } else {
        // All used — reset memory and pick a new one
        recentByUser[userId] = [];
        pick = valid[Math.floor(Math.random() * valid.length)];
    }

    // Final safety: fix any time mismatch
    if (__timeAware && __timeAware.isTimeInappropriate(pick, period)) {
        pick = __timeAware.fixGreeting(pick, period);
    }

    remember(userId, pick);
    return pick;
}

function normalize(text) {
    return String(text || '').trim();
}

// ============================================================
// MAIN FUNCTIONS
// ============================================================
// LANGUAGE AWARE — reply in same language as the user
var __lang = null;
try { __lang = require('./language_handler'); } catch (e) {}

function generateReply(userId, incomingText) {
    // 0. Check emotion FIRST — override for strong emotional messages
    if (__emotion) {
        try {
            var emo = __emotion.detectEmotion(incomingText);
            if (emo && __emotion.shouldOverrideEmotion(emo)) {
                var isPg = __biLang ? __biLang.isPidgin(incomingText) : false;
                var emoReply = __emotion.getEmotionReply(emo, isPg);
                if (emoReply) {
                    console.log('[EMO] detected ' + emo);
                    return { text: emoReply };
                }
            }
        } catch(e) {}
    }

    // 1. Try bilingual library
    var biReply = __bilingualReply(userId, incomingText);
    if (biReply) return biReply;

    // 2. Fall back to original patterns
    var t = normalize(incomingText);
    if (!t || t.length < 2) return null;
    if (t.startsWith('.')) return null;
    if (t.indexOf('@bot') !== -1) return null;

    var userPidgin = __lang ? __lang.isPidgin(t) : false;

    for (var i = 0; i < PATTERNS.length; i++) {
        if (PATTERNS[i].p.test(t)) {
            var reply = pickFresh(userId, PATTERNS[i].r);
            // If user wrote English but reply is pidgin, translate it
            if (!userPidgin && __lang && __lang.isPidgin(reply)) {
                reply = __lang.translateToEnglish(reply);
            }
            return { text: reply };
        }
    }
    return null;
}

function shouldReplyIncoming(userId, incomingText) {
    var t = normalize(incomingText);
    if (!t || t.length < 2) return false;
    if (t.startsWith('.')) return false;
    if (t.indexOf('@bot') !== -1) return false;

    // Always reply to greetings (first 8 patterns)
    for (var i = 0; i < 8; i++) {
        if (PATTERNS[i].p.test(t)) return Math.random() < 0.95;
    }
    // Reply to most matching patterns
    for (var j = 8; j < 30; j++) {
        if (PATTERNS[j].p.test(t)) return Math.random() < 0.75;
    }
    // Reply to other patterns less often
    for (var k = 30; k < PATTERNS.length; k++) {
        if (PATTERNS[k].p.test(t)) return Math.random() < 0.4;
    }
    // No match at all → 20% chance for a filler
    return Math.random() < 0.2;
}

function catchAllReply(userId, incomingText) {
    var biReply = __bilingualReply(userId, incomingText);
    if (biReply) return biReply.text;
    var t = normalize(incomingText);
    if (t.length < 2) return null;
    if (t.startsWith('.')) return null;

    var userPidgin = __lang ? __lang.isPidgin(t) : false;

    var short = ['ehn','hmm','ok o','sure','we dey o','chill','na so','I hear you','ehen','alright','wetin happen?','see talk'];
    var reply = pickFresh(userId, short);
    if (!userPidgin && __lang && __lang.isPidgin(reply)) {
        reply = __lang.translateToEnglish(reply);
    }
    return reply;
}

function getStyleExamples(incomingText) {
    var t = normalize(incomingText);
    if (!t) return null;
    var lines = [];
    var count = 0;
    for (var i = 0; i < PATTERNS.length && count < 3; i++) {
        if (PATTERNS[i].p.test(t)) {
            PATTERNS[i].r.slice(0, 4).forEach(function (ex) {
                lines.push('  • ' + ex);
            });
            count++;
        }
    }
    return lines.length ? lines.join('\n') : null;
}

function isGreeting(incomingText) {
    var t = normalize(incomingText);
    if (!t || t.length > 60) return false;
    for (var i = 0; i < 5; i++) {
        if (PATTERNS[i].p.test(t)) return true;
    }
    return false;
}

// ============================================================
// LOAD EXTENDED LIBRARIES
// ============================================================
(function loadAllLibraries() {
    var libs = [
        './conversation_library',
        './conversation_library2',
        './conversation_library3',
        './conversation_library4',
        './conversation_library5',
        './conversation_library6',
        './conversation_library7',
        './conversation_library8',
        './conversation_library9',
        './conversation_library10'
    ];
    libs.forEach(function (path, idx) {
        try {
            var lib = require(path);
            if (Array.isArray(lib)) {
                lib.forEach(function (entry) { PATTERNS.push(entry); });
                console.log('[LIB' + (idx + 1) + '] loaded ' + lib.length + ' patterns');
            }
        } catch (e) {
            console.log('[LIB' + (idx + 1) + '] ' + path + ' not loaded: ' + e.message);
        }
    });
    console.log('[LIB] total patterns: ' + PATTERNS.length);
})();


// ============================================================
// LOAD BILINGUAL LIBRARY (en + pg native replies)
// ============================================================
var __biLang = null;
try { __biLang = require('./language_handler'); } catch (e) {}

var BILINGUAL = [];

// Load expanded FIRST (higher priority)
try {
    var __BIX = require('./bilingual_expanded');
    if (Array.isArray(__BIX)) {
        __BIX.forEach(function(e) { BILINGUAL.push(e); });
        console.log('[BIX] loaded ' + __BIX.length + ' expanded patterns (priority)');
    }
} catch (e) { console.log('[BIX] could not load: ' + e.message); }

try {
    BILINGUAL = require('./bilingual_library');
    console.log('[BI] bilingual library loaded: ' + BILINGUAL.length + ' patterns');
} catch (e) {
    console.log('[BI] could not load: ' + e.message);
}

// Bilingual-aware reply function (checked FIRST before other patterns)

// ==== TIME-POOL-OVERRIDE ====
// If user says a time-of-day greeting but the current time doesn't match,
// return a pool of replies for the CURRENT time instead.
function __timeAppropriatePool(userText, originalPool) {
    if (!__timeAware) return originalPool;
    var period = __timeAware.getPeriod();
    var t = String(userText).toLowerCase();

    // Detect what the user said
    var saysMorning = /\b(good\s*morning|morning|morn)\b/i.test(t);
    var saysAfternoon = /\b(good\s*afternoon|afternoon|aftn)\b/i.test(t);
    var saysEvening = /\b(good\s*evening|evening|eve)\b/i.test(t);
    var saysNight = /\b(good\s*night|night|nite)\b/i.test(t);

    // If the user's greeting matches the actual time, use original pool
    if (period === 'morning' && saysMorning) return originalPool;
    if (period === 'afternoon' && saysAfternoon) return originalPool;
    if (period === 'evening' && saysEvening) return originalPool;
    if (period === 'night' && saysNight) return originalPool;

    // If user said a time-of-day greeting that DOESN'T match, replace the pool
    if (saysMorning || saysAfternoon || saysEvening || saysNight) {
        var map = {
            morning: {
                en: ['Good morning ☀️','Morning!','Hope you slept well','Morning 🌞','Rise and shine ☀️'],
                pg: ['Morning o ☀️','Morn don break 🌞','Morning chief','Morn o']
            },
            afternoon: {
                en: ['Good afternoon ☀️','Afternoon!','How is your day going?','Hey!'],
                pg: ['Afternoon o','Good afternoon o ☀️','Afternoon chief']
            },
            evening: {
                en: ['Good evening 🌙','Evening!','Hope you had a good day','Hey!'],
                pg: ['Evening o 🌆','Good evening o','Evening chief']
            },
            night: {
                en: ['Good night 🌙','Sleep well','Night!','Rest well 😴'],
                pg: ['Night o 🌙','Sleep well o','Good night chief']
            }
        };
        var pick = map[period];
        if (pick) return pick.en.concat(pick.pg);
    }
    return originalPool;
}
// ==== END TIME-POOL-OVERRIDE ====

function __bilingualReply(userId, incomingText) {
    if (!__biLang || !BILINGUAL.length) return null;
    var t = normalize(incomingText);
    if (!t || t.length < 2) return null;
    if (t.startsWith('.')) return null;
    if (t.indexOf('@bot') !== -1) return null;

    var userIsPidgin = __biLang.isPidgin(t);
    for (var i = 0; i < BILINGUAL.length; i++) {
        if (BILINGUAL[i].p.test(t)) {
            var pool = userIsPidgin ? (BILINGUAL[i].pg || BILINGUAL[i].en) : (BILINGUAL[i].en || BILINGUAL[i].pg);
            pool = __timeAppropriatePool(t, pool); // TIME-POOL-OVERRIDE applied
            if (!pool || !pool.length) return null;
            var biReply = pickFresh(userId, pool);
            if (__personalizer && dbForPersonalize) {
                try { biReply = __personalizer.personalize(userId, t, biReply, dbForPersonalize); } catch(e) {}
            }
            // Context-aware: sometimes reference recent topic
            if (__ctxReplies && __getCtxTracker() && dbForPersonalize) {
                try {
                    if (t.length < 25 && Math.random() < 0.12) {
                        var topic = __getCtxTracker().getCurrentTopic(dbForPersonalize, userId, '__last_chat');
                        if (topic) {
                            var isPg = __biLang ? __biLang.isPidgin(t) : false;
                            biReply = __ctxReplies.addContextToReply(biReply, topic, isPg);
                            console.log('[CTX-REPLY] topic=' + topic);
                        }
                    }
                } catch(e) { console.log('[CTX-ERR]', e.message); }
            }
            return { text: biReply };
        }
    }
    return null;
}
// ============================================================

module.exports = {
    generateReply: generateReply,
    shouldReplyIncoming: shouldReplyIncoming,
    catchAllReply: catchAllReply,
    getStyleExamples: getStyleExamples,
    isGreeting: isGreeting,
    PATTERNS: PATTERNS
};


// Global for personalization access
var dbForPersonalize = null;
function setPersonalizerDB(db) { dbForPersonalize = db; }

// ==== CONTEXT DB SETTER ====
var __ctxDB = null;
function setContextDB(db) {
    __ctxDB = db;
    try {
        var ct = require('./context_tracker');
        if (ct && ct.ensure) ct.ensure(db);
    } catch(e) {}
}
// ==== END ====

module.exports.setPersonalizerDB = setPersonalizerDB;


module.exports.setContextDB = setContextDB;
