/* ═══ ⚔️ DUEL ONLINE — main barengan di HP masing-masing, tantangannya sama persis (seed sama),
   skor lawan keliatan live, pemenang otomatis.
   Cara pakai di game:
     Duel.setup({ name, emoji, low, fmt(v), valid(v)?, start(seed, cfg), stop()?, cfg()?, setCfg(c)?, mount: '#elemen' })
     pas main: Duel.score(v)  (opsional, buat skor live)
     pas selesai: if (Duel.active()) return Duel.finish(v);
   📨 Tantang jarak jauh (ikut otomatis): main sekali → skor dikirim → pasangan main kapan aja dengan seed sama, sekali kesempatan.
   Server: pakai "meja" game online yang sama (Berdua.room / roomPost). ═══ */
(function () {
  if (window.Duel) return;
  const PAGE = (location.pathname.split('/').pop() || '').replace(/\.html$/, '') || 'game';
  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const s = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const me = () => (window.Who && Who.me && Who.me()) || (window.Berdua && Berdua.me()) || g('berdua-me', 'Dara');
  const op = () => me() === 'Razan' ? 'Dara' : 'Razan';
  const tday = () => { const n = new Date(), p = x => String(x).padStart(2, '0'); return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`; };
  const sig = r => r ? [r.id, (r.moves || []).length, r.end ? 1 : 0, Object.keys(r.joined || {}).length].join(':') : 'null';
  const B = () => window.Berdua;
  if (!window.Berdua) { try { const sc = document.createElement('script'); sc.src = 'sync.js'; document.head.appendChild(sc); } catch (e) {} }

  let mode = 'duel', tgR = null, tgAsk = null, invR = null;
  let C = null, room = null, st = 'idle', lastSent = 0, lastV = null, polling = false, pollTok = 0, mineFin = null, cdT = 0;
  // st: idle | wait (nunggu lawan gabung) | count | play | fin (aku udah selesai, nunggu lawan) | done

  // ── tampilan ──
  function css() {
    if (document.getElementById('duel-css')) return;
    const c = document.createElement('style'); c.id = 'duel-css';
    c.textContent = `.dl-btn{display:block;width:100%;margin:.55rem 0 0;padding:.8rem .6rem;border-radius:50px;border:none;background:linear-gradient(135deg,#3b3566,#6a5a9e);color:#fff;font:700 14px 'Poppins',system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(59,53,102,.28);white-space:normal;line-height:1.3}
    .dl-btn small{display:block;font-weight:400;font-size:11px;opacity:.85}
    .dl-inv{display:flex;align-items:center;gap:.6rem;width:100%;margin:.55rem 0 0;text-align:left;border:none;border-radius:18px;padding:.7rem .8rem;background:linear-gradient(135deg,#efeaff,#ffe4ea);box-shadow:0 4px 14px rgba(106,90,158,.2);cursor:pointer;font-family:'Poppins',system-ui,sans-serif;animation:dlP 1.6s ease-in-out infinite}
    @keyframes dlP{50%{transform:scale(1.02)}}
    .dl-inv .e{font-size:1.5rem}.dl-inv b{display:block;font-size:13px;color:#2d1f1a}.dl-inv small{display:block;font-size:11px;color:#9a8070}.dl-inv i{margin-left:auto;font-style:normal;font-size:12px;font-weight:700;color:#fff;background:#6a5a9e;border-radius:50px;padding:.4rem .75rem;flex-shrink:0}
    .dl-ov{position:fixed;inset:0;z-index:9600;background:rgba(30,24,50,.6);display:flex;align-items:center;justify-content:center;padding:1.2rem;font-family:'Poppins',system-ui,sans-serif}
    .dl-c{background:#faf6f0;border-radius:24px;padding:1.4rem 1.2rem 1.1rem;max-width:330px;width:100%;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.3);animation:dlIn .35s cubic-bezier(.3,1.4,.5,1)}
    @keyframes dlIn{from{transform:scale(.88);opacity:0}}
    .dl-c .e{font-size:2.6rem;display:block;line-height:1.2}
    .dl-c h3{font-size:1.1rem;margin:.35rem 0 .25rem;color:#2d1f1a}
    .dl-c p{font-size:12.5px;color:#9a8070;line-height:1.55;margin:0 0 .9rem}
    .dl-c .vs{display:flex;gap:.5rem;margin:.2rem 0 .9rem}.dl-c .vs div{flex:1;border-radius:16px;padding:.6rem .3rem;background:#fff;font-size:11px;color:#9a8070}.dl-c .vs b{display:block;font-size:1.35rem;color:#2d1f1a}.dl-c .vs .w{background:#fffbea;box-shadow:0 0 0 2px #e3c77a}
    .dl-c button{display:block;width:100%;border:none;border-radius:50px;padding:.8rem;font:700 14px 'Poppins',sans-serif;cursor:pointer;margin-top:.45rem;background:#6a5a9e;color:#fff}
    .dl-c button.g{background:#fff;color:#6a5a9e;border:1.5px solid #d6cdee}
    .dl-cd{font-size:4.5rem;font-weight:800;color:#fff;text-shadow:0 6px 24px rgba(0,0,0,.4);animation:dlCd .9s ease}
    @keyframes dlCd{from{transform:scale(1.7);opacity:0}30%{opacity:1}}
    .dl-hud{position:fixed;top:calc(6px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:9550;display:flex;gap:.35rem;align-items:center;background:rgba(30,24,50,.82);color:#fff;border-radius:50px;padding:.28rem .7rem;font:600 11.5px 'Poppins',sans-serif;pointer-events:none;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.25)}
    .dl-tg{display:block;width:100%;margin:.45rem 0 0;padding:.7rem .6rem;border-radius:50px;border:1.5px dashed #b9a9e0;background:rgba(255,255,255,.75);color:#4b3f80;font:600 13px 'Poppins',system-ui,sans-serif;cursor:pointer;white-space:normal;line-height:1.3}
    .dl-tg small{display:block;font-weight:400;font-size:10.5px;opacity:.8}
    .dl-tgi{display:flex;align-items:center;gap:.6rem;width:100%;margin:.45rem 0 0;text-align:left;border:none;border-radius:18px;padding:.65rem .8rem;background:linear-gradient(135deg,#fff4e8,#ffe4ea);box-shadow:0 4px 14px rgba(217,119,107,.18);cursor:pointer;font-family:'Poppins',system-ui,sans-serif;animation:dlP 1.8s ease-in-out infinite}
    .dl-tgi .e{font-size:1.4rem;flex:0 0 auto}.dl-tgi>span:not(.e){flex:1;min-width:0}.dl-tgi b{display:block;font-size:12.5px;color:#2d1f1a}.dl-tgi small{display:block;font-size:11px;color:#9a8070}.dl-tgi i{font-style:normal;font-size:12px;font-weight:700;color:#fff;background:#d9776b;border-radius:50px;padding:.4rem .7rem;flex-shrink:0}
    .dl-tgs{display:flex;gap:.45rem;align-items:center;margin:.4rem 0 0;font:500 11.5px 'Poppins',system-ui,sans-serif;color:#9a8070;background:rgba(255,255,255,.65);border-radius:14px;padding:.45rem .7rem;text-align:left;line-height:1.4}
    .dl-tgs.w{color:#2e7d4f;background:#eefaf2}.dl-tgs.l{color:#a8584c;background:#fff1ee}
    .dl-hud i{font-style:normal;opacity:.7}.dl-hud b{font-weight:700}.dl-hud .R{color:#9fc4ff}.dl-hud .D{color:#ffb3a8}`;
    document.head.appendChild(c);
  }
  function ov(html) { let o = document.getElementById('dl-ov'); if (!o) { o = document.createElement('div'); o.id = 'dl-ov'; o.className = 'dl-ov'; o.setAttribute('data-noskor', '1'); document.body.appendChild(o); } o.innerHTML = html; return o; }
  function ovClose() { const o = document.getElementById('dl-ov'); if (o) o.remove(); }
  function hud() {
    let h = document.getElementById('dl-hud');
    if (st !== 'play' && st !== 'fin') { if (h) h.remove(); return; }
    if (!h) { h = document.createElement('div'); h.id = 'dl-hud'; h.className = 'dl-hud'; h.setAttribute('data-noskor', '1'); document.body.appendChild(h); }
    const S = scores(), m = me(), o = op(), f = v => v == null ? '–' : C.fmt(v);
    if (mode === 'tg') { h.innerHTML = `📨 <b class="${m[0]}">Kamu ${f(lastV)}</b>` + (tgR && tgR.ch ? `<i>vs</i><b class="${o[0]}">${o} ${esc(tgR.ch.f)}</b>` : '<i>· tantangan</i>'); return; }
    h.innerHTML = `⚔️ <b class="${m[0]}">Kamu ${f(lastV)}</b><i>vs</i><b class="${o[0]}">${o} ${f(S[o].v)}${S[o].fin ? ' ✓' : ''}</b>`;
  }
  function scores() {
    const out = { Razan: { v: null, fin: false }, Dara: { v: null, fin: false } };
    ((room && room.moves) || []).forEach(m => { if (!m || !out[m.w]) return; if (m.f !== undefined) { out[m.w].v = m.f; out[m.w].fin = true; } else if (m.s !== undefined && !out[m.w].fin) out[m.w].v = m.s; });
    return out;
  }
  const valid = v => v != null && (C.valid ? C.valid(v) : true);
  const better = (a, b) => valid(a) && (!valid(b) || (C.low ? a < b : a > b));

  // ── server ──
  async function post(body) {
    for (let i = 0; i < 6; i++) {
      try {
        const r = await B().roomPost(Object.assign({ g: PAGE, who: me() }, body, body.op === 'move' ? { id: room.id, n: (room.moves || []).length } : {}));
        if (r && r.room) room = r.room;
        if (r && r.ok) return r;
        if (r && r.error === 'conflict') continue;
        return r;
      } catch (e) { await new Promise(res => setTimeout(res, 800 * (i + 1))); }
    }
    return null;
  }
  async function move(mv) { return post({ op: 'move', mv }); }
  function poll() {
    if (polling) return; polling = true; const tok = ++pollTok;
    (async () => {
      while (tok === pollTok && st !== 'idle' && st !== 'done') {
        try { const before = sig(room), r = await B().room(PAGE, before); if (tok !== pollTok) break; if (r) { room = r; tick(); } if (sig(r) === before) await new Promise(res => setTimeout(res, 700)); }
        catch (e) { await new Promise(res => setTimeout(res, 2000)); }
      }
      polling = false;
    })();
  }
  // ── alur ──
  function tick() {
    if (!room) return;
    if (room.end && st !== 'done' && st !== 'idle') { const who = room.end.who; if (who !== me()) { stopGame(); st = 'done'; hud(); result(true); } return; }
    const both = room.joined && room.joined.Razan && room.joined.Dara;
    if (st === 'wait' && both) {
      if (room.host === me() && !(room.moves || []).some(m => m.go)) move({ go: 1, w: me() });
      if ((room.moves || []).some(m => m.go)) countdown();
    }
    if (st === 'play' || st === 'fin') hud();
    if (st === 'fin') { const S = scores(); if (S.Razan.fin && S.Dara.fin) { st = 'done'; result(false); } else showWaitFin(); }
  }
  function waitFinHTML() { const S = scores(), o = op(); return `<div class="dl-c"><span class="e">⏳</span><h3>Skor kamu: ${esc(valid(mineFin) ? C.fmt(mineFin) : 'nyerah')}</h3><p>Nunggu ${o} selesai main…<br>Skor ${o} sekarang: <b>${S[o].v == null ? '–' : esc(C.fmt(S[o].v))}</b></p><button class="g" id="dl-x">Udahan aja</button></div>`; }
  function showWaitFin() { ov(waitFinHTML()); const x = $$('dl-x'); if (x) x.onclick = cancel; }
  function countdown() {
    if (st !== 'wait') return; st = 'count'; let n = 3;
    const o = ov(`<div class="dl-cd" id="dl-cd">3</div>`); o.style.background = 'rgba(30,24,50,.45)';
    const step = () => { const el = document.getElementById('dl-cd'); if (n > 0) { if (el) { el.textContent = n; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; } try { navigator.vibrate && navigator.vibrate(15); } catch (e) {} n--; cdT = setTimeout(step, 850); return; } ovClose(); begin(); };
    step();
  }
  // selama duel, angka acak game disamain (seed sama) biar tantangannya setara
  const R0 = Math.random;
  function seedRandom(seed) { let a = (seed | 0) || 1; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function unseed() { Math.random = R0; }
  function begin() {
    st = 'play'; if (!C.ownSeed) seedRandom(room.cfg.seed); lastV = null; mineFin = null; lastSent = 0; window.__onlineGame = PAGE;
    try { if (C.setCfg && room.cfg && room.cfg.c) C.setCfg(room.cfg.c); } catch (e) {}
    hud();
    try { C.start(room.cfg.seed, room.cfg.c); } catch (e) { console.error(e); }
    if (C.now) { clearInterval(window.__dlNow); window.__dlNow = setInterval(() => { if (st !== 'play') return clearInterval(window.__dlNow); try { const v = C.now(); if (v != null && v !== lastV) Duel.score(v); } catch (e) {} }, 1500); }
  }
  function stopGame() { unseed(); try { C.stop && C.stop(); } catch (e) {} }
  function result(left) {
    clearTimeout(cdT); hud();
    const S = scores(), m = me(), o = op(), a = S[m].v, b = S[o].v;
    let w = null; if (!left) { if (better(a, b)) w = m; else if (better(b, a)) w = o; }
    else w = m;   // lawan kabur
    const rec = g('duel-' + PAGE, { Razan: 0, Dara: 0 }); const key = room.id;
    if (w && !g('duel-seen', []).includes(key)) { rec[w] = (rec[w] || 0) + 1; s('duel-' + PAGE, rec); s('duel-seen', g('duel-seen', []).concat(key).slice(-60)); if (w === m && !left) { try { window.Skor && Skor.add && Skor.add(PAGE, m); } catch (e) {} } }
    const f = v => v == null ? '–' : C.fmt(v);
    ov(`<div class="dl-c"><span class="e">${left ? '🏃' : w === m ? '🏆' : w ? '😤' : '🤝'}</span><h3>${left ? `${o} ninggalin duel` : w === m ? 'Kamu yang menang duel!' : w ? `${o} yang menang duel` : 'Seri!'}</h3>
      <div class="vs"><div class="${w === m ? 'w' : ''}">Kamu<b>${esc(f(a))}</b></div><div class="${w === o ? 'w' : ''}">${o}<b>${esc(f(b))}</b></div></div>
      <p>Rekor duel ${esc(C.name)}: Razan ${rec.Razan || 0} · Dara ${rec.Dara || 0}</p>
      <button id="dl-again">⚔️ Duel lagi</button><button class="g" id="dl-x">Udahan</button></div>`);
    if (w === m) { try { window.SFX && SFX.play('win'); } catch (e) {} confettiLite(); }
    $$('dl-again').onclick = () => { ovClose(); open(true); };
    $$('dl-x').onclick = () => { ovClose(); st = 'idle'; pollTok++; window.__onlineGame = null; try { C.onEnd && C.onEnd(); } catch (e) {} };
  }
  const $$ = id => document.getElementById(id);
  function confettiLite() { const cl = ['#ffd36b', '#c9b6ea', '#f6a6c1', '#fff']; for (let i = 0; i < 40; i++) { const p = document.createElement('i'); p.style.cssText = `position:fixed;z-index:9700;top:-10px;left:${Math.random() * 100}vw;width:8px;height:12px;background:${cl[i % 4]};border-radius:2px;pointer-events:none;transition:transform 2.2s linear,opacity 2.2s;`; document.body.appendChild(p); requestAnimationFrame(() => { p.style.transform = `translateY(${innerHeight + 40}px) rotate(${Math.random() * 720}deg)`; p.style.opacity = '0'; }); setTimeout(() => p.remove(), 2400); } }

  // bikin duel baru (aku yang ngajak)
  async function open(again) {
    if (!B() || !B().url) return alert('Duel online butuh koneksi Data Berdua 😢');
    if (st === 'play' || st === 'count') return;
    css(); st = 'wait'; mineFin = null; lastV = null;
    ov(`<div class="dl-c"><span class="e">⚔️</span><h3>Nyiapin duel…</h3><p>Bentar ya</p></div>`);
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5), seed = Math.floor(Math.random() * 1e9);
    const r = await post({ op: 'new', id, cfg: { duel: 1, seed, c: C.cfg ? C.cfg() : null, n: C.name, e: C.emoji } });
    if (!r || !r.ok) { st = 'idle'; ov(`<div class="dl-c"><span class="e">😢</span><h3>Gagal bikin duel</h3><p>${r && r.error === 'game' ? 'Server belum diupdate — tempel Apps Script terbaru & deploy versi baru dulu ya.' : 'Cek internet terus coba lagi.'}</p><button id="dl-x">Oke</button></div>`); $$('dl-x').onclick = ovClose; return; }
    try { B().put('ajak', me(), tday(), { g: PAGE, id, at: Date.now(), v: 'duel', n: C.name, e: C.emoji }); } catch (e) {}
    try { window.Push && Push.notify && Push.notify({ title: `⚔️ ${me()} ngajak duel ${C.name}!`, body: 'Main barengan dari HP masing-masing — siapa skornya paling bagus? 😏', url: `${PAGE}.html?online=1`, tag: 'duel-' + PAGE }); } catch (e) {}
    ov(`<div class="dl-c"><span class="e">${esc(C.emoji)}</span><h3>Nunggu ${op()} gabung…</h3><p>${op()} dapet notif ajakan duel ${esc(C.name)}. Begitu dia gabung, hitung mundur langsung jalan & kalian main barengan dengan tantangan yang sama persis ⚔️</p><button class="g" id="dl-x">Batal</button></div>`);
    $$('dl-x').onclick = cancel;
    poll(); tick();
  }
  async function join() {
    css(); st = 'wait';
    ov(`<div class="dl-c"><span class="e">⚔️</span><h3>Gabung duel…</h3></div>`);
    const r = await post({ op: 'join', id: room.id });
    if (!r || !r.ok) { st = 'idle'; ov(`<div class="dl-c"><span class="e">😢</span><h3>Duelnya udah ga ada</h3><p>Mungkin udah dibatalin. Ajak duel balik aja!</p><button id="dl-x">Oke</button></div>`); $$('dl-x').onclick = ovClose; return; }
    ov(`<div class="dl-c"><span class="e">⏳</span><h3>Siap-siap…</h3><p>Hitung mundur bentar lagi</p></div>`);
    poll(); tick();
  }
  async function cancel() { unseed(); if (mode === 'tg') { mode = 'duel'; tgR = null; st = 'idle'; ovClose(); hud(); window.__onlineGame = null; return; } pollTok++; st = 'idle'; ovClose(); hud(); window.__onlineGame = null; if (room) post({ op: 'bye', id: room.id }); }
  // ajakan dari pasangan (dicek pas buka halaman / ada perubahan)
  async function check(auto) {
    if (!B() || !B().url || st !== 'idle') return;
    let r = null; try { r = await B().room(PAGE); } catch (e) { return; }
    if (!r || !r.cfg || !r.cfg.duel || r.end || r.host === me() || (r.joined && r.joined[me()]) || Date.now() - (r.at || 0) > 10 * 60e3) { paintInv(null); return; }
    room = r; paintInv(r);
    if (auto) { css(); ov(`<div class="dl-c"><span class="e">${esc(C.emoji)}</span><h3>${op()} ngajak duel!</h3><p>${esc(C.name)} — main barengan di HP masing-masing, tantangannya sama persis. Skor siapa paling bagus menang ⚔️</p><button id="dl-ok">⚔️ Gas duel</button><button class="g" id="dl-x">Nanti</button></div>`); $$('dl-ok').onclick = join; $$('dl-x').onclick = ovClose; }
  }
  // ═══ 📨 TANTANG JARAK JAUH ═══
  const DAY = 864e5, OLD = 14 * DAY, D0 = Date.UTC(1960, 0, 1);
  const tgOn = () => C && !C.noTg && typeof TG === 'undefined';      // game Duo punya tantangan sendiri
  const rows = (app, w) => Object.values(g(app + '-' + w, {}) || {}).filter(x => x && x.id);
  const putRow = (app, w, date, data) => { if (B()) B().put(app, w, date, data); else { const k = app + '-' + w, m = g(k, {}) || {}; m[date] = data; s(k, m); } };
  const slot = () => { const n = ((g('tg-slot', -1) | 0) + 1) % 40; s('tg-slot', n); return new Date(D0 + n * DAY).toISOString().slice(0, 10); };
  const tgIncoming = () => { const R = new Set(rows('tantangbalas', me()).map(x => x.id)); return rows('tantang', op()).filter(c => c.g === PAGE && !R.has(c.id) && Date.now() - c.at < OLD).sort((a, b) => b.at - a.at); };
  const tgMine = () => { const R = {}; rows('tantangbalas', op()).forEach(x => R[x.id] = x); return rows('tantang', me()).filter(c => c.g === PAGE && Date.now() - c.at < OLD).sort((a, b) => b.at - a.at).map(c => Object.assign({}, c, { r: R[c.id] || null })); };
  const winOf = (a, b) => better(a, b) ? me() : better(b, a) ? op() : null;
  function tgRec(w, id) {
    const seen = g('tg-seen', []); if (seen.includes(id)) return; s('tg-seen', seen.concat(id).slice(-80));
    if (!w) return; const r = g('tantang-rek-' + PAGE, { Razan: 0, Dara: 0 }); r[w] = (r[w] || 0) + 1; s('tantang-rek-' + PAGE, r);
    if (w === me()) { try { window.Skor && Skor.add && Skor.add(PAGE, w); } catch (e) {} }
  }
  function tgGate(R, seed, c) {
    css(); const o = op();
    const p = R.kind === 'kirim' ? `Main sekali — skor kamu dikirim ke ${o}. Nanti ${o} main dengan tantangan yang <b>sama persis</b> kapan aja dia sempet 😏` : `Skor ${o}: <b>${esc(R.ch.f)}</b>. Kesempatan kamu cuma <b>sekali</b> — kalau keluar di tengah jalan dianggap nyerah ya!`;
    ov(`<div class="dl-c"><span class="e">📨</span><h3>${R.kind === 'kirim' ? `Tantang ${o}` : `Jawab tantangan ${o}`}</h3><p>${p}</p><button id="dl-go">${esc(C.emoji)} Mulai!</button><button class="g" id="dl-x">Nanti aja</button></div>`);
    $$('dl-x').onclick = () => { ovClose(); if (R.kind === 'terima') { const t = g('tg-try', []).filter(x => x !== R.ch.id); s('tg-try', t); } };
    $$('dl-go').onclick = () => {
      ovClose(); mode = 'tg'; tgR = R; st = 'play'; lastV = null; mineFin = null;
      try { if (C.setCfg && c) C.setCfg(c); } catch (e) {}
      if (!C.ownSeed) seedRandom(seed); R.seed = seed; R.c = c; hud();
      try { C.start(seed, c); } catch (e) { console.error(e); }
      if (C.now) { clearInterval(window.__dlNow); window.__dlNow = setInterval(() => { if (st !== 'play') return clearInterval(window.__dlNow); try { const v = C.now(); if (v != null && v !== lastV) { lastV = v; hud(); } } catch (e) {} }, 1000); }
    };
  }
  function tgSend() { if (st !== 'idle' && st !== 'done') return; tgGate({ kind: 'kirim' }, Math.floor(Math.random() * 1e9), C.cfg ? C.cfg() : null); }
  function tgAccept(id) {
    if (st !== 'idle' && st !== 'done') return;
    const c = tgIncoming().find(x => x.id === id); if (!c) { paintInv(null); return; }
    const tried = g('tg-try', []);
    if (tried.includes(id)) { mode = 'tg'; tgR = { kind: 'terima', ch: c }; st = 'play'; return tgDone(null, true); }
    s('tg-try', tried.concat(id).slice(-60));
    tgGate({ kind: 'terima', ch: c }, c.seed, c.c);
  }
  function tgDone(v, gaveUp) {
    unseed(); clearInterval(window.__dlNow); const R = tgR || { kind: 'kirim' }; tgR = null; mode = 'duel'; st = 'idle'; hud(); window.__onlineGame = null;
    const w = me(), o = op(), ok = valid(v), f = ok ? C.fmt(v) : 'nyerah';
    const page = `${PAGE}.html`;
    if (R.kind === 'kirim') {
      if (!ok && gaveUp) { ovClose(); return; }
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      putRow('tantang', w, slot(), { id, g: PAGE, n: C.name, e: C.emoji, seed: R.seed, c: R.c || null, v: ok ? v : null, f, at: Date.now() });
      try { window.Push && Push.notify && Push.notify({ title: `${C.emoji} ${w} nantang kamu di ${C.name}!`, body: `Skor ${w}: ${f}. Bisa ngalahin? 😏 (kesempatan cuma sekali)`, url: `${page}?tantang=${id}`, tag: 'tantang-' + PAGE }); } catch (e) {}
      ov(`<div class="dl-c"><span class="e">📨</span><h3>Tantangan terkirim!</h3><div class="vs"><div class="w">Skor kamu<b>${esc(f)}</b></div></div><p>${o} dapet notif & main dengan tantangan yang sama persis. Hasilnya nanti muncul di halaman game ini 😏</p><button id="dl-x">Oke</button></div>`);
      try { window.SFX && SFX.play('win'); } catch (e) {}
    } else {
      const c = R.ch, win = winOf(ok ? v : null, c.v);
      putRow('tantangbalas', w, slot(), { id: c.id, g: PAGE, v: ok ? v : null, f, at: Date.now() });
      tgRec(win, c.id);
      try { window.Push && Push.notify && Push.notify({ title: `${C.emoji} ${w} udah jawab tantanganmu di ${C.name}`, body: `${o}: ${c.f} · ${w}: ${f} — ${win === w ? `${w} menang 😎` : win ? 'kamu menang! 🎉' : 'seri 🤝'}`, url: page, tag: 'tantangb-' + PAGE }); } catch (e) {}
      const rec = g('tantang-rek-' + PAGE, { Razan: 0, Dara: 0 });
      ov(`<div class="dl-c"><span class="e">${win === w ? '🏆' : win ? '😤' : '🤝'}</span><h3>${win === w ? 'Kamu menang tantangan!' : win ? `${o} yang menang` : 'Seri!'}</h3>
        <div class="vs"><div class="${win === w ? 'w' : ''}">Kamu<b>${esc(f)}</b></div><div class="${win === o ? 'w' : ''}">${o}<b>${esc(c.f)}</b></div></div>
        <p>Rekor tantangan ${esc(C.name)}: Razan ${rec.Razan || 0} · Dara ${rec.Dara || 0}</p><button id="dl-bk">📨 Tantang balik</button><button class="g" id="dl-x">Oke</button></div>`);
      if (win === w) { try { window.SFX && SFX.play('win'); } catch (e) {} confettiLite(); }
      $$('dl-bk').onclick = () => { ovClose(); tgSend(); };
    }
    $$('dl-x').onclick = () => { ovClose(); try { C.onEnd && C.onEnd(); } catch (e) {} };
    setTimeout(() => paintInv(null), 400);
  }
  function tgHTML() {
    if (!tgOn()) return '';
    const o = op(); let h = '';
    tgIncoming().slice(0, 2).forEach(c => { h += `<button class="dl-tgi" data-tg="${esc(c.id)}"><span class="e">📨</span><span><b>${o} nantang kamu!</b><small>Skor ${o}: ${esc(c.f)} · kalahin dalam 1x main</small></span><i>Terima</i></button>`; });
    tgMine().slice(0, 2).forEach(c => {
      if (!c.r) { h += `<div class="dl-tgs"><span>⏳</span><span>Nunggu ${o} jawab · skor kamu ${esc(c.f)}</span></div>`; return; }
      const win = winOf(c.v, c.r.v); tgRec(win, c.id);
      h += `<div class="dl-tgs ${win === me() ? 'w' : win ? 'l' : ''}"><span>${win === me() ? '🏆' : win ? '😤' : '🤝'}</span><span>Kamu ${esc(c.f)} vs ${o} ${esc(c.r.f)} — <b>${win === me() ? 'kamu menang!' : win ? o + ' menang' : 'seri'}</b></span></div>`;
    });
    return h + `<button class="dl-tg" id="dl-tg">📨 Tantang ${o} jarak jauh<small>main duluan, ${o} jawab kapan aja · adu skor</small></button>`;
  }
  function paintInv(r) {
    const box = document.getElementById('dl-box'); if (!box) return;
    if (r === undefined) r = invR; else invR = r;
    box.innerHTML = (r ? `<button class="dl-inv" id="dl-inv"><span class="e">⚔️</span><span><b>${op()} ngajak duel!</b><small>Lagi nunggu kamu gabung</small></span><i>Gabung</i></button>` : '') + `<button class="dl-btn" id="dl-new">⚔️ Duel online sama ${op()}<small>main barengan di HP masing-masing · skor live</small></button>`;
    box.insertAdjacentHTML('beforeend', tgHTML());
    if (r) $$('dl-inv').onclick = join;
    $$('dl-new').onclick = () => open(false);
    const tb = $$('dl-tg'); if (tb) tb.onclick = tgSend;
    box.querySelectorAll('[data-tg]').forEach(b => b.onclick = () => tgAccept(b.dataset.tg));
  }

  function tgAuto() { if (!tgAsk || !tgOn() || st !== 'idle') return; const c = tgIncoming().find(x => x.id === tgAsk); if (c) { tgAsk = null; tgAccept(c.id); } }
  window.Duel = {
    setup(cfg) {
      C = cfg; css();
      const mnt = typeof cfg.mount === 'string' ? document.querySelector(cfg.mount) : cfg.mount;
      const aft = cfg.after ? (typeof cfg.after === 'string' ? document.querySelector(cfg.after) : cfg.after) : null;
      if ((mnt || aft) && !document.getElementById('dl-box')) { const d = document.createElement('div'); d.id = 'dl-box'; if (aft) aft.insertAdjacentElement('afterend', d); else if (cfg.before) mnt.parentNode.insertBefore(d, mnt); else mnt.appendChild(d); }
      // bungkus fungsi "game selesai" & "keluar" punya game (fungsi global) biar pas duel larinya ke sini
      if (cfg.endFn && typeof window[cfg.endFn] === 'function') { const o = window[cfg.endFn]; window[cfg.endFn] = function () { if (st === 'play') { let v = null; try { v = cfg.endVal ? cfg.endVal.apply(this, arguments) : arguments[0]; } catch (e) {} try { cfg.onFinish && cfg.onFinish(); } catch (e) {} Duel.finish(v); return; } return o.apply(this, arguments); }; }
      if (cfg.quitFn && typeof window[cfg.quitFn] === 'function') { const o = window[cfg.quitFn]; window[cfg.quitFn] = function () { if (st === 'play' || st === 'fin') { if (!confirm(mode === 'tg' ? (tgR && tgR.kind === 'terima' ? 'Keluar? Tantangannya dianggap nyerah lho 😅' : 'Keluar? Tantangannya batal dikirim.') : 'Keluar dari duel? Dianggap kalah lho 😅')) return; Duel.quit(); try { cfg.onEnd && cfg.onEnd(); } catch (e) {} return; } return o.apply(this, arguments); }; }
      paintInv(null);
      const ask = /[?&]online=1/.test(location.search); tgAsk = new URLSearchParams(location.search).get('tantang');
      const hook = n => { if (window.Berdua && Berdua.room) { check(ask); try { history.replaceState(null, '', location.pathname); } catch (e) {} Berdua.on(ev => { if (ev.apps && ev.apps.includes('ajak')) check(false); if (st === 'idle' && (!ev.apps || ev.apps.some(a => /^tantang/.test(a)))) { paintInv(undefined); tgAuto(); } }); try { Berdua.pull && Berdua.pull(true); } catch (e) {} setTimeout(tgAuto, 1800); setInterval(() => { if (!document.hidden && st === 'idle') check(false); }, 20000); } else if (n < 30) setTimeout(() => hook(n + 1), 300); };
      hook(0);
    },
    active: () => st === 'play',
    busy: () => st !== 'idle' && st !== 'done',
    score(v) { if (st !== 'play') return; lastV = v; hud(); if (mode === 'tg') return; if (Date.now() - lastSent > 4000) { lastSent = Date.now(); move({ w: me(), s: v }); } },
    async finish(v) {
      if (st !== 'play') return;
      if (mode === 'tg') return tgDone(v);
      unseed(); st = 'fin'; mineFin = v; lastV = v; hud();
      showWaitFin();
      await move({ w: me(), f: valid(v) ? v : null });
      tick();
    },
    quit() { if (mode === 'tg' && st === 'play') { stopGame(); return tgDone(null, true); } if (st === 'play' || st === 'fin') { stopGame(); cancel(); } },
    tantang: () => mode === 'tg',
    open, PAGE, me
  };
})();
