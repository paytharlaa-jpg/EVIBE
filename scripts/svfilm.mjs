// QA: full-size frames of the home film at chosen story progress values.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const [mode = 'desktop', out = 'story', list = '0.02,0.12,0.22,0.29,0.38,0.47,0.56,0.7,0.8,0.95'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext(mode === 'mobile' ? { viewport: { width: +(process.env.VW || 390), height: +(process.env.VH || 844) }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: process.env.UA || undefined } : { viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
await page.goto(process.env.URL || 'http://localhost:5173/services', { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 40000 });
await page.waitForSelector('.svf', { timeout: 60000 });
await page.waitForTimeout(4000);
for (const p of list.split(',').map(Number)) {
  await page.evaluate((p) => { const s = document.querySelector('.svf'); window.scrollTo(0, s.offsetTop + (s.offsetHeight - innerHeight) * p); }, p);
  await page.waitForTimeout(+(process.env.WAIT || 2600));
  await page.screenshot({ timeout: 240000, path: `${out}/${mode}-p${String(Math.round(p * 1000)).padStart(4, '0')}.png` });
}
console.log('errors:', errs.length ? errs : 'none');
await browser.close();
