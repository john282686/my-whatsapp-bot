// ============================================================
// CONVERSATION LIBRARY 7 — emotional states, group mentions, reactions
// ============================================================
var LIB7 = [

// ============ GROUP-WIDE MESSAGES ============
{ p: /^\s*(@?all|@?everyone|@?everybody|@?guys|@?una|@?people)\s*[!.,]?\s*$/i,
  r: ['we dey o','present 👋','I dey here','here o','me dey','ehen','sup all'] },
{ p: /\b(good\s*(morning|evening|afternoon|night))\s*(everyone|all|guys|una|people)\b/i,
  r: ['same to you o ☀️','good morning o','ehen same','morning o 🌞','good day o','you too o'] },

// ============ HOW EVERYONE IS DOING ============
{ p: /\b(how\s*(una|everybody|everyone|all)\s*(dey|doing|dey do))\b/i,
  r: ['we dey o','everybody dey o','we dey manage','all good o','we dey small small','dey o'] },
{ p: /\b(how\s*is\s*everybody|how\s*is\s*everyone)\b/i,
  r: ['everybody dey o','we dey o','all good','dey o','we dey jare'] },

// ============ EMOTIONAL STATES ============
{ p: /\b(i\s*am\s*(very\s*)?(happy|glad|excited|thrilled))\b/i,
  r: ['🎉🎉','nice one!','see vibes 🔥','happy for you o','💪','e sweet o'] },
{ p: /\b(i\s*am\s*(very\s*)?(sad|depressed|down|crying|heartbroken))\b/i,
  r: ['sorry o 😢','e go better','God dey o','🙏','we dey with you','take heart'] },
{ p: /\b(i\s*am\s*(very\s*)?(angry|vex|mad|frustrated))\b/i,
  r: ['chill o','no vex','calm down','take it easy','breathe small'] },
{ p: /\b(i\s*am\s*(very\s*)?(tired|exhausted|weary|drained))\b/i,
  r: ['same here o 😴','go rest o','take am easy','no wahala','you work too much'] },
{ p: /\b(i\s*am\s*(very\s*)?(hungry|starving))\b/i,
  r: ['food dey o 😋','make I come chop','hungry na wahala','go find something'] },
{ p: /\b(i\s*am\s*(very\s*)?(confused|lost|scattered))\b/i,
  r: ['chill o','explain now','wetyn happen?','calm down small','talk am'] },
{ p: /\b(i\s*am\s*(very\s*)?(bored|idle))\b/i,
  r: ['same here o','let\'s gist','make we talk','nothing dey happen','wetin we do?'] },
{ p: /\b(i\s*am\s*(very\s*)?(sick|ill|not feeling well))\b/i,
  r: ['sorry o 🙏','go hospital o','take care','rest well','get well soon'] },
{ p: /\b(i\s*am\s*(very\s*)?(nervous|scared|afraid))\b/i,
  r: ['chill o','no fear','take a breath','e go be','you go make am 💪'] },
{ p: /\b(i\s*am\s*(very\s*)?(proud|lucky|blessed))\b/i,
  r: ['🙏🙏','congrats o','na God o','e sweet o','proud of you too'] },
{ p: /\b(i\s*am\s*(very\s*)?(busy|working))\b/i,
  r: ['hustle o 💪','dey go o','we go talk later','no wahala'] },
{ p: /\b(i\s*am\s*(very\s*)?(late|running late))\b/i,
  r: ['no worry','ehen ok','dey come','take your time'] },
{ p: /\b(i\s*am\s*(very\s*)?(free|available|idle))\b/i,
  r: ['ehen','make we do something','talk to me','wetin dey happen?'] },

// ============ I FEEL ___ PATTERNS ============
{ p: /\b(i\s*feel\s*(very\s*)?(happy|glad|great|good|fine))\b/i,
  r: ['nice one 👍','ehen o','same here','sweet'] },
{ p: /\b(i\s*feel\s*(very\s*)?(bad|terrible|awful))\b/i,
  r: ['sorry o','e go better','chill small','what happen?'] },
{ p: /\b(i\s*feel\s*(very\s*)?(like\s*)?(sleep|sleepy|drowsy))\b/i,
  r: ['go sleep o 😴','same here','rest well','night o'] },
{ p: /\b(i\s*feel\s*(very\s*)?(lonely|alone))\b/i,
  r: ['talk to me','you no dey alone o','we dey here','chill'] },

// ============ LIFE / PHILOSOPHY ============
{ p: /\b(life\s*(no\s*balance|hard|tough|hard|painful|sweet))\b/i,
  r: ['na so o','e go better','we dey manage','God dey o','life na one'] },
{ p: /\b(e\s*be\s*like|e be say)\b/i,
  r: ['e be like so o','seriously?','wetin happen now?','chai'] },
{ p: /\b(life\s*don\s*teach\s*me|life\s*lesson)\b/i,
  r: ['true talk o','na so o','life na teacher','we dey learn'] },
{ p: /\b(only\s*god|god\s*only|na\s*only\s*god)\b/i,
  r: ['na God o 🙏','amen','true talk o'] },

// ============ GHANA SPECIFIC ============
{ p: /\b(mepa|accra|tema|kumasi|kuffour|kalyppo)\b/i,
  r: ['chale o','which side?','we dey o','ako'] },
{ p: /\b(awa|you dey chop|give me small|sharp)\b/i,
  r: ['chale o','small small','ehen na'] },
{ p: /\b(wo ho te sen|ete sen|apae)\b/i,
  r: ['me ho ye o','chale','you too much o'] },

// ============ SURPRISE / SHOCK ============
{ p: /^\s*(ah|ahh|ahhh|ah ah ah)\s*[!?.,]?\s*$/i,
  r: ['wetyn happen?','chai','serious?','talk am'] },
{ p: /^\s*(wait|wait o|wait wait|hold on)\s*[!?.,]?\s*$/i,
  r: ['wetyn?','talk am','I dey hear','ehen na'] },
{ p: /^\s*(what|what!|wetyn|wetin)\s*[!?]?\s*$/i,
  r: ['wetyn happen?','talk am','ehn','chill'] },

// ============ SURPRISE / DRAMA ============
{ p: /\b(you\s*no\s*hear|you\s*no\s*see|you\s*no\s*dey)\b/i,
  r: ['I dey hear o','wetin happen?','talk am','I dey here'] },
{ p: /\b(i\s*just\s*(see|notice|hear|find))\b/i,
  r: ['wetyn?','talk am','serious?','ehen'] },

// ============ COUNSELING / SUPPORT ============
{ p: /\b(what\s*should\s*i\s*do|wetin\s*i\s*go\s*do|what\s*you\s*suggest)\b/i,
  r: ['wetin happen first?','talk am','explain','wetin you think?','we go see'] },
{ p: /\b(i\s*need\s*advice|advise\s*me)\b/i,
  r: ['talk to me','wetin happen?','I dey hear','explain na'] },
{ p: /\b(i\s*need\s*(your\s*)?help|help\s*me\s*please)\b/i,
  r: ['wetin happen?','talk am','I dey hear','wetyn you need?'] },
{ p: /\b(i\s*don\'?t\s*know\s*what\s*to\s*do)\b/i,
  r: ['chill o','think small','e go be','God dey o'] },

// ============ RESPONSES TO PHOTOS ============
{ p: /\b(if\s*you\s*see\s*my\s*(pic|photo)|my\s*pic|see\s*my\s*pic)\b/i,
  r: ['send am na','which pic?','I dey wait','ehen o'] },
{ p: /\b(na\s*me\s*be\s*this|na\s*me\s*for\s*here|that\'?s\s*me)\b/i,
  r: ['you fine o 😎','ehen na you','see person','nice one'] },

// ============ RESPONSES TO VIDEOS ============
{ p: /\b(na\s*me\s*for\s*video|that\s*na\s*me|see\s*me\s*for)\b/i,
  r: ['you too much o','see person 😂','ehen na you','nice one'] },
{ p: /\b(check\s*this\s*video|watch\s*this|see\s*this)\b/i,
  r: ['send am come','link?','wetyn dey inside?','I dey wait'] },

// ============ CHEEKY / TEASING ============
{ p: /\b(you\s*dey\s*mad|you\s*dey\s*craze|you\s*dey\s*form)\b/i,
  r: ['chill o 😂','wetin happen?','abeg jare','no vex'] },
{ p: /\b(who\s*you\s*be|who\s*you\s*think\s*you\s*be)\b/i,
  r: ['na me o','😂','who you be?','chill na'] },
{ p: /\b(you\s*think\s*you\s*wise|you\s*dey\s*wise)\b/i,
  r: ['😂😂','chill o','see person','you sef'] },

// ============ AGREEMENT WITH HUMOR ============
{ p: /\b(e\s*be\s*like\s*comedy|like\s*play|like\s*joke)\b/i,
  r: ['na so o 😂','we dey watch','see movie','ewo'] },
{ p: /\b(you\s*dey\s*watch\s*movie|which\s*movie)\b/i,
  r: ['which one?','recommend me one','I dey watch one','🎬'] },

// ============ WEDDING / PARTY ============
{ p: /\b(party\s*don\s*start|party\s*dey\s*go|party\s*sweet)\b/i,
  r: ['we dey come o 🎉','which party?','make I come','let\'s go'] },
{ p: /\b(wedding|aso\s*ebi|gele|jollof)\b/i,
  r: ['🎉🎉','which one?','we dey come','aso ebi don land'] },

// ============ RANDOM EVERYDAY ============
{ p: /\b(i\s*dey\s*(watch|see)\s*(tv|television|football|match))\b/i,
  r: ['which one?','who dey play?','we dey watch','enjoy'] },
{ p: /\b(i\s*dey\s*(read|study|learning))\b/i,
  r: ['read well o 📚','sharp sharp','keep going 💪','📖'] },
{ p: /\b(i\s*dey\s*(cook|cooking|prepare|preparing))\b/i,
  r: ['😋 which food?','send am come','make I come','food dey sweet?'] },
{ p: /\b(i\s*dey\s*(listen|hearing)\s*(to\s*music|song))\b/i,
  r: ['which song?','🎶','link?','music na life'] },

// ============ RESPONSES TO SPECIFIC WORDS ============
{ p: /\b(sauce|pepper|spicy)\b/i,
  r: ['pepper dey o 🌶️','make I come taste','chai spicy','😋'] },
{ p: /\b(waist|body|shape)\b/i,
  r: ['👀','chill o','see person','no mind them'] },
{ p: /\b(morning\s*news|news\s*update)\b/i,
  r: ['wetyn happen?','tell me now','which news?','link?'] },

// ============ FINAL FALLBACKS ============
{ p: /.{3,}/,
  r: ['ehn','hmm','ok o','sure','we dey o','chill','na so','I hear you','ehen','alright','talk am','continue','wetin happen?','see talk','oya na','chai','omo','dey o','sweet','nice','ok sha','na wa','talk na'] }

];
module.exports = LIB7;
