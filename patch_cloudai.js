const fs = require('fs');
let s = fs.readFileSync('index.js', 'utf8');
let changed = 0;

// 1. Add KEY_POOL near top (after DATA_ROOT)
if (!s.includes('const KEY_POOL')) {
    s = s.replace(
        /const DATA_ROOT = process\.env\.DATA_ROOT \|\| '\.';/,
        `const DATA_ROOT = process.env.DATA_ROOT || '.';

const KEY_POOL = {
    groq: [
        process.env.GROQ_KEY || ''
    ],
    cerebras: [
        process.env.CEREBRAS_KEY_1 || '',
        process.env.CEREBRAS_KEY_2 || '',
        process.env.CEREBRAS_KEY_3 || '',
        process.env.CEREBRAS_KEY_4 || ''
    ],
    cohere: [
        process.env.COHERE_KEY || ''
    ],
    mistral: [
        process.env.MISTRAL_KEY || ''
    ]
};`
    );
    changed++;
    console.log('✓ KEY_POOL added');
}

// 2. Replace entire askAI function with cloud-first version
const newAskAI = `async function askAI(q, opts) {
    opts = opts || {};

    var rules =
        '\\n\\nIMPORTANT RULES:\\n' +
        '- Read the recent conversation before replying.\\n' +
        '- Do NOT repeat a question you already asked.\\n' +
        '- Do NOT repeat an answer or use nearly identical wording.\\n' +
        '- Respond directly to what the person just said.\\n' +
        '- Keep replies SHORT (1-2 sentences).\\n' +
        '- NEVER start your reply with a label (no You:, Person:, me:, them:, Chidi:).\\n';

    var sp = (opts.systemPrompt || '') + rules;

    var moods = [
        'You are feeling cheerful and playful today.',
        'You are feeling a bit sassy and bold today.',
        'You are feeling chill and laid back today.',
        'You are feeling shy and sweet today.',
        'You are feeling energetic and excited today.',
        'You are feeling a bit moody today.',
        'You are feeling flirty and fun today.',
        'You are feeling curious and chatty today.'
    ];
    sp = moods[Math.floor(Math.random() * moods.length)] + ' ' + sp;

    var messages = [];
    if (sp) messages.push({ role: 'system', content: sp });
    messages.push({ role: 'user', content: q });

    // 1. Groq
    for (var g = 0; g < KEY_POOL.groq.length; g++) {
        if (!KEY_POOL.groq[g]) continue;
        try {
            var rG = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + KEY_POOL.groq[g], 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: messages, max_tokens: 300, temperature: 0.9 })
            });
            var dG = await rG.json();
            if (dG.choices && dG.choices[0] && dG.choices[0].message && dG.choices[0].message.content) {
                console.log('[AI] OK via Groq');
                return dG.choices[0].message.content;
            }
            if (dG.error) console.log('[AI] Groq err:', JSON.stringify(dG.error).substring(0, 120));
        } catch (e) { console.log('[AI] Groq:', e.message); }
    }

    // 2. Cerebras (4 keys, try each)
    var cModels = ['llama-3.3-70b', 'llama3.1-8b'];
    for (var c = 0; c < KEY_POOL.cerebras.length; c++) {
        if (!KEY_POOL.cerebras[c]) continue;
        for (var cm = 0; cm < cModels.length; cm++) {
            try {
                var rC = await fetch('https://api.cerebras.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + KEY_POOL.cerebras[c], 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: cModels[cm], messages: messages, max_tokens: 300, temperature: 0.9 })
                });
                var dC = await rC.json();
                if (dC.choices && dC.choices[0] && dC.choices[0].message && dC.choices[0].message.content) {
                    console.log('[AI] OK via Cerebras key#' + c);
                    return dC.choices[0].message.content;
                }
                if (dC.error) console.log('[AI] Cerebras err:', JSON.stringify(dC.error).substring(0, 120));
            } catch (e) { console.log('[AI] Cerebras:', e.message); }
        }
    }

    // 3. Mistral
    for (var m = 0; m < KEY_POOL.mistral.length; m++) {
        if (!KEY_POOL.mistral[m]) continue;
        try {
            var rM = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + KEY_POOL.mistral[m], 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'mistral-small-latest', messages: messages, max_tokens: 300, temperature: 0.9 })
            });
            var dM = await rM.json();
            if (dM.choices && dM.choices[0] && dM.choices[0].message && dM.choices[0].message.content) {
                console.log('[AI] OK via Mistral');
                return dM.choices[0].message.content;
            }
            if (dM.error) console.log('[AI] Mistral err:', JSON.stringify(dM.error).substring(0, 120));
        } catch (e) { console.log('[AI] Mistral:', e.message); }
    }

    // 4. Cohere
    for (var co = 0; co < KEY_POOL.cohere.length; co++) {
        if (!KEY_POOL.cohere[co]) continue;
        try {
            var rCo = await fetch('https://api.cohere.com/v2/chat', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + KEY_POOL.cohere[co], 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'command-r-08-2024', messages: messages, max_tokens: 300 })
            });
            var dCo = await rCo.json();
            if (dCo.message && dCo.message.content && dCo.message.content[0] && dCo.message.content[0].text) {
                console.log('[AI] OK via Cohere');
                return dCo.message.content[0].text;
            }
            if (dCo.error) console.log('[AI] Cohere err:', JSON.stringify(dCo.error).substring(0, 120));
        } catch (e) { console.log('[AI] Cohere:', e.message); }
    }

    console.log('[AI] ALL PROVIDERS FAILED');
    return null;
}`;

// Find old askAI function and replace it
var re = /async function askAI\(q, opts\) \{[\s\S]*?\n\}/;
if (re.test(s)) {
    s = s.replace(re, newAskAI);
    changed++;
    console.log('✓ askAI function replaced');
} else {
    console.log('❌ could not find askAI function');
}

fs.writeFileSync('index.js', s);
console.log('---');
console.log('Total changes: ' + changed);
