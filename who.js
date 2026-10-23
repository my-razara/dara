/* ═══ 🔑 KODE PASANGAN — tiap permintaan ke server Razara dibawain kode rahasia yang disimpen di HP ini (bukan di kodingan) ═══
   Kode masuk lewat link  …/#kode=rz-xxxx  (sekali tap) atau diketik di layar kode. */
(function () {
  if (window.RZ) return;
  var K = 'rz-kode', ls = null; try { ls = window.localStorage; } catch (e) {}
  var ok = function (k) { return /^rz-[a-z0-9]{12,40}$/i.test(String(k || '').trim()); };
  function kode() { try { var v = ls.getItem(K); return v && ok(v) ? v : ''; } catch (e) { return ''; } }
  function set(k) { k = String(k || '').trim(); if (!ok(k)) return false; try { ls.setItem(K, k); } catch (e) { return false; } return true; }
  // link #kode=… → simpen, terus ilangin dari alamat biar ga kebaca orang
  try { var m = /(?:^#|&)kode=(rz-[A-Za-z0-9]{12,40})/.exec(location.hash || ''); if (m) { var fresh = kode() !== m[1]; set(m[1]); history.replaceState(null, '', location.pathname + location.search); if (fresh) setTimeout(function () { toast('🔑 Kode Razara kesimpen di HP ini'); }, 600); } } catch (e) {}
  var SRV = /^https:\/\/script\.google\.com\/macros\//;
  function addQ(u) { var k = kode(); if (!k || /[?&]kode=/.test(u)) return u; return u + (u.indexOf('?') < 0 ? '?' : '&') + 'kode=' + encodeURIComponent(k); }
  function addB(b) { var k = kode(); if (!k || typeof b !== 'string' || b.charAt(0) !== '{') return b; try { var o = JSON.parse(b); if (o && typeof o === 'object' && !o.kode) { o.kode = k; return JSON.stringify(o); } } catch (e) {} return b; }
  function seen(t) { if (typeof t === 'string' && /"error"\s*:\s*"kode"/.test(t.slice(0, 200))) ask(true); }
  // XHR
  try {
    var X = XMLHttpRequest.prototype, o0 = X.open, s0 = X.send;
    X.open = function (m, u) { var a = Array.prototype.slice.call(arguments); this.__rz = SRV.test(String(u || '')); if (this.__rz) { this.__rzm = String(m || 'GET').toUpperCase(); if (this.__rzm === 'GET') a[1] = addQ(String(u)); } return o0.apply(this, a); };
    X.send = function (b) { if (this.__rz) { if (this.__rzm !== 'GET') b = addB(b); var x = this; this.addEventListener('load', function () { try { seen(x.responseText); } catch (e) {} }); } return s0.call(this, b); };
  } catch (e) {}
  // fetch
  try {
    var f0 = window.fetch;
    if (f0) window.fetch = function (input, init) {
      try {
        var u = typeof input === 'string' ? input : (input && input.url) || '';
        if (SRV.test(u)) {
          var m = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
          if (m === 'GET' && typeof input === 'string') input = addQ(input);
          else if (m !== 'GET' && init && typeof init.body === 'string') init = Object.assign({}, init, { body: addB(init.body) });
          return f0.call(window, input, init).then(function (r) { try { r.clone().text().then(seen).catch(function () {}); } catch (e) {} return r; });
        }
      } catch (e) {}
      return f0.apply(window, arguments);
    };
  } catch (e) {}
  function toast(t) { try { var el = document.createElement('div'); el.textContent = t; el.style.cssText = 'position:fixed;left:50%;bottom:calc(1.2rem + env(safe-area-inset-bottom));transform:translateX(-50%);background:#2d1f1a;color:#fff;font:500 12.5px Poppins,system-ui,sans-serif;padding:.65rem 1.1rem;border-radius:50px;z-index:2147483001;max-width:calc(100% - 2rem);text-align:center'; (document.body || document.documentElement).appendChild(el); setTimeout(function () { el.remove(); }, 3200); } catch (e) {} }
  // layar masukin kode (muncul kalau server nolak karena belum ada kode / kodenya salah)
  var shown = false;
  function ask(auto) {
    var EMB = false; try { EMB = window.self !== window.top; } catch (e) { EMB = true; }
    if (EMB) { try { window.top.RZ && window.top.RZ.ask(auto); } catch (e) {} return; }
    if (shown || document.getElementById('rz-gate')) return;
    if (!document.body) { document.addEventListener('DOMContentLoaded', function () { ask(auto); }); return; }
    shown = true;
    var g = document.createElement('div'); g.id = 'rz-gate';
    g.style.cssText = 'position:fixed;inset:0;z-index:2147483200;background:rgba(30,22,28,.6);display:flex;align-items:center;justify-content:center;padding:1.2rem;font-family:Poppins,system-ui,sans-serif;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)';
    g.innerHTML = '<div style="background:#fff;color:#2d1f1a;border-radius:24px;padding:1.4rem 1.2rem 1.2rem;width:100%;max-width:340px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.3)">' +
      '<div style="font-size:2.4rem;line-height:1.1">🔑</div><h3 style="font-size:16px;margin:.3rem 0 .25rem">Masukin kode Razara</h3>' +
      '<p style="font-size:12px;color:#8a7a72;line-height:1.5;margin:0 0 .8rem">' + (kode() ? 'Kode di HP ini udah ga cocok sama server. ' : 'Biar data kalian ga bisa dibuka orang lain, HP ini butuh kode Razara sekali aja. ') + 'Minta link kodenya ke pasanganmu, atau tempel kodenya di sini.</p>' +
      '<input id="rz-in" placeholder="rz-…" autocomplete="off" autocapitalize="off" spellcheck="false" style="width:100%;box-sizing:border-box;font:600 15px Poppins,system-ui,sans-serif;text-align:center;padding:.7rem;border:2px solid #eee;border-radius:14px;outline:none;color:#2d1f1a">' +
      '<div id="rz-err" style="color:#c0392b;font-size:11.5px;min-height:1.3em;margin:.3rem 0 .4rem"></div>' +
      '<div style="display:flex;gap:.5rem"><button id="rz-no" style="flex:1;border:none;border-radius:50px;padding:.75rem;font:600 13px Poppins,system-ui,sans-serif;background:#f3eee9;color:#7a6a62;cursor:pointer">Nanti</button><button id="rz-ok" style="flex:1;border:none;border-radius:50px;padding:.75rem;font:700 13px Poppins,system-ui,sans-serif;background:#c17a6f;color:#fff;cursor:pointer">Simpan</button></div></div>';
    document.body.appendChild(g);
    var inp = g.querySelector('#rz-in');
    g.querySelector('#rz-no').onclick = function () { g.remove(); shown = false; };
    g.querySelector('#rz-ok').onclick = function () { var v = inp.value.replace(/\s+/g, ''); var mm = /(rz-[A-Za-z0-9]{12,40})/.exec(v); if (!mm || !set(mm[1])) { g.querySelector('#rz-err').textContent = 'Kodenya ga valid — awalnya “rz-”'; return; } g.remove(); toast('🔑 Kode kesimpen'); setTimeout(function () { location.reload(); }, 700); };
  }
  window.RZ = { kode: kode, set: set, ask: ask, has: function () { return !!kode(); }, link: function () { var k = kode(); return k ? location.origin + location.pathname.replace(/[^\/]*$/, '') + '#kode=' + k : ''; }, clear: function () { try { ls.removeItem(K); } catch (e) {} } };
})();
/* ═══ SIAPA YANG PAKAI HP INI — satu pilihan buat seluruh web ═══
   Dipilih sekali (pakai PIN), semua halaman otomatis ngikut: data, notif, sama warna tema.
   Dara = nuansa pink 💗 · Razan = nuansa biru 💙 */
(function () {
  if (window.Who) return;
  var PIN = { Dara: '18', Razan: '17' };
  // kunci "aku siapa" lama di tiap halaman — sekarang semuanya diisi otomatis dari pilihan global
  var KEYS = ['berdua-me', 'bl-me', 'daftar-me', 'dd-me', 'film-me', 'gembok-me', 'gm-me', 'gt-me', 'hk-me', 'ingat-me', 'janji-me', 'jarak-me', 'kalk-me', 'kamus-me', 'kangen-me', 'kb-me', 'ketemu-me', 'kk-me', 'kl-me', 'kmk-me', 'kode-me', 'lampion-me', 'lc-me', 'md-me', 'minum-me', 'mood-me', 'mw-me', 'ori-me', 'pn-me', 'qa-me', 'ramalan-me', 'resep-me', 'rs-me', 'syukur-me', 'tarot-me', 'terserah-me', 'wish-me'];
  var ls = null; try { ls = window.localStorage; } catch (e) {}
  var rawSet = Storage.prototype.setItem;
  function get(k) { try { return JSON.parse(ls.getItem(k)); } catch (e) { return null; } }
  function put(k, v) { try { rawSet.call(ls, k, JSON.stringify(v)); } catch (e) {} }
  var valid = function (w) { return w === 'Razan' || w === 'Dara'; };
  var cur = get('who-ok') && valid(get('berdua-me')) ? get('berdua-me') : null;
  var html = document.documentElement;

  // ── warna tema ──
  var css = 'html[data-user=Dara]:not(.night){--rose:#d4718a;--deep:#8a3352;--blush:#f2c4d0;--warm:#fbedf1;--cream:#fdf6f8}' +
    'html[data-user=Razan]:not(.night){--rose:#5a8fcc;--deep:#2c4f7c;--blush:#c3d8ee;--warm:#eaf2fa;--cream:#f5f9fd;--muted:#7f8ea3;--ink:#1e2836}' +
    'html.night[data-user=Dara]{--rose:#e58aa2;--deep:#f0a8bd;--blush:#4d3440}' +
    'html.night[data-user=Razan]{--rose:#79a8e0;--deep:#a9c9f0;--blush:#33415a}' +
    '#who-gate{position:fixed;inset:0;z-index:2147483000;background:rgba(30,22,28,.55);display:flex;align-items:center;justify-content:center;padding:1.2rem;font-family:Poppins,sans-serif;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}' +
    '#who-gate .wb{background:#fff;color:#2d1f1a;border-radius:24px;padding:1.4rem 1.2rem 1.2rem;width:100%;max-width:330px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.3);animation:whoIn .3s cubic-bezier(.3,1.4,.5,1)}' +
    '@keyframes whoIn{from{transform:scale(.88);opacity:0}}' +
    '#who-gate h3{font-size:16px;font-weight:700;margin-bottom:.25rem}#who-gate p{font-size:12px;color:#8a7a72;line-height:1.45;margin-bottom:.9rem}' +
    '#who-gate .wp{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.9rem}' +
    '#who-gate .wp button{border:2px solid #eee;background:#fff;border-radius:18px;padding:.7rem .3rem;font:600 13px Poppins,sans-serif;cursor:pointer;color:#2d1f1a}' +
    '#who-gate .wp button span{display:block;font-size:1.8rem;margin-bottom:.15rem}' +
    '#who-gate .wp button.R.on{border-color:#5a8fcc;background:#eaf2fa;color:#2c4f7c}#who-gate .wp button.D.on{border-color:#d4718a;background:#fbedf1;color:#8a3352}' +
    '#who-gate input{width:100%;font:600 24px Poppins,sans-serif;letter-spacing:.5em;text-align:center;padding:.55rem .3rem .55rem .8rem;border:2px solid #eee;border-radius:16px;outline:none;margin-bottom:.3rem;color:#2d1f1a;background:#fff}' +
    '#who-gate input::placeholder{letter-spacing:normal;font-size:14px;font-weight:400;color:#b8aaa2}#who-gate input:focus{border-color:#c9a96e}#who-gate .err{color:#c0392b;font-size:11.5px;min-height:1.2em;margin-bottom:.5rem}' +
    '#who-gate .shake{animation:whoSh .35s}@keyframes whoSh{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}' +
    '#who-gate .wa{display:flex;gap:.5rem}#who-gate .wa button{flex:1;border:none;border-radius:50px;padding:.75rem;font:600 13px Poppins,sans-serif;cursor:pointer}' +
    '#who-gate .ok{color:#fff;background:#c17a6f}#who-gate .ok.R{background:#5a8fcc}#who-gate .ok.D{background:#d4718a}#who-gate .no{background:#f3eee9;color:#7a6a62}';
  var st = document.createElement('style'); st.textContent = css; (document.head || html).appendChild(st);
  function apply() { if (cur) html.setAttribute('data-user', cur); else html.removeAttribute('data-user'); }
  // isi semua kunci lama biar halaman lama otomatis ngikut
  function mirror() { if (!cur) return; var v = JSON.stringify(cur); KEYS.forEach(function (k) { try { if (ls.getItem(k) !== v) rawSet.call(ls, k, v); } catch (e) {} }); }
  // kasih tau service worker (notif per orang)
  function tellSW() { try { if (cur && window.caches) caches.open('untuk-dara-meta').then(function (c) { return c.put('/__me', new Response(JSON.stringify({ me: cur }))); }).catch(function () {}); } catch (e) {} }
  apply(); mirror(); tellSW();

  // halaman lama yang nyoba ganti orang sendiri → dicegat, diganti jadi ganti global pakai PIN
  Storage.prototype.setItem = function (k, v) {
    if (this === ls && cur && KEYS.indexOf(k) >= 0) {
      var w = null; try { w = JSON.parse(v); } catch (e) {}
      if (w !== cur) { if (valid(w) && !document.getElementById('who-gate')) setTimeout(function () { ask(w, { revert: true }); }, 0); return; }
    }
    return rawSet.call(this, k, v);
  };

  var subs = [];
  function done(w) {
    var changed = w !== cur;
    cur = w; put('who-ok', true); mirror(); apply(); tellSW();
    subs.forEach(function (f) { try { f(w); } catch (e) {} });
    return changed;
  }
  function close() { var o = document.getElementById('who-gate'); if (o) o.remove(); }
  // opt: { force: true } = wajib pilih (pertama kali), { revert } = halaman lama yang minta ganti
  function ask(target, opt) {
    opt = opt || {};
    if (!document.body) { document.addEventListener('DOMContentLoaded', function () { ask(target, opt); }); return; }
    close();
    var pick = valid(target) ? target : (cur ? (cur === 'Razan' ? 'Dara' : 'Razan') : (valid(get('berdua-me')) ? get('berdua-me') : null));
    var o = document.createElement('div'); o.id = 'who-gate';
    o.innerHTML = '<div class="wb"><h3>' + (opt.force ? '👋 Ini HP siapa?' : '🔄 Ganti orang') + '</h3><p>' + (opt.force ? 'Pilih sekali aja — semua game, hadiah, notif & warna tema langsung ngikut.' : 'Semua halaman, notif & warna tema bakal ikut ganti.') + '</p>' +
      '<div class="wp"><button class="R" data-w="Razan"><span>🙋‍♂️</span>Razan</button><button class="D" data-w="Dara"><span>🙋‍♀️</span>Dara</button></div>' +
      '<input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="PIN"><div class="err"></div>' +
      '<div class="wa">' + (opt.force ? '' : '<button class="no">Batal</button>') + '<button class="ok">Masuk</button></div></div>';
    document.body.appendChild(o);
    var inp = o.querySelector('input'), err = o.querySelector('.err'), ok = o.querySelector('.ok'), box = o.querySelector('.wb');
    function paint() {
      o.querySelectorAll('.wp button').forEach(function (b) { b.classList.toggle('on', b.dataset.w === pick); });
      ok.className = 'ok' + (pick ? ' ' + pick[0] : ''); ok.textContent = pick ? (pick === 'Razan' ? 'Masuk 💙' : 'Masuk 💗') : 'Pilih dulu';
      inp.placeholder = pick ? 'PIN ' + pick : 'PIN';
    }
    o.querySelectorAll('.wp button').forEach(function (b) { b.onclick = function () { pick = b.dataset.w; err.textContent = ''; inp.value = ''; paint(); inp.focus(); }; });
    function go() {
      if (!pick) { err.textContent = 'Pilih Razan atau Dara dulu'; return; }
      if (inp.value !== PIN[pick]) { err.textContent = 'PIN-nya salah 🙈'; inp.value = ''; box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); try { navigator.vibrate && navigator.vibrate([40, 40, 40]); } catch (e) {} return; }
      var changed = done(pick); close();
      try { navigator.vibrate && navigator.vibrate(20); } catch (e) {}
      if (opt.onDone) opt.onDone(pick, changed);
      else if (changed) location.reload();
    }
    ok.onclick = go;
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    var no = o.querySelector('.no'); if (no) no.onclick = function () { close(); if (opt.revert && !document.getElementById('who-btn')) location.reload(); };
    paint(); setTimeout(function () { try { inp.focus(); } catch (e) {} }, 120);
  }
  // kalau diganti di tab/halaman lain (misal di dalam hub) → halaman ini ikut
  window.addEventListener('storage', function (e) {
    if (e.key !== 'berdua-me' || !get('who-ok')) return;
    var w = get('berdua-me'); if (valid(w) && w !== cur) { cur = w; apply(); location.reload(); }
  });
  // notif instan antar HP (push.js) — dimuat belakangan biar ga ngeberatin halaman
  // dibuka di dalam halaman lain (fitur yang dilebur) → ga usah tombol melayang / kirim lokasi dobel, link keluar ke halaman utama
  var EMB = false; try { EMB = window.self !== window.top; } catch (e) { EMB = true; }
  if (EMB) {
    html.classList.add('embed');
    var es = document.createElement('style'); es.textContent = 'html.embed .sfx-btn,html.embed .sfx-tip,html.embed .cfab,html.embed #lok-pill{display:none!important}html.embed .top>a.pill[href="index.html"],html.embed a.back[href="index.html"],html.embed .back-btn[href="index.html"]{visibility:hidden}'; (document.head || html).appendChild(es);
    document.addEventListener('click', function (e) { var a = e.target && e.target.closest && e.target.closest('a[href]'); if (!a || a.target || e.defaultPrevented) return; var h = a.getAttribute('href') || ''; if (!h || h.charAt(0) === '#' || /^(javascript|blob|data):/i.test(h) || a.hasAttribute('download')) return; a.target = '_top'; }, false);
  }
  // klaim voucher yang belum dikirim ke WA → layar ditutup dulu dari awal (klaim.js yang nampilin tombol WA-nya)
  if (!EMB && get('klaim-pending')) { html.classList.add('klaimlock'); var ks = document.createElement('style'); ks.textContent = 'html.klaimlock body{visibility:hidden!important}'; (document.head || html).appendChild(ks); setTimeout(function () { if (!document.getElementById('klaim-ov')) html.classList.remove('klaimlock'); }, 5000); }
  try { (EMB ? ['push.js', 'ritual.js', 'skor.js'] : ['push.js', 'ritual.js', 'skor.js', 'chatfab.js', 'lokasi.js', 'klaim.js']).forEach(function (f) { var ps = document.createElement('script'); ps.src = f; ps.defer = true; (document.head || html).appendChild(ps); }); } catch (e) {}
  window.Who = {
    me: function () { return cur; },
    ready: function () { return !!cur; },
    other: function () { return cur === 'Razan' ? 'Dara' : 'Razan'; },
    ask: ask,
    on: function (f) { subs.push(f); }
  };
})();

/* ═══ ⚡ MODE RINGAN + 🔒 KUNCI PIN (opsional, cuma berlaku di HP ini) ═══ */
(function () {
  if (window.Kunci) return;
  var ls = null; try { ls = window.localStorage; } catch (e) { return; }
  function g(k) { try { return JSON.parse(ls.getItem(k)); } catch (e) { return null; } }
  var html = document.documentElement, head = document.head || html;
  // ⚡ mode ringan: matiin efek blur kaca (paling berat di HP) — otomatis nyala di HP yang RAM-nya kecil / mode hemat data
  var lite = g('lite-mode');
  if (lite == null) { try { lite = (navigator.deviceMemory && navigator.deviceMemory <= 3) || (navigator.connection && navigator.connection.saveData) ? 1 : 0; } catch (e) { lite = 0; } }
  if (lite) html.classList.add('lite');
  var st = document.createElement('style');
  st.textContent = 'html.lite *{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}' +
    'html.pinlock body{visibility:hidden!important}' +
    '#pin-gate{position:fixed;inset:0;z-index:2147483600;visibility:visible;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.9rem;padding:1.2rem;font-family:Poppins,system-ui,sans-serif;background:linear-gradient(160deg,#fdf6f0,#f3e1d8);color:#2d1f1a;text-align:center;user-select:none;-webkit-user-select:none}' +
    'html[data-user=Razan] #pin-gate{background:linear-gradient(160deg,#f5f9fd,#dce9f6)}html[data-user=Dara] #pin-gate{background:linear-gradient(160deg,#fdf6f8,#f6dbe3)}' +
    '#pin-gate .pi{font-size:2.4rem;line-height:1}#pin-gate h3{font-size:16px;font-weight:700;margin:0}#pin-gate p{font-size:12px;color:#8a7a72;margin:0;min-height:1.2em}' +
    '#pin-gate .dots{display:flex;gap:.7rem;margin:.2rem 0}#pin-gate .dots i{width:14px;height:14px;border-radius:50%;border:2px solid #c17a6f;display:block}#pin-gate .dots i.f{background:#c17a6f}' +
    'html[data-user=Razan] #pin-gate .dots i{border-color:#5a8fcc}html[data-user=Razan] #pin-gate .dots i.f{background:#5a8fcc}' +
    '#pin-gate .kp{display:grid;grid-template-columns:repeat(3,64px);gap:.7rem}#pin-gate .kp button{width:64px;height:64px;border-radius:50%;border:none;background:rgba(255,255,255,.85);font:600 22px Poppins,system-ui,sans-serif;color:#2d1f1a;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.06)}' +
    '#pin-gate .kp button:active{transform:scale(.92)}#pin-gate .kp button.x{background:none;box-shadow:none;font-size:18px}' +
    '#pin-gate .lp{border:none;background:none;color:#9a8070;font:500 12px Poppins,system-ui,sans-serif;text-decoration:underline;cursor:pointer;margin-top:.2rem}' +
    '#pin-gate .shake{animation:pinSh .35s}@keyframes pinSh{25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}' +
    '@media (max-height:560px){#pin-gate .kp{grid-template-columns:repeat(3,54px)}#pin-gate .kp button{width:54px;height:54px;font-size:19px}}';
  head.appendChild(st);

  var PRIV = ['keuangan-dara', 'keuangan-razan', 'keuangan-berdua', 'period-tracker', 'buku-harian', 'chat', 'jarak-kita'];
  function hash(salt, pin) {
    var s = salt + '|' + pin + '|razara';
    try { if (window.crypto && crypto.subtle && window.TextEncoder) return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }); } catch (e) {}
    var h = 5381; for (var r = 0; r < 500; r++) for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i) + r) | 0;
    return Promise.resolve('x' + (h >>> 0).toString(16));
  }
  var P = g('app-pin');
  var PAGE = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
  var on = !!(P && P.h && P.s);
  var EMB2 = false; try { EMB2 = window.self !== window.top; } catch (e) { EMB2 = true; }
  var need = !EMB2 && on && (P.scope === 'all' || PRIV.indexOf(PAGE) >= 0 || PAGE === 'kunci-pin');
  var TO = Math.max(10000, (P && P.t != null ? +P.t : 1) * 60000);   // "langsung" = 10 detik (biar pindah halaman ga dikunci terus)
  var ss = null; try { ss = window.sessionStorage; } catch (e) {}
  function sg(k) { try { return +ss.getItem(k) || 0; } catch (e) { return 0; } }
  function sset(k, v) { try { ss.setItem(k, String(v)); } catch (e) {} }
  function fresh() { var ok = sg('pin-ok'), seen = sg('pin-seen'); return ok && Date.now() - Math.max(ok, seen) < TO; }
  function seenNow() { if (!html.classList.contains('pinlock')) sset('pin-seen', Date.now()); }
  var gate = null, typed = '';
  function show() {
    if (gate) return; html.classList.add('pinlock');
    gate = document.createElement('div'); gate.id = 'pin-gate'; gate.setAttribute('role', 'dialog'); gate.setAttribute('aria-label', 'Kunci PIN');
    var n = P.n || 4;
    gate.innerHTML = '<div class="pi">🔒</div><h3>Razara kekunci</h3><p class="msg">Masukin PIN kamu</p><div class="dots">' + Array(n + 1).join('<i></i>') + '</div>' +
      '<div class="kp">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (d) { return '<button data-d="' + d + '">' + d + '</button>'; }).join('') + '<button class="x" data-x="1" aria-label="Hapus">⌫</button><button data-d="0">0</button><span></span></div>' +
      '<button class="lp">Lupa PIN?</button>';
    html.appendChild(gate);
    var dots = gate.querySelectorAll('.dots i'), msg = gate.querySelector('.msg'), box = gate.querySelector('.dots');
    function paint() { for (var i = 0; i < dots.length; i++) dots[i].className = i < typed.length ? 'f' : ''; }
    function wait() { var f = g('pin-fail') || {}; return f.until && f.until > Date.now() ? Math.ceil((f.until - Date.now()) / 1000) : 0; }
    function check() {
      var w = wait(); if (w) { msg.textContent = 'Kebanyakan salah — tunggu ' + w + ' detik'; typed = ''; paint(); return; }
      var t = typed;
      hash(P.s, t).then(function (h) {
        if (h === P.h) { try { ls.removeItem('pin-fail'); } catch (e) {} sset('pin-ok', Date.now()); sset('pin-seen', Date.now()); hide(); return; }
        var f = g('pin-fail') || { n: 0 }; f.n = (f.n || 0) + 1; if (f.n >= 5) { f.until = Date.now() + 30000 * Math.pow(2, Math.min(4, f.n - 5)); }
        try { ls.setItem('pin-fail', JSON.stringify(f)); } catch (e) {}
        typed = ''; paint(); msg.textContent = f.until && f.until > Date.now() ? 'Kebanyakan salah — tunggu ' + wait() + ' detik' : 'PIN salah 🙈';
        box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); try { navigator.vibrate && navigator.vibrate([40, 40, 40]); } catch (e) {}
      });
    }
    gate.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button'); if (!b) return;
      if (b.classList.contains('lp')) {
        if (!confirm('Lupa PIN?\n\nPIN cuma bisa dihapus dengan RESET app di HP ini: semua data yang kesimpen di HP ini dihapus (yang udah ke-sync bakal balik lagi setelah login ulang, tapi catatan rahasia yang cuma di HP ini ikut ilang).\n\nLanjut reset?')) return;
        try { ls.clear(); } catch (e) {} try { ss.clear(); } catch (e) {} try { indexedDB.deleteDatabase('razara-chat'); } catch (e) {}
        location.replace('index.html'); return;
      }
      try { navigator.vibrate && navigator.vibrate(8); } catch (e) {}
      if (b.dataset.x) { typed = typed.slice(0, -1); paint(); return; }
      if (b.dataset.d != null && typed.length < n) { typed += b.dataset.d; paint(); if (typed.length === n) setTimeout(check, 120); }
    });
    document.addEventListener('keydown', onKey, true);
    function onKey(e) { if (!gate) { document.removeEventListener('keydown', onKey, true); return; } if (/^\d$/.test(e.key) && typed.length < n) { typed += e.key; paint(); if (typed.length === n) setTimeout(check, 120); e.preventDefault(); } else if (e.key === 'Backspace') { typed = typed.slice(0, -1); paint(); e.preventDefault(); } }
    var w0 = wait(); if (w0) msg.textContent = 'Kebanyakan salah — tunggu ' + w0 + ' detik';
  }
  function hide() { if (gate) { gate.remove(); gate = null; } typed = ''; html.classList.remove('pinlock'); try { window.dispatchEvent(new Event('pin-unlock')); } catch (e) {} }
  if (need) {
    if (!fresh()) show(); else seenNow();
    document.addEventListener('visibilitychange', function () { if (document.hidden) seenNow(); else if (!fresh()) show(); });
    window.addEventListener('pagehide', seenNow);
    setInterval(function () { if (!document.hidden) seenNow(); }, 5000);
  } else if (on) {
    // halaman yang ga dikunci tetep nyatet "terakhir aktif" biar pas pindah ke halaman pribadi ga langsung ditanya lagi
    var touch = function () { if (!sg('pin-ok')) return; if (fresh()) sset('pin-seen', Date.now()); else sset('pin-ok', 0); };   // kelamaan ditinggal → harus PIN lagi
    touch();
    document.addEventListener('visibilitychange', touch);
    window.addEventListener('pagehide', touch);
    setInterval(function () { if (!document.hidden) touch(); }, 5000);
  }
  window.Kunci = { on: on, scope: on ? P.scope : '', PRIV: PRIV, hash: hash, locked: function () { return !!gate; }, lock: function () { if (on) { sset('pin-ok', 0); show(); } } };
})();
