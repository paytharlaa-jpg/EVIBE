import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 60000 });
const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const hits = new Map();
for (let y = 0; y <= H; y += 900) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(100);
  const r = await page.evaluate(() => {
    const W = document.documentElement.clientWidth; const out = [];
    for (const el of document.querySelectorAll('main *, footer *')) {
      if (el.closest('.menu, svg')) continue;
      const b = el.getBoundingClientRect();
      if (b.right > W + 1 && b.width > 0) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} right=${Math.round(b.right)} W=${W}`);
    }
    return { sw: document.documentElement.scrollWidth - W, out: out.slice(0, 5) };
  });
  if (r.sw > 0) r.out.forEach((o) => hits.set(o, y));
}
console.log(hits.size ? [...hits.entries()].slice(0, 10) : 'ok');
await browser.close();
