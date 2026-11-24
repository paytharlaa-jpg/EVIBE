import { chromium } from 'playwright-core';
import fs from 'node:fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto(process.argv[3] || 'http://localhost:5173/');
const t0 = Date.now();
for (const ms of [300, 800, 1300, 1900, 2500, 3300, 4300]) {
  await page.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
  await page.screenshot({ path: `${out}/l-${String(ms).padStart(5, '0')}.png` });
}
await browser.close();
