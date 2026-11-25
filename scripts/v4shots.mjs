// QA: screenshots of the new content sections (desktop or mobile).
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const [mode = 'desktop', out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext(mode === 'mobile' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
const shots = [
  ['/', '.ip', 0.1, 'home-intro'],
  ['/', '.eco-wheel', 0, 'home-eco'],
  ['/', '.ft2', 0.1, 'home-franchise'],
  ['/franchise', '.ph', 0, 'fr-hero'],
  ['/franchise', '.fw', 0.55, 'fr-words'],
  ['/franchise', '.fb', 0.1, 'fr-t1'],
  ['/franchise', '.fb', 0.5, 'fr-t2'],
  ['/franchise', '.fb', 0.85, 'fr-t3'],
  ['/franchise', '.fc', 0.05, 'fr-compare'],
  ['/franchise', '#enquiry', 0, 'fr-enquiry'],
  ['/partner', '.ph', 0, 'pa-hero'],
  ['/partner', '.ptn', 0, 'pa-types'],
  ['/partner', '.lo', 0.05, 'pa-land'],
  ['/about', '.tx', 0.05, 'ab-tech'],
];
let page; let last = '';
for (const [path, sel, f, name] of shots) {
  if (path !== last) {
    page = await ctx.newPage();
    await page.goto('http://localhost:5173' + path, { waitUntil: 'networkidle' });
    await page.waitForSelector('.ld2', { state: 'detached', timeout: 60000 });
    await page.waitForTimeout(1200);
    last = path;
  }
  await page.evaluate(([sel, f]) => { const el = document.querySelector(sel); const top = el.getBoundingClientRect().top + scrollY; window.scrollTo(0, top + Math.max(0, el.offsetHeight - innerHeight) * f + (f === 0 && sel !== '.ph' ? -40 : 0)); }, [sel, f]);
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${out}/${mode}-${String(shots.findIndex((s) => s[3] === name)).padStart(2, '0')}-${name}.png` });
}
await browser.close();
