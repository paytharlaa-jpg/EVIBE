import { chromium } from 'playwright-core';
import fs from 'node:fs';
const [mode = 'desktop', out, path = '/about'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext(mode === 'mobile' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } })).newPage();
await page.goto('http://localhost:5173' + path, { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 60000 });
const info = await page.evaluate(() => ({ max: document.documentElement.scrollHeight - innerHeight, fh: document.querySelector('footer').offsetHeight, vh: innerHeight }));
console.log(info);
for (const [i, back] of [[0, 1.0], [1, 0.7], [2, 0.4], [3, 0.15], [4, 0]]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(info.max - info.fh * back));
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${out}/${mode}-f${i}.png` });
}
await browser.close();
