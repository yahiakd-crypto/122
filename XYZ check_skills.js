const fs = require('fs');
const path = 'C:/Users/yahia/Downloads/New folder/BUILD THE AI PRODUCT RESEARCH & LANDING PAGE STRATEGY APP/lib/canvas/SkillRegistry.js';
const src = fs.readFileSync(path, 'utf8');

const m = src.match(/export const SKILLS_DICT = \{([\s\S]*)\n\};/);
const body = m[1];
const keys = [...body.matchAll(/^\s{2}(\w+):\s*[{\s]/gm)].map(x => x[1]);
const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
console.log('dict keys:', keys.length, 'dups:', JSON.stringify([...new Set(dup)]));

const icons = [...body.matchAll(/icon: "([A-Za-z0-9]+)"/g)].map(x => x[1]);
const catsMatch = src.match(/export const SKILL_CATEGORIES = \{[\s\S]*?\n\};/);
const catIcons = [...catsMatch[0].matchAll(/icon: "([A-Za-z0-9]+)"/g)].map(x => x[1]);
const all = [...new Set([...icons, ...catIcons])];

let lucide;
try { lucide = require('C:/Users/yahia/Downloads/New folder/BUILD THE AI PRODUCT RESEARCH & LANDING PAGE STRATEGY APP/node_modules/lucide-react'); }
catch (e) { console.log('lucide import failed:', e.message); process.exit(0); }
const missing = all.filter(n => !lucide[n]);
console.log('explicit icons:', all.length, 'missing from lucide:', JSON.stringify(missing));