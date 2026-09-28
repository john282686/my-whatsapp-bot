var LIB9 = [

// ============ TIME-BASED GREETINGS ============
{ p: /\b(morning\s*people|morning\s*fam|morning\s*everyone)\b/i,
  r: ['morning o ☀️','ehen morning','same to you o','morn don break'] },
{ p: /\b(afternoon\s*(people|fam|everyone|guys))\b/i,
  r: ['afternoon o ☀️','same to you','good afternoon'] },
{ p: /\b(evening\s*(people|fam|everyone|guys))\b/i,
  r: ['evening o 🌙','same to you o','good evening'] },

// ============ SPECIFIC DAYS ============
{ p: /\b(happy\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i,
  r: ['same to you o','🎉','thank you o','ehen same'] },
{ p: /\b(monday\s*(blues|don come)|monday again|work week)\b/i,
  r: ['chai monday 😩','week don start o','hustle o 💪','no be small thing'] },
{ p: /\b(tgif|thank\s*god\s*it\'?s?\s*friday|happy\s*friday)\b/i,
  r: ['🎉🎉 TGIF o','weekend don land','we go turn up','let\'s go'] },
{ p: /\b(happy\s*weekend|weekend\s*(don\s*land|vibes))\b/i,
  r: ['same to you o 🎉','let\'s enjoy','weekend na life','🎶'] },

// ============ MONEY / BUSINESS DEEPER ============
{ p: /\b(alert\s*(don\s*land|dey\s*sweet)|money\s*don\s*land)\b/i,
  r: ['alert dey sweet o 😎','congrats!','chop life o','🔥'] },
{ p: /\b(i\s*just\s*(make|earn|get)\s*(some\s*)?(money|cash|profit))\b/i,
  r: ['🎉🎉','nice one!','see alert o','God dey o'] },
{ p: /\b(business\s*(dey\s*go|don\s*boom|dey\s*sweet))\b/i,
  r: ['God dey o 🙏','congrats o','hustle na hustle','🔝'] },
{ p: /\b(customer\s*(don\s*buy|dey\s*buy|don\s*pay))\b/i,
  r: ['see blessing o 🎉','nice one!','God dey o','hustle pays'] },
{ p: /\b(investment\s*(don\s*pay|don\s*boom))\b/i,
  r: ['see profit o 💸','congrats!','smart move 🔥','God when? 😩'] },

// ============ SPECIFIC COMMENTS ON LIFE ============
{ p: /\b(lagos\s*(no\s*be\s*laugh|no\s*be\s*small|na\s*island|traffic))\b/i,
  r: ['Lagos na wahala o','third mainland bridge 😩','we dey manage','chai'] },
{ p: /\b(nigeria\s*(hard|wahala|na\s*tough|na\s*serious))\b/i,
  r: ['na so o','e go better','we dey manage','God dey o'] },
{ p: /\b(abroad\s*(life|dey\s*sweet|be\s*tough))\b/i,
  r: ['abroad na hustle o','e dey sweet o','japa o','God when? 😩'] },
{ p: /\b(japa\s*(be\s*the\s*plan|na\s*the\s*plan|don\s*start))\b/i,
  r: ['japa na the plan 🛫','God go do am','we go blow o','🔥'] },

// ============ HEALTH / WELLNESS ============
{ p: /\b(i\s*dey\s*see\s*doctor|going\s*to\s*hospital|seeing\s*doc)\b/i,
  r: ['hope all is well o','God dey o','🙏','get well soon'] },
{ p: /\b(i\s*dey\s*(take|drinking)\s*medicine)\b/i,
  r: ['get well soon','🙏','take care o','e go better'] },
{ p: /\b(i\s*don\s*(recover|improve|better))\b/i,
  r: ['🙏 praise God','nice one','ehen praise be','God dey o'] },
{ p: /\b(i\s*need\s*to\s*(rest|sleep|slow\s*down))\b/i,
  r: ['go rest o 😴','take am easy','same here','no wahala'] },

// ============ RELATIONSHIP DEEPER ============
{ p: /\b(she\s*(don\s*leave|break\s*up|dump)|he\s*(don\s*leave|dump|break))\b/i,
  r: ['chai sorry o','e go better','girls come girls go','no worry','🙏'] },
{ p: /\b(i\s*don\s*(fine\s*a\s*new|meet\s*a\s*new))\b/i,
  r: ['ehen 😏','see person','chop life o','make I hear'] },
{ p: /\b(my\s*(babe|boo|girl)\s*(don\s*vex|vex))\b/i,
  r: ['chill o 😂','go apologize','no be small thing','chai'] },
{ p: /\b(she\s*dey\s*ignore\s*me|he\s*dey\s*ignore)\b/i,
  r: ['chill o','girls na like that','give am time','no worry'] },

// ============ SPECIFIC THINGS ============
{ p: /\b(petrol\s*(don\s*finish|don\s*spoiled|tank)\b)/i,
  r: ['petrol na wahala o','chai 💸','fuel don mad','na so o'] },
{ p: /\b(nepa\s*(don\s*strike|don\s*take|don\s*cut))\b/i,
  r: ['NEPA don strike again 😩','chai','generator o','na so o'] },
{ p: /\b(network\s*(bad|don\s*change|dey\s*fail))\b/i,
  r: ['network dey kill person o','chai','4G dey slow','no wahala'] },
{ p: /\b(data\s*(don\s*finish|dey\s*cost|dey\s*go))\b/i,
  r: ['data dey finish me o','chai 💸','same here','😩'] },

// ============ FOOD DEEPER ============
{ p: /\b(jollof\s*(war|battle|beats|don\s*land))\b/i,
  r: ['jollof na the best 😋','Ghana jollof vs Nigeria jollof 😂','which one?','chai food talk'] },
{ p: /\b(party\s*jollof|party\s*rice)\b/i,
  r: ['party jollof sweet pass 🎉','make I come o','food don land','😋'] },
{ p: /\b(suya|suya\s*spot|suya\s*man)\b/i,
  r: ['suya dey sweet o 🔥','make I come','which suya?','na my favourite'] },

// ============ TRAVEL ============
{ p: /\b(i\s*dey\s*travel|going\s*for\s*trip|traveling)\b/i,
  r: ['safe journey o 🛫','enjoy o','send pics','later o'] },
{ p: /\b(i\s*don\s*land|i\s*don\s*reach\s*(safely)?)\b/i,
  r: ['welcome o 🙏','safe landing','ehen o','nice one'] },
{ p: /\b(i\s*dey\s*obodo\s*oyibo|i\s*dey\s*abroad|i\s*dey\s*yankee)\b/i,
  r: ['ehen o','abroad na hustle o','where exactly?','God when? 😩'] },

// ============ ASKING FOR HELP DEEPER ============
{ p: /\b(can\s*you\s*teach\s*me|teach\s*me\s*(something|how))\b/i,
  r: ['which one?','wetyn you wan learn?','make we talk','I dey hear'] },
{ p: /\b(how\s*do\s*i\s*(do|make|get|start))\b/i,
  r: ['wetin you want make?','talk am','explain small','we go see'] },
{ p: /\b(wetyn\s*be\s*the\s*way|which\s*way)\b/i,
  r: ['which way wetyn?','talk am','explain na','we go find am'] },

// ============ SPECIFIC COMPLIMENTS ============
{ p: /\b(your\s*(english|grammar|accent)\s*(sharp|nice|sweet|clean))\b/i,
  r: ['🙏 thanks o','you sef sabi','we dey learn','🙈'] },
{ p: /\b(you\s*be\s*(wise|smart|sharp|intelligent))\b/i,
  r: ['🙏','you sef','we dey learn o','na God o'] },
{ p: /\b(you\s*be\s*(real|original|correct)\s*(guy|guy|person|bobo))\b/i,
  r: ['🙏','na you o','we dey try o','correct guy 😎'] },

// ============ WEATHER MORE ============
{ p: /\b(rain\s*(dey\s*fall|don\s*start|dey\s*beat))\b/i,
  r: ['rain dey here too o','chai','make I enter house','🌧️'] },
{ p: /\b(rain\s*don\s*stop|rain\s*don\s*finish)\b/i,
  r: ['ehen o','nice one','come outside','🌤️'] },
{ p: /\b(sun\s*dey\s*(hot|beat|kill|scatter))\b/i,
  r: ['sun dey kill person o','chai','☀️','na wa o'] },

// ============ REACTIONS TO SPECIFIC WORDS ============
{ p: /\b(see\s*me|look\s*at\s*me|check\s*me)\b/i,
  r: ['I dey see you o','👀','wetyn happen?','chill'] },
{ p: /\b(pass\s*(me|by)|check\s*me\s*out)\b/i,
  r: ['👀','see person','chill o','ok o'] },
{ p: /\b(you\s*no\s*dey\s*see\s*me|you\s*no\s*see\s*me)\b/i,
  r: ['I dey see you o','no vex','chill o','ehen na'] },
{ p: /\b(you\s*dey\s*one\s*side|you\s*dey\s*corner)\b/i,
  r: ['chill o','no be so','come here','talk na'] },

// ============ GREETINGS REVISITED ============
{ p: /^\s*(hi+\s*everybody|hi+\s*fam|hi+\s*people)\s*$/i,
  r: ['sup guys 👋','hey everyone','sup sup','hi hi'] },
{ p: /^\s*(so|so\s*so|oya|so\s*na)\s*[!?]?\s*$/i,
  r: ['so wetyn?','talk am','ehen','continue'] },
{ p: /^\s*(wat\s*up|watup|wassup|watz\s*up)\s*$/i,
  r: ['nothing much','just dey','we dey o','wetin dey?'] },

// ============ FINAL FALLBACK ============
{ p: /.{3,}/,
  r: ['ehn','hmm','ok o','sure','we dey o','chill','na so','I hear you','ehen','alright','talk am','continue','wetin happen?','see talk','oya na','chai','omo','dey o','sweet','nice','ok sha','na wa','talk na','ehen na','chill small','nah','sharp'] }

];
module.exports = LIB9;
