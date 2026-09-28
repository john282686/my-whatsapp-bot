// ============================================================
// TIME AWARENESS — replies match the actual time of day
// ============================================================

function getHour() {
    return new Date().getHours();
}

function getPeriod() {
    var h = getHour();
    if (h >= 5 && h < 12) return 'morning';   // 5am - 11:59am
    if (h >= 12 && h < 17) return 'afternoon'; // 12pm - 4:59pm
    if (h >= 17 && h < 22) return 'evening';   // 5pm - 9:59pm
    return 'night';                            // 10pm - 4:59am
}

// Replies that only make sense at certain times
var BAD_BY_PERIOD = {
    morning: [
        /good night/i, /goodnight/i, /sleep well/i, /night o/i, /later o.*sleep/i,
        /^night/i, /^good evening/i, /^good afternoon/i, /^evening/i
    ],
    afternoon: [
        /good night/i, /goodnight/i, /sleep well/i, /^night/i, /^morning/i,
        /^good morning/i, /^morn don break/i, /^evening o$/i
    ],
    evening: [
        /^good morning/i, /^morning/i, /^morn don break/i, /good night/i,
        /sleep well.*now/i
    ],
    night: [
        /^good morning/i, /^morning o/i, /^morn don break/i, /^good afternoon/i,
        /^afternoon o/i, /^good evening/i, /^evening o$/i
    ]
};

// Pick a time-appropriate reply from the pool

// Extra: morning-only replies are banned outside morning
var MORNING_ONLY = [
    /hope you slept well/i, /slept well/i, /morn don break/i,
    /morning o/i, /^morning/i, /good morning/i,
    /bright and early/i, /top of the morning/i, /rise and shine/i,
    /^gm\b/i, /^gm!/i, /^gm\s/i, /^morning/i, /^good morning/i,
    /morning hey/i, /morning jare/i, /morning chief/i,
    /ehen morning/i, /morn o/i, /morn don break/i,
    /^morn/i
];

// Afternoon-only replies
var AFTERNOON_ONLY = [
    /afternoon o/i, /^afternoon/i, /good afternoon/i, /^afternoon!/i
];

// Evening-only replies
var EVENING_ONLY = [
    /evening o/i, /^evening/i, /good evening/i
];

// Night-only replies
var NIGHT_ONLY = [
    /^night o/i, /^good night/i, /^goodnight/i, /sleep well/i,
    /later o.*night/i
];

function isTimeMismatch(reply, period) {
    if (!reply || !period) return false;
    if (period !== 'morning') {
        for (var i = 0; i < MORNING_ONLY.length; i++) {
            if (MORNING_ONLY[i].test(reply)) return true;
        }
    }
    if (period !== 'afternoon') {
        for (var j = 0; j < AFTERNOON_ONLY.length; j++) {
            if (AFTERNOON_ONLY[j].test(reply)) return true;
        }
    }
    if (period !== 'evening') {
        for (var k = 0; k < EVENING_ONLY.length; k++) {
            if (EVENING_ONLY[k].test(reply)) return true;
        }
    }
    if (period !== 'night') {
        for (var l = 0; l < NIGHT_ONLY.length; l++) {
            if (NIGHT_ONLY[l].test(reply)) return true;
        }
    }
    return false;
}

// Time-appropriate generic fallbacks (if all pool replies are filtered out)
var TIME_FALLBACKS = {
    morning: ['Morning! ☀️', 'Morning o', 'Morn don break 🌞', 'Good morning!', 'Hey! Morning ☀️'],
    afternoon: ['Afternoon o', 'Good afternoon ☀️', 'Afternoon!', 'Hey!', 'Hi there'],
    evening: ['Evening o 🌆', 'Good evening 🌙', 'Evening!', 'Hey!', 'Hi there'],
    night: ['Night o 🌙', 'Good night', 'Evening o', 'Hey!', 'Sleep well 😴']
};

function getTimeFallback(period) {
    var arr = TIME_FALLBACKS[period] || TIME_FALLBACKS.afternoon;
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickTimeAppropriate(pool, period) {
    if (!pool || !pool.length) return null;
    var badPatterns = BAD_BY_PERIOD[period] || [];
    var valid = pool.filter(function (reply) {
        // Old filter
        for (var i = 0; i < badPatterns.length; i++) {
            if (badPatterns[i].test(reply)) return false;
        }
        // NEW: strict time-mismatch filter
        if (isTimeMismatch(reply, period)) return false;
        return true;
    });
    // If nothing survived, use a time-appropriate fallback
    if (!valid.length) return getTimeFallback(period);
    return valid[Math.floor(Math.random() * valid.length)];
}

// Check if a reply is time-inappropriate (used as a final safety filter)
function isTimeInappropriate(reply, period) {
    if (!reply || !period) return false;
    var badPatterns = BAD_BY_PERIOD[period] || [];
    for (var i = 0; i < badPatterns.length; i++) {
        if (badPatterns[i].test(reply)) return true;
    }
    return false;
}

// Replace bad greeting with good one for the current time
function fixGreeting(reply, period) {
    if (!reply) return reply;
    var h = getHour();
    var isMorning = period === 'morning';
    var isAfternoon = period === 'afternoon';
    var isEvening = period === 'evening';
    var isNight = period === 'night';

    // If it says "morning" but it's not morning
    if (!isMorning && /morning/i.test(reply)) {
        if (isAfternoon) return reply.replace(/morning\s*(o|chief)?\s*[☀️🌞😴]*/gi, 'afternoon').trim() || 'Good afternoon';
        if (isEvening) return reply.replace(/morning\s*(o|chief)?\s*[☀️🌞😴]*/gi, 'evening').trim() || 'Good evening';
        if (isNight) return reply.replace(/morning\s*(o|chief)?\s*[☀️🌞😴]*/gi, 'evening').trim() || 'Good evening';
    }
    // If it says "good night" during the day
    if (!isNight && /good ?night|sleep well/i.test(reply)) {
        if (isMorning) return 'Morning ☀️';
        if (isAfternoon) return 'Afternoon ☀️';
        return 'Good evening 🌙';
    }
    // If it says "evening" in morning
    if (isMorning && /\b(evening|night)\b/i.test(reply) && !/good ?night/i.test(reply)) {
        return reply.replace(/evening\s*(o)?/gi, 'morning').replace(/night\s*(o)?/gi, 'morning').trim();
    }
    return reply;
}

module.exports = {
    isTimeMismatch: isTimeMismatch,
    getTimeFallback: getTimeFallback,
    getPeriod,
    getHour,
    pickTimeAppropriate,
    isTimeInappropriate,
    fixGreeting
};
