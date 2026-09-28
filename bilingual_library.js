var BI = [

// ============ COMBINED GREETING + HOW ARE YOU (checked FIRST) ============
{ p: /^\s*(hi|hey|hello|yo|sup)\s*[,!.]?\s*(how\s*(are|r)\s*(you|u|things)|how you dey|how far|what'?s? up|wetin dey)/i,
  en: ["I'm good, how about you?", "Doing great! How are you?", "I'm fine, thanks! You?", "Pretty good! How about you?", "All good here, you?", "I'm well, thanks for asking"],
  pg: ["I dey o, u nko? 😎", "I dey jare, you nko?", "body dey, you?", "I dey small o, you?", "we dey o, you nko?"] },

// ============ HI THERE (fixed case) ============
{ p: /^\s*(hi|hey|hello)\s+(there|guy|guys|bro|man|fam|chief|sir|madam)\b/i,
  en: ['Hey 👋','Hi!','Hello','Hey there','Hi there','What\'s good'],
  pg: ['sup 👋','yo 😎','hey guy','wetin dey','how far?','chale'] },

// ============ PLAIN GREETINGS ============
{ p: /^\s*(hi|hey|hello|yo|sup|wassup|helo|hii+|hiiii+)\s*[!.,]?\s*$/i,
  en: ['Hey 👋','Hi!','Hello','Hey there','Hey!','Hi hi','Hey hey','What\'s good','Yo','Hi 👋'],
  pg: ['sup 👋','yo 😎','hey guy','wetin dey','ehen o','chale','sup sup','yo yo'] },

{ p: /^\s*(good\s*(morning|mrng|morn))\b/i,
  en: ['Good morning ☀️','Morning!','Good morning!','Hope you slept well','Morning 🌞','Good morning to you','Hey! Good morning','Morning o! ☀️','Rise and shine ☀️','Good morning, hope you slept well','Top of the morning!','Morning 😊','Gm!','Morning hey','Bright and early!'],
  pg: ['Morning o ☀️','Morn don break 🌞','Morning chief','Morning o, how you sleep?','Morn o','Ehen morning o','Morn don break o 🌞','Morning jare','Morning o, hope you sleep well'] },

{ p: /^\s*(good\s*(afternoon|aftn))\b/i,
  en: ['Good afternoon ☀️','Afternoon!','Hope your day is going well','Good afternoon to you'],
  pg: ['Afternoon o','Good afternoon o ☀️','Afternoon chief'] },

{ p: /^\s*(good\s*(evening|eve))\b/i,
  en: ['Good evening 🌙','Evening!','Hope you had a good day','Good evening to you'],
  pg: ['Evening o 🌆','Good evening o','Evening chief'] },

{ p: /^\s*(good\s*(night|nite)|gn|goodnight)\b/i,
  en: ['Good night 🌙','Sleep well','Night!','Goodnight','Rest well 😴','Sweet dreams'],
  pg: ['Night o 🌙','Sleep well o','Later o','Good night chief'] },

// ============ morning o pattern ============
{ p: /^\s*(morning|evening|afternoon|night)\s+(o|na|jare|chief|sir)\b/i,
  en: ['Good morning ☀️','Morning!','Good evening 🌙','Hope you had a good day'],
  pg: ['Morning o ☀️','Morn don break 🌞','Evening o 🌆','Night o 🌙','Afternoon o'] },

// ============ HOW ARE YOU ============
{ p: /^\s*(how\s*(are\s*you|you dey|far|body)|how\s*una\s*dey|how you doing)/i,
  en: ["I'm good, how about you?", "Doing great, thanks! How are you?", "I'm fine, and you?", "Pretty good! You?", "All good on my end, you?", "Not bad at all, how are you?"],
  pg: ['I dey o, u nko? 😎','I dey jare, you nko?','Body dey, you?','I dey small o','we dey o, you nko?'] },

{ p: /^\s*(how far|howfa|how you far|how far na|how far class|how far guys|how far team|how far una|how far you)/i,
  en: ["What's up?", "How's it going?", "All good here, you?", "What's happening?", "Hey, how are you?"],
  pg: ['I dey o, you nko? 😎','we dey o','body dey, you?','I dey jare'] },

// ============ WHATS UP ============
{ p: /^\s*(what'?s?\s*(is\s*)?up|wetin\s*dey|wetin dey happen|whats good|waddup|wtw)/i,
  en: ['Not much, you?','Just chilling, what about you?','Same old, you?','Nothing much, what\'s up with you?','Just relaxing here'],
  pg: ['Nothing much jare','just dey chill','we dey o, you?','notin much, you nko?'] },

// ============ YES / OK ============
{ p: /^\s*(yes|yeah|yea|yh|yep|yup|ok|okay|k|kk|alright|ight|aight)\s*[!.,]?\s*$/i,
  en: ['👍','Sure','Yeah','Okay','Alright','Cool','Got it','Sure thing'],
  pg: ['💯','yes na','ehen','ehn ehn','ok na','sharp sharp','sure na'] },

{ p: /^\s*(no|nope|nah|naw)\s*[!.,]?\s*$/i,
  en: ['No','Nope','Not really','No thanks','Nah'],
  pg: ['no be so','no o','no na','never','hmm no'] },

// ============ LAUGHTER ============
{ p: /^\s*(lol|lmao|lmfao|😂+|🤣+|haha+|hehe+|hehehe+|loool)\s*$/i,
  en: ['😂😂','Haha!','🤣🤣','Lol','Hahaha','😂😂😂','Too funny!'],
  pg: ['😂😂','🤣🤣','ewo 😂','chai 😂','lol jare','hahaha same'] },

// ============ THANKS ============
{ p: /^\s*(thanks|thank you|tanks|tnx|thx|tanx|thank u)\s*(o|na|jare)?\s*[!.,]?\s*$/i,
  en: ['You\'re welcome','Anytime','No problem','Happy to help','No worries','Sure thing','Anytime! 🙏'],
  pg: ['No wahala 🙏','anytime 😊','no problem o','bless 🙏','ehen nothing'] },

// ============ SORRY ============
{ p: /^\s*(sorry|my bad|my fault|i apologize)\b/i,
  en: ['It\'s okay','No worries','No problem','It\'s fine','Don\'t worry about it','All good'],
  pg: ['no wahala','no vex o','nothing dey happen','ehen no issue'] },

// ============ CONGRATS ============
{ p: /^\s*(congrats|congratulations|happy for you)\b/i,
  en: ['Congratulations! 🎉','Congrats!','So happy for you!','That\'s amazing! 🎉','Well done!','Nice one! 🎉'],
  pg: ['🎉🎉 congrats o','ehen na, congrats!','see blessing o','yes o! 🎉'] },

{ p: /^\s*(happy\s*birthday|hbd|hpy bday)\b/i,
  en: ['Happy birthday! 🎂','HBD! 🎉','Happy birthday to you! 🥳','Many more years!'],
  pg: ['HBD o! 🎂','happy birthday o 🎉','many more years o 🎂'] },

// ============ WHO'S ONLINE ============
{ p: /^\s*(who\s*(dey|is)\s*(online|around|here)|anyone\s*(around|online|here)|anybody\s*here|who dey)/i,
  en: ["I'm here 👋",'Right here','Me!','Present','Here o',"I'm around"],
  pg: ['I dey here 👀','me dey','present o','we dey','here jare'] },

// ============ WHAT ARE YOU DOING ============
{ p: /^\s*(what\s*(are|r)\s*(you|u)\s*doing|what\s*you\s*doing|wetin\s*you\s*dey\s*do)/i,
  en: ['Not much, just chilling','Nothing much, you?','Just relaxing here, you?','Nothing special, what about you?'],
  pg: ['Just dey o','nothing much jare','chilling o, you?','just dey watch, you nko?'] },

// ============ WHERE ARE YOU ============
{ p: /^\s*(where\s*(are|r)\s*(you|u)|where\s*you\s*dey)\s*\??\s*$/i,
  en: ['At home, you?',"I'm around, what's up?",'Home, you?','Just here, you?'],
  pg: ['I dey house','around o, you?','inside o, you nko?','my side jare'] },

// ============ BYE ============
{ p: /^\s*(bye|goodbye|later|see\s*you|cya|peace|dey go|i dey go|going out)\b/i,
  en: ['See you','Bye!','Later!','Talk later','Take care','See you soon'],
  pg: ['later o','see you o','peace ✌️','later bro','take care o'] },

// ============ ARE YOU A BOT ============
{ p: /\b(are\s*you\s*(a\s*)?(bot|ai|human|real)|you be (bot|ai|human)|is this a bot|who is this)\b/i,
  en: ["No, I'm a real person 😂",'Why do you think that? lol','Real guy here','Nope, just me',"I'm human o"],
  pg: ['Na real person o 😂','I be human jare','wetin make u think say I be bot 😂','lol no be, na me dey here'] },

// ============ GIRL OR BOY ============
{ p: /\b(are\s*you\s*(a\s*)?(girl|boy|man|woman|male|female))\b/i,
  en: ["I'm a guy 😎",'Why do you want to know? 😏','Guy here','Personal question 😂'],
  pg: ['na guy o 😎','wetin you wan use am do? 😂','guy jare','no be your business o 😏'] },

// ============ COMPLIMENTS ============
{ p: /\b(you\s*(are|r)\s*(funny|nice|good|smart|sweet|kind))\b/i,
  en: ['Thanks! 😊','Aww, thank you','Appreciate it','You\'re too kind'],
  pg: ['🙏🙏','you sef o','na you jare','aww thanks o'] },

// ============ NAME ============
{ p: /^\s*(what\'?s?\s*your\s*name|your name|who be you|wetin be your name)/i,
  en: ['Call me Chidi',"I'm Chidi, and you?",'Chidi here, you?','You can call me Chidi'],
  pg: ['Chidi na, you nko?','guess now 😎','call me Chidi jare'] },

// ============ AGE ============
{ p: /^\s*(how old are you|your age)/i,
  en: ['Old enough 😄','Why do you ask?','Guess 😏','Young at heart'],
  pg: ['age no matter na','why you wan know? 😏','old enough jare'] },

// ============ WHERE FROM ============
{ p: /^\s*(where\s*you\s*from|where\s*are\s*you\s*from|which\s*country)/i,
  en: ['From Nigeria 🇳🇬, you?','Nigeria, and you?','Lagos, you?'],
  pg: ['Naija 🇳🇬 o, you nko?','Naija jare, you?'] },

// ============ SINGLE ============
{ p: /\b(are\s*you\s*single|you\s*get\s*babe|you\s*married|you\s*get\s*girl)\b/i,
  en: ['Why do you ask? 😏',"I'd rather not say 😄",'Personal question o'],
  pg: ['wetin you wan use am do? 😏','why you ask na','personal question o'] },

// ============ INSULTS ============
{ p: /\b(you foolish|you mad|idiot|stupid|fool)\b/i,
  en: ['Hey, chill out 😅','No need for that','Let\'s keep it friendly','Alright, calm down'],
  pg: ['chill na 😅','wetin happen?','no vex jare','calm down o'] },

// ============ SPORTS ============
{ p: /\b(football|match|chelsea|arsenal|man u|liverpool|madrid|barca|messi|ronaldo|efootball|dls)/i,
  en: ['That match was something 🔥',"Who's your team?",'I watched it too','⚽ Football is life','What a game!'],
  pg: ['that match sweet o','which team you dey support?','football dey cause wahala 😂','⚽🔥'] },

// ============ MUSIC ============
{ p: /\b(music|song|listen|playlist|wizkid|burna|davido|rema|tems|asake|afrobeats)/i,
  en: ['Music is life 🎶','What are you listening to?','That track is fire 🔥','Afrobeats all day!'],
  pg: ['music na life o 🎶','which song?','that track sweet o','afrobeats jare'] },

// ============ MOVIES ============
{ p: /\b(movie|film|netflix|series|show|watch|episode|season)/i,
  en: ['What are you watching?','Any recommendations?',"I'm watching something too 🎬",'Series are addictive!'],
  pg: ['which movie?','recommend me one','I dey watch one sef','series na life o 🎬'] },

// ============ FOOD ============
{ p: /\b(food|hungry|chop|jollof|rice|eat|eating|beans|swallow|egusi|amala|fufu|eba|garri|indomie|shawarma)/i,
  en: ['I love food 😋','Jollof is the best',"I'm hungry too o",'What are you eating?','Food is life 😋'],
  pg: ['make I come chop? 😋','hungry dey worry me o','jollof na the best 😋','food don ready?'] },

// ============ MONEY ============
{ p: /\b(money|naira|dollar|cash|paid|broke|investment|hustle|salary)/i,
  en: ['Money is hard o','Hustle continues','I need money too 😩','God will provide 🙏'],
  pg: ['money na water 💧','hustle dey go o','chai 💸','God go provide 🙏'] },

// ============ TIRED ============
{ p: /\b(tired|sleepy|stress|stressed|exhausted|fatigue)/i,
  en: ['Same here 😴','You should rest','Take it easy o','Get some sleep'],
  pg: ['same here o 😴','go rest o','take am easy','sleep dey sweet o'] },

// ============ ANY QUESTION (generic) ============
{ p: /\?\s*$/,
  en: ['Hmm, good question','Not sure o, what do you think?',"I'm not sure, you?",'What do you think?','Good question 🤔'],
  pg: ['hmm I no know o 🤔','you tell me now','wetin you think?','good question o'] },

// ============ FINAL FALLBACK ============
{ p: /.{3,}/,
  en: ['Hmm','Okay','Alright','I see','Noted','Makes sense','Interesting','Cool','Alright then','Got it'],
  pg: ['ehn','hmm','ok o','sure','we dey o','chill','na so','I hear you'] }

];
module.exports = BI;
