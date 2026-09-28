// ============================================================
// CONVERSATION LIBRARY 6 — real, verified patterns
// ============================================================
var LIB6 = [

// ============ VARIANT EXPANSIONS (top patterns) ============
// When these match, they override earlier patterns for more variety

// Expanded "hi" replies (30 total variants)
{ p: /^\s*(hi|hey|hello|yo|sup|wassup|howdy|helo|hii+)\s*[!.,]?\s*$/i,
  r: ['sup','yo','hey','whats good','ehen','how far','hello o','yo yo','hey hey','sup sup','chale','guy','hey o','sup bro','hi hi','yo guy','hey you','wetin dey','na so','ehen o','you dey?','present','we dey here','hi chief','greetings o','e good','hello everybody','hey fam','sap'] },

// Expanded "how are you" (20 variants)  
{ p: /^\s*(how\s*(are\s*you|you dey|far|body))\b/i,
  r: ['I dey o','I dey jare','body dey','we dey o','I dey small','small small','I dey here','same here','we dey manage','no be small thing','we dey sha','chilling o','we dey o, you nko?','I dey jare, you nko?','body dey o, you?','I dey o, u nko?','fine fine','we dey here o','dey o, you nko?','e dey go o'] },

// Expanded "thanks" (15 variants)
{ p: /^\s*(thanks|thank you|tanks|tnx|thx|tanx|thank u)\s*[!.,]?\s*$/i,
  r: ['no wahala','anytime','no problem','bless','🙏','ehen nothing','sure','no issue','nothing o','jare no wahala','we dey o','abeg no talk','👍','🙏🙏','all good'] },

// Expanded "lol" (15 variants)
{ p: /^\s*(lol|lmao|lmfao|😂+|🤣+|haha+|hehe+)\s*$/i,
  r: ['😂😂','🤣🤣','lol','hahaha','😂','ehn 😂','😅','funny','same here','you too funny','ewo 😂','chai','😂😂😂','see person','ewo'] },

// ============ QUESTIONS ABOUT TIME (15) ============
{ p: /\b(what\s*time|wetin\s*time|what\'?s?\s*the\s*time)\b/i,
  r: ['check your phone na 😂','I no get clock o','around o','I dey guess','time dey o','make I check','which time you mean?','now now o'] },
{ p: /\b(what\s*day|which\s*day|today\s*na)\b/i,
  r: ['today o','guess now','you no sabi day? 😂','today na today','na work day','monday? tuesday? who cares'] },
{ p: /\b(what\s*date|which\s*date)\b/i,
  r: ['check calendar na','this month o','around this week','I no sabi o','when you ask?'] },

// ============ HOW MUCH / PRICE (15) ============
{ p: /\b(how\s*much|how\s*is\s*it|price|prize|cost)\b/i,
  r: ['na expensive o','small thing o','ask the person','price don mad','God when? 😩','I no sabi price','check am yourself'] },

// ============ RESPONSES TO NEWS (15) ============
{ p: /\b(heard\s*that|i\s*hear\s*say|they\s*say|people\s*dey\s*say)\b/i,
  r: ['serious?','wetin happen?','na true?','who talk am?','abeg no lie','I no hear o','ehen we go see'] },

// ============ REACTIONS TO SHOCKING NEWS (10) ============
{ p: /\b(he\s*don\s*die|she\s*don\s*die|somebody\s*die|person\s*die)\b/i,
  r: ['chai 😢','RIP','God forbid o','serious?','see life o','na wa o','🙏'] },
{ p: /\b(accident|crash|fire|robbery|armed)\b/i,
  r: ['chai 😢','God forbid','hope nobody hurt','where?','serious o','🙏'] },

// ============ OFFERS / INVITATIONS (15) ============
{ p: /\b(do\s*you\s*want|you\s*wan|want\s*small|make\s*i\s*give\s*you)\b/i,
  r: ['wetyn?','talk am','give me na','ehen','abeg'] },
{ p: /\b(come\s*over|come\s*my\s*place|come\s*house)\b/i,
  r: ['when?','where you dey?','I dey come','dey come','ok na'] },
{ p: /\b(i\s*go\s*buy|i\s*wan\s*buy|i\s*go\s*get)\b/i,
  r: ['buy for me sef 😂','which one?','wetyn you dey buy?','link?'] },

// ============ STUDY / ACADEMIC (15) ============
{ p: /\b(i\s*pass|i\s*fail|i\s*passed|i\s*failed)\b/i,
  r: ['congrats o 🎉','chai sorry','no worry','next time go better','well done','try again'] },
{ p: /\b(school\s*fees|tuition|admission|jamb|waec|neco|post\s*utme)\b/i,
  r: ['chai 😩','school dey cost o','we go manage','God go provide','e go better'] },

// ============ FAMILY / RELATIVES (10) ============
{ p: /\b(my\s*(mum|mom|mother)\s*(said|say|call)|my\s*(dad|father)\s*(said|call))\b/i,
  r: ['ehen na','what they say?','family na family','e go better','God dey o'] },

// ============ ROMANTIC / FLIRTY (20) ============
{ p: /\b(i\s*miss\s*you|missing\s*you|i\s*don\s*miss\s*you)\b/i,
  r: ['😏','ehen o','miss me too?','send kiss','🙈','see this one'] },
{ p: /\b(i\s*like\s*you|i\s*dey\s*feel\s*you|i\s*love\s*you)\b/i,
  r: ['😳','ehen o','chill o','wetyn happen?','😏','abeg'] },
{ p: /\b(you\s*are\s*my\s*crush|you\s*my\s*crush|i\s*crush\s*on\s*you)\b/i,
  r: ['😏','abeg jare','😳','chill o','see this one','🙈'] },
{ p: /\b(will\s*you\s*be\s*my|be\s*my\s*(girl|babe|guy|boo))\b/i,
  r: ['😳','wetin?','abeg 😂','chill o','you dey joke?'] },
{ p: /\b(do\s*you\s*have\s*(a\s*)?(girl|boy|babe|boo))\b/i,
  r: ['why you ask? 😏','personal o','na me you dey ask?','you nko?'] },

// ============ SPECIFIC COMPLIMENTS (10) ============
{ p: /\b(your\s*(voice|accent|english)\s*(sweet|nice|good))\b/i,
  r: ['🙏','thanks o','you too much','ehen na','🙈'] },
{ p: /\b(you\s*be\s*legend|you\s*be\s*goat|you\s*be\s*mvp)\b/i,
  r: ['🙏🙏','you sef o','na you o 😎','thank you o'] },

// ============ RANDOM DAILY QUESTIONS (15) ============
{ p: /\b(where\s*you\s*dey\s*work|which\s*work\s*you\s*dey\s*do)\b/i,
  r: ['hustle dey o','which work?','na side hustle','I dey manage'] },
{ p: /\b(you\s*dey\s*school|you\s*still\s*dey\s*school|what\s*you\s*study)\b/i,
  r: ['school dey o','which one?','I dey try','school na wahala'] },
{ p: /\b(you\s*get\s*(car|motor|motorcycle))\b/i,
  r: ['no be small thing o','we dey hustle','God when? 😩','which one?'] },

// ============ GENERAL FILLERS (10) ============
{ p: /^\s*(k)\s*$/i,
  r: ['ok na','👍','ehen','sure'] },
{ p: /^\s*(o)\s*$/i,
  r: ['yes?','wetyn?','ehn','talk'] },
{ p: /^\s*(o+\s*o+|o+o+)\s*$/i,
  r: ['wetyn happen?','talk am','ehn','chill'] },

// ============ FINAL FALLBACKS ============
{ p: /.{3,}/,
  r: ['ehn','hmm','ok o','sure','we dey o','chill','na so','I hear you','ehen','alright','talk am','continue','wetin happen?','see talk','oya na','chai','omo','dey o','sweet','nice'] }

];
module.exports = LIB6;
