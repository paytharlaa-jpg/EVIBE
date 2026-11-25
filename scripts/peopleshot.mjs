// QA: render one person GLB with a clip in dev/people.html. node peopleshot.mjs query out.png
import { chromium } from 'playwright-core';
const [query, out] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 700, height: 700 } })).newPage();
page.on('pageerror', (e) => console.log('ERR', e.message));
await page.goto('http://localhost:5173/dev/people.html?' + query);
await page.waitForFunction(() => window.__info, null, { timeout: 120000 });
console.log(JSON.stringify(await page.evaluate(() => window.__info)));
await page.screenshot({ path: out });
await browser.close();
