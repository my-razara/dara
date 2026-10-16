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
  let liftT = 0;
  function lift() {
    if (!btn) return; const W = innerWidth, H = innerHeight;
    let h = barH(document, window, 0, 0, W, H);
    document.querySelectorAll('iframe').forEach(f => { try { const r = f.getBoundingClientRect(); if (f.contentDocument) h = Math.max(h, barH(f.contentDocument, f.contentWindow, r.left, r.top, W, H)); } catch (e) {} });
    if (h > 0) btn.style.setProperty('bottom', (h + 10) + 'px', 'important'); else btn.style.removeProperty('bottom');
  }
  const liftLater = () => { clearTimeout(liftT); liftT = setTimeout(() => { if (!document.hidden) lift(); }, 450); };
  const shrink = () => { clearTimeout(miniT); miniT = setTimeout(() => btn && btn.classList.add('mini'), 3500); };
  function paint() {
    if (!btn) return; const p = g('chat-peek-' + me(), null), n = p && p.n || 0;
    btn.innerHTML = '💬' + (n ? `<i>${n > 9 ? '9+' : n}</i>` : '');
    btn.setAttribute('aria-label', n ? `Chat · ${n} pesan baru` : 'Chat');
    if (n) { btn.classList.remove('mini'); btn.classList.add('new'); shrink(); }
  }
  async function peek() {
    const w = me(); if (!w || document.hidden) return;
    const last = g('chat-peek-' + w, null); if (last && Date.now() - (last.at || 0) < 60e3) { paint(); return; }
    try {
      const u = (window.Berdua && Berdua.url) || URL, k = (window.Berdua && Berdua.key) || KEY;
      const r = await fetch(`${u}?action=chat&key=${k}&who=${w}&peek=1&t=${Date.now()}`).then(x => x.json());
      if (r && r.ok) { s('chat-peek-' + w, { n: r.unread || 0, last: r.last, at: Date.now() }); paint(); }
    } catch (e) {}
  }
  function add() {
    if (!me()) return; css();
    btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cfab'; btn.dataset.sfxSkip = '1';
    btn.addEventListener('click', e => { e.stopPropagation(); if (btn.classList.contains('mini')) { btn.classList.remove('mini'); shrink(); return; } location.href = 'chat.html'; });
    document.body.appendChild(btn); paint(); shrink(); setTimeout(peek, 2500);
    setTimeout(lift, 900); addEventListener('resize', liftLater); setInterval(() => { if (!document.hidden) lift(); }, 4000);
    try { new MutationObserver(m => { if (m.some(x => x.target !== btn && !btn.contains(x.target))) liftLater(); }).observe(document.body, { attributes: true, attributeFilter: ['class', 'style'], childList: true, subtree: true }); } catch (e) {}
    // lagi main game online → tombol 💬 komen game yang dipakai, yang ini ngumpet dulu biar ga dobel
    setInterval(() => { if (btn) btn.style.display = document.getElementById('olc-fab') ? 'none' : ''; }, 1500);
    setInterval(peek, 90e3); document.addEventListener('visibilitychange', () => { if (!document.hidden) peek(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();
