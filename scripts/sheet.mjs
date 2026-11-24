import sharp from 'sharp'; import fs from 'node:fs'; import path from 'node:path';
const [dir, prefix, out, cols = 5, w = 360] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter(f => f.startsWith(prefix) && f.endsWith('.png')).sort();
const first = await sharp(path.join(dir, files[0])).metadata();
const h = Math.round(w * first.height / first.width), C = Number(cols), W = Number(w);
const rows = Math.ceil(files.length / C);
const comps = await Promise.all(files.map(async (f, i) => ({ input: await sharp(path.join(dir, f)).resize(W, h).toBuffer(), left: (i % C) * (W + 4), top: Math.floor(i / C) * (h + 4) })));
await sharp({ create: { width: C * (W + 4), height: rows * (h + 4), channels: 3, background: '#f00' } }).composite(comps).jpeg({ quality: 80 }).toFile(out);
console.log(files.length, 'files');
