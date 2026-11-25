// QA: evenly spaced screenshots of each page at a viewport (layout review).
// node layout.mjs <tablet|mobile|ipad-land> <outdir> [paths comma list] [shots per page]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const [mode = 'tablet', out, list = '/about,/franchise,/iq,/partner,/contact,/gallery,/faq', nShots = '8'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const VP = { tablet: { width: 820, height: 1180 }, 'ipad-land': { width: 1180, height: 820 }, mobile: { width: 390, height: 844 } }[mode];
const touch = mode !== 'ipad-land' ? { isMobile: true, hasTouch: true } : { hasTouch: true };
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: VP, deviceScaleFactor: 1, ...touch });
for (const path of list.split(',')) {
  const page = await ctx.newPage();
  await page.goto('http://localhost:5173' + path, { waitUntil: 'networkidle' });
  await page.waitForSelector('.ld2', { state: 'detached', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let y = 0; y <= H; y += 600) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(60); }
  const ow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(path, 'overflowX', ow);
  const n = +nShots;
  for (let i = 0; i < n; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round((H * i) / (n - 1)));
    await page.waitForTimeout(1300);
    await page.screenshot({ path: `${out}/${mode}-${path.replace(/\W/g, '') || 'home'}-${i}.png`, timeout: 120000 });
  }
  await page.close();
}
await browser.close();
