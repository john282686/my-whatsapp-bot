const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
let changed = 0;

// 1. Replace the groupStatusMentionMessage check with a more robust version
const oldCheck = "if(msg.message.groupStatusMentionMessage){ sock.sendMessage(from,{delete:msg.key}).catch(function(){}); continue; }";
const newCheck = `if (msg.message.groupStatusMentionMessage ||
                    (msg.message.protocolMessage && msg.message.protocolMessage.type === 0) ||
                    (msg.message.reactionMessage && msg.message.reactionMessage.text === '')) {
                    try {
                        await sock.sendMessage(from, { delete: msg.key });
                        console.log('[STATUS-FILTER] deleted status/system msg in ' + from);
                    } catch (e) {
                        console.log('[STATUS-FILTER] delete failed:', e.message);
                    }
                    continue;
                }`;

if (s.includes(oldCheck)) {
    s = s.replace(oldCheck, newCheck);
    changed++;
    console.log('✓ status-mention block replaced');
} else if (s.includes('groupStatusMentionMessage')) {
    // looser match
    s = s.replace(/if\(msg\.message\.groupStatusMentionMessage\)\{[^}]+\}\s*continue;/,
                  newCheck);
    changed++;
    console.log('✓ status-mention block replaced (loose)');
} else {
    console.log('❌ status-mention block not found — send me the line');
}

// 2. Add a filter for "system" messages that often show up as protocolMessage
//    (e.g. group icon change, subject change, participant add/remove notifications)
const sysBlock = `
                // ==== SYSTEM MESSAGE FILTER ====
                try {
                    var pmt = msg.message && msg.message.protocolMessage;
                    if (pmt && (pmt.type === 3 || pmt.type === 4 || pmt.type === 5 || pmt.type === 6)) {
                        // 3 = REVOKE, 4 = EPHEMERAL_SETTING, 5 = EPHEMERAL_SYNC_RESPONSE, 6 = HISTORY_SYNC_NOTIFICATION
                        await sock.sendMessage(from, { delete: msg.key }).catch(function() {});
                        console.log('[STATUS-FILTER] deleted protocol msg type ' + pmt.type);
                        continue;
                    }
                } catch (e) { console.log('[STATUS-FILTER] sys err:', e.message); }
`;

// insert this block right after we know 'from' is a group
const anchor = "if(!isG) continue;";
if (s.includes(anchor) && !s.includes('SYSTEM MESSAGE FILTER')) {
    s = s.replace(anchor, anchor + sysBlock);
    changed++;
    console.log('✓ system message filter added');
} else if (s.includes('SYSTEM MESSAGE FILTER')) {
    console.log('✓ system message filter already present');
}

fs.writeFileSync('index.js', s);
console.log('---');
console.log('Total changes: ' + changed);
