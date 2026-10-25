/* ═══ 🌐 MEJA ONLINE — game giliran / ngobrol dimainin beda HP.
   Cara kerjanya: "keadaan meja" (state) game disimpen di server; tiap ada yang jalan,
   HP-nya ngirim keadaan terbaru → HP pasangan langsung nampilin keadaan yang sama.
   Cara pakai di game:
     Meja.setup({ name, emoji, after: '#tombol', init(seed) → state awal, apply(state) → tampilin state dari pasangan,
                  begin()? → pindah ke layar game, onEnd()? → balik ke menu, quitFn?: 'namaFungsiKeluar' })
     Meja.on()          → lagi main online?
     Meja.push(state)   → abis aku jalan, kirim keadaan terbaru
     Meja.me(), Meja.op(), Meja.host() ═══ */
(function () {
  if (window.Meja) return;
  const PAGE = (location.pathname.split('/').pop() || '').replace(/\.html$/, '') || 'game';
  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const me = () => (window.Who && Who.me && Who.me()) || (window.Berdua && Berdua.me()) || g('berdua-me', 'Dara');
  const op = () => me() === 'Razan' ? 'Dara' : 'Razan';
  const tday = () => { const n = new Date(), p = x => String(x).padStart(2, '0'); return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`; };
  const sig = r => r ? [r.id, (r.moves || []).length, r.end ? 1 : 0, Object.keys(r.joined || {}).length].concat(r.sv ? [r.sv] : []).join(':') : 'null';
  const B = () => window.Berdua;
  const $$ = id => document.getElementById(id);
  if (!window.Berdua) { try { const sc = document.createElement('script'); sc.src = 'sync.js'; document.head.appendChild(sc); } catch (e) {} }

  let C = null, room = null, st = 'idle', sv = 0, inited = false, pollTok = 0, polling = false, sending = false, queued = null;
  // st: idle | wait (nunggu gabung) | play | ended

  function css() {
    if ($$('mj-css')) return;
    const c = document.createElement('style'); c.id = 'mj-css';
    c.textContent = `.mj-btn{display:block;width:100%;margin:.55rem 0 0;padding:.8rem .6rem;border-radius:50px;border:none;background:linear-gradient(135deg,#2f7d6b,#4fae8f);color:#fff;font:700 14px 'Poppins',system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(47,125,107,.28);white-space:normal;line-height:1.3}
    .mj-btn small{display:block;font-weight:400;font-size:11px;opacity:.88}
    .mj-inv{display:flex;align-items:center;gap:.6rem;width:100%;margin:.55rem 0 0;text-align:left;border:none;border-radius:18px;padding:.7rem .8rem;background:linear-gradient(135deg,#e6f7f0,#fff1e8);box-shadow:0 4px 14px rgba(47,125,107,.2);cursor:pointer;font-family:'Poppins',system-ui,sans-serif;animation:mjP 1.6s ease-in-out infinite}
    @keyframes mjP{50%{transform:scale(1.02)}}
    .mj-inv .e{font-size:1.5rem}.mj-inv b{display:block;font-size:13px;color:#2d1f1a}.mj-inv small{display:block;font-size:11px;color:#9a8070}.mj-inv i{margin-left:auto;font-style:normal;font-size:12px;font-weight:700;color:#fff;background:#2f7d6b;border-radius:50px;padding:.4rem .75rem;flex-shrink:0}
    .mj-ov{position:fixed;inset:0;z-index:9600;background:rgba(20,40,34,.55);display:flex;align-items:center;justify-content:center;padding:1.2rem;font-family:'Poppins',system-ui,sans-serif}
    .mj-c{background:#faf6f0;border-radius:24px;padding:1.4rem 1.2rem 1.1rem;max-width:330px;width:100%;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.3)}
    .mj-c .e{font-size:2.6rem;display:block}.mj-c h3{font-size:1.1rem;margin:.35rem 0 .25rem;color:#2d1f1a}.mj-c p{font-size:12.5px;color:#9a8070;line-height:1.55;margin:0 0 .9rem}
    .mj-c button{display:block;width:100%;border:none;border-radius:50px;padding:.8rem;font:700 14px 'Poppins',sans-serif;cursor:pointer;margin-top:.45rem;background:#2f7d6b;color:#fff}
    .mj-c button.g{background:#fff;color:#2f7d6b;border:1.5px solid #bfe2d6}
    .mj-tag{position:fixed;top:calc(6px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:9550;background:rgba(20,60,50,.85);color:#fff;border-radius:50px;padding:.26rem .7rem;font:600 11px 'Poppins',sans-serif;pointer-events:none;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.2)}
    .mj-tag.wait{background:rgba(120,90,30,.88)}`;
    document.head.appendChild(c);
  }
  function ov(html) { let o = $$('mj-ov'); if (!o) { o = document.createElement('div'); o.id = 'mj-ov'; o.className = 'mj-ov'; o.setAttribute('data-noskor', '1'); document.body.appendChild(o); } o.innerHTML = html; return o; }
  function ovClose() { const o = $$('mj-ov'); if (o) o.remove(); }
  function tag(txt, wait) {
    let t = $$('mj-tag');
    if (!txt) { if (t) t.remove(); return; }
    if (!t) { t = document.createElement('div'); t.id = 'mj-tag'; t.setAttribute('data-noskor', '1'); document.body.appendChild(t); }
    t.className = 'mj-tag' + (wait ? ' wait' : ''); t.textContent = txt;
  }
  function setOn(v) { window.Online = Object.assign(window.Online || {}, { on: !!v }); window.__onlineGame = v ? PAGE : null; }

  async function post(body) {
    for (let i = 0; i < 5; i++) {
      try {
        const r = await B().roomPost(Object.assign({ g: PAGE, who: me() }, body));
        if (r && r.room) room = r.room;
        return r;
      } catch (e) { await new Promise(res => setTimeout(res, 700 * (i + 1))); }
    }
    return null;
  }
  function poll() {
    if (polling) return; polling = true; const tok = ++pollTok;
    (async () => {
      while (tok === pollTok && st !== 'idle') {
        try { const before = sig(room), r = await B().room(PAGE, before); if (tok !== pollTok) break; if (r) { room = r; tick(); } if (sig(r) === before) await new Promise(res => setTimeout(res, 600)); }
        catch (e) { await new Promise(res => setTimeout(res, 2000)); }
      }
      polling = false;
    })();
  }
  function tick() {
    if (!room) return;
    if (room.end && st !== 'idle') {
      if (room.end.who !== me()) { const was = st; st = 'idle'; setOn(false); tag(''); pollTok++; if (was === 'play' || was === 'wait') { ov(`<div class="mj-c"><span class="e">🚪</span><h3>${op()} keluar dari meja</h3><p>Main online-nya selesai.</p><button id="mj-x">Oke</button></div>`); $$('mj-x').onclick = () => { ovClose(); try { C.onEnd && C.onEnd(); } catch (e) {} }; } }
      return;
    }
    const both = room.joined && room.joined.Razan && room.joined.Dara;
    if (st === 'wait' && both && room.host === me() && !room.sv && !inited) { inited = true; const s0 = C.init(room.cfg.seed); push(s0, true); }
    if (room.sv && room.sv > sv && room.state) {
      const first = st === 'wait'; sv = room.sv;
      if (first) { st = 'play'; ovClose(); setOn(true); try { C.begin && C.begin(); } catch (e) { console.error(e); } }
      if (room.sby !== me() || first) { try { C.apply(room.state); } catch (e) { console.error(e); } }
      paintTag();
    }
  }
  function paintTag() { if (st !== 'play') return tag(''); let t = null; try { t = C.turn ? C.turn(room.state) : null; } catch (e) {} tag(t == null ? `🌐 Online sama ${op()}` : t === me() ? '🌐 Giliran kamu' : `🌐 Giliran ${t}…`, t != null && t !== me()); }
  // kirim keadaan terbaru (kalau lagi ngirim, yang terakhir diantriin)
  async function push(state, init) {
    if (st !== 'play' && !init) return;
    if (sending) { queued = state; return; }
    sending = true;
    // batas server ±6000 huruf per keadaan → minta game ngerampingin dulu
    try { if (JSON.stringify(state).length > 5600 && C.trim) state = C.trim(JSON.parse(JSON.stringify(state))) || state; } catch (e) {}
    let r = await post({ op: 'state', id: room.id, st: state, sv: room.sv || 0 });
    if (r && !r.ok && r.error === 'data') { try { window.toast ? toast('Data game kegedean buat dikirim 😢') : console.warn('meja: data kegedean'); } catch (e) {} }
    if (r && !r.ok && r.error === 'conflict') {
      // barengan sama pasangan → keadaan dia yang dipakai
      if (room && room.state) { sv = room.sv; try { C.apply(room.state); } catch (e) {} }
      if (!C.quiet) try { window.toast && toast('Barengan sama ' + op() + ' — coba lagi ya'); } catch (e) {}
    } else if (r && r.ok) { if (st === 'play') sv = room.sv; else { sending = false; tick(); return; } }
    sending = false; paintTag();
    if (queued) { const q = queued; queued = null; push(q); }
  }

  async function open() {
    if (!B() || !B().url) return alert('Main online butuh koneksi Data Berdua 😢');
    css(); st = 'wait'; sv = 0; inited = false;
    ov(`<div class="mj-c"><span class="e">🌐</span><h3>Nyiapin meja…</h3></div>`);
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5), seed = Math.floor(Math.random() * 1e9);
    const r = await post({ op: 'new', id, cfg: { meja: 1, seed, c: C.cfg ? C.cfg() : null, n: C.name, e: C.emoji } });
    if (!r || !r.ok) { st = 'idle'; ov(`<div class="mj-c"><span class="e">😢</span><h3>Gagal bikin meja</h3><p>${r && r.error === 'game' ? 'Server belum diupdate — tempel Apps Script terbaru & deploy versi baru dulu ya.' : 'Cek internet terus coba lagi.'}</p><button id="mj-x">Oke</button></div>`); $$('mj-x').onclick = ovClose; return; }
    try { B().put('ajak', me(), tday(), { g: PAGE, id, at: Date.now(), n: C.name, e: C.emoji }); } catch (e) {}
    try { window.Push && Push.notify && Push.notify({ title: `🌐 ${me()} ngajak kamu main ${C.name} bareng`, body: 'Dari HP masing-masing — buka & gabung ya 🎮', url: `${PAGE}.html?online=1`, tag: 'meja-' + PAGE }); } catch (e) {}
    ov(`<div class="mj-c"><span class="e">${esc(C.emoji)}</span><h3>Nunggu ${op()} gabung…</h3><p>${op()} dapet notif ajakan main ${esc(C.name)}. Begitu gabung, game langsung mulai di dua HP 🎮</p><button class="g" id="mj-x">Batal</button></div>`);
    $$('mj-x').onclick = leave;
    poll(); tick();
  }
  async function join() {
    css(); st = 'wait'; sv = 0; inited = true;
    ov(`<div class="mj-c"><span class="e">🌐</span><h3>Gabung meja…</h3></div>`);
    try { if (C.setCfg && room.cfg && room.cfg.c) C.setCfg(room.cfg.c); } catch (e) {}
    const r = await post({ op: 'join', id: room.id });
    if (!r || !r.ok) { st = 'idle'; ov(`<div class="mj-c"><span class="e">😢</span><h3>Mejanya udah ga ada</h3><p>Mungkin udah dibatalin. Ajak balik aja!</p><button id="mj-x">Oke</button></div>`); $$('mj-x').onclick = ovClose; return; }
    ov(`<div class="mj-c"><span class="e">⏳</span><h3>Siap-siap…</h3><p>Nunggu ${op()} nyiapin meja</p></div>`);
    poll(); tick();
  }
  async function leave() { const was = st; st = 'idle'; pollTok++; setOn(false); tag(''); ovClose(); if (room && was !== 'idle') post({ op: 'bye', id: room.id }); }
  async function check(auto) {
    if (!B() || !B().url || st !== 'idle') return;
    let r = null; try { r = await B().room(PAGE); } catch (e) { return; }
    if (!r || !r.cfg || !r.cfg.meja || r.end || r.host === me() || (r.joined && r.joined[me()]) || Date.now() - (r.at || 0) > 10 * 60e3) { paintInv(null); return; }
    room = r; paintInv(r);
    if (auto) { css(); ov(`<div class="mj-c"><span class="e">${esc(C.emoji)}</span><h3>${op()} ngajak main online!</h3><p>${esc(C.name)} — dari HP masing-masing 🎮</p><button id="mj-ok">🎮 Gabung</button><button class="g" id="mj-x">Nanti</button></div>`); $$('mj-ok').onclick = join; $$('mj-x').onclick = ovClose; }
  }
  function paintInv(r) {
    const box = $$('mj-box'); if (!box) return;
    box.innerHTML = (r ? `<button class="mj-inv" id="mj-inv"><span class="e">🌐</span><span><b>${op()} ngajak main online!</b><small>Lagi nunggu kamu gabung</small></span><i>Gabung</i></button>` : '') + `<button class="mj-btn" id="mj-new">🌐 Main online sama ${op()}<small>dari HP masing-masing · ${esc(C.sub || 'gantian kayak biasa')}</small></button>`;
    if (r) $$('mj-inv').onclick = join;
    $$('mj-new').onclick = open;
  }

  window.Meja = {
    setup(cfg) {
      C = cfg; css();
      const mnt = typeof cfg.mount === 'string' ? document.querySelector(cfg.mount) : cfg.mount;
      const aft = cfg.after ? (typeof cfg.after === 'string' ? document.querySelector(cfg.after) : cfg.after) : null;
      if ((mnt || aft) && !$$('mj-box')) { const d = document.createElement('div'); d.id = 'mj-box'; if (aft) aft.insertAdjacentElement('afterend', d); else mnt.appendChild(d); }
      paintInv(null);
      if (cfg.quitFn && typeof window[cfg.quitFn] === 'function') { const o = window[cfg.quitFn]; window[cfg.quitFn] = function () { if (st === 'play') { if (!confirm(`Keluar dari main online sama ${op()}?`)) return; leave(); try { cfg.onEnd && cfg.onEnd(); } catch (e) {} return; } return o.apply(this, arguments); }; }
      const ask = /[?&]online=1/.test(location.search);
      const hook = n => { if (window.Berdua && Berdua.room) { check(ask); try { history.replaceState(null, '', location.pathname); } catch (e) {} Berdua.on(ev => { if (ev.apps && ev.apps.includes('ajak')) check(false); }); setInterval(() => { if (!document.hidden && st === 'idle') check(false); }, 20000); } else if (n < 30) setTimeout(() => hook(n + 1), 300); };
      hook(0);
    },
    on: () => st === 'play',
    push(s) { return push(s); },
    restart() { if (st !== 'play') return; const s0 = C.init(Math.floor(Math.random() * 1e9)); try { C.apply(s0); } catch (e) {} push(s0); },
    leave, me, op, host: () => room && room.host === me(), state: () => room && room.state, PAGE, paintTag
  };
})();
