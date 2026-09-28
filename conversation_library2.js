// ============================================================
// CONVERSATION LIBRARY 2 — timestamps, slang, more pidgin
// ============================================================
var LIB2 = [

// ============ TIME-AWARE GREETINGS (20) ============
{ p: /^\s*(morning|morn)\s*[!.,]?\s*$/i,
  r: ['Morning 🌞','morning o ☀️','good morning','morn don break','ehen morning o'] },
{ p: /^\s*(afternoon|aftn)\s*[!.,]?\s*$/i,
  r: ['Afternoon o','Good afternoon ☀️','How the day dey go?','afternoon o'] },
{ p: /^\s*(evening|eve)\s*[!.,]?\s*$/i,
  r: ['Evening o 🌆','Good evening 🌙','how the day go?','evening o'] },
{ p: /^\s*(night|nite)\s*[!.,]?\s*$/i,
  r: ['Night o 🌙','Good night','sleep well 😴','later o'] },

// ============ PIDGIN-HEAVY PATTERNS (30) ============
{ p: /\b(na so|na him|na im|na wetin|na who|na when|na where|na why|na how)\b/i,
  r: ['na so o','ehen na','na im','wetin happen?','you tell me na','na God o'] },
{ p: /\b(e be like|e be say|e con be|e don be|e don happen)\b/i,
  r: ['e be like so o','seriously?','wetin happen now?','na wa o'] },
{ p: /\b(abeg|jare|sha|sef|nko|nkwo)\b/i,
  r: ['no wahala','abeg na','chill','ehen','na so'] },
{ p: /\b(chai|chei|oyaa|oyah|ewo|ewoh)\b/i,
  r: ['chai!','na wa o','see this thing','😩','ehn ehn'] },
{ p: /\b(mumu|mumuness|werey|were|kolo|mad o|crase)\b/i,
  r: ['chill na 😅','wetin happen?','no insult o','abeg','calm down'] },
{ p: /\b(weytin|wetin|wetyin)\s+(be\s+that|na)\b/i,
  r: ['wetin?','you tell me','wetin happen?','talk am'] },
{ p: /\b(oya\s*(come|go|na)|oya\s+now)\b/i,
  r: ['oya na','sharp sharp','let\'s go 💪','dey come'] },
{ p: /\b(waka|waka pass|waka well)\b/i,
  r: ['waka o','safe journey','see you','later'] },
{ p: /\b(sabi|saby|you sabi|u sabi)\b/i,
  r: ['I sabi na','you sabi pass me','na so o','ehen'] },
{ p: /\b(gbege|gbege dey|wahala dey|problem dey)\b/i,
  r: ['gbege!','wahala o','chai','wetin happen?'] },

// ============ TYPOS / MISSPELLINGS (20) ============
{ p: /^\s*(helo|hlo|hallo|hullo|holla|heloo+)\s*[!.,]?\s*$/i,
  r: ['sup 👋','hey','yo','wetin dey'] },
{ p: /^\s*(gud\s*(morning|morn|evening|night|aftn))\b/i,
  r: ['morning o 🌞','evening o','night 🌙','good morning','ehen morning'] },
{ p: /^\s*(tanx|tanks|thnk|thnks|thankz|thank\s*u)\b/i,
  r: ['no wahala 🙏','anytime','👍','ehen nothing'] },
{ p: /^\s*(pls|plz|plss|pleas|plese)\b/i,
  r: ['ehen','ok na','talk na','wetyn you need?'] },
{ p: /^\s*(hw\s*(r\s*u|are\s*you)|hw\s*far|how\s*u\s*dey)\b/i,
  r: ['I dey o, u nko?','body dey, you?','I dey jare'] },

// ============ WHATSAPP-SPECIFIC (20) ============
{ p: /\b(forward|forwarded|fwd|chain message|broadcast)\b/i,
  r: ['see forward message 😂','who send you this one?','abeg jare'] },
{ p: /\b(sticker|stikers|stika)\b/i,
  r: ['😂 sticker dey funny','which sticker?','abeg','nice one'] },
{ p: /\b(voice\s*note|voice\s*msg|voicenote|vn)\b/i,
  r: ['I dey hear you','send am na','voice note sweet o','talk am'] },
{ p: /\b(video|vid|clip)\b/i,
  r: ['which video?','send am come','wetyn happen for inside?'] },
{ p: /\b(pic|photo|image|picture|selfie)\b/i,
  r: ['which pic?','send am','you fine o 😎','no pic o'] },
{ p: /\b(group|gc|group chat)\b/i,
  r: ['which group?','add me na','we dey here o','who dey that group?'] },
{ p: /\b(admin|admins|oga admin)\b/i,
  r: ['oga admin dey hear','wetin happen?','talk to admin','ehen'] },
{ p: /\b(ban|kicked|removed|delete|delete me)\b/i,
  r: ['no vex','wetin happen?','abeg na','chill'] },

// ============ HOW'S IT GOING (15) ============
{ p: /\b(how\s*(you|u|things|everything|life|work|business)\s*(dey\s*go|going|dey))\b/i,
  r: ['e dey go o','small small','we dey manage','not bad at all','e dey happen'] },
{ p: /\b(e\s*(dey\s*go|dey\s*happen|don\s*reach))\b/i,
  r: ['e dey go o','small small','we go see','no be small thing'] },
{ p: /\b(any\s*update|wetyn\s*dey\s*happen|wetin\s*dey\s*sup|whats\s*the\s*gist)\b/i,
  r: ['no update o','we dey o','wetin you hear?','spill am'] },

// ============ MONEY / MOMO / CASH (20) ============
{ p: /\b(momo|momo\s*number|send\s*money|send\s*me|nawa|palmpay|opay|moniepoint|airtime|data\s*me)\b/i,
  r: ['money dey finish me o','small small o','wetyn you need am for?','abeg'] },
{ p: /\b(owe|owing|debt|borrow|loan|credit)\b/i,
  r: ['chai 💸','money na water','hustle o','we go manage'] },
{ p: /\b(transaction|transfer|send\s*alert|credit\s*alert|debit\s*alert)\b/i,
  r: ['alert dey sweet o 😎','which amount?','money don land'] },

// ============ GIST / GOSSIP (20) ============
{ p: /\b(gist|gist\s*me|spill\s*the\s*tea|spill\s*gist|tell\s*me|what\s*happened)\b/i,
  r: ['talk am','I dey hear','continue','go on','wetin happen?','ehen ehen'] },
{ p: /\b(heard\s*that|i\s*hear\s*say|they\s*say|rumour|rumor)\b/i,
  r: ['serious?','wetin happen?','na true?','who talk am?','abeg no lie'] },
{ p: /\b(omg|ohno|oh\s*no|wtf|tf|damn|shit|ewo|ewoh)\b/i,
  r: ['wetin happen?','chai','na wa o','serious?','ewo'] },

// ============ MOOD RESPONSES (25) ============
{ p: /\b(i'm\s*(fine|ok|good|great|alright|cool))\b/i,
  r: ['same here o','nice one 👍','ehen','sweet'] },
{ p: /\b(i'm\s*(tired|exhausted|stressed|done|fed\s*up|weak))\b/i,
  r: ['same here o 😴','go rest o','take it easy','no wahala','we go manage'] },
{ p: /\b(i\s*dey\s*(happy|excited|glad))\b/i,
  r: ['🎉🎉','nice one!','see vibes 🔥','💪'] },
{ p: /\b(i\s*dey\s*(sad|down|depressed|crying))\b/i,
  r: ['sorry o','e go better','God dey o','🙏'] },
{ p: /\b(i\s*dey\s*(bored|idle|free))\b/i,
  r: ['same here o','let\'s gist','make we talk','nothing dey happen'] },
{ p: /\b(i\s*no\s*(know|understand|hear|see|get))\b/i,
  r: ['ehen o','you tell me','wetin happen?','I dey hear'] },
{ p: /\b(i\s*(think|feel)\s*(say|that))\b/i,
  r: ['I feel you','na so o','you think so?','ehen'] },

// ============ LAUGHTER VARIANTS (15) ============
{ p: /\b(lmaoo+|lmfaoo+|rofl|dead|dying|💀|☠️|🤣🤣🤣)\b/i,
  r: ['😂😂','ewo 😂','chai 😂','you funny o','😂😂😂','dead 😂'] },
{ p: /\b(that\s*one\s*(sweet|funny|hard|strong|sweat))\b/i,
  r: ['na so o','ehn na','😂','💯'] },

// ============ ROMANCE / FLIRTING (25) ============
{ p: /\b(you\s*beautiful|you\s*fine|you\s*cute|you\s*sweet)\b/i,
  r: ['😏','abeg 😂','ehen o','you too much o','🙈'] },
{ p: /\b(you\s*handsome|you\s*fine\s*boy|you\s*cute\s*boy)\b/i,
  r: ['🙏','you too much o','😎','abeg jare'] },
{ p: /\b(i\s*like\s*you|i\s*love\s*you|i\s*dey\s*feel\s*you)\b/i,
  r: ['ehen 😏','😳','chill o','😅','wetyn happen?'] },
{ p: /\b(can\s*i\s*(have|get)\s*your\s*number|your\s*number)\b/i,
  r: ['DM na 😎','wetyn you wan use am do?','abeg','chill'] },
{ p: /\b(are\s*you\s*married|you\s*get\s*wife|you\s*get\s*husband)\b/i,
  r: ['why you ask? 😏','private o','😂','you nko?'] },
{ p: /\b(na\s*woman|you\s*be\s*woman|you\s*be\s*girl|you\s*be\s*lady)\b/i,
  r: ['no be o 😂','you think so?','abeg','wetyn make u think?'] },

// ============ GENDER / AGE (15) ============
{ p: /\b(are\s*you\s*(a\s*)?(boy|girl|man|woman|male|female))\b/i,
  r: ['guess na 😎','no be your business 😂','why you ask?','you nko?'] },
{ p: /\b(how\s*(old|many\s*years))\b/i,
  r: ['guess now','age no matter na','why you ask?','you nko?'] },

// ============ INVITATIONS (10) ============
{ p: /\b(come\s*(here|outside|house|my place|my side))\b/i,
  r: ['dey come','where?','wetin happen?','oya na'] },
{ p: /\b(link\s*up|linkup|hangout|hang\s*out|let's\s*meet)\b/i,
  r: ['when?','where?','let\'s do am','we go see','I dey down'] },
{ p: /\b(join\s*(this|my|the)\s*group|add\s*me)\b/i,
  r: ['which group?','send link','wetyn dey happen inside?','dm me'] },

// ============ SLANG ABBREVIATIONS (20) ============
{ p: /^\s*(omg|wtf|tbh|ngl|fr|yk|idk|imo|tbf|smh|lol|rofl)\s*[!.,]?\s*$/i,
  r: ['😂','serious?','na wa o','ehen','I dey hear'] },
{ p: /\b(omg|wtf|tbh|ngl|fr\s*fr|yk|idk)\b/i,
  r: ['chai','seriously?','I no know o','wetin happen?'] },

// ============ COMMENTS ON OTHERS (10) ============
{ p: /\b(dat\s*(guy|girl|person|bobo|babe))\b/i,
  r: ['who be that?','which person?','wetin happen?','you know am?'] },
{ p: /\b(you\s*see\s*(am|him|her)|as\s*i\s*see\s*(am|him|her))\b/i,
  r: ['wetin happen?','talk am','continue','I dey hear'] },

// ============ RESPONSES TO PHOTOS/STATUS (10) ============
{ p: /\b(drop\s*(your|ur)\s*pic|send\s*pic|show\s*pic|post\s*pic)\b/i,
  r: ['which pic?','abeg','no pic o','you first'] },
{ p: /\b(look\s*good|fresh|fine|clean)\b/i,
  r: ['🙏','thanks','you too much o','na so o'] },

// ============ COMPLAINTS (20) ============
{ p: /\b(this\s*(thing|place|world|life)\s*(hard|tough|bad|painful))\b/i,
  r: ['e go better o','no worry','God dey o','we dey manage','💪'] },
{ p: /\b(e\s*dey\s*(hard|pain|touch|do\s*me))\b/i,
  r: ['e go better o','no worry','hold on','God dey o'] },
{ p: /\b(i\s*don\s*tire|i\s*don\s*give\s*up|i\s*don\s*carry\s*last)\b/i,
  r: ['no give up o','hold on','e go better','God dey o'] },

// ============ MUSIC / DANCE / VIBE (15) ============
{ p: /\b(dance|dancing|vibe|turn\s*up|groove|party)\b/i,
  r: ['na my vibe 🔥','party dey sweet o','let\'s go!','🎉🎶'] },
{ p: /\b(song\s*dey\s*sweet|track\s*dey\s*sweet|beat\s*dey\s*sweet)\b/i,
  r: ['🔥🎶','which song?','link?','play am'] },

// ============ ASKING FOR HELP (15) ============
{ p: /\b(help\s*me|help\s*me\s*(na|o|please)|abeg\s*help)\b/i,
  r: ['wetin happen?','talk to me','wetyn you need?','I dey hear'] },
{ p: /\b(i\s*need\s*(help|advice|someone|support))\b/i,
  r: ['talk to me','wetin happen?','I dey hear','explain now'] },
{ p: /\b(can\s*you\s*help|you\s*fit\s*help)\b/i,
  r: ['talk na','wetin happen?','explain','I dey hear'] },

// ============ DAILY LIFE (20) ============
{ p: /\b(i\s*just\s*(wake|woke|get\s*up|arise))\b/i,
  r: ['morning o','how you sleep?','morn don break','ehen'] },
{ p: /\b(i\s*dey\s*(go|leave|comot|waka))\b/i,
  r: ['safe journey','later o','see you','take care'] },
{ p: /\b(i\s*don\s*(reach|arrive|land))\b/i,
  r: ['nice one','welcome','ehen','safe'] },
{ p: /\b(i\s*dey\s*(come|coming|on\s*my\s*way))\b/i,
  r: ['ok na','sharp sharp','dey come','alright'] },
{ p: /\b(i\s*dey\s*(eat|chop|eating|eating))\b/i,
  r: ['😋 make I come','food dey sweet?','enjoy','chop well'] },

// ============ ENCOURAGEMENT / SUPPORT (15) ============
{ p: /\b(don\'t\s*give\s*up|never\s*give\s*up|keep\s*going|stay\s*strong|hold\s*on)\b/i,
  r: ['💪','yes o','keep going','we go make am','God dey o'] },
{ p: /\b(you\s*can\s*do\s*it|you\s*go\s*make\s*am)\b/i,
  r: ['yes o! 💪','go na','we dey behind you','🙏'] },

// ============ FINAL FALLBACK FOR LONG MESSAGES (15) ============
{ p: /.{50,}/,
  r: ['ehn ehn','you talk well o','I hear you','hmm na wa','ok o','we go see','serious o','interesting 🤔','chai'] },

// ============ VERY SHORT UNKNOWN (10) ============
{ p: /^\s*(\w{1,2})\s*$/,
  r: ['ehn?','wetin?','talk am','you say?'] }

];
module.exports = LIB2;
