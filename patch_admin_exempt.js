const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
const steps = [];

function patch(name, cond, from, to) {
    if (cond()) { steps.push('skip ' + name); return; }
    if (!s.includes(from)) { steps.push('FAIL ' + name); return; }
    s = s.split(from).join(to);
    steps.push('ok ' + name);
}

// 1. Compute isSenderAdmin right after we have earlyMeta
// Move admin detection up so fast-link-delete can use it
patch('early-admin-detect',
    () => s.includes('var isSenderAdmin'),
    "var msgId = msg.key.id;\n                if (processedMsgs[msgId]) continue;\n                processedMsgs[msgId] = Date.now();\n\n // FAST LINK DELETE\n if(!msg.key.fromMe){\n  var fastText=text;\n  if(msg.message.extendedTextMessage && msg.message.extendedTextMessage.matchedText) fastText+=' '+msg.message.extendedTextMessage.matchedText;\n  if(hasLink(fastText)){ delWarn(sock,from,msg,sender,'Links not allowed'); continue; }\n }",
    "var msgId = msg.key.id;\n                if (processedMsgs[msgId]) continue;\n                processedMsgs[msgId] = Date.now();\n\n                // Detect if sender is a group admin (so we can skip moderation for them)\n                var earlySn = num(sender);\n                var isSenderAdmin = isAdmin(earlyMeta, sender, earlySn, earlyBn, earlyBl, msg.key.fromMe);\n\n // FAST LINK DELETE (admins exempt)\n if(!msg.key.fromMe && !isSenderAdmin){\n  var fastText=text;\n  if(msg.message.extendedTextMessage && msg.message.extendedTextMessage.matchedText) fastText+=' '+msg.message.extendedTextMessage.matchedText;\n  if(hasLink(fastText)){ delWarn(sock,from,msg,sender,'Links not allowed'); continue; }\n }"
);

// 2. Exempt admins from the second moderation block (invites, contacts, links, phones, DM requests)
patch('block-exempt',
    () => s.includes("if (!msg.key.fromMe && !isSenderAdmin) {"),
    "if (!msg.key.fromMe) {\n                    if (mt === 'groupInviteMessage') {",
    "if (!msg.key.fromMe && !isSenderAdmin) {\n                    if (mt === 'groupInviteMessage') {"
);

// 3. Exempt admins from forwarded-message deletion too
patch('forward-exempt',
    () => s.includes("if (wasFwd) continue;") && s.includes("!isSenderAdmin && !msg.key.fromMe"),
    "var wasFwd = await deleteForwardedMessage(sock, msg, from);\n                if (wasFwd) continue;",
    "if (!isSenderAdmin) {\n                    var wasFwd = await deleteForwardedMessage(sock, msg, from);\n                    if (wasFwd) continue;\n                }"
);

fs.writeFileSync('index.js', s);
console.log('=== PATCH RESULT ===');
steps.forEach(function(x){ console.log('  ' + x); });
