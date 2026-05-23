const fs = require('fs');
const frDict = JSON.parse(fs.readFileSync('src/i18n/locales/fr/common.json', 'utf8'));
const arDict = JSON.parse(fs.readFileSync('src/i18n/locales/ar/common.json', 'utf8'));

const paths = [
    'dashboard.operateur.dashboard.soumissions.mesSoumissions',
    'dashboard.operateur.dashboard.soumissions.wizard',
    'dashboard.operateur.dashboard.recours.mesRecours',
    'dashboard.operateur.dashboard.recours.create',
];

for (const lang of [{name: 'FR', dict: frDict}, {name: 'AR', dict: arDict}]) {
    console.log(`\n=== ${lang.name} ===`);
    for (const p of paths) {
        let curr = lang.dict;
        let ok = true;
        for (const part of p.split('.')) {
            if (!curr || !curr[part]) { ok = false; break; }
            curr = curr[part];
        }
        const keys = ok && typeof curr === 'object' ? Object.keys(curr).join(', ') : '';
        console.log(`  ${p} → ${ok ? `✅ [${keys}]` : '❌ MISSING'}`);
    }
}
