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
function pickTimeAppropriate(pool, period) {
    if (!pool || !pool.length) return null;
    var badPatterns = BAD_BY_PERIOD[period] || [];
    var valid = pool.filter(function (reply) {
        for (var i = 0; i < badPatterns.length; i++) {
            if (badPatterns[i].test(reply)) return false;
        }
        return true;
    });
    // If all were filtered out, use the original pool
    if (!valid.length) return pool[Math.floor(Math.random() * pool.length)];
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
    getPeriod,
    getHour,
    pickTimeAppropriate,
    isTimeInappropriate,
    fixGreeting
};
