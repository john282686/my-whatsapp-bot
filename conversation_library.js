// ============================================================
// CONVERSATION LIBRARY — hundreds of human reply patterns
// ============================================================
var LIB = [

// ============ GREETINGS (30) ============
{ p: /^\s*(hi|hey|hello|yo|sup|wassup|whats up|what's up|howdy|helo|hii+|hiiii+)\s*[!.,]?\s*$/i,
  r: ['sup 👋','yo 😎','hey','hey guy','wetin dey','how you dey?','sup bro','heyyy','hi hi','yo yo','hey hey 😄','ehen','whats good','chale','sup sup'] },
{ p: /^\s*(good\s*(morning|mrng|morn))\b/i,
  r: ['Morning 🌞','Morning o ☀️','Morn don break 🌞','Good morning 😊','Morning! how you sleep?','Mornin 🌞','Morning chief ☀️','Morn o'] },
{ p: /^\s*(good\s*(afternoon|aftn|aft))\b/i,
  r: ['Good afternoon ☀️','Afternoon o','Afternoon 🌞','How the day dey go?','Afternoon chief','Afternoon 👋'] },
{ p: /^\s*(good\s*(evening|eve))\b/i,
  r: ['Good evening 🌙','Evening o','Evening 🌆','How the day go?','Good evening chief','Evening 👋'] },
{ p: /^\s*(good\s*(night|nite)|gn|goodnight)\b/i,
  r: ['Night 🌙','Good night o','sleep well 😴','later','night night','ok good night','Night o, rest well'] },
{ p: /^\s*(welcome|you dey welcome|welkom)\b/i,
  r: ['thanks 🙏','🙏','no wahala','ehen thanks','appreciate','thank you'] },
{ p: /^\s*(hello\s*everyone|hi\s*everyone|hey\s*(guys|everyone|all|people))\b/i,
  r: ['Sup guys 👋','hey everyone','wetin dey guys','hi all','sup sup','yo guys','hey hey','evening all'] },

// ============ HOW ARE YOU (15) ============
{ p: /^\s*(how\s*(are\s*you|you dey|far|body)|how\s*una\s*dey|hw\s*(r\s*u|are\s*you)|how you dey na)/i,
  r: ['I dey o, u nko? 😎','I dey, you nko?','Body dey, you?','I dey jare, u nko?','Chilling o, you?','We dey o, you nko?','I dey small, you?','Body dey inside cloth','I dey o, you nko?'] },
{ p: /^\s*(how far|howfa|how you far|hw far|how far na|how far class|how far guys|how far team|how far una|how far you)/i,
  r: ['I dey o, you nko? 😎','we dey o','body dey, you?','I dey jare 😎','chilling o','nothing much, you?','I dey small o','we dey jare'] },
{ p: /^\s*(you dey ok|you dey\??|hope you dey ok|you alright|u alright)/i,
  r: ['I dey o','body dey','I dey jare 😎','fine fine','small small o','we dey jare'] },
{ p: /^\s*(how\s*you\s*dey\s*today|how\s*your\s*day|how\s*was\s*your\s*day)\b/i,
  r: ['E dey go o','small small','we dey manage','no be small thing o','chilling o','not bad at all'] },

// ============ WHATS UP (10) ============
{ p: /^\s*(what'?s?\s*up|wetin\s*dey|wetin dey happen|whats good|wha?ts good|waddup|wtw|whats poppin)/i,
  r: ['Nothing much jare','just dey chill','we dey o, you?','notin much, you nko?','all good, you?','just dey o','same old, you?','notin jare, you nko?'] },
{ p: /^\s*(what\s*you\s*say|wetin\s*you\s*talk|what\s*you\s*mean)\b/i,
  r: ['I no talk notin','wetin happen?','you hear am na','ehn na so','wetin you talk?'] },

// ============ YES / NO / OK (20) ============
{ p: /^\s*(yes|yeah|yea|yh|yep|yup|yhh|ehen|ehn|ok|okay|k|kk|alright|ight|aight)\s*[!.,]?\s*$/i,
  r: ['💯','yes na','sure','ehen','👍','ehn ehn','ok na','cool','sure sure','alright','facts','ok o','sharp sharp'] },
{ p: /^\s*(no|nope|nah|naw|no o|no na)\s*[!.,]?\s*$/i,
  r: ['no be so','nah','no o','no na','never','no way','hmm no','no sha'] },
{ p: /^\s*(ok\s*na|ok\s*o|alright\s*na|ok\s*sha)\s*$/i,
  r: ['ehn na','yes o','sure na','👍','ehen'] },
{ p: /^\s*(sure|for sure|sure sure|definitely|100\s*percent|💯)\s*[!.,]?\s*$/i,
  r: ['💯','yes na','exactly','for sure','100%','na so o'] },

// ============ LAUGHTER (15) ============
{ p: /^\s*(lol|lmao|lmfao|😂+|🤣+|haha+|hehe+|hehehe+|loool)\s*$/i,
  r: ['😂😂','🤣🤣','lol','hahaha','😂','ehn 😂','😅','funny','hahaha same','😂😂😂','ewo 😂','chai 😂'] },
{ p: /\b(lol|lmao|😂|🤣|haha)\b/i,
  r: ['😂','right?! 😂','lol same','ehn 😅','😆','funny guy','you too funny 😂'] },
{ p: /\b(funny|fun|comedy|comedian|joke)\b/i,
  r: ['😂😂','you funny o','ewo 😂','chai','who send you 😂','see person'] },

// ============ THANKS / SORRY (20) ============
{ p: /^\s*(thanks|thank you|tanks|tnx|thx|tanx|thank u|thank yu)\s*[!.,]?\s*$/i,
  r: ['No wahala 🙏','anytime 😊','no problem','bless 🙏','👍','ehn nothing','sure','no issue','nah you 🙏'] },
{ p: /^\s*(sorry|my bad|my fault)\b/i,
  r: ['no wahala','it\'s ok','no problem 🙏','ehn no issue','no vex','no worry','all good','nothing dey happen'] },
{ p: /^\s*(i\s*apologize|apology|my apologies)\b/i,
  r: ['no wahala','nothing dey happen','no worry','ehen no issue'] },

// ============ CONGRATULATIONS (15) ============
{ p: /^\s*(congrats|congratulations|happy for you)\b/i,
  r: ['🎉🎉','congrats!','yes o! 🎉','🔥🔥','well done','nice one! 🎉','proud of you','more wins 💪'] },
{ p: /^\s*(happy\s*birthday|hbd|hpy bday|hbd\s*🎂)\b/i,
  r: ['🎂🎉🥳','HBD! 🎂','happy birthday 🎉','🎉🎂🥳','happy bday!','many more years 🎂'] },
{ p: /^\s*(success|achievement|won|winning)\b/i,
  r: ['🎉🎉','big up!','well done','💪','more wins','congrats o'] },

// ============ WHO'S ONLINE (10) ============
{ p: /^\s*(who\s*(dey|is)\s*(online|around|here)|anyone\s*(around|online|here)|anybody\s*here|who dey house|who dey)/i,
  r: ['I dey here 👀','me dey','here o','present 👋','I dey o','right here 😎','we dey','dey here o'] },

// ============ WHAT ARE YOU DOING (10) ============
{ p: /^\s*(what\s*(are|r)\s*(you|u)\s*doing|what\s*you\s*doing|wetin\s*you\s*dey\s*do|wetin you dey do|what you dey do)/i,
  r: ['Just dey o','nothing much','chilling 🌞','just dey watch','nothing jare, you?','dey o, you nko?','just dey vibe','nothing much o, you?'] },

// ============ WHERE ARE YOU (8) ============
{ p: /^\s*(where\s*(are|r)\s*(you|u)|where\s*you\s*dey|where\s*u\s*dey)\s*\??\s*$/i,
  r: ['I dey house','around o','just dey my side','inside o','my area, you?','house jare','somewhere o'] },

// ============ BYE (12) ============
{ p: /^\s*(bye|goodbye|later|see\s*you|cya|peace|dey go|i dey go|am going|going out|comot)\b/i,
  r: ['later 👋','see you','peace ✌️','later bro','safe journey','take care','later o','see you soon','dey go well'] },

// ============ EMOJI ONLY (15) ============
{ p: /^\s*(👍+|❤️+|🔥+|💯+|🙏+|👌+|🙌+|😎+|👋+|😊+|😂+|🤔+)\s*$/i,
  r: ['🔥','💯','👌','🙏','😎','same vibe','❤️','😄','yes','👏','na so o','ehen'] },

// ============ REAL / BOT QUESTIONS (20) ============
{ p: /\b(are\s*you\s*(a\s*)?(bot|ai|human|real)|you be (bot|ai|human)|u be (bot|ai)|is this a bot|who is this)\b/i,
  r: ['Na real person o 😂','I be human jare','wetin make u think say I be bot 😂','lol no be, na me dey here','normal person o','I be guy na 😎','just me jare','na real guy o, no mind them'] },
{ p: /\b(you\s*are\s*a\s*bot|u\s*(na|be)\s*(bot|ai)|you\s*na\s*(bot|ai))\b/i,
  r: ['no be o 😂','wetin make u think so?','abeg no o','lol na real guy','chill, na me dey here'] },
{ p: /\b(send\s*(your|ur)\s*(pic|photo|picture)|show me your pic|drop your pic)\b/i,
  r: ['no dey ask me that 😂','abeg','wetyn you wan use am do?','no pic o','chill jare'] },

// ============ NAME / AGE / WHERE FROM (15) ============
{ p: /^\s*(what\\'?s?\\s*your\\s*name|your name|who be you|wetin be your name)\b/i,
  r: ['guess 😎','Chidi na','call me Chidi','and you?','wetin be your own?','na you first'] },
{ p: /^\s*(how old are you|your age|wetin your age|what\\'s your age)\b/i,
  r: ['age no matter na','guess now','😂 you wan know?','old enough','why you ask?','age na number'] },
{ p: /^\s*(where you from|where\\s*you\\s*dey from|which state|where you dey stay)\b/i,
  r: ['Nigeria 🇳🇬 o','Lagos','you nko?','where you from?','Nigerian born','warri o'] },
{ p: /^\s*(are you single|you get babe|you get girl|you married)\b/i,
  r: ['why you ask? 😏','personal question o','😂 no comment','you nko?','why?','focus on the matter'] },

// ============ COMPLIMENTS / INSULTS (20) ============
{ p: /^\s*(you\s*(are|r)\s*(funny|nice|good|smart|sweet)|u (funny|nice|good|smart)|you too much)/i,
  r: ['🙏🙏','aww thanks','ehen na 😎','you too much pass me','🙏','you sef','omo na you'] },
{ p: /^\s*(you foolish|you mad|idiot|stupid|fool|nonsense)\b/i,
  r: ['chill na 😅','wetin happen now?','no vex','ehn ok','we no dey do that here','no insult o','abeg jare'] },
{ p: /^\s*(shut\s*up|comot|fuck\s*off|get\s*out|waka)\b/i,
  r: ['chill','no vex','we dey play na','ehn ok','no wahala','cool down'] },

// ============ QUESTIONS ENDING WITH ? (10) ============
{ p: /\?\s*$/,
  r: ['hmm I no know o 🤔','I think so','maybe na','not sure o','you tell me','ehn wetin you think?','good question o','hmm sha','I dey hear you','ehen'] },

// ============ FOOTBALL / SPORTS (30) ============
{ p: /\b(football|match|chelsea|arsenal|man u|man utd|liverpool|madrid|barca|barcelona|messi|ronaldo|premier league|super eagles|efootball|dls|freefire|football match)\b/i,
  r: ['that match sweet o','which team you dey support?','football dey cause wahala 😂','we go see','na so o','⚽🔥','the thing pain me o','E dey go o','⚽','game sweet o'] },
{ p: /\b(goal|scored|score|winger|striker|keeper|goalkeeper|defence|midfielder)\b/i,
  r: ['🔥🔥🔥','see goal','💪','⚽','nice one','yes o!','football na life'] },
{ p: /\b(lose|lost|defeat|beaten|failed|losing)\b/i,
  r: ['chai 😩','sorry o','next time go better','no worry','we go bounce back 💪','the thing pain me o'] },
{ p: /\b(win|won|we won|victory|champion|trophy)\b/i,
  r: ['yes o! 🎉','🔥🔥🔥','we don win','💪','celebrate o','see goal! 🔥','champion 🏆'] },

// ============ MUSIC (25) ============
{ p: /\b(music|song|listen|playlist|artist|album|afrobeats|wizkid|burna|davido|rema|tems|asake|sarkodie|stonebwoy)\b/i,
  r: ['music na life o 🎶','which song?','that track dey sweet','na my vibe','🔥🎶','you sabi music o','play am','song sweet o'] },
{ p: /\b(dj|beat|instrumental|producer|studio)\b/i,
  r: ['beats dey sweet o','who produce am?','🔥🔥','na vibe','🎶🎶'] },

// ============ MOVIES / SHOWS (20) ============
{ p: /\b(movie|film|netflix|series|show|watch|episode|season|cinema)\b/i,
  r: ['which movie?','na good one?','I dey watch one sef','series na life o 🎬','you watch am finish?','recommend me one','🎬','the movie sweet o'] },

// ============ FOOD (25) ============
{ p: /\b(food|hungry|chop|jollof|rice|eat|eating|beans|swallow|egusi|amala|fufu|eba|pounded yam|garri|plantain|indomie|shawarma)\b/i,
  r: ['make I come chop? 😋','hungry dey worry me o','jollof na the best 😋','food don ready?','send am come 😂','I dey fast o','na my favorite 😋','food na life','when food dey ready?'] },
{ p: /\b(cook|cooking|kitchen|chef)\b/i,
  r: ['who cook?','make I come 😋','food dey ready?','ehn na my favorite'] },
{ p: /\b(water|drink|beer|wine|juice|coffee|tea)\b/i,
  r: ['water na life o 💧','I need one too','make I drink small','🫗','cool cool'] },

// ============ MONEY / WORK (30) ============
{ p: /\b(money|naira|dollar|dollars|cash|paid|broke|investment|hustle|wealth|rich|poverty|salary)\b/i,
  r: ['money na water 💧','hustle dey go o','chai 💸','who no get money?','God go provide 🙏','same here o','let\'s grind 💪','money dey finish','no be small thing'] },
{ p: /\b(work|working|job|office|boss|client)\b/i,
  r: ['work dey go o','which work?','boss dey stress person','chai 😩','hustle na hustle','we go manage'] },
{ p: /\b(business|enterprise|shop|store|sell|selling|buy|buying)\b/i,
  r: ['which business?','how sales dey go?','hustle o','business na business 💼'] },

// ============ SCHOOL / EXAMS (20) ============
{ p: /\b(school|class|exam|test|teacher|student|assignment|homework|study|campus|university|jamb|waec)\b/i,
  r: ['school na wahala','exam don come','chai 😩','we go manage','how e dey go?','no be small thing o','study hard o','read your book o'] },

// ============ RELATIONSHIPS (40) ============
{ p: /\b(girlfriend|boyfriend|babe|bobo|crush|love|relationship|single|dating|wifey|hubby|ex)\b/i,
  r: ['ehen 😏','love na sweet thing o','chai','omo see talk','who be the person?','story for another day','🙈','love dey sweet o','single? me too o'] },
{ p: /\b(breakup|broke up|dumped|cheated|cheating|betray|betrayed)\b/i,
  r: ['chai 😢','sorry o','no worry','time go heal','God dey o','we dey with you'] },
{ p: /\b(propose|proposal|wedding|marriage|married|wife|husband)\b/i,
  r: ['🎉🎉','congratulations o','when be the wedding?','happy for you','ehen!','🙏🏽'] },
{ p: /\b(flirt|flirting|toast|toasting|kiss|kissing|romance|romantic)\b/i,
  r: ['😏','ehen o','see person','we dey watch','🔞😂'] },
{ p: /\b(sex|sexy|nudes|naked|porn|hookup|fuck|fucking)\b/i,
  r: ['abeg no dey o','we no dey do that here','chill','no be am o','focus jare'] },

// ============ WEATHER (15) ============
{ p: /\b(rain|raining|rainy|sun|sunny|hot|cold|weather|cloudy|harmattan)\b/i,
  r: ['rain dey here too o','sun dey kill person','cold dey o','weather no good today','🌧️','☀️','💨','harmattan dey o'] },

// ============ TRAFFIC / TRANSPORT (15) ============
{ p: /\b(traffic|go-slow|hold up|transport|bus|keke|uber|bolt|taxi)\b/i,
  r: ['traffic na wahala o','go-slow dey o','chai 😩','how you take reach?','no be small thing o','traffic dey kill person','lagos traffic o'] },

// ============ TECH / PHONE (25) ============
{ p: /\b(phone|android|iphone|app|whatsapp|internet|data|wifi|charge|battery|laptop|computer)\b/i,
  r: ['data dey finish me o','phone dey slow','my battery low o','internet no good here','Android or iPhone?','tech na wahala','phone don spoil','data dey cost'] },
{ p: /\b(charger|charging|charge me|low battery|percentage)\b/i,
  r: ['my battery low o','charge dey go','plug am','let me charge small'] },
{ p: /\b(ai|artificial intelligence|chatgpt|gemini|chat bot)\b/i,
  r: ['AI dey everywhere o','which AI?','AI na the new thing','🤖'] },

// ============ NEWS / GIST (15) ============
{ p: /\b(news|heard|trending|viral|breaking|saw something|gist)\b/i,
  r: ['wetin happen?','I no hear o','tell me now','serious?','spill the tea ☕','link?','talk am'] },

// ============ FAMILY (15) ============
{ p: /\b(mum|mom|mama|mother|dad|papa|father|brother|sister|family|wife|husband|uncle|aunt)\b/i,
  r: ['family na everything 🙏','which one?','how e dey?','send them my greetings','family dey o'] },

// ============ CHURCH / RELIGION (15) ============
{ p: /\b(church|god|jesus|pastor|prayer|pray|blessing|blessed|hallelujah|amen|christian|muslim|allah)\b/i,
  r: ['Amen 🙏','God dey o','bless up 🙏','prayer na key','God go do am','Amen o'] },

// ============ LAGOS / NIGERIA LIFE (30) ============
{ p: /\b(lagos|abuja|portharcourt|ph|ibadan|kano|naija|nigeria|9ja|naija)\b/i,
  r: ['Lagos na Lagos o','city of hustle','9ja no dey carry last','Naija 🇳🇬','we dey o','my country'] },
{ p: /\b(nepa|phcn|light|no light|light don go|electric)\b/i,
  r: ['NEPA don strike again 😩','light dey come dey go','no light o','chai','generator dey work'] },

// ============ ENCOURAGEMENT (20) ============
{ p: /\b(tired|stress|stressed|exhausted|fed up|weary|drained)\b/i,
  r: ['same here o 😴','go rest o','you work too much','take it easy','no wahala, rest small'] },
{ p: /\b(hard|difficult|tough|challenging|painful)\b/i,
  r: ['e go better o','no worry','God dey o','hold on','we go manage','💪'] },
{ p: /\b(happy|excited|glad|joyful|great news)\b/i,
  r: ['🎉🎉','happy for you o','that na good news!','💪','see vibes 🔥'] },
{ p: /\b(sad|depressed|down|crying|cry)\b/i,
  r: ['sorry o','no worry','God dey o','we dey with you','🙏','e go better'] },
{ p: /\b(angry|vex|frustrated|mad)\b/i,
  r: ['chill o','no vex','calm down','take it easy','no wahala'] },

// ============ REACTIONS (30) ============
{ p: /^\s*(wow|omg|damn|chai|wahala|omo|oya|ehen|sheesh|ayeee|yooo|ohh?|na wa|ehyah)\s*[!.,]?\s*$/i,
  r: ['omo 😳','chai!','wahala o','see this thing','na wa o','ehen!','serious?','😱','ah ah','ewo o'] },
{ p: /^\s*(nice|sweet|cool|great|beautiful|lovely|fine|great job|na wa o)\s*[!.,]?\s*$/i,
  r: ['🙏','thanks','ehn o 😎','na you','nice one 🔥','💯','appreciate'] },
{ p: /^\s*(interesting|serious|really|for real|you serious)\s*[!.,]?\s*$/i,
  r: ['seriously o','I swear','on god','real talk','na so o','you think so?','🤔'] },
{ p: /^\s*(bad|terrible|awful|horrible|mess)\b/i,
  r: ['wahala o','chai','na wa','serious problem','God dey o','sorry about that','that one strong'] },
{ p: /^\s*(exactly|fact|facts|true|real talk|you right|you dey right|you\\s*correct|very true|nah true)\s*[!.,]?\s*$/i,
  r: ['💯','exactly 💯','fact!','real talk','you sabi','na true o','ehen na 💯'] },
{ p: /^\s*(wrong|no be so|you wrong|that\\s*is\\s*wrong|lies|fake)\s*[!.,]?\s*$/i,
  r: ['how?','no be so o','you sure?','ehn wetin happen?','explain now','serious?','abeg jare'] },

// ============ MUSIC/CRUISE (15) ============
{ p: /\b(party|club|turn up|groove|shayo|parole|bar)\b/i,
  r: ['party dey sweet o 🎉','which club?','we go turn up','🔥','let\'s go'] },
{ p: /\b(bored|boring|nothing to do)\b/i,
  r: ['same here o','we dey find wetin do','nobody dey talk','make we play game','entertain me'] },

// ============ CHAT / CONVERSATION (15) ============
{ p: /\b(chat|talk|conversation|gist|banter)\b/i,
  r: ['talk to me na','wetin dey happen?','I dey hear','continue','👀'] },
{ p: /\b(please|abeg|biko|jare)\b/i,
  r: ['no wahala','ok na','sure','ehen','wetyn happen?'] },

// ============ WELL WISHES (10) ============
{ p: /\b(good luck|wish me luck|pray for me|fingers crossed)\b/i,
  r: ['🙏🙏','God go do am','best of luck','you go win','💪'] },
{ p: /\b(get well|feel better|recover)\b/i,
  r: ['🙏','thank you','God heal','get well soon','take care'] },

// ============ POLITE / RESPECT (10) ============
{ p: /\b(sir|ma|chief|oga|boss)\b/i,
  r: ['yes o','sir 🙏','oga no vex','ehen','present'] },
{ p: /\b(excuse me|pardon|sorry to disturb)\b/i,
  r: ['no wahala','talk na','wetin dey?','I dey hear'] },

// ============ LONG STATEMENTS / STORIES (15) ============
{ p: /.{30,}/,
  r: ['ehn ehn','na wa o','that one strong o','serious?','omo','chai','see talk','hmm','ok o','interesting 🤔','wait wait','hmmmm'] }

];
module.exports = LIB;
