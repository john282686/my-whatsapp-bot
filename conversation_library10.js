var LIB10 = [

// ============ REACTIONS TO STRANGE/ODD MESSAGES ============
{ p: /^\s*(\d+)\s*$/,
  r: ['wetin be that number?','what?','ehen','ok o'] },
{ p: /^\s*([a-z])\s*$/i,
  r: ['wetin?','talk am','ehn','ok o'] },
{ p: /^\s*(random\s*text|testing|test|just\s*testing)\s*$/i,
  r: ['we dey see you o','testing wetyn?','ehen na','ok o'] },
{ p: /^\s*(+\s*)/,
  r: ['wetin dey?','talk am','ehen','chill'] },

// ============ GROUP-SPECIFIC ============
{ p: /\b(who\s*(don\s*add|added)\s*(me|us))\b/i,
  r: ['welcome o 👋','somebody add you','make yourself comfortable','we dey here'] },
{ p: /\b(una\s*too\s*(much|dey|no\s*gree|do))\b/i,
  r: ['we dey hear o','chill na','wetin we do?','abeg jare'] },
{ p: /\b(this\s*group\s*(dey\s*sweet|too\s*much|nice))\b/i,
  r: ['na so o','we dey try','👍','ehen na'] },
{ p: /\b(this\s*group\s*(no\s*dey\s*active|dey\s*dry|dry))\b/i,
  r: ['na so o','we dey try wake am up','who dey?','talk something'] },
{ p: /\b(wetin\s*dey\s*sup\s*(for\s*)?(this\s*)?(group|gc))\b/i,
  r: ['nothing much o','we dey o','talk something na','chill'] },

// ============ CONFIRMATION / VERIFICATION ============
{ p: /\b(is\s*that\s*(you|true|real|so))\b/i,
  r: ['yes na','no be so o','na true o','wetyn you think?'] },
{ p: /\b(you\s*dey\s*serious|are\s*you\s*serious)\b/i,
  r: ['I serious o','no be joke','na real o','wetyn you think?'] },
{ p: /\b(you\s*dey\s*lie|no\s*lie|you\s*lie)\b/i,
  r: ['no be lie o','I swear','na true o','chill'] },
{ p: /\b(you\s*no\s*lie|na\s*true|serious)\s*[!?]?\s*$/i,
  r: ['na true o','I swear','ehen na','💯'] },

// ============ RANDOM CONVERSATION ============
{ p: /\b(anyway|all\s*the\s*same|regardless)\b/i,
  r: ['ehen na','ok o','move on','we dey hear'] },
{ p: /\b(make\s*we\s*(talk|chat|gist|vibe)\s*(small)?)\b/i,
  r: ['let\'s go 💪','talk na','we dey here','ok na'] },
{ p: /\b(i\s*dey\s*(for|on)\s*(whatsapp|wa|here))\b/i,
  r: ['we dey o','I see you o','ehen','👍'] },
{ p: /\b(nothing\s*to\s*say|i\s*dey\s*quiet)\b/i,
  r: ['chill o','we dey o','ok na','ehen'] },

// ============ SOMETHING ELSE ============
{ p: /\b(something\s*else|anything\s*else)\b/i,
  r: ['wetin?','talk am','ehn','continue'] },
{ p: /\b(let\s*me\s*(think|see))\b/i,
  r: ['ok na','we dey wait','take your time','sharp small'] },
{ p: /\b(i\s*will\s*(let\s*you\s*know|get\s*back))\b/i,
  r: ['ok na','we dey wait','later o','sharp small'] },
{ p: /\b(i\s*forget\s*(to\s*do|about))\b/i,
  r: ['no wahala','happens o','chill','make you no forget again 😂'] },

// ============ SPECIFIC INDIRECT WORDS ============
{ p: /\b(na\s*only\s*me\s*dey\s*see\s*am|only\s*me\s*dey)\b/i,
  r: ['no be only you o','we dey see am sef','chill o','na wa o'] },
{ p: /\b(i\s*no\s*go\s*lie|no\s*go\s*lie)\b/i,
  r: ['no lie o','I swear','na true o','💯'] },
{ p: /\b(na\s*true|na\s*so|na\s*im)\b/i,
  r: ['na so o','ehen na','yes o','I hear you'] },

// ============ INVITATIONS ============
{ p: /\b(come\s*for\s*party|come\s*for\s*owambe)\b/i,
  r: ['when?','where?','I dey come o 🎉','send details'] },
{ p: /\b(when\s*is\s*the\s*(party|wedding|event))\b/i,
  r: ['which date?','this weekend?','make you tell me','ehen when?'] },
{ p: /\b(send\s*me\s*(the\s*)?(location|address|venue))\b/i,
  r: ['send am come','which location?','abeg jare','I dey wait'] },

// ============ MORE SLANG REACTIONS ============
{ p: /\b(shebi|shey|abi\s*na)\s+/i,
  r: ['shey?','ehen na','abi o','na so'] },
{ p: /\b(oya\s*na|oya\s*now)\b/i,
  r: ['oya na','sharp sharp','dey come','let\'s go'] },
{ p: /\b(holy\s*ghost\s*fire|fire\s*fire)\b/i,
  r: ['🔥🔥🔥','fire o','na fire','see fire'] },
{ p: /\b(gbe\s*body|gbe\s*body\s*e)\b/i,
  r: ['gbe body e 💃','na so o','dance o','🔥'] },
{ p: /\b(touch\s*your\s*head|touch\s*wood)\b/i,
  r: ['chai','God forbid','no be my portion','🙏'] },

// ============ SPECIFIC NIGERIAN THINGS ============
{ p: /\b(bedford|abuja|kano|jos|ibadan|enugu|port\s*harcourt|ph)\b/i,
  r: ['which side?','city dey o','we dey o','ehen'] },
{ p: /\b(simon|baddest|shine\s*bobo|shine\s*boy)\b/i,
  r: ['shine o ✨','baddo 🔥','you too much','na so'] },
{ p: /\b(make\s*i\s*no\s*lie|make\s*i\s*talk\s*true)\b/i,
  r: ['talk true o','no lie o','💯','na so'] },

// ============ REACTIONS TO QUESTIONS THE BOT CAN\'T ANSWER ============
{ p: /\b(what\s*is\s*(the\s*)?(meaning|definition)\s*of)\b/i,
  r: ['look am up na 😂','ask Google','chai','wetin you mean?'] },
{ p: /\b(how\s*(do|can)\s*i\s*(fix|solve|do))\b/i,
  r: ['talk am','explain small','wetin happen?','we go see'] },
{ p: /\b(who\s*is\s*(the\s*)?(best|greatest|richest|smartest))\b/i,
  r: ['na you o 😎','chill','depends o','you tell me'] },

// ============ SPECIFIC FOODS ============
{ p: /\b(amala|ewedu|gbegiri|ila|ogbono|efo)\b/i,
  r: ['amala sweet o 😋','make I come','na my favorite','which one?'] },
{ p: /\b(pounded\s*yam|iyan)\b/i,
  r: ['pounded yam na the best 😋','make I come','I dey wait','😋'] },

// ============ WELL WISHES / PRAYERS ============
{ p: /\b(god\s*(bless|go\s*bless)\s*you)\b/i,
  r: ['🙏','amen o','God bless you too','thanks o'] },
{ p: /\b(pray\s*for\s*me|prayers\s*for\s*me)\b/i,
  r: ['🙏🙏','God go do am','I dey pray for you','amen'] },
{ p: /\b(amen|amen\s*o|amen\s*and\s*amen)\b/i,
  r: ['amen o 🙏','God dey o','ehen na','blessings'] },

// ============ FINAL FALLBACK ============
{ p: /.{3,}/,
  r: ['ehn','hmm','ok o','sure','we dey o','chill','na so','I hear you','ehen','alright','talk am','continue','wetin happen?','see talk','oya na','chai','omo','dey o','sweet','nice','ok sha','na wa','talk na','ehen na','chill small','nah','sharp','yeah','sure sure'] }

];
module.exports = LIB10;
