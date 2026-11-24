import fs from 'node:fs'; import path from 'node:path'; import wawoff2 from 'wawoff2';
const dir = path.resolve(import.meta.dirname, '..', 'public', 'fonts');
const keep = { 'RedHatDisplay-VariableFont_wght.ttf': 'redhat-display.woff2', 'PlusJakartaSans-VariableFont_wght.ttf': 'jakarta.woff2', 'PlusJakartaSans-Italic-VariableFont_wght.ttf': 'jakarta-italic.woff2' };
for (const [src, out] of Object.entries(keep)) fs.writeFileSync(path.join(dir, out), Buffer.from(await wawoff2.compress(fs.readFileSync(path.join(dir, src)))));
for (const f of fs.readdirSync(dir)) if (f.endsWith('.ttf')) fs.unlinkSync(path.join(dir, f));
console.log(fs.readdirSync(dir).map(f => f + ' ' + fs.statSync(path.join(dir, f)).size).join('\n'));
