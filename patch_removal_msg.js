const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');

// Match the existing "was removed" line, regardless of spacing
const oldMsg = /'User @' \+ p\.split\('@'\)\[0\] \+ ' was removed\.'/;

if (!oldMsg.test(s)) {
    console.log('❌ could not find the old removal message');
    // Show context
    const lines = s.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf('was removed') !== -1 || lines[i].indexOf('Goodbye') !== -1) {
            console.log((i+1) + ': ' + lines[i].trim());
        }
    }
    process.exit(1);
}

const newMsg = "'@' + p.split('@')[0] + ' has been removed from the group for violating our rules. Please continue to follow the guidelines to keep this group safe.'";

s = s.replace(oldMsg, newMsg);
fs.writeFileSync('index.js', s);
console.log('✅ removal message updated');
