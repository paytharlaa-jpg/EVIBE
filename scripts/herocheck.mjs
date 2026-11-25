// QA: read the opening headline reveal state on a phone viewport.
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext(process.env.DESK ? { viewport: { width: 1280, height: 800 } } : { viewport: { width: 393, height: 852 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true })).newPage();
page.on('pageerror', (e) => console.log('ERR', e.message));
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 90000 });
for (const t of [500, 6000, 12000]) {
  await page.waitForTimeout(t);
  console.log(t, JSON.stringify(await page.evaluate(() => {
    const c = document.querySelector('[data-card]');
    const ch = c?.querySelectorAll('.sch');
    return { in: c?.style.getPropertyValue('--in'), vis: c && getComputedStyle(c).visibility, op: c && getComputedStyle(c).opacity, first: ch && getComputedStyle(ch[0]).opacity, last: ch && getComputedStyle(ch[ch.length - 1]).opacity, n: ch?.length, html: document.documentElement.className };
  })));
}
await browser.close();
