// Same recording endpoint/options as tower-of-hanoi and stat-golf.
// This endpoint returns an opaque response; no readable count API is configured.
(() => {
  if (window.coinShootingAccessRecorded) return;
  window.coinShootingAccessRecorded = true;
  try {
    fetch('https://script.google.com/macros/s/AKfycbxssCIHsD-N97SHxNC_GN0ihYeC0qy-lb-EY0KmSs6Gnztaph1sITMerLVEnNWOGkYc/exec?app=coin-shooting', {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      credentials: 'omit',
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Logging failures must never interrupt experiments. Do not retry.
  }
})();
