// QA: Solutions formats visual at three scroll points (desktop) and stacked (mobile).
import { chromium } from 'playwright-core';
const out = process.argv[2];
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errs = [];
for (const mode of ['desktop', 'mobile']) {
  const ctx = await browser.newContext(mode === 'mobile' ? { viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto('http://localhost:5173/services', { waitUntil: 'networkidle' });
  await page.waitForSelector('.ld2', { state: 'detached', timeout: 60000 });
  await page.waitForTimeout(1000);
  const pts = mode === 'desktop' ? [0.15, 0.5, 0.85] : [0, 0.34, 0.67];
  for (const [i, f] of pts.entries()) {
    await page.evaluate((f) => {
      const s = document.querySelector('.fv');
      const items = document.querySelectorAll('.fv-item');
      if (items.length) window.scrollTo(0, items[Math.round(f * 3)].getBoundingClientRect().top + scrollY - 80);
      else window.scrollTo(0, s.offsetTop + (s.offsetHeight - innerHeight) * f);
    }, f);
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${out}-${mode}-${i}.png` });
  }
  await ctx.close();
}
console.log('errors', JSON.stringify(errs));
await browser.close();
