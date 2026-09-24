const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
let changed = 0;

// 1. Add DATA_ROOT constant near the top
if (!s.includes('const DATA_ROOT')) {
    s = s.replace(
        "const PHONE_NUMBER = '233206391674';",
        "const PHONE_NUMBER = '233206391674';\nconst DATA_ROOT = process.env.DATA_ROOT || '.';"
    );
    changed++;
    console.log('✓ Added DATA_ROOT constant');
}

// 2. Change useMultiFileAuthState('auth_info') to use DATA_ROOT
if (s.includes("useMultiFileAuthState('auth_info')")) {
    s = s.replace(
        "useMultiFileAuthState('auth_info')",
        "useMultiFileAuthState(DATA_ROOT + '/auth_info')"
    );
    changed++;
    console.log('✓ auth_info now uses DATA_ROOT');
}

// 3. Change database.json paths to use DATA_ROOT
let count = 0;
s = s.replace(/'\.\/database\.json'/g, function () {
    count++;
    return "DATA_ROOT + '/database.json'";
});
if (count > 0) {
    changed++;
    console.log('✓ database.json path updated (' + count + ' occurrences)');
}

// 4. Also fix existsSync check
s = s.replace(
    /fs\.existsSync\('\.\/database\.json'\)/g,
    "fs.existsSync(DATA_ROOT + '/database.json')"
);

fs.writeFileSync('index.js', s);
console.log('---');
console.log('Total changes: ' + changed);
