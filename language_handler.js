// ============================================================
// LANGUAGE HANDLER — detect English vs Pidgin, translate replies
// ============================================================

// Pidgin markers — if the message contains any of these, it's pidgin
var PIDGIN_MARKERS = [
    'dey', 'na', 'jare', 'sha', 'wetin', 'abeg', 'chai', 'wahala',
    'nko', 'abi', 'sef', 'shey', 'shebi', 'sabi', 'gbege', 'oyibo',
    'una', 'omo', 'chale', 'wey', 'don', 'no wahala', 'make i',
    'no be', 'ehen', 'ehn', 'waka', 'wetin dey', 'sup', 'how far',
    'se', 'kudi', 'ego', 'nwanne', 'biko', 'chei', 'hian',
    'thanks o', 'thank you o', 'sorry o', 'welcome o',
    'yes o', 'no o', 'ok o', 'fine o', 'well o',
    'morning o', 'evening o', 'afternoon o', 'night o'
];

function isPidgin(text) {
    if (!text) return false;
    var t = String(text).toLowerCase();
    for (var i = 0; i < PIDGIN_MARKERS.length; i++) {
        var m = PIDGIN_MARKERS[i];
        // Whole-word match for short markers, substring for phrases
        if (m.indexOf(' ') !== -1) {
            if (t.indexOf(m) !== -1) return true;
        } else {
            var re = new RegExp('\\b' + m + '\\b');
            if (re.test(t)) return true;
        }
    }
    return false;
}

// Direct translations from pidgin replies to English equivalents
// Keys are the pidgin replies, values are English versions
var PIDGIN_TO_ENGLISH = {
    'sup 👋': 'Hey 👋',
    'sup': 'Hey',
    'sup bro': 'Hey bro',
    'sup sup': 'Hey hey',
    'yo': 'Hey',
    'yo 😎': 'Hey 😎',
    'yo yo': 'Hey hey',
    'yo guy': 'Hey guy',
    'wetin dey': "What's up",
    'wetin dey 👀': "What's up 👀",
    'wetin dey o': "What's up",
    'wetin happen?': 'What happened?',
    'wetin?': 'What?',
    'how far?': 'How are you?',
    'how far': 'How are you?',
    'how you dey?': 'How are you?',
    'I dey o, u nko? 😎': "I'm fine, how about you? 😎",
    'I dey o, u nko?': "I'm fine, how about you?",
    'I dey o, you nko? 😎': "I'm fine, how about you? 😎",
    'I dey o, you nko?': "I'm fine, how about you?",
    'I dey o': "I'm fine",
    'I dey jare, u nko?': "I'm fine, how about you?",
    'I dey jare, you nko?': "I'm fine, how about you?",
    'I dey jare': "I'm fine",
    'I dey, you nko?': "I'm fine, how about you?",
    'body dey, you?': "I'm fine, and you?",
    'body dey': "I'm fine",
    'we dey o': "We're here",
    'we dey o, you nko?': "We're here, how about you?",
    'we dey o, you?': "We're here, and you?",
    'we dey jare': "We're good",
    'we dey here': "We're here",
    'we dey manage': "We're managing",
    'we dey o 😎': "We're here 😎",
    'I dey here': "I'm here",
    'I dey here 👀': "I'm here 👀",
    'I dey small': "I'm okay",
    'I dey house': "I'm at home",
    'nothing much jare': 'Nothing much',
    'just dey chill': 'Just chilling',
    'just dey': 'Just chilling',
    'just dey o': 'Just chilling',
    'just dey watch': 'Just chilling',
    'just dey my side': "I'm around",
    'notin much, you nko?': 'Not much, how about you?',
    'ehen': 'Alright',
    'ehen na': 'Alright',
    'ehen o': 'Alright',
    'ehn': 'Alright',
    'ehn o': 'Alright',
    'ehn ehn': 'Alright',
    'na so o': "That's right",
    'na so': "That's right",
    'na wa o': 'Wow',
    'na wa': 'Wow',
    'chai': 'Oh no',
    'chai!': 'Oh no!',
    'chai 😢': 'Oh no 😢',
    'chai 😩': 'Oh no 😩',
    'chai 💸': 'Oh no 💸',
    'chai 😂': 'Oh no 😂',
    'ewo': 'Wow',
    'ewo o': 'Wow',
    'ewo 😂': 'Wow 😂',
    'omo': 'Bro',
    'omo 😳': 'Bro 😳',
    'no wahala': "It's fine",
    'no wahala o': "It's fine",
    'no wahala 🙏': "It's fine 🙏",
    'no be so': "That's not it",
    'no be so o': "That's not it",
    'abeg': 'Please',
    'abeg jare': 'Please',
    'ok na': 'Okay',
    'ok o': 'Okay',
    'ok o!': 'Okay!',
    'okay o': 'Okay',
    'sure na': 'Sure',
    'sharp sharp': 'Nice',
    'sharp sharp 👍': 'Nice 👍',
    'sharp': 'Nice',
    'jare': 'Then',
    'jare no wahala': "It's fine",
    'oya na': "Let's go",
    'oya': "Let's go",
    'dey come': 'Coming',
    'dey go': 'Going',
    'later o': 'See you later',
    'later bro': 'See you later',
    'safe journey': 'Safe travels',
    'chill o': 'Relax',
    'chill na': 'Relax',
    'chill small': 'Relax a bit',
    'calm down': 'Calm down',
    'no vex': 'No worries',
    'no worry': 'No worries',
    'no worry o': 'No worries',
    'we go see': "We'll see",
    'we go manage': "We'll manage",
    'e go better': "It'll get better",
    'God dey o': "God is there",
    'na God o 🙏': 'God is there 🙏',
    'na God o': 'God is there',
    'I swear': 'I swear',
    'no be lie': 'No lie',
    'na true': "That's true",
    'na true o': "That's true",
    'true talk o': 'True talk',
    'real talk': 'Real talk',
    'ehen same to you': 'Same to you',
    'same here o': 'Same here',
    'same here': 'Same here',
    'you sabi': 'You know',
    'you sabi o': 'You know',
    'you too much': "You're too much",
    'you too much o': "You're too much",
    'you sef': 'You too',
    'na you o': "It's you",
    'na you': "It's you",
    'na you o 😎': "It's you 😎",
    'I hear you': 'I hear you',
    'I dey hear': 'I hear you',
    'talk am': 'Talk',
    'talk na': 'Talk',
    'talk to me': 'Talk to me',
    'continue': 'Continue',
    'gist me': 'Tell me',
    'spill am': 'Spill it',
    'wetin you think?': 'What do you think?',
    'you nko?': 'How about you?',
    'you tell me': 'You tell me',
    'see talk': 'Wow',
    'see this thing': 'Wow',
    'see person': 'Look at this',
    'hmm sha': 'Hmm',
    'hmm': 'Hmm',
    'hmm o': 'Hmm',
    'nice one': 'Nice one',
    'nice one!': 'Nice one!',
    'nice one 👍': 'Nice one 👍',
    'sweet': 'Nice',
    'gbe body e 💃': 'Dance 💃',
    'na so o 💯': "That's right 💯",
    '💯': '💯',
    'alright': 'Alright',
    'dey o': "I'm here",
    'dey o, you nko?': "I'm here, how about you?",
    'we go see o': "We'll see",
    'wetin be that?': 'What is that?',
    'chill': 'Relax',
    'okay': 'Okay'
};

function translateToEnglish(pidginReply) {
    if (!pidginReply) return pidginReply;
    var trimmed = String(pidginReply).trim();
    if (PIDGIN_TO_ENGLISH[trimmed]) return PIDGIN_TO_ENGLISH[trimmed];

    // Partial match — replace known words
    var out = trimmed;
    var replacements = [
        [/\bdey\b/gi, 'are'],
        [/\bjare\b/gi, ''],
        [/\bnko\b/gi, ''],
        [/\bwetin\b/gi, 'what'],
        [/\bwahala\b/gi, 'problem'],
        [/\babeg\b/gi, 'please'],
        [/\bsabi\b/gi, 'know'],
        [/\behen\b/gi, 'alright'],
        [/\behn\b/gi, 'alright'],
        [/\bna so\b/gi, "that's right"],
        [/\bchai\b/gi, 'oh no'],
        [/\bewo\b/gi, 'wow'],
        [/\bomo\b/gi, 'bro'],
        [/\bsup\b/gi, 'hey'],
        [/\byo\b/gi, 'hey'],
        [/\bsharp\b/gi, 'nice'],
        [/\bna\b/g, 'is']
    ];
    replacements.forEach(function (pair) {
        out = out.replace(pair[0], pair[1]);
    });
    out = out.replace(/\s+/g, ' ').trim();
    return out;
}


// EXTENDED TRANSLATIONS — more pidgin → english mappings
Object.assign(PIDGIN_TO_ENGLISH, {
    'I dey jare, u nko?': "I'm fine, how about you?",
    'I dey jare, you nko?': "I'm fine, how about you?",
    'I dey small o': "I'm okay",
    'I dey small': "I'm okay",
    'we dey jare': "We're good",
    'we dey manage o': "We're managing",
    'nothing much o, you?': 'Not much, and you?',
    'just dey watch': 'Just watching',
    'dey o, you nko?': "I'm here, how about you?",
    'nothing dey happen': 'Nothing happened',
    'na so we dey see am': "That's how we see it",
    'you don hear?': 'Did you hear?',
    'you hear am?': 'Did you hear it?',
    'e don do': "That's enough",
    'no be small thing': 'Not a small thing',
    'e be like say': 'It seems like',
    'wetyn be that': 'What is that',
    'nothing do you': "You're fine",
    'no worry yourself': "Don't worry yourself",
    'make we talk': "Let's talk",
    'make we see': "Let's see",
    'make we go': "Let's go",
    'oya na': "Let's go",
    'oya make we go': "Let's go",
    'abeg no vex': 'Please no offense',
    'i hear you': 'I hear you',
    'i dey hear you': 'I hear you',
    'sharp sharp o': 'Very good',
    'small small': 'Little by little',
    'one day': 'One day',
    'time dey go': 'Time is passing',
    'e go better': "It will get better"
});

module.exports = {
    isPidgin: isPidgin,
    translateToEnglish: translateToEnglish,
    PIDGIN_TO_ENGLISH: PIDGIN_TO_ENGLISH
};
