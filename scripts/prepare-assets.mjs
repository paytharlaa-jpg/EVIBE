// Copies brand assets and converts photos to responsive WebP/AVIF.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const pub = path.resolve(import.meta.dirname, '..', 'public');
const kit = path.join(root, 'logo/EVIBE_Brand_Kit_2026/Option_2_Bold_Motion');
const mk = (d) => fs.mkdirSync(d, { recursive: true });

// Photos -> named, responsive webp + avif
const photos = {
  'pexels-04iraq-35736783.jpg': 'charge-01',
  'pexels-giantasparagus-37576187.jpg': 'charge-02',
  'pexels-jakubzerdzicki-28851165.jpg': 'charge-03',
  'pexels-kindelmedia-9799724.jpg': 'charge-04',
  'pexels-matt-jerome-connor-1428905-14242296.jpg': 'charge-05',
  'pexels-nazar-kharin-2813332-39414338.jpg': 'charge-06',
  '3d-electric-car-charging-station.jpg': 'charge-07',
  'electric-car-charging-station.jpg': 'charge-08',
  'top-view-electric-cars-charging.jpg': 'charge-09',
};
mk(path.join(pub, 'img'));
const meta = {};
for (const [src, name] of Object.entries(photos)) {
  const input = path.join(root, 'images', src);
  const m = await sharp(input).metadata();
  meta[name] = { w: m.width, h: m.height };
  for (const w of [800, 1600]) {
    const p = sharp(input).rotate().resize({ width: Math.min(w, m.width) });
    await p.clone().webp({ quality: 74 }).toFile(path.join(pub, 'img', `${name}-${w}.webp`));
    await p.clone().avif({ quality: 52 }).toFile(path.join(pub, 'img', `${name}-${w}.avif`));
  }
}
fs.writeFileSync(path.join(import.meta.dirname, '..', 'src', 'imageMeta.json'), JSON.stringify(meta, null, 2));

// Logos (SVG) + icons
mk(path.join(pub, 'brand'));
const svgDir = path.join(kit, 'Logo_Files/6_SVG_Web');
for (const f of fs.readdirSync(svgDir)) fs.copyFileSync(path.join(svgDir, f), path.join(pub, 'brand', f));
const iconDir = path.join(kit, 'Logo_Files/7_App_Icon_Favicon_Social');
for (const f of fs.readdirSync(iconDir)) fs.copyFileSync(path.join(iconDir, f), path.join(pub, 'brand', f));

// Fonts -> woff2 not available via sharp; copy variable TTFs
mk(path.join(pub, 'fonts'));
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of walk(path.join(kit, 'Fonts'))) if (f.endsWith('.ttf')) fs.copyFileSync(f, path.join(pub, 'fonts', path.basename(f)));
console.log('done', Object.keys(meta).length, 'photos');
await import('./fonts.mjs');
