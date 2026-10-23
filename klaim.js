/* ═══ 🎟️ KLAIM VOUCHER — setelah klaim, wajib kirim ke WA Razan dulu ═══
   Dimuat who.js di semua halaman. Kalau ada klaim yang belum dikirim, layar ini nutup app
   sampai tombol WA dipencet (balik dari WA = kecatet kekirim + Razan dapet notif cadangan). */
(function () {
  if (window.Klaim) return;
  var EMB = false; try { EMB = window.self !== window.top; } catch (e) { EMB = true; }
  var URL = 'https://script.google.com/macros/s/AKfycbyCq294yq71M-BDzouyLttp2Kki0aumPAP0JzII0fvvnBakSQ5_eHkNTawXA01fQ3dC/exec', KEY = 'razara-berdua';   // sama dengan sync.js
  var WA = { Razan: '6285692740607', Dara: '6287703706518' };
  var K = 'klaim-pending';
  function g(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function s(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function put(app, who, date, data) {
    if (window.Berdua && Berdua.put) { Berdua.put(app, who, date, data); return; }
    var k = app + '-' + who, m = g(k, {}) || {}; m[date] = data; s(k, m);
    var now = Date.now(), st = g('bd-stamp', {}) || {}; st[app + '|' + who + '|' + date] = now; s('bd-stamp', st);
    var body = JSON.stringify({ key: KEY, kode: (window.RZ && RZ.kode()) || undefined, action: 'put', rows: [{ app: app, who: who, date: date, data: data, updated: now }] });
    try { if (navigator.sendBeacon && navigator.sendBeacon(URL, new Blob([body], { type: 'text/plain' }))) return; } catch (e) {}
    try { var x = new XMLHttpRequest(); x.open('POST', URL, true); x.setRequestHeader('Content-Type', 'text/plain'); x.send(body); } catch (e) {}
  }
  function msg(p) {
    var d = p.date.split('-');
    return '🎟️ Aku klaim voucher harian: ' + p.e + ' *' + p.t + '* — ' + (+d[2]) + ' ' + BLN[+d[1] - 1] + (p.note ? '\n📝 ' + p.note : '') + '\nDitepatin ya sayang 🥺🤍';
  }
  function link(p) { return 'https://wa.me/' + (WA[p.to] || WA.Razan) + '?text=' + encodeURIComponent(msg(p)); }
  var ov = null, st = null;
  function css() {
    if (st) return; st = document.createElement('style');
    st.textContent = 'html.klaimlock body{visibility:hidden!important;overflow:hidden!important}' +
      '#klaim-ov{position:fixed;inset:0;z-index:2147483500;visibility:visible;display:flex;align-items:center;justify-content:center;padding:1.2rem;background:linear-gradient(160deg,#fdf6f8,#f6dbe3);font-family:Poppins,system-ui,sans-serif;color:#2d1f1a;overflow-y:auto}' +
      '#klaim-ov .kb{width:100%;max-width:360px;text-align:center}' +
      '#klaim-ov .tk{background:#fff;border-radius:22px;padding:1.1rem 1rem;border:2px dashed #e7a6b8;box-shadow:0 12px 30px rgba(194,90,120,.18);margin-bottom:1rem;position:relative}' +
      '#klaim-ov .tk .e{font-size:3rem;line-height:1.1;display:block}#klaim-ov .tk b{display:block;font-size:17px;margin:.25rem 0 .15rem}#klaim-ov .tk small{font-size:11.5px;color:#9a8070}' +
      '#klaim-ov .tk .nt{font-size:12px;color:#8a3352;margin-top:.4rem;overflow-wrap:anywhere}' +
      '#klaim-ov h3{font-size:15px;margin:0 0 .3rem}#klaim-ov p{font-size:12px;color:#8a7a72;line-height:1.55;margin:0 0 .8rem}' +
      '#klaim-ov .pv{background:#e7f8ec;border-radius:14px 14px 4px 14px;padding:.6rem .75rem;font-size:12px;text-align:left;white-space:pre-wrap;color:#1f3a28;margin:0 0 .9rem;overflow-wrap:anywhere}' +
      '#klaim-ov .go{display:block;width:100%;border:none;border-radius:50px;padding:1rem;font:700 15px Poppins,system-ui,sans-serif;color:#fff;background:#25a35a;box-shadow:0 8px 20px rgba(37,163,90,.3);cursor:pointer;text-decoration:none}' +
      '#klaim-ov .go:active{transform:scale(.98)}#klaim-ov .err{color:#b03a2e;font-size:12px;min-height:1.3em;margin-top:.6rem}' +
      '#klaim-ov .shake{animation:klSh .35s}@keyframes klSh{25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}';
    (document.head || document.documentElement).appendChild(st);
  }
  function show() {
    var p = g(K, null); if (!p || EMB) return;
    if (!document.body) { document.addEventListener('DOMContentLoaded', show); return; }
    css(); document.documentElement.classList.add('klaimlock');
    if (!ov) {
      ov = document.createElement('div'); ov.id = 'klaim-ov'; ov.setAttribute('role', 'dialog');
      document.documentElement.appendChild(ov);
      try { history.pushState({ klaim: 1 }, '', location.href); } catch (e) {}
    }
    ov.innerHTML = '<div class="kb"><div class="tk"><span class="e">' + esc(p.e) + '</span><b>' + esc(p.t) + '</b><small>Voucher harian · diklaim</small>' + (p.note ? '<div class="nt">📝 ' + esc(p.note) + '</div>' : '') + '</div>' +
      '<h3>Satu langkah lagi! 🥺</h3><p>Kirim klaimnya ke WA ' + esc(p.to || 'Razan') + ' dulu ya — app-nya kebuka lagi setelah kamu kirim.</p>' +
      '<div class="pv">' + esc(msg(p)) + '</div><a class="go" href="' + link(p) + '" target="_blank" rel="noopener">💬 Kirim ke WA ' + esc(p.to || 'Razan') + '</a><div class="err"></div></div>';
    ov.querySelector('.go').addEventListener('click', function () { var q = g(K, null); if (q) { q.opened = Date.now(); s(K, q); } });
  }
  function nag(t) { if (!ov) return; var e = ov.querySelector('.err'), b = ov.querySelector('.kb'); if (e) e.textContent = t; if (b) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); } try { navigator.vibrate && navigator.vibrate([40, 40, 40]); } catch (x) {} }
  function done() {
    var p = g(K, null); if (!p) return;
    var who = p.from || 'Dara', row = (g('vklaim-' + who, {}) || {})[p.date] || {};
    put('vklaim', who, p.date, Object.assign({}, row, { id: p.id, e: p.e, t: p.t, note: p.note || '', at: p.at, sent: Date.now() }));
    try { localStorage.removeItem(K); } catch (e) {}
    var tell = function (n) { if (window.Push && Push.notify) { try { Push.notify({ title: p.e + ' ' + who + ': ' + p.t, body: (p.note ? '📝 ' + p.note + ' · ' : '') + 'Pilihan hari ini, udah dikirim ke WA juga 🥺', url: 'voucher-harian.html', tag: 'vklaim' }); } catch (e) {} } else if (n < 20) setTimeout(function () { tell(n + 1); }, 500); };
    tell(0);
    if (ov) { ov.remove(); ov = null; } document.documentElement.classList.remove('klaimlock');
    try { window.dispatchEvent(new CustomEvent('klaim-sent', { detail: p })); } catch (e) {}
  }
  // balik dari WA → anggep kekirim (kalau baliknya kecepetan = WA-nya ga kebuka)
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return; var p = g(K, null); if (!p) return;
    if (p.opened && Date.now() - p.opened >= 2000) done();
    else if (p.opened) { p.opened = 0; s(K, p); show(); nag('WA-nya belum kebuka — pencet tombolnya lagi ya'); }
    else show();
  });
  window.addEventListener('popstate', function () { if (g(K, null) && !EMB) { try { history.pushState({ klaim: 1 }, '', location.href); } catch (e) {} show(); nag('Kirim ke WA dulu ya 🥺'); } });
  window.addEventListener('beforeunload', function (e) { if (g(K, null) && !EMB && !(g(K, {}).opened)) { e.preventDefault(); e.returnValue = ''; } });
  window.addEventListener('storage', function (e) { if (e.key === K) { if (g(K, null)) show(); else if (ov) { ov.remove(); ov = null; document.documentElement.classList.remove('klaimlock'); } } });
  window.Klaim = {
    start: function (p) { p = Object.assign({ from: 'Dara', to: 'Razan', at: Date.now() }, p); s(K, p); put('vklaim', p.from, p.date, { id: p.id, e: p.e, t: p.t, note: p.note || '', at: p.at }); show(); },
    pending: function () { return g(K, null); },
    show: show
  };
  if (g(K, null)) show();
})();
