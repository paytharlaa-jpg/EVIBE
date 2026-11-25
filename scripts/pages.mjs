// QA: each page loaded directly: hero + 3 scroll positions; plus a click-through transition.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const [mode = 'desktop', out = 'pages'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext(mode === 'mobile' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
const errs = [];
for (const path of ['/about', '/services', '/gallery', '/testimonials', '/faq', '/contact']) {
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errs.push(path + ' ' + String(e)));
  await page.goto('http://localhost:5173' + path, { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 40000 });
  await page.waitForTimeout(2600);
  const name = path.slice(1);
  await page.screenshot({ path: `${out}/${mode}-${name}-0.png` });
  const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const [i, f] of [[1, 0.25], [2, 0.5], [3, 0.8]]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(H * f));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}/${mode}-${name}-${i}.png` });
  }
  await page.close();
}
// transition: home → services via nav
const page = await ctx.newPage();
page.on('pageerror', (e) => errs.push('nav ' + String(e)));
await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 40000 });
await page.waitForTimeout(1500);
if (mode === 'mobile') { await page.click('.menu-btn'); await page.waitForTimeout(1300); await page.click('.menu-link >> text=Services'); }
else await page.click('.nav-inline >> text=Services');
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/${mode}-zz-transition.png` });
await page.waitForTimeout(2500);
console.log('url after nav:', page.url(), 'title:', await page.title());
console.log('errors:', errs.length ? errs : 'none');
await browser.close();
