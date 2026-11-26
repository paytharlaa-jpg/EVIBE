// QA: one screenshot of a path at a scroll position. node shot1.mjs path out.png [scrollY] [mobile]
import { chromium } from 'playwright-core';
const [path, out, y = '0', mode = 'desktop'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext(mode === 'mobile' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('ERR', e.message));
await page.goto('http://localhost:5173' + path, { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 60000 });
await page.evaluate((y) => { const el = /^[.#]/.test(y) ? document.querySelector(y) : null; window.scrollTo(0, el ? el.getBoundingClientRect().top + scrollY : +y); }, y);
await page.waitForTimeout(5000);
await page.screenshot({ path: out });
await browser.close();
