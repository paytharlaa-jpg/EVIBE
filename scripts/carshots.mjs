import { chromium } from 'playwright-core';
const out = process.argv[2];
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 900, height: 520 } })).newPage();
page.on('pageerror', (e) => console.log('ERR', String(e)));
for (const [car, paint] of (process.argv[3] ? [[process.argv[3], process.argv[4] || '%23B8121B']] : [['mustang', '%230561DF'], ['challenger', '%23B8121B'], ['amg', '%23E9EDF2']])) {
  for (const view of [0, 1, 2]) {
    await page.goto(`http://localhost:5173/dev/carview.html?car=${car}&paint=${paint}&view=${view}`);
    await page.waitForFunction(() => window.__ready, null, { timeout: 60000 });
    await page.waitForTimeout(300);
    if (view === 0) console.log(car, await page.textContent('#l'));
    await page.screenshot({ path: `${out}/${car}-${view}.png` });
  }
}
await browser.close();
