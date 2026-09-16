const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage, getContentType } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(require('child_process').exec);
const { franc } = require('franc');
const axios = require('axios');

const PREFIX = '.';
const GROQ_API_KEY = "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";
const CEREBRAS_API_KEY = "csk-52h4rk6ydh4v56686639tjceew8fxdkf86hnftj4hrtyrhm8";
const PHONE_NUMBER = '233206391674';

let db = { warnings:{}, bannedUsers:[], mutedGroups:{}, welcomeSettings:{}, nsfwEnabled:{}, protectedGroups:{}, xp:{}, afk:{}, autoReply:{}, memory:{} };
if (fs.existsSync('./database.json')) { try { db = { ...db, ...JSON.parse(fs.readFileSync('./database.json')) }; } catch (e) {} }
function saveDB() { fs.writeFileSync('./database.json', JSON.stringify(db, null, 2)); }

const PIDGIN = ['abeg','wetin','dey','sabi','wahala','oya','na so','how far','no wahala','sha','abi','shey','you dey','i dey','una','e don','jare','chale','no vex','i wan','na wa','wetin happen','how you dey','no be','na im','dey go','wetin dey','wetin be','who dey','shey you','oya now','na true','gist','japa','yarn'];
function isPidgin(t) { if (!t) return false; const l = ' ' + t.toLowerCase() + ' '; return PIDGIN.some(w => l.includes(' ' + w + ' ')); }

function clean(t) {
    if (!t) return null;
    const l = t.toLowerCase();
    if (l.includes('api key')||l.includes('rate limit')||l.includes('user safety')||l.includes('safety:')||l.includes('quota')||l.includes('error')) return null;
    t = t.replace(/User Safety:\s*\w+\s*/gi,'').replace(/Safety:\s*\w+\s*/gi,'').trim();
    return t.length < 2 ? null : t;
}

function mem(g,u) { if(!db.memory[g])db.memory[g]={}; if(!db.memory[g][u])db.memory[g][u]={name:null,count:0,recent:[]}; return db.memory[g][u]; }
function addMem(g,u,n,t) { try{ const m=mem(g,u); m.count++; if(n&&!m.name)m.name=n; if(t&&t.length>3){m.recent.push(t.substring(0,150)); if(m.recent.length>10)m.recent.shift();} saveDB(); }catch(e){} }
function ctx(g,u) { const m=db.memory[g]?.[u]; if(!m)return''; let s=''; if(m.name)s+=`User name: ${m.name}. `; if(m.recent.length)s+=`Recent: ${m.recent.slice(-3).join(' | ')}. `; return s; }

async function askCerebras(q,sp) {
    try{ const m=[]; if(sp)m.push({role:'system',content:sp}); m.push({role:'user',content:q});
    const r=await fetch('https://api.cerebras.ai/v1/chat/completions',{method:'POST',headers:{'Authorization':`Bearer ${CEREBRAS_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:'llama3.1-8b',messages:m,max_tokens:300,temperature:0.9})});
    const d=await r.json();
    if(d.choices?.[0]?.message?.content)return{text:d.choices[0].message.content};
    if(d.error)console.log('Cerebras:',d.error.message);
    }catch(e){console.log('Cerebras err:',e.message);} return null;
}
async function askGroq(q,sp) {
    try{ const m=[]; if(sp)m.push({role:'system',content:sp}); m.push({role:'user',content:q});
    const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Authorization':`Bearer ${GROQ_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:m,max_tokens:300,temperature:0.9})});
    const d=await r.json();
    if(d.choices?.[0]?.message?.content)return{text:d.choices[0].message.content};
    if(d.error)console.log('Groq:',d.error.message);
    }catch(e){console.log('Groq err:',e.message);} return null;
}
async function askAI(q,opts={}) {
    let r=await askCerebras(q,opts.systemPrompt); if(r){const c=clean(r.text); if(c){console.log('[AI] ✅ Cerebras'); return c;}}
    r=await askGroq(q,opts.systemPrompt); if(r){const c=clean(r.text); if(c){console.log('[AI] ✅ Groq'); return c;}}
    console.log('[AI] ❌ Both failed');
    return null;
}

function num(j) { if(!j)return''; return j.split(':')[0].split('@')[0].replace(/\D/g,''); }
function isAdmin(m,s,sn,bn,bl,fm){ if(fm||sn===PHONE_NUMBER||sn===bn||(bl&&sn===bl))return true; return m.participants.some(p=>{if(!p.admin)return false; const n=num(p.id); return n===sn||n===bn||(bl&&n===bl)||n===PHONE_NUMBER;}); }
function isBotAdmin(m,bn,bl){ return m.participants.some(p=>{if(!p.admin)return false; const n=num(p.id); return n===bn||(bl&&n===bl);}); }

const cache={};
async function getMeta(s,j){ const n=Date.now(); if(cache[j]&&n-cache[j].t<300000)return cache[j].d; const d=await s.groupMetadata(j); cache[j]={d,t:n}; return d; }

async function delWarn(s,f,msg,sender,r){ try{ await s.sendMessage(f,{delete:msg.key}); await s.sendMessage(f,{text:`⚠️ *Deleted*\n@${sender.split('@')[0]}: ${r}`,mentions:[sender]}); }catch(e){} }

const cooldown={};
let pairing=false;

async function startBot() {
    const {state,saveCreds}=await useMultiFileAuthState('auth_info');
    const sock=makeWASocket({auth:state,logger:pino({level:'silent'}),browser:["Ubuntu","Chrome","20.0.04"]});
    sock.ev.on('creds.update',saveCreds);
    sock.ev.on('connection.update',async(u)=>{
        const{connection,lastDisconnect,qr}=u;
        if(qr&&!sock.authState.creds.registered&&!pairing){ pairing=true; try{ const c=await sock.requestPairingCode(PHONE_NUMBER); console.log(`\n===== YOUR CODE: ${c} =====\n`); }catch(e){pairing=false;} }
        if(connection==='close'){ pairing=false; const rc=(lastDisconnect.error)?.output?.statusCode!==DisconnectReason.loggedOut; if(rc){console.log('Reconnecting...'); setTimeout(startBot,5000);} }
        else if(connection==='open'){ pairing=false; console.log('✅ Bot connected!'); }
    });

    sock.ev.on('group-participants.update',async(u)=>{
        try{ const m=await getMeta(sock,u.id); const bn=num(sock.user.id); const bl=sock.user.lid?num(sock.user.lid):null;
        if(!isBotAdmin(m,bn,bl))return; if(db.welcomeSettings[u.id]!==true)return;
        const gn=m.subject||'this group';
        for(let po of u.participants){ const p=typeof po==='string'?po:po.id;
            if(u.action==='add') await sock.sendMessage(u.id,{text:`👋 *Welcome to ${gn}, @${p.split('@')[0]}!*\n\n*We're happy you joined!* 🎉\n\n*Introduce yourself:*\n1️⃣ Name\n2️⃣ Where you're from\n3️⃣ What you do\n\n*We want to know you!* 💬\n\n⚠️ *Please follow the group rules.*`,mentions:[p]});
            else if(u.action==='remove') await sock.sendMessage(u.id,{text:`👋 Goodbye @${p.split('@')[0]}!`,mentions:[p]});
        }}catch(e){}
    });

    sock.ev.on('messages.upsert',async(m)=>{
        for(const msg of m.messages){
            if(!msg.message)continue;
            const from=msg.key.remoteJid; const isG=from.endsWith('@g.us');
            let sender=msg.key.participant||msg.key.remoteJid; if(msg.key.fromMe)sender=sock.user.id.split(':')[0]+'@s.whatsapp.net';
            const text=msg.message?.conversation||msg.message?.extendedTextMessage?.text||'';
            const pn=msg.pushName||null;
            if(text.startsWith('⚠️ *Deleted'))continue;
            if(msg.message?.groupStatusMentionMessage){await sock.sendMessage(from,{delete:msg.key});continue;}
            if(!isG)continue;
            let meta; try{meta=await getMeta(sock,from);}catch(e){continue;}
            const bn=num(sock.user.id); const bl=sock.user.lid?num(sock.user.lid):null;
            const sn=num(sender);
            const botA=isBotAdmin(meta,bn,bl); const isA=isAdmin(meta,sender,sn,bn,bl,msg.key.fromMe);
            const prot=db.protectedGroups[from]; const mt=getContentType(msg.message);
            if(!botA)continue;
            if(text&&!text.startsWith(PREFIX)&&!msg.key.fromMe) addMem(from,sender,pn,text);
            if(db.afk?.[sender]){ delete db.afk[sender]; saveDB(); await sock.sendMessage(from,{text:`👋 Welcome back @${sn}!`,mentions:[sender]}); }
            if(text&&!text.startsWith(PREFIX)){ if(!db.xp[from])db.xp[from]={}; if(!db.xp[from][sender])db.xp[from][sender]={xp:0,level:1}; db.xp[from][sender].xp++; if(db.xp[from][sender].xp%10===0){ db.xp[from][sender].level++; await sock.sendMessage(from,{text:`🎉 @${sn} leveled up to Level ${db.xp[from][sender].level}!`,mentions:[sender]}); } saveDB(); }
            const pid=isPidgin(text);
            if(prot&&!isA&&!msg.key.fromMe&&text.length>5&&!pid&&!text.startsWith(PREFIX)){
                const c=text.replace(/@\d+/g,'').replace(/\d+/g,'').replace(/[^a-zA-Z\s]/g,'').trim();
                const wl=['bro','hey','hi','okay','lol','what','how','why','my','you','your','just','message','help','normal'];
                if(c.split(/\s+/).length>5&&!wl.some(w=>c.toLowerCase().includes(w))){ const lc=franc(c,{minLength:3}); if(lc!=='eng'&&lc!=='und'){ await delWarn(sock,from,msg,sender,"English & Pidgin only"); continue; } }
            }
            if(db.autoReply?.[from]&&!msg.key.fromMe&&text.length>1&&!text.startsWith(PREFIX)&&!text.includes('@bot')){
                const now=Date.now();
                if(!cooldown[from]||now-cooldown[from]>30000){ cooldown[from]=now;
                    const c=ctx(from,sender);
                    const sp=pid?`You are a real Nigerian named "Chidi". Reply ONLY in Nigerian Pidgin. 1-3 short sentences. Never mention AI. Context: ${c}`:`You are a real person named "Alex". Reply in English. 1-3 short sentences like texting a friend. Never mention AI. Context: ${c}`;
                    const r=await askAI(text,{systemPrompt:sp});
                    if(r)await sock.sendMessage(from,{text:r},{quoted:msg});
                    continue;
                }
            }
            if(!msg.key.fromMe){
                if(mt==='contactMessage'||mt==='contactsArrayMessage'){await delWarn(sock,from,msg,sender,"Contacts not allowed");continue;}
                const tn=text.replace(/@[\+\d]+/g,'').trim();
                if(tn.length>0&&!text.startsWith(PREFIX)&&/(\+?\d{1,4}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3,4}[\s-]?\d{4}/.test(tn)){await delWarn(sock,from,msg,sender,"Phone numbers not allowed");continue;}
                if(/\b(dm|inbox|message me|text me|pm me|private message|chat me)\b/i.test(text)){await delWarn(sock,from,msg,sender,"DM requests not allowed");continue;}
                if(/(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|me|io|co|xyz|top|info|link))/i.test(text)){await delWarn(sock,from,msg,sender,"Links not allowed");continue;}
            }
            if(text.includes('@bot')){
                const q=text.replace('@bot','').trim();
                if(q){ const c=ctx(from,sender); const pid2=isPidgin(q);
                    const sp=pid2?`You are a real Nigerian named "Chidi". Reply ONLY in Nigerian Pidgin. 1-3 short sentences. Never mention AI. Context: ${c}`:`You are a real person named "Alex". Reply in English. 1-3 short sentences. Never mention AI. Context: ${c}`;
                    const r=await askAI(q,{systemPrompt:sp});
                    if(r)await sock.sendMessage(from,{text:r},{quoted:msg});
                }
                continue;
            }
            if(!text.startsWith(PREFIX))continue;
            const args=text.slice(PREFIX.length).trim().split(/ +/);
            const cmd=args.shift().toLowerCase();
            const ment=msg.message?.extendedTextMessage?.contextInfo?.mentionedJid||[];
            const tgt=ment[0];

            if(cmd==='ping')await sock.sendMessage(from,{text:'🏓 Pong!'});
            else if(cmd==='help')await sock.sendMessage(from,{text:`*🤖 COMMANDS*\n\n*AI:* @bot <q>\n*Fun:* .joke .quote .8ball .dice .coinflip .truth .dare .ship\n*Facts:* .fact .catfact .dogfact .meme .advice\n*Info:* .wiki .weather .calc .qr .time\n*Fun:* .pokemon .anime .imagine\n*Social:* .profile .top .rank .leaderboard .afk .marry .divorce\n*Admin:* .protect .welcome .autoreply .tagall .mute .unmute .ban .unban .kick .warn .promote .demote .save .clear .lock .unlock`});
            else if(cmd==='autoreply'){ if(!isA)continue; if(args[0]==='on'){db.autoReply[from]=true;saveDB();await sock.sendMessage(from,{text:'💬 Auto-Reply ON'});} else if(args[0]==='off'){db.autoReply[from]=false;saveDB();await sock.sendMessage(from,{text:'OFF'});} }
            else if(cmd==='protect'){ if(!isA)continue; if(args[0]==='on'){db.protectedGroups[from]=true;saveDB();await sock.sendMessage(from,{text:'🛡️ Protection ON'});} else if(args[0]==='off'){db.protectedGroups[from]=false;saveDB();await sock.sendMessage(from,{text:'OFF'});} }
            else if(cmd==='welcome'){ if(!isA)continue; if(args[0]==='on'){db.welcomeSettings[from]=true;saveDB();await sock.sendMessage(from,{text:'✅ Welcome ON'});} else if(args[0]==='off'){db.welcomeSettings[from]=false;saveDB();await sock.sendMessage(from,{text:'OFF'});} }
            else if(cmd==='8ball')await sock.sendMessage(from,{text:`🎱 ${['Yes','No','Maybe','Definitely','Ask again later'][Math.floor(Math.random()*5)]}`});
            else if(cmd==='dice')await sock.sendMessage(from,{text:`🎲 *${Math.floor(Math.random()*6)+1}*`});
            else if(cmd==='coinflip')await sock.sendMessage(from,{text:`🪙 *${Math.random()<0.5?'HEADS':'TAILS'}*`});
            else if(cmd==='joke')await sock.sendMessage(from,{text:`😂 ${['Why did the scarecrow win? He was outstanding in his field.','Why dont scientists trust atoms? They make up everything.','What do you call a fake noodle? An impasta.'][Math.floor(Math.random()*3)]}`});
            else if(cmd==='quote')await sock.sendMessage(from,{text:`✨ ${['Do what you can with what you have.','Stay strong, stay focused.','Success is not final, failure is not fatal.'][Math.floor(Math.random()*3)]}`});
            else if(cmd==='truth')await sock.sendMessage(from,{text:`🎭 ${['Biggest fear?','First crush?','Most embarrassing moment?'][Math.floor(Math.random()*3)]}`});
            else if(cmd==='dare')await sock.sendMessage(from,{text:`🔥 ${['Send a funny selfie.','Text your crush.','Speak in accent for 5 min.'][Math.floor(Math.random()*3)]}`});
            else if(cmd==='fact'){ try{const r=await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random');await sock.sendMessage(from,{text:`💡 ${r.data.text}`});}catch(e){} }
            else if(cmd==='catfact'){ try{const r=await axios.get('https://catfact.ninja/fact');await sock.sendMessage(from,{text:`🐱 ${r.data.fact}`});}catch(e){} }
            else if(cmd==='dogfact'){ try{const r=await axios.get('https://dogapi.dog/api/facts');await sock.sendMessage(from,{text:`🐶 ${r.data.facts[0]}`});}catch(e){} }
            else if(cmd==='meme'){ try{const r=await axios.get('https://meme-api.com/gimme');await sock.sendMessage(from,{image:{url:r.data.url},caption:`😂 ${r.data.title}`});}catch(e){} }
            else if(cmd==='advice'){ try{const r=await axios.get('https://api.adviceslip.com/advice');await sock.sendMessage(from,{text:`💭 ${r.data.slip.advice}`});}catch(e){} }
            else if(cmd==='wiki'){ const t=args.join(' '); if(t){ try{const r=await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}`);if(r.data.extract)await sock.sendMessage(from,{text:`📖 *${r.data.title}*\n\n${r.data.extract}`});}catch(e){} } }
            else if(cmd==='weather'){ const c=args.join(' '); if(c){ try{const r=await axios.get(`https://wttr.in/${encodeURIComponent(c)}?format=j1`);const d=r.data.current_condition[0];await sock.sendMessage(from,{text:`🌤️ *${c}*\n${d.temp_C}°C | ${d.weatherDesc[0].value}`});}catch(e){} } }
            else if(cmd==='calc'){ const e=args.join(' '); if(e){ try{const s=e.replace(/[^0-9+\-*/().%\s]/g,'');const r=Function('"use strict";return ('+s+')')();await sock.sendMessage(from,{text:`🧮 ${e} = *${r}*`});}catch(e){} } }
            else if(cmd==='qr'){ const q=args.join(' '); if(q)await sock.sendMessage(from,{image:{url:`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(q)}`},caption:`QR: ${q}`}); }
            else if(cmd==='time')await sock.sendMessage(from,{text:`🕐 ${new Date().toUTCString()}`});
            else if(cmd==='pokemon'){ const n=args[0]; if(n){ try{const r=await axios.get(`https://pokeapi.co/api/v2/pokemon/${n.toLowerCase()}`);const d=r.data;await sock.sendMessage(from,{image:{url:d.sprites.front_default},caption:`*${d.name}*\nType: ${d.types.map(t=>t.type.name).join(', ')}`});}catch(e){} } }
            else if(cmd==='anime'){ const q=args.join(' '); if(q){ try{const r=await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=1`);const a=r.data.data[0];if(a)await sock.sendMessage(from,{image:{url:a.images.jpg.image_url},caption:`*${a.title}* ⭐${a.score}`});}catch(e){} } }
            else if(cmd==='imagine'){ const p=args.join(' '); if(p){ await sock.sendMessage(from,{text:'🎨 Generating...'}); await sock.sendMessage(from,{image:{url:`https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1024&height=1024&nologo=true`},caption:`🎨 ${p}`},{quoted:msg}); } }
            else if(cmd==='ship'){ if(ment.length<2)await sock.sendMessage(from,{text:'Tag 2 people!'}); else{ const p=Math.floor(Math.random()*101); await sock.sendMessage(from,{text:`💕 @${ment[0].split('@')[0]} ❤️ @${ment[1].split('@')[0]}\n*${p}%*`,mentions:[ment[0],ment[1]]}); } }
            else if(cmd==='profile'){ const x=db.xp[from]?.[sender]||{xp:0,level:1}; await sock.sendMessage(from,{text:`👤 @${sn}\nLv ${x.level} | XP ${x.xp}`,mentions:[sender]}); }
            else if(cmd==='rank'){ const x=db.xp[from]?.[sender]||{xp:0,level:1}; await sock.sendMessage(from,{text:`🏆 @${sn}: Lv ${x.level}`,mentions:[sender]}); }
            else if(cmd==='top'||cmd==='leaderboard'){ if(!db.xp[from])db.xp[from]={}; const s=Object.entries(db.xp[from]).sort((a,b)=>b[1].xp-a[1].xp).slice(0,5); let t="🏆 *Top 5*\n\n"; s.forEach((u,i)=>t+=`${i+1}. @${u[0].split('@')[0]} — Lv ${u[1].level}\n`); await sock.sendMessage(from,{text:t,mentions:s.map(x=>x[0])}); }
            else if(cmd==='afk'){ if(!db.afk)db.afk={}; db.afk[sender]=args.join(' ')||'AFK'; saveDB(); await sock.sendMessage(from,{text:`💤 @${sn} is AFK`,mentions:[sender]}); }
            else if(cmd==='marry'){ if(!tgt)await sock.sendMessage(from,{text:'Tag someone!'}); else{ if(!db.marriage)db.marriage={}; db.marriage[`${from}_${sender}`]=tgt; saveDB(); await sock.sendMessage(from,{text:`💍 @${sn} ❤️ @${tgt.split('@')[0]}`,mentions:[sender,tgt]}); } }
            else if(cmd==='divorce'){ if(!db.marriage)db.marriage={}; if(db.marriage[`${from}_${sender}`]){delete db.marriage[`${from}_${sender}`];saveDB();await sock.sendMessage(from,{text:'💔 Single'});} else await sock.sendMessage(from,{text:'Not married.'}); }
            else if(cmd==='tagall'&&isA){ let t="📢 *Everyone!*\n\n"; meta.participants.forEach(p=>t+=`@${p.id.split('@')[0]} `); await sock.sendMessage(from,{text:t,mentions:meta.participants.map(p=>p.id)}); }
            else if(cmd==='mute'&&isA){ db.mutedGroups[from]=true; saveDB(); await sock.sendMessage(from,{text:'🔇'}); }
            else if(cmd==='unmute'&&isA){ delete db.mutedGroups[from]; saveDB(); await sock.sendMessage(from,{text:'🔊'}); }
            else if(cmd==='kick'&&isA&&tgt){ await sock.groupParticipantsUpdate(from,[tgt],'remove'); await sock.sendMessage(from,{text:'✅ Kicked',mentions:[tgt]}); }
            else if(cmd==='promote'&&isA&&tgt){ await sock.groupParticipantsUpdate(from,[tgt],'promote'); await sock.sendMessage(from,{text:'✅ Promoted',mentions:[tgt]}); }
            else if(cmd==='demote'&&isA&&tgt){ await sock.groupParticipantsUpdate(from,[tgt],'demote'); await sock.sendMessage(from,{text:'✅ Demoted',mentions:[tgt]}); }
            else if(cmd==='warn'&&isA&&tgt){ const k=`${from}_${tgt}`; db.warnings[k]=(db.warnings[k]||0)+1; if(db.warnings[k]>=3){ await sock.groupParticipantsUpdate(from,[tgt],'remove'); await sock.sendMessage(from,{text:'🚫 Kicked after 3 warnings',mentions:[tgt]}); delete db.warnings[k]; } else await sock.sendMessage(from,{text:`⚠️ (${db.warnings[k]}/3)`,mentions:[tgt]}); saveDB(); }
            else if(cmd==='resetwarn'&&isA&&tgt){ delete db.warnings[`${from}_${tgt}`]; saveDB(); await sock.sendMessage(from,{text:'✅ Reset',mentions:[tgt]}); }
            else if(cmd==='ban'&&isA&&tgt){ db.bannedUsers.push(tgt); saveDB(); await sock.sendMessage(from,{text:'🚫',mentions:[tgt]}); }
            else if(cmd==='save'&&isA&&args[0]){ if(!db.notes)db.notes={}; if(!db.notes[from])db.notes[from]={}; db.notes[from][args[0].toLowerCase()]=args.slice(1).join(' '); saveDB(); await sock.sendMessage(from,{text:'✅ Saved'}); }
            else if(cmd==='memory'&&isA&&tgt){ const m=db.memory[from]?.[tgt]; if(!m)await sock.sendMessage(from,{text:'❌ No memory'}); else await sock.sendMessage(from,{text:`🧠 @${tgt.split('@')[0]}\nName: ${m.name||'?'}\nMsgs: ${m.count}`,mentions:[tgt]}); }
        }
    });
}
startBot();
