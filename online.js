/* ═══ Game Online Berdua — main dari HP masing-masing ═══
   Butuh sync.js (Berdua). Satu "meja" per game, isinya urutan langkah.
   Halaman game cukup manggil Online.setup({...}) */
(function () {
  const WA = { Razan: '6285692740607', Dara: '6287703706518' };
  const GN = { congklak: ['🐚', 'Congklak'], 'perang-kapal': ['⚓', 'Perang Kapal'], dam: ['⚫', 'Dam'], 'empat-sejajar': ['🔴', 'Empat Sejajar'] };
  const FRESH = 12 * 3600e3;
  const O = { on: false, room: null, applied: 0, g: null, h: null, wait: false, net: 'ok', waitingJoin: false };
  let pollT = null, polling = false, delivering = false, sendChain = Promise.resolve(), lastRoom = undefined;
  const B = () => window.Berdua;
  const me = () => B() ? B().me() : 'Dara';
  const op = () => me() === 'Razan' ? 'Dara' : 'Razan';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = id => document.getElementById(id);
  const vib = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  const fresh = r => r && !r.end && Date.now() - (r.last || r.at || 0) < FRESH;
  const both = r => r && r.joined && r.joined.Razan && r.joined.Dara;
  const tday = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };

  function css() {
    if ($('ol-css')) return;
    const st = document.createElement('style'); st.id = 'ol-css';
    st.textContent = `
    .ol-panel{background:linear-gradient(135deg,#eef4fd,#fdf0ec);border:1.5px solid rgba(74,127,193,.25);border-radius:20px;padding:.9rem 1rem;margin:.8rem 0;text-align:left}
    .ol-panel h3{font-size:13.5px;font-weight:700;color:#2d1f1a;margin:0 0 .2rem;display:flex;align-items:center;justify-content:space-between;gap:.4rem}
    .ol-panel h3 span.new{font-size:9.5px;background:#4a7fc1;color:#fff;border-radius:20px;padding:.12rem .45rem;letter-spacing:.06em}
    .ol-panel p{font-size:11.5px;color:#9a8070;line-height:1.55;margin:0 0 .6rem}
    .ol-panel .who{font-size:11.5px;color:#9a8070;margin:0 0 .55rem}
    .ol-panel .who button{border:none;background:none;color:#c17a6f;font-weight:600;text-decoration:underline;font-size:11.5px;cursor:pointer;padding:0;font-family:inherit}
    .ol-panel .who b.Razan{color:#4a7fc1}.ol-panel .who b.Dara{color:#d9776b}
    .ol-btn{display:block;width:100%;padding:.8rem .5rem;border:none;border-radius:50px;font-family:inherit;font-size:13.5px;font-weight:700;color:#fff;background:linear-gradient(135deg,#6f9ad6,#3f6aa8);cursor:pointer;box-shadow:0 5px 14px rgba(63,106,168,.25)}
    .ol-btn.pink{background:linear-gradient(135deg,#d48c80,#a8584c);box-shadow:0 5px 14px rgba(168,88,76,.25);animation:olP 1.6s ease-in-out infinite}
    @keyframes olP{50%{transform:scale(1.03)}}
    .ol-btn.ghost{background:#fff;color:#7a3f35;border:1.5px solid #e8c4b0;box-shadow:none;font-weight:600}
    .ol-row{display:flex;gap:.45rem;margin-top:.45rem}.ol-row>*{flex:1;min-width:0}
    .ol-wa{display:block;text-align:center;padding:.7rem .4rem;border-radius:50px;background:#25a35a;color:#fff;font-size:12.5px;font-weight:700;text-decoration:none}
    .ol-ov{position:fixed;inset:0;z-index:9550;background:rgba(45,31,26,.45);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1.2rem}
    .ol-card{width:100%;max-width:340px;background:#faf6f0;border-radius:24px;padding:1.4rem 1.2rem 1rem;text-align:center;font-family:'Poppins',system-ui,sans-serif;animation:olIn .4s cubic-bezier(.3,1.4,.5,1)}
    @keyframes olIn{from{transform:scale(.7);opacity:0}}
    .ol-card .e{font-size:3rem;display:block;line-height:1.1}
    .ol-card h3{font-size:1.05rem;font-weight:700;color:#7a3f35;margin:.5rem 0 .3rem;line-height:1.3}
    .ol-card p{font-size:12.5px;color:#9a8070;line-height:1.6;margin:0 0 .9rem}
    .ol-dots i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#c17a6f;margin:0 3px;animation:olD 1.2s ease-in-out infinite}
    .ol-dots i:nth-child(2){animation-delay:.2s}.ol-dots i:nth-child(3){animation-delay:.4s}
    @keyframes olD{0%,100%{opacity:.25;transform:translateY(0)}50%{opacity:1;transform:translateY(-4px)}}
    .ol-x{display:block;width:100%;margin-top:.4rem;padding:.6rem;border:none;background:none;color:#9a8070;font-family:inherit;font-size:12.5px;cursor:pointer}
    .ol-st{font-size:11px;text-align:center;color:#4a7fc1;margin:.35rem 0 0;min-height:1.1em;font-weight:500}
    .ol-st.err{color:#b4554a}`;
    document.head.appendChild(st);
  }

  // ── server ──
  async function getRoom() { try { const r = await B().room(O.g); O.net = 'ok'; return r; } catch (e) { O.net = 'err'; return undefined; } }
  async function post(body) {
    for (let i = 0; i < 6; i++) {
      try { const r = await B().roomPost(Object.assign({ g: O.g, who: me() }, body)); O.net = 'ok'; status(); return r; }
      catch (e) { O.net = 'err'; status(); await new Promise(r => setTimeout(r, 1500 * (i + 1))); }
    }
    return { ok: false, error: 'jaringan' };
  }

  // ── panel di menu game ──
  function panel() {
    const el = $('ol-panel'); if (!el) return;
    if (!B() || !B().enabled) { el.style.display = 'none'; return; }
    el.style.display = '';
    const r = lastRoom, m = me(), o = op(), N = GN[O.g] || ['🎮', O.g];
    let body = '';
    if (fresh(r) && r.host === o && !(r.joined || {})[m]) body = `<p>${o} lagi nunggu kamu buat main ${N[1]} 🥺</p><button class="ol-btn pink" onclick="Online.join()">🎮 Gabung main sama ${o}</button>`;
    else if (fresh(r) && both(r)) body = `<p>Ada game yang belum selesai (${r.moves.length} langkah).</p><button class="ol-btn" onclick="Online.resume()">▶ Lanjutin game online</button><div class="ol-row"><button class="ol-btn ghost" onclick="Online.invite()">🔁 Mulai baru</button></div>`;
    else if (fresh(r) && r.host === m) body = `<p>Kamu udah ngajak ${o}, nunggu dia gabung…</p><button class="ol-btn" onclick="Online.waitJoin()">⏳ Liat status</button>`;
    else body = `<p>Main dari HP masing-masing — langkah ${o} muncul sendiri di HP kamu. Seru buat pas lagi jauhan 🫶</p><button class="ol-btn" onclick="Online.invite()">🎮 Ajak ${o} main online</button>`;
    const html = `<h3>🌐 Main online (beda HP) <span class="new">BARU</span></h3><p class="who">Kamu main sebagai <b class="${m}">${m}</b> · <button onclick="Online.swap()">bukan aku</button></p>${body}`;
    if (el.__h !== html) { el.innerHTML = html; el.__h = html; }
  }
  function swap() { if (!B()) return; B().setMe(op()); panel(); }

  // ── overlay ──
  function overlay(html) { closeOv(); const ov = document.createElement('div'); ov.className = 'ol-ov'; ov.id = 'ol-ov'; ov.innerHTML = `<div class="ol-card">${html}</div>`; document.body.appendChild(ov); return ov; }
  function closeOv() { const x = $('ol-ov'); if (x) x.remove(); }
  function waLink() { const u = new URL(O.g + '.html?online=1', location.href).href; return `https://wa.me/${WA[op()]}?text=${encodeURIComponent(`🎮 Main ${(GN[O.g] || ['', O.g])[1]} online yuk sama aku! Aku udah nunggu nih 😆\n${u}`)}`; }
  function waitJoin() {
    O.waitingJoin = true;
    overlay(`<span class="e">${(GN[O.g] || ['🎮'])[0]}</span><h3>Nunggu ${op()} gabung</h3><p>Ajakannya udah dikirim ke web ${op()} — begitu dia buka & gabung, game langsung mulai.</p><p class="ol-dots"><i></i><i></i><i></i></p><a class="ol-wa" href="${waLink()}" target="_blank" rel="noopener">💬 Kabarin lewat WA juga</a><button class="ol-x" onclick="Online.cancelWait()">Tutup</button>`);
    poll(true);
  }
  function cancelWait() { O.waitingJoin = false; closeOv(); panel(); }

  // ── alur ──
  async function invite() {
    if (O.h.canInvite && !O.h.canInvite()) return;
    const cfg = O.h.makeCfg ? O.h.makeCfg() : {};
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    overlay(`<span class="e">⏳</span><h3>Nyiapin meja…</h3><p class="ol-dots"><i></i><i></i><i></i></p>`);
    const r = await post({ op: 'new', id, cfg });
    if (!r.ok) { overlay(`<span class="e">😵</span><h3>Gagal nyambung</h3><p>Cek internet terus coba lagi ya.</p><button class="ol-x" onclick="document.getElementById('ol-ov').remove()">Tutup</button>`); return; }
    lastRoom = r.room;
    try { B().put('ajak', me(), tday(), { g: O.g, id, at: Date.now() }); } catch (e) {}
    waitJoin();
  }
  async function join() {
    overlay(`<span class="e">🎮</span><h3>Gabung…</h3><p class="ol-dots"><i></i><i></i><i></i></p>`);
    const cur = await getRoom(); if (cur === undefined) { closeOv(); return; }
    lastRoom = cur;
    if (!fresh(cur)) { closeOv(); panel(); return; }
    const r = await post({ op: 'join', id: cur.id });
    closeOv();
    if (r.ok) enter(r.room); else panel();
  }
  async function resume() { const r = await getRoom(); if (r) { lastRoom = r; if (fresh(r)) enter(r); else panel(); } }
  function enter(room) {
    closeOv(); O.waitingJoin = false;
    O.on = true; O.room = room; O.applied = room.moves.length; O.wait = false;
    O.h.onStart(room, me(), op());
    status(); poll(true);
  }
  function leave(silent) {
    if (O.on && O.room && !O.room.end) post({ op: 'bye', id: O.room.id });
    O.on = false; O.room = null; status(); if (!silent) panel();
  }
  function move(mv, opt) {
    if (!O.on || !O.room) return;
    const n = O.applied++; const id = O.room.id;
    sendChain = sendChain.then(async () => {
      const r = await post({ op: 'move', id, n, mv });
      if (r.ok) { O.room = r.room; return; }
      if (r.error === 'conflict' && r.room && r.room.id === id) {
        if (opt && opt.retry) {                              // langkah barengan (mis. pasang kapal) → masukin langkah lawan dulu, kirim ulang
          O.applied = n; O.room = r.room; await deliver(r.room, mv);
          O.applied++; const r2 = await post({ op: 'move', id, n: r.room.moves.length, mv }); if (r2.ok) O.room = r2.room; else resync(r2.room);
        } else resync(r.room);
      } else if (r.error === 'ended' && r.room) ended(r.room);
      else if (r.error === 'stale') resync(r.room);
    });
  }
  function resync(room) { if (room && fresh(room) && both(room)) { O.room = room; O.applied = room.moves.length; O.h.onStart(room, me(), op()); } else if (room) ended(room); }
  async function deliver(room, skipMine) {
    if (delivering) return; delivering = true;
    try {
      while (O.on && O.room && room.id === O.room.id && room.moves.length > O.applied) {
        const i = O.applied, mv = room.moves[i];
        O.applied++;
        if (skipMine && JSON.stringify(mv) === JSON.stringify(skipMine)) continue;
        try { await O.h.onMove(mv, i); } catch (e) { console.error(e); }
      }
    } finally { delivering = false; }
  }
  function ended(room) {
    if (!O.on) return; O.room = room; O.on = false; status();
    if (room.end && room.end.who && room.end.who !== me()) {
      overlay(`<span class="e">👋</span><h3>${esc(room.end.who)} keluar dari game</h3><p>Gamenya udahan. Ajak main lagi kapan-kapan ya 🤍</p><button class="ol-btn" onclick="document.getElementById('ol-ov').remove();Online.h.onLeft&&Online.h.onLeft()">Oke</button>`);
    }
  }

  // ── cek berkala ──
  function every() { if (!O.on) return O.waitingJoin ? 2000 : 6000; return O.wait ? 2000 : 6000; }
  async function poll(now) {
    clearTimeout(pollT);
    if (document.hidden) return;
    if (!now) { pollT = setTimeout(() => poll(true), every()); return; }
    if (polling) { pollT = setTimeout(() => poll(true), 800); return; }
    polling = true;
    const r = await getRoom(); polling = false; status();
    if (r !== undefined) {
      lastRoom = r;
      if (O.on && O.room) {
        if (!r || r.id !== O.room.id) {
          if (r && fresh(r) && r.host === op()) { overlay(`<span class="e">🔁</span><h3>${op()} ngajak main lagi!</h3><p>Gabung ke game baru?</p><button class="ol-btn pink" onclick="Online.join()">🎮 Gabung</button><button class="ol-x" onclick="document.getElementById('ol-ov').remove()">Nanti</button>`); O.on = false; }
        } else if (r.end) ended(r);
        else await deliver(r);
      } else if (O.waitingJoin && r && r.host === me() && both(r) && fresh(r)) { vib([40, 40, 80]); try { window.SFX && SFX.play('open'); } catch (e) {} enter(r); }
      else if (!O.on) panel();
    }
    pollT = setTimeout(() => poll(true), every());
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(true); });

  function status() {
    const el = O.h && O.h.statusEl && $(O.h.statusEl); if (!el) return;
    if (!O.on) { el.textContent = ''; el.className = 'ol-st'; return; }
    el.className = 'ol-st' + (O.net === 'err' ? ' err' : '');
    el.textContent = O.net === 'err' ? '⚠️ Koneksi putus — nyoba nyambung lagi…' : `🌐 Online · kamu (${me()}) vs ${op()}`;
  }
  function waiting(v) { const was = O.wait; O.wait = !!v; if (v && !was) poll(false); }

  function setup(h) {
    O.g = h.g; O.h = h; window.__onlineGame = h.g; css();
    const anchor = h.panelAfter && document.querySelector(h.panelAfter);
    if (anchor && !$('ol-panel')) { const d = document.createElement('div'); d.className = 'ol-panel'; d.id = 'ol-panel'; anchor.insertAdjacentElement('afterend', d); }
    panel();
    if (!B() || !B().enabled) return;
    (async () => {
      const r = await getRoom(); if (r !== undefined) lastRoom = r; panel();
      if (/[?&]online=1/.test(location.search) && r && fresh(r)) {
        if (r.host === op() && !(r.joined || {})[me()]) join();
        else if (both(r)) enter(r);
      }
      poll(false);
    })();
  }

  window.Online = { setup, invite, join, resume, leave, move, waiting, swap, waitJoin, cancelWait, me, op, get on() { return O.on; }, get room() { return O.room; }, get h() { return O.h; } };
})();
