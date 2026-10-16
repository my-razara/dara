/* ═══ Game Online Berdua — main dari HP masing-masing ═══
   Butuh sync.js (Berdua). Satu "meja" per game, isinya urutan langkah.
   Halaman game cukup manggil Online.setup({...}) */
(function () {
  const WA = { Razan: '6285692740607', Dara: '6287703706518' };
  const GN = { congklak: ['🐚', 'Congklak'], 'perang-kapal': ['⚓', 'Perang Kapal'], dam: ['⚫', 'Dam'], 'empat-sejajar': ['🔴', 'Empat Sejajar'], tictactoe: ['⭕', 'Tic-Tac-Toe'], 'titik-kotak': ['🔳', 'Titik & Kotak'], 'bolak-balik': ['🔘', 'Bolak-Balik'], 'ular-tangga': ['🐍', 'Ular Tangga'] };
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
  // 💬 komen: langkah khusus {_k:1,w,x} — ga pernah dikasih ke logika game
  const isChat = mv => !!(mv && typeof mv === 'object' && mv._k === 1);
  const gameView = room => room ? Object.assign({}, room, { moves: (room.moves || []).filter(m => !isChat(m)) }) : room;
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


  // ═════ 💬 KOMEN PAS MAIN ONLINE ═════
  const CHAT_Q = ['😂', '😱', '😏', '🥺', '💗', '🤣'];
  const CHAT_PRE = ['Hoki banget sih 😤', 'Yahh 😆', 'Mikirnya lama 😴', 'Cepet dong 😤', 'Awas kalah ya 😏', 'Curang ih 🙄', 'Semangat sayang 💗', 'Wkwkwk 🤣', 'Deg-degan 😬', 'Nyerah aja 😜', 'Pinter juga kamu 👏', 'Rematch abis ini!'];
  let chatLast = 0;
  const chatOn = () => O.on && O.h && O.h.chat !== false;
  function chatCss() {
    if ($('olc-css')) return;
    const st = document.createElement('style'); st.id = 'olc-css';
    st.textContent = `
    #olc-b{position:fixed;left:0;right:0;top:calc(10px + env(safe-area-inset-top));z-index:9700;max-width:460px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;padding:0 12px}
    .olc-m{max-width:88%;padding:.5rem .85rem;border-radius:18px;font:500 13px/1.4 'Poppins',system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.18);animation:olcIn .3s cubic-bezier(.3,1.5,.5,1);word-break:break-word;text-align:center}
    .olc-m b{font-weight:700;margin-right:.3rem}
    .olc-m.Razan{background:#eaf2ff;color:#24456f;border:1.5px solid #9cbcec}.olc-m.Dara{background:#ffeef1;color:#7a2c3a;border:1.5px solid #f2a9b6}
    .olc-m.out{opacity:0;transform:translateY(-8px);transition:all .35s}
    @keyframes olcIn{from{opacity:0;transform:scale(.7) translateY(10px)}}
    #olc-fab{position:fixed;right:14px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:9400;width:48px;height:48px;border-radius:50%;border:none;background:#fff;box-shadow:0 6px 18px rgba(0,0,0,.18);font-size:1.35rem;cursor:pointer;display:flex;align-items:center;justify-content:center}
    #olc-fab.their{background:linear-gradient(135deg,#d48c80,#a8584c);animation:olcP 1.8s ease-in-out infinite}
    #olc-fab i{position:absolute;right:-4px;top:-6px;font:600 9.5px 'Poppins',sans-serif;font-style:normal;background:#2d1f1a;color:#fff;border-radius:20px;padding:.12rem .4rem;white-space:nowrap;pointer-events:none}
    @keyframes olcP{50%{transform:scale(1.08)}}
    #olc-ov{position:fixed;inset:0;z-index:9650;background:rgba(45,31,26,.45);display:flex;align-items:flex-end;justify-content:center}
    .olc-sh{background:#faf6f0;width:100%;max-width:460px;border-radius:22px 22px 0 0;padding:1rem 1rem calc(1rem + env(safe-area-inset-bottom));font-family:'Poppins',system-ui,sans-serif;animation:olcUp .25s ease}
    @keyframes olcUp{from{transform:translateY(100%)}}
    .olc-sh h3{font-size:15px;color:#2d1f1a;margin:0 0 .6rem;text-align:center}
    .olc-q{display:flex;justify-content:center;gap:.15rem;margin-bottom:.6rem}
    .olc-q button{border:none;background:#fff;font-size:1.35rem;width:42px;height:42px;border-radius:50%;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.06)}
    .olc-p{display:flex;flex-wrap:wrap;gap:.35rem;justify-content:center;margin-bottom:.75rem;max-height:30vh;overflow-y:auto}
    .olc-p button{border:1.5px solid #e8c4b0;background:#fff;border-radius:50px;padding:.42rem .75rem;font:500 12px 'Poppins',sans-serif;color:#7a3f35;cursor:pointer}
    .olc-f{display:flex;gap:.4rem}
    .olc-f input{flex:1;min-width:0;border:1.5px solid #e8c4b0;border-radius:50px;padding:.7rem 1rem;font:16px 'Poppins',sans-serif;outline:none;background:#fff;color:#2d1f1a}
    .olc-f button{border:none;border-radius:50px;padding:0 1.1rem;background:#c17a6f;color:#fff;font:700 13px 'Poppins',sans-serif;cursor:pointer;flex-shrink:0}
    .olc-n{font-size:11px;color:#9a8070;text-align:center;margin:.5rem 0 0;min-height:1em}
    @media(max-width:340px){.olc-q button{width:36px;height:36px;font-size:1.15rem}}`;
    document.head.appendChild(st);
  }
  function chatFull() { try { return JSON.stringify(O.room).length > 7200; } catch (e) { return false; } }
  function chatShow(w, x, mine, sys) {
    chatCss(); let box = $('olc-b'); if (!box) { box = document.createElement('div'); box.id = 'olc-b'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const b = document.createElement('div'); b.className = 'olc-m ' + (w === 'Razan' ? 'Razan' : 'Dara');
    b.innerHTML = sys ? esc(x) : `<b>${esc(w)}${mine ? ' (kamu)' : ''}:</b>${esc(x)}`;
    box.appendChild(b); while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => { b.classList.add('out'); setTimeout(() => b.remove(), 400); }, mine ? 2800 : 4200);
  }
  function chatIn(w, x) {
    if (O.h && O.h.onChat) { try { O.h.onChat(w, x); } catch (e) {} } else chatShow(w, x);
    vib([15, 40, 15]); try { window.SFX && SFX.play('pop'); } catch (e) {}
  }
  function say(x) {
    if (!O.on || !O.room) return false;
    x = String(x || '').replace(/\s+/g, ' ').trim().slice(0, 60); if (!x) return false;
    const now = Date.now(); if (now - chatLast < 1200) return false; chatLast = now;
    if (chatFull()) { chatShow(me(), 'Komen buat game ini udah penuh — lanjut main dulu ya 🙏', true, true); return false; }
    move({ _k: 1, w: me(), x });
    if (!(O.h && O.h.onChat)) chatShow(me(), x, true);
    return true;
  }
  function chatMark() {
    const f = $('olc-fab'); if (!f) return;
    const their = O.on && O.wait; f.classList.toggle('their', their);
    f.innerHTML = '💬' + (their ? `<i>Komenin ${op()}</i>` : '');
  }
  function chatUI() {
    if (!chatOn() || O.h.chatUI === false) return; chatCss();
    if (!$('olc-fab')) { const f = document.createElement('button'); f.id = 'olc-fab'; f.type = 'button'; f.setAttribute('aria-label', 'Komen'); f.onclick = chatOpen; if (O.h.chatBottom) f.style.bottom = `calc(${O.h.chatBottom} + env(safe-area-inset-bottom))`; document.body.appendChild(f); }
    chatMark();
  }
  function chatOff() { const f = $('olc-fab'); if (f) f.remove(); chatClose(); }
  function chatOpen() {
    if (!O.on) return; chatCss(); chatClose();
    const pre = (O.h && O.h.chatPresets ? O.h.chatPresets.concat(CHAT_PRE) : CHAT_PRE).slice(0, 14);
    const ov = document.createElement('div'); ov.id = 'olc-ov';
    ov.innerHTML = `<div class="olc-sh"><h3>💬 Komenin ${op()}</h3><div class="olc-q">${CHAT_Q.map(e => `<button type="button" data-x="${e}">${e}</button>`).join('')}</div><div class="olc-p">${pre.map(p => `<button type="button" data-x="${esc(p)}">${esc(p)}</button>`).join('')}</div><form class="olc-f"><input maxlength="60" autocomplete="off" placeholder="Tulis komen kamu…" enterkeyhint="send"><button type="submit">Kirim</button></form><p class="olc-n">${chatFull() ? 'Komen buat game ini udah penuh 🙏' : ''}</p></div>`;
    ov.addEventListener('click', e => { if (e.target === ov) return chatClose(); const b = e.target.closest('button[data-x]'); if (b) { say(b.dataset.x); chatClose(); } });
    ov.querySelector('form').addEventListener('submit', e => { e.preventDefault(); const i = ov.querySelector('input'); if (say(i.value)) chatClose(); });
    document.body.appendChild(ov);
  }
  function chatClose() { const o = $('olc-ov'); if (o) o.remove(); }

  // ── server ──
  const sig = r => r ? [r.id, r.moves.length, r.end ? 1 : 0, Object.keys(r.joined || {}).length].join(':') : 'null';
  async function getRoom(since) { try { const r = await B().room(O.g, since); O.net = 'ok'; return r; } catch (e) { O.net = 'err'; return undefined; } }
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
    else if (fresh(r) && both(r)) body = `<p>Ada game yang belum selesai (${r.moves.filter(m => !isChat(m)).length} langkah).</p><button class="ol-btn" onclick="Online.resume()">▶ Lanjutin game online</button><div class="ol-row"><button class="ol-btn ghost" onclick="Online.invite()">🔁 Mulai baru</button></div>`;
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
    if (!r.ok) {
      const why = r.error === 'action' || r.error === 'game' ? 'Server (Apps Script Data Berdua) masih versi lama — belum ada fitur game online. Update kodenya & deploy <b>Versi baru</b> dulu ya.'
        : r.error === 'jaringan' ? 'Server Google-nya ga bisa dihubungi. Cek internet, atau cek Apps Script-nya udah di-deploy dengan akses "Siapa saja".'
        : 'Server-nya bilang: <b>' + esc(r.error || 'error') + '</b>';
      overlay(`<span class="e">😵</span><h3>Gagal bikin meja</h3><p>${why}</p><button class="ol-x" onclick="document.getElementById('ol-ov').remove()">Tutup</button>`); return;
    }
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
    try { localStorage.setItem('ajak-seen', JSON.stringify(Date.now())); } catch (e) {}
    O.on = true; O.room = room; O.applied = room.moves.length; O.wait = false;
    O.h.onStart(gameView(room), me(), op()); chatUI();
    status(); poll(true);
  }
  function leave(silent) {
    chatOff();
    if (O.on && O.room && !O.room.end) post({ op: 'bye', id: O.room.id });
    O.on = false; O.room = null; status(); if (!silent) panel();
  }
  function move(mv, opt) {
    if (!O.on || !O.room) return;
    let n = O.applied++; const id = O.room.id;
    sendChain = sendChain.then(async () => {
      const r = await post({ op: 'move', id, n, mv });
      if (r.ok) { O.room = r.room; return; }
      if (r.error === 'conflict' && r.room && r.room.id === id) {
        const extra = r.room.moves.slice(n);
        if (isChat(mv) || (extra.length && extra.every(isChat))) {
          let room = r.room;
          for (let k = 0; k < 4; k++) {
            O.applied = n; O.room = room; await deliver(room, mv);
            const n2 = room.moves.length; O.applied = n2 + 1;
            const r2 = await post({ op: 'move', id, n: n2, mv });
            if (r2.ok) { O.room = r2.room; return; }
            if (r2.error !== 'conflict' || !r2.room || r2.room.id !== id) { if (r2.error === 'ended' && r2.room) ended(r2.room); else if (!isChat(mv)) resync(r2.room); return; }
            if (!isChat(mv) && !r2.room.moves.slice(n2).every(isChat)) { resync(r2.room); return; }
            room = r2.room; n = n2;
          }
          return;
        }
        if (opt && opt.retry) {                              // langkah barengan (mis. pasang kapal) → masukin langkah lawan dulu, kirim ulang
          O.applied = n; O.room = r.room; await deliver(r.room, mv);
          O.applied++; const r2 = await post({ op: 'move', id, n: r.room.moves.length, mv }); if (r2.ok) O.room = r2.room; else resync(r2.room);
        } else resync(r.room);
      } else if (r.error === 'ended' && r.room) ended(r.room);
      else if (r.error === 'stale') resync(r.room);
    });
  }
  function resync(room) { if (room && fresh(room) && both(room)) { O.room = room; O.applied = room.moves.length; O.h.onStart(gameView(room), me(), op()); } else if (room) ended(room); }
  async function deliver(room, skipMine) {
    if (delivering) return; delivering = true;
    try {
      while (O.on && O.room && room.id === O.room.id && room.moves.length > O.applied) {
        const i = O.applied, mv = room.moves[i];
        O.applied++;
        if (skipMine && JSON.stringify(mv) === JSON.stringify(skipMine)) continue;
        if (isChat(mv)) { if (mv.w !== me()) chatIn(mv.w, mv.x); continue; }
        try { await O.h.onMove(mv, i); } catch (e) { console.error(e); }
      }
    } finally { delivering = false; }
  }
  function ended(room) {
    if (!O.on) return; O.room = room; O.on = false; status(); chatOff();
    if (room.end && room.end.who && room.end.who !== me()) {
      overlay(`<span class="e">👋</span><h3>${esc(room.end.who)} keluar dari game</h3><p>Gamenya udahan. Ajak main lagi kapan-kapan ya 🤍</p><button class="ol-btn" onclick="document.getElementById('ol-ov').remove();Online.h.onLeft&&Online.h.onLeft()">Oke</button>`);
    }
  }

  // ── cek berkala ──
  // lagi nunggu lawan → "nunggu langkah" (server langsung jawab begitu ada langkah baru)
  const longWait = () => O.on || O.waitingJoin;
  let quick = false;
  function every() { return longWait() ? (O.net === 'err' ? 1500 : quick ? 700 : 30) : 6000; }
  async function poll(now) {
    clearTimeout(pollT);
    if (document.hidden) return;
    if (!now) { pollT = setTimeout(() => poll(true), every()); return; }
    if (polling) return;                                  // yang lagi jalan nanti jadwalin ulang sendiri
    polling = true;
    let since = null;
    if (longWait()) since = O.on && O.room ? [O.room.id, O.applied, O.room.end ? 1 : 0, Object.keys(O.room.joined || {}).length].join(':') : sig(lastRoom);
    const t0 = Date.now(), before = O.applied;
    const r = await getRoom(since); polling = false; status();
    if (r !== undefined) {
      lastRoom = r;
      if (O.on && O.room) {
        if (!r || r.id !== O.room.id) {
          if (r && fresh(r) && r.host === op()) { overlay(`<span class="e">🔁</span><h3>${op()} ngajak main lagi!</h3><p>Gabung ke game baru?</p><button class="ol-btn pink" onclick="Online.join()">🎮 Gabung</button><button class="ol-x" onclick="document.getElementById('ol-ov').remove()">Nanti</button>`); O.on = false; }
        } else if (r.end) ended(r);
        else { O.room = Object.assign({}, r, { moves: r.moves }); await deliver(r); }
      } else if (O.waitingJoin && r && r.host === me() && both(r) && fresh(r)) { vib([40, 40, 80]); try { window.SFX && SFX.play('open'); } catch (e) {} enter(r); }
      else if (!O.on) panel();
    }
    quick = since != null && Date.now() - t0 < 500 && O.applied === before;   // balik cepet tanpa langkah baru → jangan muter-muter
    pollT = setTimeout(() => poll(true), every());
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(true); });

  function status() {
    const el = O.h && O.h.statusEl && $(O.h.statusEl); if (!el) return;
    if (!O.on) { el.textContent = ''; el.className = 'ol-st'; return; }
    el.className = 'ol-st' + (O.net === 'err' ? ' err' : '');
    el.textContent = O.net === 'err' ? '⚠️ Koneksi putus — nyoba nyambung lagi…' : `🌐 Online · kamu (${me()}) vs ${op()}`;
  }
  function waiting(v) { const was = O.wait; O.wait = !!v; if (v && !was) poll(true); chatMark(); }

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

  window.Online = { setup, invite, join, resume, leave, move, waiting, swap, waitJoin, cancelWait, me, op, say, chatOpen, chatShow, get full() { return chatFull(); }, get on() { return O.on; }, get room() { return O.room; }, get h() { return O.h; } };
})();
