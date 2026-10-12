const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('access-counter.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const endpoint = 'https://script.google.com/macros/s/AKfycbxssCIHsD-N97SHxNC_GN0ihYeC0qy-lb-EY0KmSs6Gnztaph1sITMerLVEnNWOGkYc/exec?app=coin-shooting';
assert.equal((html.match(/src="access-counter.js"/g) || []).length, 1);
(async () => {
  for (const outcome of ['success', 'rejection', 'throw', 'unavailable', 'pending']) {
    let calls = [];
    const context = vm.createContext({window: {}, fetch: outcome === 'unavailable' ? undefined : (url, options) => {
      calls.push({url, options: JSON.parse(JSON.stringify(options))});
      if (outcome === 'throw') throw Error('unavailable');
      if (outcome === 'rejection') return Promise.reject(Error('offline'));
      if (outcome === 'pending') return new Promise(() => {});
      return Promise.resolve({type: 'opaque'});
    }});
    vm.runInContext(source, context);
    vm.runInContext(source, context); // Duplicate execution must not retry.
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(calls.length, outcome === 'unavailable' ? 0 : 1);
    if (calls.length) assert.deepEqual(calls[0], {url: endpoint, options: {
      method: 'GET', mode: 'no-cors', cache: 'no-store', credentials: 'omit', keepalive: true,
    }});
  }
  console.log('PASS: one attempt per document, duplicate guard, nonblocking pending request, rejected/synchronous/missing fetch; no real GAS requests');
})().catch(error => {console.error(error); process.exitCode = 1;});
