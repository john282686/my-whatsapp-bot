// ============================================================
// CONVERSATION LIBRARY 3 — games, artists, slang, group drama
// ============================================================
var LIB3 = [

// ============ GAMES (30) ============
{ p: /\b(efootball|e-football|pes|fifa|fifa 25|fifa 24|ea fc|ea sports)\b/i,
  r: ['my team dey strong o','which team you dey use?','make we play','efootball na my game','pass the ball na'] },
{ p: /\b(dls|dream league|dream league soccer)\b/i,
  r: ['DLS dey sweet o','which division you dey?','my team na fire 🔥','let\'s play','make we match'] },
{ p: /\b(free ?fire|ff|pubg|cod|call of duty|fortnite|mobile legends|mlbb)\b/i,
  r: ['which rank you dey?','let\'s squad up','add me na','we go play','my squad strong o'] },
{ p: /\b(mini militia|puzzle|chess|ludo|whot|scrabble|monopoly)\b/i,
  r: ['make we play','I dey down o','who wan play?','let\'s do am'] },
{ p: /\b(game|gaming|gamer|play\s*game|playstation|xbox|ps5|ps4)\b/i,
  r: ['which game?','game dey sweet o','let\'s play','add me'] },

// ============ MUSIC ARTISTS (40) ============
{ p: /\b(wizkid|wizzy|starboy)\b/i,
  r: ['Wizkid na legend o','his song dey sweet','which one?','🔥🎶'] },
{ p: /\b(burna|burna boy|odogwu)\b/i,
  r: ['Burna dey too much o','that guy na genius','last last!','🔥'] },
{ p: /\b(davido|obo)\b/i,
  r: ['Davido dey too much o','30BG 💪','which track?','🔥'] },
{ p: /\b(rema|rema boy)\b/i,
  r: ['Rema dey calm o','ozeba!','his flow dey sweet','🔥'] },
{ p: /\b(tems|tems baby)\b/i,
  r: ['Tems voice dey sweet o','free mind!','she too much','🎶'] },
{ p: /\b(asake|asakaa)\b/i,
  r: ['Asake dey too much o','mr money!','his song dey sweet','🔥'] },
{ p: /\b(olamide|skibii|zino|zino boy|nairaland)\b/i,
  r: ['which track?','his beat dey sweet','🔥'] },
{ p: /\b(omah lay|omah)\b/i,
  r: ['Omah lay dey calm o','soso!','his song dey sweet','🎶'] },
{ p: /\b(joeboy|fireboy|fireboy dml)\b/i,
  r: ['fireboy dey sweet o','which song?','🔥'] },
{ p: /\b(sarkodie|stonebwoy|shatta wale|kidi|kuami eugene|gyakie)\b/i,
  r: ['GH music dey sweet o','which track?','🔥🎶','ekiki mi'] },
{ p: /\b(tems|tiwa|yemi alade|simi|teni|niniola)\b/i,
  r: ['her voice dey sweet o','which song?','🎶'] },
{ p: /\b(drake|kendrick|j cole|travis|21 savage|future)\b/i,
  r: ['which track?','his flow dey sweet','🎶','🔥'] },
{ p: /\b(afrobeats|afrobeat|afro pop|amapiano)\b/i,
  r: ['afrobeats na life o 🎶','na my vibe','🔥🎶','afrobeats to the world'] },

// ============ LANGUAGE PATTERNS (30) ============
{ p: /\b(how\s*you\s*talk|wetin\s*you\s*say|talk\s*in\s*english)\b/i,
  r: ['shey you dey hear me?','I dey talk na','you no understand?','speak na'] },
{ p: /\b(igbo|ibo|i\s*dey\s*talk\s*igbo|speak\s*igbo)\b/i,
  r: ['kedu?','nno o','you sabi igbo?','biko talk am'] },
{ p: /\b(yoruba|yoruba\s*people|speak\s*yoruba)\b/i,
  r: ['bawo ni?','you sabi yoruba?','se wa okay?','omo'] },
{ p: /\b(hausa|speak\s*hausa)\b/i,
  r: ['sannu','yaya kake?','you sabi hausa?','nagode'] },
{ p: /\b(pidgin|naija\s*english|broken)\b/i,
  r: ['na pidgin we dey talk','ehen na','you sabi pidgin o','na so'] },
{ p: /\b(english|speak\s*english|grammar)\b/i,
  r: ['I dey speak english na','you no hear me?','chill'] },

// ============ STREET SLANG (30) ============
{ p: /\b(gbedu|blow|choke|japa|sapa|kolo|fear|wetin)\b/i,
  r: ['sapa dey worry person 😩','japa na the plan','we go blow o','no fear'] },
{ p: /\b(chill|chilling|relax|vibe|vibing|soft\s*life)\b/i,
  r: ['just dey chill 😎','soft life only','na the vibes','we dey jare'] },
{ p: /\b(plenty|plenti|too\s*much|over\s*do|too\s*much\s*o)\b/i,
  r: ['e don do o','no be small thing','you too much','e don pass'] },
{ p: /\b(dope|lit|fire|baddest|sick)\b/i,
  r: ['🔥🔥','na fire o','you too much','that thing dey sweet'] },
{ p: /\b(sharp|sharp\s*sharp|smart|clever)\b/i,
  r: ['💯','sharp sharp 👍','you sabi o','na so'] },
{ p: /\b(gbege|wahala|kasala|blow|blow\s*up|problem)\b/i,
  r: ['wahala o','gbege dey o','chai','wetin happen?'] },
{ p: /\b(waka|waka\s*pass|japa|travel|go\s*far)\b/i,
  r: ['waka o','safe journey','see you','later'] },
{ p: /\b(gbedu|gbam|gbam!|sharp!\s*correct)\b/i,
  r: ['gbam!','exactly 💯','na so o','ehen na'] },

// ============ WHATSAPP GROUP DRAMA (25) ============
{ p: /\b(remove\s*me|kick\s*me|delete\s*me|remove\s*am)\b/i,
  r: ['no vex o','wetin happen?','chill na','abeg'] },
{ p: /\b(admin\s*remove|admin\s*kick|admin\s*ban)\b/i,
  r: ['oga admin dey hear','talk am','wetin happen?','ehen'] },
{ p: /\b(add\s*me|add\s*me\s*na|add\s*me\s*to)\b/i,
  r: ['which group?','send link','wetyn dey happen inside?'] },
{ p: /\b(this\s*group|this\s*gc|una\s*group)\b/i,
  r: ['wetin happen?','talk am','I dey hear','ehen'] },
{ p: /\b(una\s*too\s*much|una\s*no\s*dey\s*hear|una\s*no\s*gree)\b/i,
  r: ['we dey hear o','chill na','wetin we do?','abeg jare'] },
{ p: /\b(who\s*add\s*me|who\s*add\s*me\s*here|how\s*i\s*take\s*reach\s*here)\b/i,
  r: ['welcome o 👋','somebody add you','make yourself comfortable'] },

// ============ POLITICS / NIGERIA NEWS (15) ============
{ p: /\b(tinubu|buhari|peter\s*obi|atiku|apc|pdp|labour\s*party)\b/i,
  r: ['politician na politician','we dey watch','no be our problem','God dey o'] },
{ p: /\b(fuel|petrol|pms|diesel|price|petrol\s*price)\b/i,
  r: ['fuel price don mad o','chai 💸','na wa o','Nigeria'] },
{ p: /\b(dollar|exchange\s*rate|naira\s*dey\s*fall)\b/i,
  r: ['naira dey suffer o','chai 💸','e go better','God dey o'] },

// ============ NOLLYWOOD / MOVIES (15) ============
{ p: /\b(nollywood|nigerian\s*movie|yoruba\s*movie|igbo\s*movie|skit|skitmaker)\b/i,
  r: ['which one?','that movie sweet o','🎬','na laugh we wan laugh'] },
{ p: /\b(tiktok|reels|shorts|instagram|ig|tweeter|x\s*app)\b/i,
  r: ['which one?','send am come','link?','wetyn dey happen there?'] },

// ============ RELIGIOUS / SPIRITUAL (20) ============
{ p: /\b(amen|hallelujah|praise\s*the\s*lord|thank\s*god|glory\s*be)\b/i,
  r: ['Amen 🙏','glory be to God','blessings 🙏','hallelujah'] },
{ p: /\b(prayer|pray|praying|pray\s*for\s*me)\b/i,
  r: ['🙏🙏','I dey pray for you','God go do am','Amen'] },
{ p: /\b(fasting|fast|dry\s*fast|ramadan|lent)\b/i,
  r: ['🙏','may God accept','blessings','ehen o'] },
{ p: /\b(miracle|testimony|blessing|breakthrough)\b/i,
  r: ['🙏🙏','God dey o','congratulations o','blessings'] },

// ============ WEDDINGS / PARTIES (15) ============
{ p: /\b(wedding|marry|marriage|bride|groom|aso\s*ebi)\b/i,
  r: ['🎉🎉','congratulations o','when be the wedding?','happy for you'] },
{ p: /\b(birthday|bday|hbd|special\s*day)\b/i,
  r: ['🎂🎉','happy birthday o','many more years 🎂','HBD!'] },
{ p: /\b(party|owambe|jollof|aso\s*ebi|canopy)\b/i,
  r: ['party dey sweet o 🎉','which party?','we dey come o','let\'s go'] },

// ============ COMMON WHATSAPP FORWARDS (15) ============
{ p: /\b(forwarded|forward|forward\s*message|broadcast\s*message)\b/i,
  r: ['see this forward 😂','who send you this?','abeg jare','foward message na wahala'] },
{ p: /\b(good\s*morning\s*message|morning\s*prayer|daily\s*bread|quote\s*of\s*the\s*day)\b/i,
  r: ['🙏','amen o','blessings','ehen'] },

// ============ LONG STORY RESPONSES (15) ============
{ p: /\b(long\s*story|story\s*story|story\s*for\s*the\s*gods|story\s*time)\b/i,
  r: ['talk am jare','I dey hear','continue','wetin happen?','ehen ehen'] },
{ p: /\b(so\s*(i|we)\s*(was|were|dey)\b)/i,
  r: ['ehen','continue','I dey hear','go on'] },
{ p: /\b(then\s*(what|wetin|what\s*now|wetin\s*happen))\b/i,
  r: ['wetin happen next?','continue na','then?','talk am'] },

// ============ END OF STORY / CONVERSATION (15) ============
{ p: /\b(so\s*that\'?s\s*how|that\'?s\s*the\s*end|na\s*so\s*e\s*take\s*end|end\s*of\s*story)\b/i,
  r: ['chai','see life','na wa o','ehen na'] },
{ p: /\b(anyway|anyways|regardless|moving\s*on|let\'s\s*move\s*on)\b/i,
  r: ['ehen','ok o','move on na','we dey hear'] },

// ============ SLANG WITH NUMBERS (10) ============
{ p: /\b(419|yahoo|yahoo\s*boy|fraud|scam|scammer)\b/i,
  r: ['no be am o','abeg jare','chill','no do that one'] },
{ p: /\b(nigga|bro|brah|fam|g|gee|cuz)\b/i,
  r: ['bro','fam','what up g','sup bro'] },
{ p: /\b(oya|oya\s*na)\s+/i,
  r: ['oya na','sharp sharp','dey come','let\'s go'] },

// ============ WHAT ABOUT YOU (15) ============
{ p: /\b(you\s*nko|you\s*own\s*nko|and\s*you|you\s*seff?|you\s*na)\b/i,
  r: ['I dey o','same here','me sef dey','we dey jare'] },
{ p: /\b(what\s*about\s*you|how\s*about\s*you|you\s*how|you\s*na)\b/i,
  r: ['I dey o, you nko?','same here','nothing much, you?','we dey jare'] },

// ============ SEASONAL / WEATHER (10) ============
{ p: /\b(harmattan|rainy\s*season|dry\s*season|christmas|new\s*year|easter|detty\s*december)\b/i,
  r: ['🎉','that season sweet o','we go enjoy','🕺'] },
{ p: /\b(detty\s*december|december|christmas|new\s*yea)\b/i,
  r: ['🎉🎄','the season don land o','we go rock am','ehen o'] },

// ============ RESPONSE TO LONG MESSAGES (10) ============
{ p: /.{80,}/,
  r: ['you talk well o','ehn ehn','I hear you','hmm sha','ok o','serious o','na wa','we go see'] },

// ============ EMPTY / VERY SHORT (5) ============
{ p: /^\s*[!?.,]+\s*$/,
  r: ['wetin?','you say?','ehn','talk am'] }

];
module.exports = LIB3;
