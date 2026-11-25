import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 60000 });
await page.evaluate(() => { const el = document.querySelector('.eco-wheel'); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 100); });
for (const w of [1000, 3000, 6000]) {
  await page.waitForTimeout(w);
  const r = await page.evaluate(async () => {
    let n = 0; const t0 = performance.now();
    await new Promise((res) => { const f = () => { n++; performance.now() - t0 < 1000 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
    const el = document.querySelector('.eco-node-in'); const cs = getComputedStyle(el);
    return { fps: n, nodeOpacity: cs.opacity, nodeTransform: cs.transform.slice(0, 40), storyCanvas: !!document.querySelector('.story canvas') };
  });
  console.log(w, JSON.stringify(r));
}
await browser.close();
