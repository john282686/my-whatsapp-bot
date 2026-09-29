// ============================================================
// BILINGUAL EXPANDED — more variety per pattern
// Loads BEFORE bilingual_library.js so these take priority
// ============================================================
var BIX = [

// ============ HELLO ============
{ p: /^\s*(hi|hey|hello|yo|sup|wassup|helo|hii+|hiiii+)\s*[!.,]?\s*$/i,
  en: [
    "Hey 👋", "Hi!", "Hello", "Hey there", "Yo", "Hi hi", "Hey hey",
    "What is good", "Hello hello", "Hey you", "Sup", "Hiya", "Howdy",
    "Morning o", "Afternoon o", "Evening o", "Hi 👋", "Hey!",
    "Hello there", "Hey hey hey", "Yo yo", "Ehen", "Greetings o", "Hey!"
  ],
  pg: [
    "sup 👋", "yo 😎", "hey guy", "wetin dey", "ehen o", "chale", "sup sup",
    "yo yo", "hey hey", "how far?", "wetin dey happen", "na so", "oya na",
    "ehen ehen", "sup guy", "na you", "yes na", "chale o", "we dey o",
    "I see you", "hey chief", "sup my guy", "wetin dey sup", "how body?"
  ] },

// ============ HOW ARE YOU ============
{ p: /^\s*(how\s*(are\s*you|you dey|far|body)|how\s*una\s*dey|how you doing|how are you doing)/i,
  en: [
    "I am good, how about you?", "Doing great, thanks! How are you?",
    "I am fine, and you?", "Pretty good! You?", "All good on my end, you?",
    "Not bad at all, how are you?", "I am well, thanks for asking",
    "Good! How about you?", "Fine fine, you?", "Solid! You?",
    "Never better 😊 you?", "Doing okay, you?", "I am here o, you?",
    "Cool cool, you?", "Just chilling, what about you?", "Same as always, you?",
    "Body dey, you?" // intentional crossover
  ],
  pg: [
    "I dey o, u nko? 😎", "I dey jare, you nko?", "Body dey, you?",
    "I dey small o", "we dey o, you nko?", "I dey here o, you?",
    "I dey jare o", "I dey manage, you?", "we dey jare", "I dey o jare",
    "body dey inside cloth, you?", "I dey o, you?", "we dey here o, you?",
    "I dey small small, you?", "I dey, you nko?", "body dey o"
  ] },

// ============ WHATS UP ============
{ p: /^\s*(what.?s?\s*(is\s*)?up|wetin\s*dey|wetin dey happen|whats good|waddup)/i,
  en: [
    "Not much, you?", "Just chilling, what about you?", "Same old, you?",
    "Nothing much, what is up with you?", "Just relaxing here", "Nothing o, you?",
    "Same as usual, you?", "Chilling here, you?", "Not a lot, you?",
    "Just here jare", "Nothing much o, you?", "Same story, you?"
  ],
  pg: [
    "Nothing much jare", "just dey chill", "we dey o, you?", "notin much, you nko?",
    "nothing dey happen o", "same old jare", "just dey o, you?", "nothing o jare",
    "we just dey jare", "nothing dey sup o", "same thing o, you?"
  ] },

// ============ THANKS ============
{ p: /^\s*(thanks|thank you|tanks|tnx|thx|tanx|thank u)\s*(o|na|jare)?\s*[!.,]?\s*$/i,
  en: [
    "You are welcome", "Anytime", "No problem", "Happy to help", "No worries",
    "Sure thing", "Anytime! 🙏", "You are welcome o", "Anytime friend",
    "No problem at all", "Anytime 👍", "My pleasure", "You are welcome 🙏",
    "No wahala" // crossover
  ],
  pg: [
    "No wahala 🙏", "anytime 😊", "no problem o", "bless 🙏", "ehen nothing",
    "no wahala o", "ehen jare", "nothing jare", "no vex o", "ehen no issue",
    "we dey o", "sure sure", "you welcome o"
  ] },

// ============ SORRY ============
{ p: /^\s*(sorry|my bad|my fault|i apologize)\b/i,
  en: [
    "It is okay", "No worries", "No problem", "It is fine", "Do not worry about it",
    "All good", "It is fine o", "No big deal", "You are fine", "Not your fault",
    "It happens", "Do not stress it"
  ],
  pg: [
    "no wahala", "no vex o", "nothing dey happen", "ehen no issue", "no worry jare",
    "e no bad o", "no problem jare", "we dey o", "no vex na", "chill jare"
  ] },

// ============ LAUGHTER ============
{ p: /^\s*(lol|lmao|lmfao|haha|hehe|hehehe|loool|😂+|🤣+)\s*$/i,
  en: [
    "😂😂", "Haha!", "🤣🤣", "Lol", "Hahaha", "😂😂😂", "Too funny!",
    "You funny o", "Hahahaha 😂", "So funny", "😂", "Right?! 😂", "Dead 😂"
  ],
  pg: [
    "😂😂", "🤣🤣", "ewo 😂", "chai 😂", "lol jare", "hahaha same",
    "ewo o", "see person 😂", "you too funny o", "chai o 😂", "😂😂 ewo"
  ] },

// ============ OK ============
{ p: /^\s*(yes|yeah|yea|yh|yep|yup|ok|okay|k|kk|alright|ight|aight)\s*[!.,]?\s*$/i,
  en: [
    "👍", "Sure", "Yeah", "Okay", "Alright", "Cool", "Got it", "Sure thing",
    "Sounds good", "Nice", "Perfect", "Alright then", "Good", "👍👍"
  ],
  pg: [
    "💯", "yes na", "ehen", "ehn ehn", "ok na", "sharp sharp", "sure na",
    "yes o", "na so", "ok o", "ehen na", "sharp o", "we dey o"
  ] },

// ============ BYE ============
{ p: /^\s*(bye|goodbye|later|see\s*you|cya|peace|dey go|i dey go|going out)\b/i,
  en: [
    "See you", "Bye!", "Later!", "Talk later", "Take care", "See you soon",
    "Later o", "Catch you later", "Alright, bye", "Stay safe", "Later friend"
  ],
  pg: [
    "later o", "see you o", "peace ✌️", "later bro", "take care o",
    "we go see", "later jare", "safe journey", "dey go well o", "later guy"
  ] },

// ============ CONGRATS ============
{ p: /^\s*(congrats|congratulations|happy for you)\b/i,
  en: [
    "Congratulations! 🎉", "Congrats!", "So happy for you!", "That is amazing! 🎉",
    "Well done!", "Nice one! 🎉", "Proud of you!", "Big up!", "More wins! 💪",
    "You deserve it!", "Big congratulations 🎉", "Well deserved"
  ],
  pg: [
    "🎉🎉 congrats o", "ehen na, congrats!", "see blessing o", "yes o! 🎉",
    "congrats jare", "fire! 🔥", "big up o", "more wins o 💪",
    "God dey o", "e sweet o"
  ] },

// ============ GOOD NIGHT ============
{ p: /^\s*(good\s*(night|nite)|gn|goodnight)\b/i,
  en: [
    "Good night 🌙", "Sleep well", "Night!", "Goodnight", "Rest well 😴",
    "Sweet dreams", "Night night", "Sleep tight", "Good night o", "Rest up"
  ],
  pg: [
    "Night o 🌙", "Sleep well o", "Later o", "Good night chief", "Night jare",
    "sleep sweet o", "later o jare", "good night o", "rest well o"
  ] },

// ============ GOOD MORNING ============
{ p: /^\s*(good\s*(morning|mrng|morn))\b/i,
  en: [
    "Good morning ☀️", "Morning!", "Good morning!", "Hope you slept well",
    "Morning 🌞", "Good morning to you", "Morning hey", "Top of the morning!",
    "Rise and shine ☀️", "Morning o", "Good morning friend", "Gm!",
    "Hope you had a good night"
  ],
  pg: [
    "Morning o ☀️", "Morn don break 🌞", "Morning chief", "Morning o, how you sleep?",
    "Morning jare", "Morn o", "ehen morning o", "morning o, hope you sleep well"
  ] }

];
module.exports = BIX;
