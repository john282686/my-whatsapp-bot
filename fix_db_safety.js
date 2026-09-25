const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
const steps = [];

// Find the DB load line
const loadRe = /try\s*\{\s*if\s*\(fs\.existsSync[\s\S]*?\}\s*catch\s*\(e\)\s*\{\}/;
const match = s.match(loadRe);

if (!match) {
    console.log('❌ could not find the db load line');
    process.exit(1);
}

const guard = match[0] + `

// ---- SAFETY NET ---- ensure every expected top-level key exists
var __DEFAULTS = {
    warnings: {}, welcomeSettings: {}, protectedGroups: {},
    xp: {}, afk: {}, autoReply: {}, memory: {}, chatHistory: {}, groupChat: {},
    groupLore: {}, groupStats: {}, userProfiles: {}, groupModes: {}, loreScan: {},
    longTermMemory: {}, ltmInbox: {}, timeCapsules: [],
    groupDNA: {}, relationshipGraph: {}, guardianLog: {}, guardianCooldown: {},
    predictionLedger: {}, dmReplies: true,
    groupAutobiography: {}, oraclePredictions: {}, oracleScore: { hits: 0, misses: 0 },
    chorusHistory: {}, deepTimeArchive: {},
    confessions: {}, confessTargets: {}, groupSecondLife: {},
    cultureVault: {}, matchSuggestions: {}, weeklyReplayLast: {}, ghostAlerts: {},
    healthPulse: {}, moodTide: {}, trendHistory: {}, adminBriefLast: {},
    silentMode: {}, silentAccum: {}, activePersona: {}, selfAuditLog: [],
    groupOracle: {}, timeBank: {}, livingArchive: {}, socialPhysics: {}, interventions: {},
    groupNovel: {}, memoryLeaks: {}, foundersArchive: {}, deepMirror: {}, watcherArchive: {},
    stockMarket: {}, futureLetters: [], reversePolls: {}, anthropologist: {}
};
Object.keys(__DEFAULTS).forEach(function (k) {
    if (db[k] === undefined || db[k] === null) db[k] = __DEFAULTS[k];
});`;

s = s.replace(match[0], guard);
fs.writeFileSync('index.js', s);
console.log('✅ safety net added');
