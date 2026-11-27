// QA: Pay & Charge page frames (desktop journey positions + mobile) and nav fit.
import { chromium } from 'playwright-core';
const out = process.argv[2];
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errs = [];
for (const [mode, vp] of [['desktop', { width: 1440, height: 900 }], ['laptop', { width: 1280, height: 800 }], ['mobile', { width: 393, height: 852 }]]) {
  const ctx = await browser.newContext(mode === 'mobile' ? { viewport: vp, isMobile: true, hasTouch: true } : { viewport: vp });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errs.push(mode + ' ' + e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push(mode + ' ' + m.text().slice(0, 160)));
  await page.goto('http://localhost:5173/pay-and-charge', { waitUntil: 'networkidle' });
  await page.waitForSelector('.ld2', { state: 'detached', timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}-${mode}-0.png` });
  if (mode === 'laptop') { await ctx.close(); continue; }
  const pts = mode === 'desktop' ? ['p0.1', 'p0.55', 'p0.95', '.pcr'] : ['#journey', '.pcj-item:nth-child(4)', '.pcr'];
  for (const [i, pt] of pts.entries()) {
    await page.evaluate((pt) => {
      if (pt.startsWith('p')) { const s = document.querySelector('.pcj'); window.scrollTo(0, s.offsetTop + (s.offsetHeight - innerHeight) * +pt.slice(1)); }
      else { const el = document.querySelector(pt); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 60); }
    }, pt);
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${out}-${mode}-${i + 1}.png` });
  }
  console.log(mode, 'overflowX', await page.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  await ctx.close();
}
console.log('errors', JSON.stringify(errs));
await browser.close();
