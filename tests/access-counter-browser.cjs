const {chromium, webkit, devices} = require(process.env.COIN_SHOOTING_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const useWebkit = process.env.COIN_SHOOTING_BROWSER === 'webkit';
  const browser = await (useWebkit ? webkit : chromium).launch(useWebkit ? {headless:true} : {headless:true, channel:'chrome'});
  try {
    for (const outcome of ['success', 'offline', 'throw', 'pending']) {
      const page = await browser.newPage(devices['iPad (gen 7)']);
      const requests = [], errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route('https://script.google.com/**', route => {
        requests.push(route.request().url());
        return outcome === 'offline' ? route.abort('failed') : route.fulfill({status:200, body:'OK'});
      });
      await page.addInitScript(outcome => {
        const original = window.fetch;
        window.counterCalls = [];
        window.fetch = function(url, options) {
          if (String(url).startsWith('https://script.google.com/')) {
            window.counterCalls.push({url:String(url), options});
            if (outcome === 'throw') throw Error('unavailable');
            if (outcome === 'pending') return new Promise(() => {});
          }
          return original.call(this, url, options);
        };
      }, outcome);
      await page.goto(process.env.COIN_SHOOTING_URL || 'http://127.0.0.1:8002');
      await page.waitForFunction(() => window.counterCalls.length === 1);
      const call = (await page.evaluate(() => window.counterCalls))[0];
      assert.equal(new URL(call.url).searchParams.get('app'), 'coin-shooting');
      assert.equal(call.options.mode, 'no-cors');
      await page.locator('#pull').evaluate(e => {e.value='10';e.dispatchEvent(new Event('input',{bubbles:true}));});
      await page.locator('#start').click();
      await page.locator('#single').click();
      await page.waitForFunction(() => !document.querySelector('#single').disabled);
      assert.equal(await page.locator('#arena').getAttribute('data-coins'), '1');
      await page.locator('#bin').selectOption('5');
      await page.locator('#reg-type').selectOption('multiple');
      await page.locator('#speed').selectOption('30');
      await page.locator('#auto').click();
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('coin-shooting-v1')).experiments[0].shots.length === 10);
      await page.locator('#weight').evaluate(e => {e.value='9';e.dispatchEvent(new Event('input',{bubbles:true}));});
      assert.equal(await page.evaluate(() => window.counterCalls.length), 1);
      assert.equal(await page.locator('#access-count').count(), 0);
      const saved = await page.evaluate(() => localStorage.getItem('coin-shooting-v1'));
      await page.reload();
      await page.waitForFunction(() => window.counterCalls.length === 1);
      assert.equal(await page.evaluate(() => localStorage.getItem('coin-shooting-v1')), saved);
      if (outcome === 'success' || outcome === 'offline') {
        await page.waitForFunction(() => window.counterCalls.length === 1);
        await page.waitForTimeout(100);
        assert.equal(requests.length, 2);
      } else assert.equal(requests.length, 0);
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`PASS: ${outcome}, one attempt/load and new attempt/reload, no operation sends, experiments/analysis/storage work`);
    }
  } finally {await browser.close();}
})().catch(error => {console.error(error);process.exitCode=1;});
