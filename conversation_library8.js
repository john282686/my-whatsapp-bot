// ============================================================
// CONVERSATION LIBRARY 8 — jokes, forwards, gap-fillers
// ============================================================
var LIB8 = [

// ============ JOKE REQUESTS ============
{ p: /\b(tell\s*me\s*a\s*joke|make\s*me\s*laugh|say\s*something\s*funny|drop\s*joke)\b/i,
  r: ['my guy 😂','wetyn you want laugh?','na me be joke o','comedian dey here 😎','you sef na joke'] },
{ p: /\b(that\'?s\s*funny|you\s*dey\s*funny|you\s*funny\s*o)\b/i,
  r: ['😂😂','na you jare','you sef','ewo 😂'] },

// ============ WHERE / WHEN / WHY / WHO SHORT ============
{ p: /^\s*(where\s*\??|which\s*place\s*\??)\s*$/i, r: ['which place?','talk am','where you dey?','my side o'] },
{ p: /^\s*(when\s*\??|which\s*time\s*\??)\s*$/i, r: ['when wetyn?','talk am','which time?','later o'] },
{ p: /^\s*(why\s*\??|wetyn\s*why\s*\??)\s*$/i, r: ['why wetyn?','talk am','because na so o','you tell me'] },
{ p: /^\s*(who\s*\??|who\s*dat\s*\??)\s*$/i, r: ['who you mean?','talk am','who be that?','which person?'] },
{ p: /^\s*(how\s*\??|how\s*na\s*\??)\s*$/i, r: ['how wetyn?','talk am','how you mean?','na so o'] },

// ============ DIFFICULT / STRESS ============
{ p: /\b(life\s*is\s*(hard|tough|painful|stressful))\b/i,
  r: ['na so o','e go better','we dey manage','God dey o','chill small'] },
{ p: /\b(i\'?m\s*(going\s*through|passing\s*through)\s*(a\s*)?(lot|hard\s*time))\b/i,
  r: ['sorry o','e go better','God dey o','🙏','we dey with you'] },
{ p: /\b(i\s*don\'?t\s*have\s*(money|kudi|ego|cash))\b/i,
  r: ['same here o 😩','hustle o','money dey finish me too','chai 💸','God dey o'] },
{ p: /\b(i\s*need\s*money|i\s*dey\s*find\s*money|i\s*need\s*kudi)\b/i,
  r: ['who no need am? 😩','hustle dey go o','same boat o','God dey o'] },

// ============ GHANAIAN PIDGIN ============
{ p: /\b(chale|chale wote|chale boa)\b/i,
  r: ['chale o','you dey o?','we dey o','ako'] },
{ p: /\b(you\s*dey\s*chop\s*\?|you\s*dey\s*chop)\b/i,
  r: ['we dey chop o','😋 which food?','make I come','food dey o'] },
{ p: /\b(mepa|wo\s*ho\s*te\s*sen|ete\s*sen)\b/i,
  r: ['me ho ye o','chale','you too much o','we dey o'] },
{ p: /\b(aboa|kwasea|aponkye)\b/i,
  r: ['chale chill o 😅','wetin happen?','no insult o','abeg'] },

// ============ COPING WITH EMOTIONS (deeper) ============
{ p: /\b(i\s*can\'?t\s*(take|bear)\s*(it|am|this)\s*(again|anymore)?\b)/i,
  r: ['chill o','take it easy','e go better','talk to me','no give up'] },
{ p: /\b(i\s*don\'?t\s*know\s*what\s*to\s*do\s*(anymore)?)\b/i,
  r: ['chill o','think small','God dey o','e go be','talk to me'] },
{ p: /\b(i\s*(just\s*)?(want\s*to|feel\s*like)\s*(cry|shout|scream))\b/i,
  r: ['sorry o','talk to me','we dey with you','🙏','e go better'] },
{ p: /\b(i\s*need\s*(a\s*)?(friend|someone\s*to\s*talk\s*to))\b/i,
  r: ['I dey here o','talk to me','wetyn happen?','I dey hear'] },
{ p: /\b(i\s*feel\s*like\s*giving\s*up)\b/i,
  r: ['no give up o','hold on','e go better','God dey o','we dey with you'] },

// ============ CELEBRATIONS & MILESTONES ============
{ p: /\b(i\s*just\s*(got|landed)\s*(a\s*)?(job|work|contract))\b/i,
  r: ['🎉🎉 congrats!','yes o! 💪','God dey o','see blessing','more wins 🔥'] },
{ p: /\b(i\s*(just\s*)?(graduated|grad))\b/i,
  r: ['🎓🎉','congrats o!','big up!','God don do am 🙏'] },
{ p: /\b(i\s*(just\s*)?(bought|got)\s*(a\s*)?(car|house|phone|new))\b/i,
  r: ['🎉🎉','nice one!','congrats o','God when? 😩'] },
{ p: /\b(i\s*just\s*(started|open)\s*(a\s*)?(business|shop))\b/i,
  r: ['🎉🎉','God go do am','big up!','wishing you well 🙏'] },
{ p: /\b(i\s*am\s*(now|just)\s*an?\s*(engineer|doctor|lawyer|graduate))\b/i,
  r: ['🎉🎉 congrats!','big up!','respect o 🫡','God don do am'] },

// ============ RANDOM TEXT RATTLES ============
{ p: /^\s*(lol+l+|lmfao+l+)\s*$/i, r: ['😂😂','you too funny','ewo 😂','chai'] },
{ p: /^\s*(nice\s*one|nice\s*wan)\s*[!.,]?\s*$/i, r: ['👍','🙏','thanks','ehen na'] },
{ p: /^\s*(oo+oh+|oo+h+)\s*$/i, r: ['wetyn happen?','talk am','chill'] },
{ p: /^\s*(hee+yy+|heyy+y+)\s*$/i, r: ['sup 👋','yo 😎','wetin dey','hey'] },
{ p: /^\s*(wow+w+|wow+z+)\s*$/i, r: ['see this thing','na wa o','serious?','chai'] },

// ============ NIGERIAN PROVERBS / WISE TALK ============
{ p: /\b(na\s*(life|life\s*we\s*dey))\b/i, r: ['na life o','na so o','we dey manage','e go better'] },
{ p: /\b(no\s*condition\s*is\s*permanent|nothing\s*lasts\s*forever)\b/i,
  r: ['true talk o','na so o','💯','we go overcome'] },
{ p: /\b(na\s*one\s*life|we\s*only\s*live\s*once|yolo)\b/i,
  r: ['YOLO o','na so o','enjoy am','💪'] },
{ p: /\b(better\s*days\s*ahead|e\s*go\s*better\s*for\s*us)\b/i,
  r: ['amen o 🙏','e go better','God go do am','💯'] },

// ============ RESPONSES TO THREATS ============
{ p: /\b(i\s*will\s*(beat|kill|hit|slap|show)\s*you)\b/i,
  r: ['chill o 😅','wetin happen?','no vex','calm down','abeg'] },
{ p: /\b(come\s*and\s*(see|meet)\s*me|come\s*outside)\b/i,
  r: ['chill o','wetin happen?','no vex','I no dey come'] },

// ============ SLANGS/HASHTAGS ============
{ p: /#\w+/i, r: ['ehen na','wetyn dey sup?','we dey o','ok o'] },
{ p: /\b(hashtag|trending|viral)\b/i, r: ['wetyn dey trend?','link?','tell me','ehen na'] },

// ============ RESPONSES TO LATE REPLY ============
{ p: /\b(sorry\s*i\s*dey\s*late|sorry\s*for\s*the\s*late|forgive\s*the\s*delay)\b/i,
  r: ['no wahala o','ehen nothing','we dey o','no worry'] },
{ p: /\b(i\s*forgot\s*to\s*(reply|respond|answer))\b/i,
  r: ['no wahala','nothing dey happen','ehen ok','we dey o'] },

// ============ VERY COMMON WHATSAPP ============
{ p: /^\s*(\?\?+|what\s*\?{2,})\s*$/i, r: ['wetyn?','talk am','ehn','chill'] },
{ p: /^\s*(\!\!+|wow\s*!{2,})\s*$/i, r: ['wetyn happen?','chill','ehen na','talk am'] },
{ p: /\b(screenshot|screen\s*shot)\b/i, r: ['screenshot?','for where?','wetin dey happen?','abeg'] },

// ============ FINAL FALLBACK ============
{ p: /.{3,}/,
  r: ['ehn','hmm','ok o','sure','we dey o','chill','na so','I hear you','ehen','alright','talk am','continue','wetin happen?','see talk','oya na','chai','omo','dey o','sweet','nice','ok sha','na wa','talk na','ehen na','chill small'] }

];
module.exports = LIB8;
