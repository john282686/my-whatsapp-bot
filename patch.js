const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');

// Fix the broken line that the previous patch produced
const broken = "if ( && (text.indexOf('@bot')";
const fixed  = "if (notFromMe && (text.indexOf('@bot')";

if (s.includes(broken)) {
    s = s.replace(broken, fixed);
    fs.writeFileSync('index.js', s);
    console.log('✅ step1: broken line repaired');
} else if (s.includes("if (text.indexOf('@bot')")) {
    s = s.replace(
        "if (text.indexOf('@bot')",
        "if (notFromMe && (text.indexOf('@bot')"
    );
    fs.writeFileSync('index.js', s);
    console.log('✅ step1: added fromMe guard');
} else if (s.includes("if (notFromMe && (text.indexOf('@bot')")) {
    console.log('✅ step1: already correct');
} else {
    console.log('❌ could not find the @bot condition — show me the file');
    process.exit(1);
}

// Now define notFromMe just above the usage
let s2 = fs.readFileSync('index.js', 'utf8');

if (!s2.includes('var notFromMe =')) {
    // Insert the definition right before the @bot if-block
    s2 = s2.replace(
        /(\n\s*)(if \(notFromMe && \(text\.indexOf\('@bot'\))/,
        "$1var notFromMe = !msg.key.fromMe;$1$2"
    );
    fs.writeFileSync('index.js', s2);
    console.log('✅ step2: notFromMe defined');
} else {
    console.log('✅ step2: notFromMe already defined');
}
