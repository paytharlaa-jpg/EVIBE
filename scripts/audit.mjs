// QA: every page — console errors/warnings, failed requests, horizontal overflow, broken images,
// and frames of the approach into the footer.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const [mode = 'desktop', out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext(mode === 'mobile' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
for (const path of ['/', '/about', '/services', '/franchise', '/iq', '/partner', '/gallery', '/faq', '/contact']) {
  const page = await ctx.newPage();
  const log = [];
  page.on('pageerror', (e) => log.push('PAGEERROR ' + String(e).slice(0, 200)));
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && !/GPU stall|GL Driver|DevTools|THREE.Clock/.test(m.text()) && log.push(m.type().toUpperCase() + ' ' + m.text().slice(0, 200)));
  page.on('requestfailed', (r) => log.push('REQFAIL ' + r.url()));
  page.on('response', (r) => r.status() >= 400 && log.push('HTTP ' + r.status() + ' ' + r.url()));
  await page.goto('http://localhost:5173' + path, { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 60000 });
  await page.waitForTimeout(1500);
  // scroll through the whole page in steps so every trigger fires
  const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let y = 0; y <= H; y += 700) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(120); }
  const name = path === '/' ? 'home' : path.slice(1);
  const ftTop = await page.evaluate(() => document.querySelector('footer').offsetTop);
  for (const [i, off] of [[0, 0.9], [1, 0.55], [2, 0.2], [3, 0]]) {
    await page.evaluate(([t, o]) => window.scrollTo(0, t - innerHeight * o), [ftTop, off]);
    await page.waitForTimeout(1300);
    if (path === '/about' || path === '/' ) await page.screenshot({ path: `${out}/${mode}-${name}-ft${i}.png` });
  }
  const checks = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - innerWidth,
    brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
    title: document.title,
    h1: document.querySelectorAll('h1').length,
  }));
  console.log(name, JSON.stringify(checks), log.length ? '\n  ' + [...new Set(log)].join('\n  ') : '');
  await page.close();
}
await browser.close();
