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
  try { var ps = document.createElement('script'); ps.src = 'push.js'; ps.defer = true; (document.head || html).appendChild(ps); } catch (e) {}
  window.Who = {
    me: function () { return cur; },
    ready: function () { return !!cur; },
    other: function () { return cur === 'Razan' ? 'Dara' : 'Razan'; },
    ask: ask,
    on: function (f) { subs.push(f); }
  };
})();
