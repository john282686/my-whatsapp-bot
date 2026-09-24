const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
let changed = 0;

// 1. Change history labels so the AI stops mimicking them
if (s.includes("(x.role === 'user' ? 'Person' : 'You') + ': ' + x.text")) {
    s = s.replace(
        "(x.role === 'user' ? 'Person' : 'You') + ': ' + x.text",
        "(x.role === 'user' ? '[them]' : '[me]') + ' ' + x.text"
    );
    changed++;
}

// 2. Tell the AI never to prefix its reply with a label
if (s.includes("- Keep replies SHORT (1-2 sentences).")) {
    s = s.replace(
        "- Keep replies SHORT (1-2 sentences).",
        "- Keep replies SHORT (1-2 sentences).\\n" +
        "- NEVER start your reply with a label. Never write 'You:', 'Person:', '[me]', '[them]', 'Chidi:', or anything like that. Just reply naturally as if texting."
    );
    changed++;
}

// 3. Also rename the RECENT CONVERSATION header
if (s.includes("'RECENT CONVERSATION:\\n'")) {
    s = s.replace(/'RECENT CONVERSATION:\\n'/g, "'CONTEXT (do not repeat this format):\\n'");
    changed++;
}

fs.writeFileSync('index.js', s);
console.log('changes applied: ' + changed);
console.log('--- rules block ---');
const idx = s.indexOf('IMPORTANT RULES');
if (idx !== -1) console.log(s.slice(idx, idx + 500));
