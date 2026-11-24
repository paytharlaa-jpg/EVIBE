// QA: full-size frames of the home film at chosen story progress values.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const [mode = 'desktop', out = 'story', list = '0.05,0.25,0.42,0.56,0.6,0.72,0.8,0.93,0.99'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext(mode === 'mobile' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
await page.goto(process.env.URL || 'http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 40000 });
for (const p of list.split(',').map(Number)) {
  await page.evaluate((p) => { const s = document.querySelector('.story'); window.scrollTo(0, s.offsetTop + (s.offsetHeight - innerHeight) * p); }, p);
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${out}/${mode}-p${String(Math.round(p * 1000)).padStart(4, '0')}.png` });
}
console.log('errors:', errs.length ? errs : 'none');
await browser.close();
