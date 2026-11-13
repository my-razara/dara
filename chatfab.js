/* ═══ 💬 Tombol chat melayang — ada di semua halaman, tap buat buka chat ═══
   Ada di kanan bawah. Sama kayak tombol 🎵: abis beberapa detik minggir ke pinggir biar ga ganggu, tap sekali buat munculin lagi. */
(function () {
  if (window.__chatFab) return; window.__chatFab = 1;
  try { if (window.top !== window) return; } catch (e) { return; }
  const page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
  if (page === 'chat') return;
  const URL = 'https://script.google.com/macros/s/AKfycbyCq294yq71M-BDzouyLttp2Kki0aumPAP0JzII0fvvnBakSQ5_eHkNTawXA01fQ3dC/exec', KEY = 'razara-berdua';   // sama dengan sync.js
  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const s = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const me = () => (window.Who && Who.me && Who.me()) || g('berdua-me', null);
  let btn = null, miniT = 0;
  // ── ✋ tombol melayang bisa digeser ke mana aja (posisinya diinget di HP ini) ──
  window.__fabDrag = window.__fabDrag || function (btn, key, hooks) {
    hooks = hooks || {};
    btn.style.touchAction = 'none';
    const W = () => innerWidth, H = () => innerHeight;
    function place(x, y, save) {
      const w = btn.offsetWidth || 48, h = btn.offsetHeight || 48;
      x = Math.max(4, Math.min(W() - w - 4, x)); y = Math.max(4, Math.min(H() - h - 4, y));
      btn.style.setProperty('left', x + 'px', 'important'); btn.style.setProperty('top', y + 'px', 'important');
      btn.style.setProperty('right', 'auto', 'important'); btn.style.setProperty('bottom', 'auto', 'important');
      btn.dataset.moved = '1'; btn.classList.remove('mini');
      if (save) { try { localStorage.setItem(key, JSON.stringify({ fx: x / Math.max(1, W() - w), fy: y / Math.max(1, H() - h) })); } catch (e) {} }
      if (hooks.moved) hooks.moved(x, y);
    }
    function restore() { try { const p = JSON.parse(localStorage.getItem(key)); if (p && p.fx != null) { const w = btn.offsetWidth || 48, h = btn.offsetHeight || 48; place(p.fx * (W() - w), p.fy * (H() - h), false); } } catch (e) {} }
    let sx = null, sy = 0, ox = 0, oy = 0, drag = false, pid = null, last = 0;
    btn.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; const r = btn.getBoundingClientRect(); ox = sx - r.left; oy = sy - r.top; drag = false; pid = e.pointerId; try { btn.setPointerCapture(pid); } catch (er) {} });
    btn.addEventListener('pointermove', e => {
      if (sx == null || e.pointerId !== pid) return;
      if (!drag) { if (Math.hypot(e.clientX - sx, e.clientY - sy) < 10) return; drag = true; try { btn.setPointerCapture(pid); } catch (er) {} if (hooks.start) hooks.start(); btn.style.transition = 'none'; }
      e.preventDefault(); place(e.clientX - ox, e.clientY - oy, false);
    });
    const end = () => { if (drag) { const r = btn.getBoundingClientRect(); place(r.left, r.top, true); last = Date.now(); btn.style.transition = ''; try { navigator.vibrate && navigator.vibrate(10); } catch (er) {} } sx = null; drag = false; };
    btn.addEventListener('pointerup', end); btn.addEventListener('pointercancel', end);
    btn.addEventListener('click', e => { if (Date.now() - last < 450) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
    if (document.readyState === 'complete') restore(); else addEventListener('load', restore);
    restore(); addEventListener('resize', () => { if (btn.dataset.moved) restore(); });
  };
  // lagi di dalam game → tombol melayang ngumpet biar ga ganggu pencetan
  window.__inGame = window.__inGame || function () { const P = (location.pathname.split('/').pop() || '').replace(/\.html$/, ''); return !!(window.Skor && Skor.GAMES && Skor.GAMES.includes(P)); };
  function css() {
    const st = document.createElement('style');
    st.textContent = `.cfab{position:fixed;right:12px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:9000;width:48px;height:48px;border-radius:50%;border:none;background:linear-gradient(135deg,#d48c80,#a8584c);color:#fff;box-shadow:0 6px 16px rgba(168,88,76,.35);font-size:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;text-decoration:none;transition:transform .35s,opacity .35s;-webkit-tap-highlight-color:transparent}
    html[data-user="Razan"] .cfab{background:linear-gradient(135deg,#6f9ad6,#3f6aa8);box-shadow:0 6px 16px rgba(63,106,168,.35)}
    .cfab:active{transform:scale(.92)}
    .cfab.mini{transform:translateX(45%) scale(.9);opacity:.55}
    .cfab i{position:absolute;top:-3px;left:-3px;min-width:19px;height:19px;border-radius:10px;background:#e0475b;color:#fff;font:700 10.5px/19px Poppins,system-ui,sans-serif;font-style:normal;padding:0 5px;border:2px solid #fff}
    .cfab.new{animation:cfabP 1.4s ease-in-out 3}
    @keyframes cfabP{50%{transform:scale(1.15)}}`;
    document.head.appendChild(st);
  }
  // ── kalau ada bar/tombol penting nempel di bawah layar, tombol melayang naik ke atasnya (biar ga nutupin) ──
  function barH(doc, win, dx, dy, W, H) {
    let best = 0;
    try {
      const els = doc.body ? doc.body.querySelectorAll('*') : [];
      for (const el of els) {
        if (el.classList && (el.classList.contains('sfx-btn') || el.classList.contains('cfab') || el.classList.contains('sfx-tip') || el.id === 'olc-fab')) continue;
        const cs = win.getComputedStyle(el); if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .1) continue;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
        const top = r.top + dy, bot = r.bottom + dy, w = r.width;
        if (bot < H - 6 || bot > H + 30 || w < W * .55 || r.height > H * .45 || r.height < 24) continue;
        best = Math.max(best, H - top);
      }
    } catch (e) {}
    return best;
  }
  function modalOpen(doc, win) {
    // ada pop-up/sheet yang nutupin layar (latar gelap transparan) → tombol melayang ngumpet dulu biar ga nutupin tombol Simpan dsb
    try {
      const W = win.innerWidth, H = win.innerHeight;
      for (const el of doc.body ? doc.body.children : []) {
        if (el.classList && (el.classList.contains('sfx-btn') || el.classList.contains('cfab') || el.classList.contains('sfx-tip') || el.classList.contains('sfx-menu'))) continue;
        const cs = win.getComputedStyle(el); if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .5 || cs.pointerEvents === 'none') continue;
        const m = /rgba\([^)]*,\s*([\d.]+)\)/.exec(cs.backgroundColor), a = m ? +m[1] : (cs.backgroundColor === 'transparent' ? 0 : 1);
        if (a < .15 || a > .95) continue;
        const r = el.getBoundingClientRect(); if (r.width >= W * .85 && r.height >= H * .7) return true;
      }
    } catch (e) {}
    return false;
  }
  let liftT = 0;
  function lift() {
    if (!btn) return; const W = innerWidth, H = innerHeight;
    let h = barH(document, window, 0, 0, W, H);
    document.querySelectorAll('iframe').forEach(f => { try { const r = f.getBoundingClientRect(); if (f.contentDocument) h = Math.max(h, barH(f.contentDocument, f.contentWindow, r.left, r.top, W, H)); } catch (e) {} });
    if (!btn.dataset.moved) { if (h > 0) btn.style.setProperty('bottom', (h + 10) + 'px', 'important'); else btn.style.removeProperty('bottom'); }
    let modal = modalOpen(document, window);
    document.querySelectorAll('iframe').forEach(f => { try { if (!modal && f.contentDocument) modal = modalOpen(f.contentDocument, f.contentWindow); } catch (e) {} });
    btn.style.visibility = modal ? 'hidden' : '';
  }
  const liftLater = () => { clearTimeout(liftT); liftT = setTimeout(() => { if (!document.hidden) lift(); }, 450); };
  const shrink = () => { clearTimeout(miniT); miniT = setTimeout(() => btn && !btn.dataset.moved && btn.classList.add('mini'), 3500); };
  function paint() {
    if (!btn) return; const p = g('chat-peek-' + me(), null), n = p && p.n || 0;
    btn.innerHTML = '💬' + (n ? `<i>${n > 9 ? '9+' : n}</i>` : '');
    btn.setAttribute('aria-label', n ? `Chat · ${n} pesan baru` : 'Chat');
    if (n) { btn.classList.remove('mini'); btn.classList.add('new'); shrink(); }
  }
  async function peek(force) {
    const w = me(); if (!w || document.hidden) return;
    const last = g('chat-peek-' + w, null); if (force !== true && last && Date.now() - (last.at || 0) < (window.Hemat && Hemat.on() ? 300e3 : 60e3)) { paint(); return; }
    try {
      const u = (window.Berdua && Berdua.url) || URL, k = (window.Berdua && Berdua.key) || KEY;
      const r = await fetch(`${u}?action=chat&key=${k}&who=${w}&peek=1&t=${Date.now()}`).then(x => x.json());
      if (r && r.ok) { s('chat-peek-' + w, { n: r.unread || 0, last: r.last, at: Date.now() }); paint(); try { maybeToast(r); } catch (e) {} }
    } catch (e) {}
  }

  // ── 📌 🎵 & 💬 nempel di bar atas halaman (kalau barnya standar), atau di pojok kanan atas kalau pojoknya kosong ──
  window.__fabDock = window.__fabDock || function (el, order) {
    try {
      const H = document.documentElement; if (H.classList.contains('ui2') || H.classList.contains('embed')) return false;
      if (!document.getElementById('fab-dock-css')) { const st = document.createElement('style'); st.id = 'fab-dock-css'; st.textContent = '.fab-dock{display:inline-flex;gap:6px;align-items:center;margin-left:auto;margin-right:6px;flex-shrink:0}.fab-corner{position:fixed;top:calc(10px + env(safe-area-inset-top));right:10px;z-index:8900;display:flex;gap:6px}.fab-dock>.docked,.fab-corner>.docked{position:relative!important;inset:auto!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;width:34px!important;height:34px!important;min-width:0!important;font-size:15px!important;box-shadow:none!important;transform:none!important;opacity:1!important;z-index:auto!important;visibility:visible!important;margin:0!important;padding:0!important;border:1px solid rgba(193,122,111,.22)!important;background:rgba(255,255,255,.88)!important;display:flex!important;align-items:center;justify-content:center;border-radius:12px!important;animation:none!important}.fab-corner>.docked{box-shadow:0 4px 12px rgba(60,30,40,.12)!important}html.night .fab-dock>.docked,html.night .fab-corner>.docked{background:rgba(40,30,40,.85)!important;border-color:rgba(255,255,255,.12)!important}.fab-dock>.docked i,.fab-corner>.docked i{top:-6px!important;right:-6px!important}.top.fab-tight>a.pill:first-child{font-size:0!important;padding-left:.75rem!important;padding-right:.75rem!important}.top.fab-tight>a.pill:first-child::before{content:"←";font-size:14px}'; document.head.appendChild(st); }
      el.classList.add('docked'); el.dataset.moved = '1'; el.style.order = order;
      const put = d => { const sib = [...d.children].find(x => +x.style.order > order); if (sib) d.insertBefore(el, sib); else d.appendChild(el); };
      // 1) bar atas standar: [← balik] … [🙋 nama]
      const okBar = b => { if (!b) return false; const cs = getComputedStyle(b), r = b.getBoundingClientRect(); return cs.display.indexOf('flex') >= 0 && cs.position !== 'fixed' && r.top < 160 && r.top > -10 && r.height < 90 && r.width >= innerWidth * .7; };
      const bar = [...document.querySelectorAll('.top')].find(t => okBar(t) && (t.querySelector('#me-pill') || (t.lastElementChild && t.lastElementChild.classList.contains('pill'))));
      if (bar) {
        let d = bar.querySelector('.fab-dock');
        if (!d) { d = document.createElement('span'); d.className = 'fab-dock'; bar.insertBefore(d, bar.lastElementChild); }
        put(d);
        const fit = () => { bar.classList.remove('fab-tight'); if (bar.scrollWidth > bar.clientWidth + 2) bar.classList.add('fab-tight'); };
        fit(); setTimeout(fit, 400); addEventListener('resize', fit);
        return true;
      }
      // 2) pojok kanan atas, cuma kalau di situ ga ada tombol/tulisan
      if ((window.__inGame && window.__inGame()) || document.querySelector('script[src*="hub.js"], script[src*="sub.js"]')) { el.classList.remove('docked'); delete el.dataset.moved; return false; }   // game / halaman bertab gabungan → tetep kayak dulu
      let c = document.querySelector('.fab-corner');
      if (!c) {
        const busy = [[innerWidth - 24, 28], [innerWidth - 64, 28], [innerWidth - 24, 52], [innerWidth - 64, 52]].some(([x, y]) => { const e = document.elementFromPoint(x, y); return e && e !== document.body && e !== H && !!e.closest('a,button,input,select,textarea,label,[onclick],canvas,img,svg,video,iframe,h1,h2,h3,h4,p,span,b,small,li,td'); });
        if (busy) { el.classList.remove('docked'); delete el.dataset.moved; return false; }
        c = document.createElement('div'); c.className = 'fab-corner'; c.style.display = 'none'; document.body.appendChild(c);
        const gh = () => { c.style.display = window.__inGame && window.__inGame() ? 'none' : 'flex'; let y = 0; document.querySelectorAll('.hub-tabs, .sub-tabs').forEach(t => { const r = t.getBoundingClientRect(); if (r.top < 200 && r.bottom > y) y = r.bottom; }); c.style.top = y ? (y + 10) + 'px' : ''; };   // ada tab gabungan di atas → turun ke bawahnya setTimeout(gh, 700); setInterval(gh, 1500);   // lagi main game → ngumpet kayak dulu
      }
      put(c); return true;
    } catch (e) { return false; }
  };
  function hookChat0() {
    const hookChat = n => { if (window.Berdua && Berdua.on) Berdua.on(ev => { if (ev.apps && ev.apps.includes('chat')) peek(true); }); else if (n < 20) setTimeout(() => hookChat(n + 1), 400); }; hookChat(0); document.addEventListener('visibilitychange', () => { if (!document.hidden) peek(); });
  }
  // ── 💬 chat baru pas lagi di halaman lain / lagi main → muncul dari atas, bisa langsung dibales ──
  function maybeToast(r) {
    const w = me(); if (!r || !r.unread || !r.last || r.last.w === w) return;
    const at = r.last.at || 0; if (at <= g('chat-toast-at', 0)) return; s('chat-toast-at', at);
    if (Date.now() - at > 30 * 60e3) return;
    const wl = document.getElementById('s-welcome'); if (wl && !wl.classList.contains('hide') && getComputedStyle(wl).display !== 'none') return;
    showToast(r.last, r.unread);
  }
  function showToast(L, n) {
    const old = document.getElementById('ctoast'); if (old) old.remove();
    if (!document.getElementById('ctoast-css')) { const st = document.createElement('style'); st.id = 'ctoast-css'; st.textContent = '#ctoast{position:fixed;left:10px;right:10px;top:calc(10px + env(safe-area-inset-top));z-index:2147482000;max-width:440px;margin:0 auto;background:#2a1c22;color:#fff;border-radius:20px;padding:10px 12px;box-shadow:0 18px 30px -12px rgba(0,0,0,.55);font-family:Poppins,system-ui,sans-serif;animation:ctIn .35s cubic-bezier(.3,1.4,.5,1);touch-action:none}#ctoast.out{transition:transform .25s,opacity .25s;transform:translateY(-120%);opacity:0}@keyframes ctIn{from{transform:translateY(-120%)}}#ctoast .r1{display:flex;align-items:center;gap:10px}#ctoast .a{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;font-size:15px}#ctoast .m{flex:1;min-width:0;cursor:pointer}#ctoast .m b{display:block;font-size:12px}#ctoast .m small{display:block;font-size:11.5px;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#ctoast .bl{background:#fff;color:#2a1c22;border:none;border-radius:12px;padding:7px 12px;font:600 11.5px Poppins,system-ui,sans-serif;flex-shrink:0;cursor:pointer}#ctoast .r2{display:flex;gap:6px;margin-top:9px}#ctoast input{flex:1;min-width:0;border:none;border-radius:12px;padding:9px 12px;font:400 14px Poppins,system-ui,sans-serif;outline:none;color:#2a1c22}#ctoast .sd{border:none;border-radius:12px;padding:0 14px;font:600 12px Poppins,system-ui,sans-serif;color:#fff;background:#d4718a;cursor:pointer}'; document.head.appendChild(st); }
    const o = document.createElement('div'); o.id = 'ctoast'; o.dataset.sfxSkip = '1';
    const col = L.w === 'Razan' ? '#5a8fcc' : '#d4718a', esc = t => String(t || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    o.innerHTML = `<div class="r1"><div class="a" style="background:${col}">${esc((L.w || '?')[0])}</div><div class="m"><b>${esc(L.w)}${n > 1 ? ` · ${n} pesan baru` : ''}</b><small>${esc(L.t)}</small></div><button class="bl">Balas</button></div>`;
    document.body.appendChild(o);
    let t = setTimeout(close, 7000), open = false, y0 = null;
    function close() { clearTimeout(t); o.classList.add('out'); setTimeout(() => o.remove(), 260); }
    o.querySelector('.m').onclick = () => { location.href = 'chat.html'; };
    o.addEventListener('pointerdown', e => { if (e.target.closest('input,button')) return; y0 = e.clientY; });
    o.addEventListener('pointermove', e => { if (y0 != null && e.clientY - y0 < -25) { y0 = null; close(); } });
    o.addEventListener('pointerup', () => { y0 = null; });
    o.querySelector('.bl').onclick = e => {
      e.stopPropagation(); if (open) return; open = true; clearTimeout(t);
      o.insertAdjacentHTML('beforeend', '<div class="r2"><input placeholder="Bales…" maxlength="500" enterkeyhint="send"><button class="sd">Kirim</button></div>');
      const inp = o.querySelector('input'), go = () => {
        const txt = inp.value.trim(); if (!txt) return close();
        const w = me(), k = 'chat-q-' + w, Q = g(k, []) || [];
        Q.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), t: txt, at: Date.now(), w, k: 'msg', q: 1 }); s(k, Q); s('chat-q-lock', 0); waitT = 0;
        setTimeout(outbox, 50); o.querySelector('.r2').innerHTML = '<small style="font-size:12px;opacity:.85">✓ Kekirim ke ' + esc(L.w) + '</small>';
        try { navigator.vibrate && navigator.vibrate(15); } catch (er) {} t = setTimeout(close, 1400);
      };
      o.querySelector('.sd').onclick = go; inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') go(); });
      setTimeout(() => inp.focus(), 50);
    };
  }
  function add() {
    if (!me()) return; css();
    btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cfab'; btn.dataset.sfxSkip = '1';
    btn.addEventListener('click', e => { e.stopPropagation(); if (btn.classList.contains('mini')) { btn.classList.remove('mini'); shrink(); return; } location.href = 'chat.html'; });
    if (window.__fabDock(btn, 2)) { paint(); setTimeout(peek, 2500); setInterval(peek, 90e3); hookChat0(); return; }
    document.body.appendChild(btn); window.__fabDrag(btn, 'fab-pos-chat'); paint(); shrink(); setTimeout(peek, 2500);
    setTimeout(lift, 900); addEventListener('resize', liftLater); setInterval(() => { if (!document.hidden) lift(); }, 4000);
    try { new MutationObserver(m => { if (m.some(x => x.target !== btn && !btn.contains(x.target))) liftLater(); }).observe(document.body, { attributes: true, attributeFilter: ['class', 'style'], childList: true, subtree: true }); } catch (e) {}
    // lagi main game online → tombol 💬 komen game yang dipakai, yang ini ngumpet dulu biar ga dobel
    const vis = () => { if (btn) btn.style.display = document.getElementById('olc-fab') || window.__inGame() ? 'none' : ''; }; vis(); setTimeout(vis, 600); setInterval(vis, 1500);
    setInterval(peek, 90e3);
    // ⚡ chat baru kedeteksi sama sync (nunggu di server) → badge langsung update
    hookChat0();
  }
  // ── 📤 pesan chat yg ngantri pas ga ada internet: dikirim dari halaman mana aja begitu internet balik ──
  function idbGet(k) { return new Promise(res => { try { const r = indexedDB.open('razara-chat', 1); r.onupgradeneeded = () => r.result.createObjectStore('img'); r.onsuccess = () => { try { const q = r.result.transaction('img', 'readonly').objectStore('img').get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); } catch (e) { res(null); } }; r.onerror = () => res(null); } catch (e) { res(null); } }); }
  function idbDel(k) { try { const r = indexedDB.open('razara-chat', 1); r.onsuccess = () => { try { r.result.transaction('img', 'readwrite').objectStore('img').delete(k); } catch (e) {} }; } catch (e) {} }
  function post(u, body) { return fetch(u, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(body) }).then(x => x.json()); }
  let sending = false, waitT = 0;
  async function outbox() {
    const w = me(); if (!w || sending || navigator.onLine === false || Date.now() < waitT) return;
    const key = 'chat-q-' + w; if (!(g(key, []) || []).length) return;
    const lock = g('chat-q-lock', 0); if (Date.now() - lock < 45e3) return;
    sending = true; s('chat-q-lock', Date.now());
    const u = (window.Berdua && Berdua.url) || URL, k = (window.Berdua && Berdua.key) || KEY;
    try {
      for (;;) {
        const Q = g(key, []) || [], q = Q[0]; if (!q) break;
        if (q.pimg && !q.img) {
          const data = await idbGet(q.id); if (!data) { s(key, (g(key, []) || []).filter(x => x.id !== q.id)); continue; }
          const r = await post(u, { key: k, who: w, action: 'chat', op: 'img', data: data.split(',')[1], mime: (/^data:(image\/(?:png|webp|jpeg));/.exec(data) || [])[1] || 'image/jpeg' });
          if (!r || !r.ok || !r.url) throw new Error('img');
          s(key, (g(key, []) || []).map(x => x.id === q.id ? Object.assign({}, x, { img: r.url }) : x)); q.img = r.url;
        }
        if (q.pvn && !q.vn) {
          const data = await idbGet(q.id); if (!data) { s(key, (g(key, []) || []).filter(x => x.id !== q.id)); continue; }
          const r = await post(u, { key: k, who: w, action: 'chat', op: 'vn', data: data.split(',')[1], mime: q.mime || 'audio/webm' });
          if (!r || !r.ok || !r.vn) throw new Error('vn');
          s(key, (g(key, []) || []).map(x => x.id === q.id ? Object.assign({}, x, { vn: r.vn }) : x)); q.vn = r.vn;
        }
        const r = await post(u, { key: k, who: w, action: 'chat', op: 'send', id: q.id, t: q.t || '', img: q.img || '', s: q.s || 0, rep: q.rep || null, vn: q.vn || '', dur: q.dur || 0 });
        if (!r || !r.ok) throw new Error('send');
        s(key, (g(key, []) || []).filter(x => x.id !== q.id)); idbDel(q.id); s('chat-q-lock', Date.now());
      }
    } catch (e) { waitT = Date.now() + 20e3; }
    sending = false; s('chat-q-lock', 0);
  }
  setTimeout(outbox, 3000); setInterval(outbox, 15e3);
  addEventListener('online', () => { waitT = 0; setTimeout(outbox, 1500); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(outbox, 1200); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();
