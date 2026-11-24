import { chromium } from 'playwright-core';
import fs from 'node:fs';
const [mode = 'desktop', out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext(mode === 'mobile' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } })).newPage();
const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
await page.goto('http://localhost:5173/contact', { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 40000 });
await page.waitForTimeout(2500);
const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
for (const [i, f] of [[0, 0], [1, 0.35], [2, 0.7], [3, 0.97]]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(H * f));
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${out}/${mode}-c${i}.png` });
}
if (mode === 'desktop') { await page.mouse.move(700, 450); await page.hover('.ct-card >> nth=0'); await page.waitForTimeout(500); await page.screenshot({ path: `${out}/${mode}-c9-cursor.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } }); }
console.log('errors', errs.length ? errs : 'none');
await browser.close();
