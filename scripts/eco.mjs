import { chromium } from 'playwright-core';
const [mode = 'desktop', out] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext(mode === 'mobile' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 1000 } })).newPage();
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 60000 });
await page.evaluate(() => { const el = document.querySelector('.eco-wheel'); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - (innerHeight - el.offsetHeight) / 2); });
await page.waitForTimeout(5000);
await page.screenshot({ path: `${out}/${mode}-eco.png` });
if (mode === 'mobile') { await page.evaluate(() => window.scrollBy(0, 700)); await page.waitForTimeout(1500); await page.screenshot({ path: `${out}/${mode}-eco-list.png` }); }
await browser.close();
