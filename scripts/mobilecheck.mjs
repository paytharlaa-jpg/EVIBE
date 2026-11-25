// QA (phone): no smooth-scroller on touch, canvas never resizes while scrolling, no errors.
import { chromium } from 'playwright-core';
const path = process.argv[2] || '/';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA })).newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 160)));
await page.goto('http://localhost:5173' + path, { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 90000 }).catch(() => {});
await page.waitForTimeout(3000);
const info = await page.evaluate(async () => {
  const c = document.querySelector('canvas');
  const sizes = new Set();
  const H = Math.min(document.documentElement.scrollHeight - innerHeight, innerHeight * 12);
  for (let y = 0; y < H; y += 120) {
    window.scrollTo(0, y);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    if (c) sizes.add(c.width + 'x' + c.height);
  }
  return { lenis: document.documentElement.classList.contains('lenis'), locked: document.documentElement.classList.contains('scroll-lock'), canvasSizes: [...sizes], stage: getComputedStyle(document.querySelector('.story-stage, .svf-stage') || document.body).height };
});
console.log(path, JSON.stringify(info), 'errors', JSON.stringify(errs.slice(0, 4)));
await browser.close();
