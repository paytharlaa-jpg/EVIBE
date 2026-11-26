// QA: frames of an IQ section while its entrance plays, then after hover.
import { chromium } from 'playwright-core';
const [out, sel = '.iqo-docs'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto('http://localhost:5173/iq', { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 90000 });
await page.waitForTimeout(1500);
await page.evaluate((s) => { const el = document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 250); }, sel);
for (const [i, t] of [[0, 300], [1, 900], [2, 2500]]) {
  await page.waitForTimeout(t);
  await page.screenshot({ path: `${out}-${i}.png` });
}
const box = await page.locator('.iqo-doc').nth(1).boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}-hover.png` });
console.log(await page.evaluate(() => [...document.querySelectorAll('.iqo-doc')].map((d) => getComputedStyle(d).transform + ' | ' + getComputedStyle(d).rotate).join('\n')));
await browser.close();
