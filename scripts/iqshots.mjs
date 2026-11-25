// QA: screenshots of the EVIBE IQ page (desktop or mobile).
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const [mode = 'desktop', out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext(mode === 'mobile' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
const shots = [
  ['.iqh', 0, 'hero'], ['.iqd', 0, 'does'], ['.iqf', 0.05, 'f1'], ['.iqf', 0.5, 'f4'], ['.iqf', 0.95, 'f6'],
  ['.iqw', 0.2, 'how'], ['.iqu', 0, 'uses'], ['.iqo', 0, 'outputs'], ['.iqo-private', 0, 'private'], ['.iqc', 0, 'cta'], ['#iq-enquiry', 0, 'form'],
];
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await page.goto('http://localhost:5173/iq', { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 60000 });
await page.waitForTimeout(3500);
let i = 0;
for (const [sel, f, name] of shots) {
  await page.evaluate(([sel, f]) => { const el = document.querySelector(sel); const top = el.getBoundingClientRect().top + scrollY; window.scrollTo(0, top + Math.max(0, el.offsetHeight - innerHeight) * f + (f === 0 && sel !== '.iqh' ? -40 : 0)); }, [sel, f]);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${out}/${mode}-${String(i++).padStart(2, '0')}-${name}.png` });
}
const ow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
console.log('overflow', ow, 'errors', JSON.stringify(errs.slice(0, 5)));
await browser.close();
