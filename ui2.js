/* ═══ RAZARA · tampilan baru (Nov 2026) ═══
   Layar pembuka + 4 tab (Beranda · Jelajah · Sehat · Kita) + menu bawah.
   Kartu-kartu lama TETEP dibikin sama kodenya masing-masing — file ini cuma nentuin kartu mana tampil di tab mana
   (pakai data-pane + CSS order), jadi semua fitur lama tetep jalan. */
(function () {
  if (window.__u2) return;
  const $ = id => document.getElementById(id);
  const home = $('home'); if (!home) return;
  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  const me = () => (window.Who && Who.me && Who.me()) || g('berdua-me', 'Dara');
  const other = () => me() === 'Razan' ? 'Dara' : 'Razan';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const vib = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  const TABS = ['beranda', 'jelajah', 'sehat', 'kita'];
  const JADIAN0 = new Date(2025, 4, 10);
  const hariKe = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((t - JADIAN0) / 864e5); };
  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  document.documentElement.classList.add('ui2');

  // ══════════ 🌅 LAYAR PEMBUKA ══════════
  function sapa() {
    const h = new Date().getHours();
    return h >= 4 && h < 10 ? ['Pagi', '🌷'] : h >= 10 && h < 15 ? ['Siang', '☀️'] : h >= 15 && h < 18 ? ['Sore', '🌇'] : ['Malem', '🌙'];
  }
  function photos() {
    let D = null, pw = null; try { D = JSON.parse(localStorage.getItem('mem-idx') || 'null'); pw = localStorage.getItem('mem-pw'); } catch (e) {}
    if (!D || !pw || !Array.isArray(D.albums)) return [];
    const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const cap = a => { if (!a) return 'momen random'; if (a.title || a.name) return a.title || a.name; const p = (a.date || '').split('-').map(Number); return p.length === 3 ? `${p[2]} ${BLN[p[1] - 1]} ${p[0]}` : 'kenangan kita'; };
    const pool = [];
    D.albums.forEach(a => (a.items || [{ id: a.cover, type: a.coverType || 'image' }]).forEach(it => { if (it && it.id && it.type === 'image') pool.push({ id: it.id, c: cap(a) }); }));
    ((D.random && D.random.items) || []).forEach(it => { if (it && it.type === 'image') pool.push({ id: it.id, c: 'momen random' }); });
    if (pool.length < 3) return [];
    const n = new Date(), seed = n.getFullYear() * 400 + n.getMonth() * 31 + n.getDate(), out = [], used = new Set();
    for (let k = 0; out.length < 3 && k < 40; k++) { const i = (seed * 9301 + 49297 + k * 7919) % 233280 % pool.length; if (!used.has(i)) { used.add(i); out.push(pool[i]); } }
    return out;
  }
  function pembuka() {
    const w = $('s-welcome'); if (!w) return;
    const night = document.documentElement.classList.contains('night'), [sp, se] = sapa(), who = me(), dara = who === 'Dara';
    let pet = null; try { pet = window.Pet && Pet.state(); } catch (e) {}
    const PE = pet ? (Pet.animal(pet.a) || {}).e : '🐱', PN = pet ? (pet.n || 'Miko') : '';
    const P = photos(), FB = [['🎞️', 'photobooth pertama', '#fde2c8,#f6b98f'], ['🦌', 'kandang rusa', '#d7ecd9,#9fcfa8'], ['🥟', 'dimsum pertama 🤍', '#fbd3df,#e98fa8']];
    const pol = (cls, i) => { const p = P[i], f = FB[i]; return `<div class="pb-pol ${cls}"><div class="ph" style="background:linear-gradient(135deg,${f[2]})">${p ? `<img alt="" data-id="${esc(p.id)}" src="https://lh3.googleusercontent.com/d/${esc(p.id)}=w400-rw">` : f[0]}</div><p>${esc(p ? p.c : f[1])}</p></div>`; };
    const line = night
      ? (dara ? 'Capek ya abis kerja? Istirahat yang cukup, terus <b>bobo yang nyenyak</b> 🤍' : `Udah malem. Jangan lupa ucapin <b>selamat bobo</b> buat ${other()} 🌙`)
      : sp === 'Pagi' ? (dara ? 'Semangat hari ini ya. Razan udah nitip <b>pesan hari ini</b> buat kamu 💌' : `Semangat hari ini! Jangan lupa sapa ${other()} ☀️`)
      : sp === 'Siang' ? (dara ? 'Jangan lupa <b>makan siang</b> sama minum air ya 🥤' : `Udah makan siang? Tanyain ${other()} juga ya 🍜`)
      : (dara ? 'Udah pulang? Istirahat bentar, terus <b>cerita-cerita</b> yuk 🤍' : `Sore! Cek kabar ${other()} di Kita 🤍`);
    const note = night
      ? `<a class="pb-note" href="tidur-kita.html"><span class="e">😴</span><span><b>Bobo &amp; Bangun</b><small>kasih tau ${other()} kamu mau bobo</small></span></a>`
      : `<button class="pb-note" data-go><span class="e">💌</span><span><b>Pesan hari ini dari ${dara ? 'Razan' : 'kamu buat Dara'}</b><small>tap buat baca</small></span></button>`;
    w.className = 'pb';
    w.innerHTML = `<div class="pb-moon"></div><div class="pb-brand">RAZARA</div>
      <div class="pb-stack ${night ? 'bed' : ''}">${pol('a', 0)}${pol('b', 1)}${pol('c', 2)}<div class="pb-bed"><b>💤</b><span>${PE}</span><i></i></div></div>
      <div class="pb-gt"><small>${HARI[new Date().getDay()]} · hari ke-${hariKe().toLocaleString('id-ID')}</small><h1>${sp}, <span>${who}</span> ${se}</h1><p>${line}</p></div>
      ${note}
      ${!night && pet ? `<div class="pb-bub">hai ${who}! 🐾</div><div class="pb-peek">${PE}</div>` : ''}
      <div class="pb-slide" id="pb-slide"><div class="pb-knob" id="pb-knob">${night ? '🌙' : '💗'}</div><p>Geser buat masuk<small>atau tap aja</small></p></div>`;
    w.querySelectorAll('.pb-pol img').forEach(im => { im.onload = () => im.classList.add('ok'); im.onerror = () => { if (!im.dataset.t) { im.dataset.t = 1; im.src = `https://drive.google.com/thumbnail?id=${im.dataset.id}&sz=w400`; } else im.remove(); }; });
    const go = () => { if (w.classList.contains('hide')) return; vib(15); try { window.enterApp(); } catch (e) { w.classList.add('hide'); } setTab('beranda'); setTimeout(sambutOnce, 700); };
    const nb = w.querySelector('[data-go]'); if (nb) nb.onclick = go;
    // geser buat masuk (tap juga bisa)
    const sl = $('pb-slide'), kn = $('pb-knob'); let x0 = null, dx = 0;
    sl.addEventListener('pointerdown', e => { x0 = e.clientX; dx = 0; sl.classList.add('drag'); try { sl.setPointerCapture(e.pointerId); } catch (er) {} });
    sl.addEventListener('pointermove', e => { if (x0 == null) return; dx = Math.max(0, Math.min(sl.clientWidth - kn.offsetWidth - 12, e.clientX - x0)); kn.style.transform = `translateX(${dx}px)`; });
    const up = () => { if (x0 == null) return; x0 = null; sl.classList.remove('drag'); const max = sl.clientWidth - kn.offsetWidth - 12; if (dx < 8 || dx > max * .6) { kn.style.transform = `translateX(${max}px)`; setTimeout(go, 120); } else kn.style.transform = ''; };
    sl.addEventListener('pointerup', up); sl.addEventListener('pointercancel', () => { x0 = null; sl.classList.remove('drag'); kn.style.transform = ''; });
  }
  // 💌 sambutan: kalimat lama Razan, muncul sekali + bisa dibuka lagi dari tab Kita
  function sambut() {
    const app = (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) || navigator.standalone === true;
    const o = document.createElement('div'); o.className = 'u2-sambut';
    o.innerHTML = `<div><small>✨ Selamat datang di</small><h2>${app ? 'Aplikasi' : 'Website'} Kesayangan Aku</h2><span class="nm">Dara Syifa Aulia 🌸</span>
      <p>Di sini ada semua yang aku buat khusus buat kamu — dari games, hadiah digital, sampai hal-hal kecil yang bikin aku inget kamu setiap hari.</p><i>— Dengan cinta, Razan 🤍</i><button>Masuk ke Dunia Kita 💝</button></div>`;
    o.onclick = e => { if (e.target === o || e.target.tagName === 'BUTTON') o.remove(); };
    document.body.appendChild(o);
  }
  function sambutOnce() { if (g('u2-sambut', 0)) return; sv('u2-sambut', Date.now()); sambut(); }

  // ══════════ 🧱 KERANGKA ══════════
  const el = (cls, pane, ord, html, tag) => { const e = document.createElement(tag || 'div'); e.className = cls; e.dataset.pane = pane; e.style.order = ord; e.dataset.u2 = '1'; if (html != null) e.innerHTML = html; home.appendChild(e); return e; };
  const top = el('u2-top', 'beranda', 1, `<button class="u2-av" id="u2-av" aria-label="Ganti orang"></button><div class="u2-hi"><small id="u2-sp"></small><b id="u2-nm"></b></div>
    <div class="u2-ic"><button id="u2-mu" aria-label="Musik">🎵</button><button id="u2-ch" aria-label="Chat">💬<em id="u2-chn"></em></button><button id="u2-ib" aria-label="Kiriman">🔔<em id="u2-ibn"></em></button></div>`);
  const lblBuat = el('u2-lbl', 'beranda', 15, '<span>Buat kamu hari ini</span>');
  const tilesEl = el('u2-tiles', 'beranda', 17, '');
  el('u2-lbl', 'beranda', 39, '<span>🏃 Sehat &amp; Jadwal</span><a href="#sehat">Buka →</a>');
  const shCard = el('u2-card u2-sh', 'beranda', 40, '');
  el('u2-ttl', 'jelajah', 100, '<h2>Jelajah</h2>');
  const seg = el('u2-seg u2-ns', 'jelajah', 115, '');
  const more = el('u2-more u2-ns', 'jelajah', 175, '');
  const shHost = el('u2-sehat', 'sehat', 300, '');
  el('u2-ttl', 'kita', 200, '<h2>Kita</h2>');
  const couple = el('u2-card u2-couple', 'kita', 201, '');
  el('u2-lbl', 'kita', 205, '<span>Lagi ngapain?</span>');
  el('u2-lbl', 'kita', 225, '<span>Hari spesial</span><a href="jadwal-kita.html">Kalender →</a>');
  const hs = el('u2-hs', 'kita', 226, '');
  el('u2-lbl', 'kita', 279, '<span>Pengaturan</span>');
  const sett = el('u2-card u2-set', 'kita', 280, '');
  el('u2-love', 'kita', 290, 'Dibuat dengan cinta, Razan 🤍', 'button').onclick = sambut;
  // isi grid kategori lama (#cat-body) pindah ke Jelajah
  const cb = $('cat-body'); if (cb) { cb.dataset.u2 = '1'; cb.dataset.pane = 'jelajah'; cb.style.order = 170; cb.classList.add('u2-ns'); home.appendChild(cb); }

  // ── tab mana buat kartu apa ──
  const has = (e, c) => e.classList && e.classList.contains(c);
  const ttl = e => { const t = e.querySelector && e.querySelector('.hx-title span'); return t ? t.textContent.trim() : ''; };
  const RULES = [
    [e => e.id === 'pet-slot', 'beranda', 50], [e => has(e, 'hx-search'), 'jelajah', 110],
    [e => has(e, 'today'), 'beranda', 10], [e => has(e, 'sp-banner'), 'beranda', 5], [e => has(e, 'ms-card'), 'beranda', 6],
    [e => has(e, 'ng-wrap'), 'beranda', 16], [e => has(e, 'ch-card'), 'beranda', 18], [e => has(e, 'on-card'), 'beranda', 19],
    [e => has(e, 'pt-card'), 'beranda', 20], [e => has(e, 'ib-card'), 'beranda', 21], [e => has(e, 'kh-card'), 'beranda', 23], [e => has(e, 'lg-card'), 'beranda', 24],
    [e => has(e, 'ck-card'), 'beranda', 25], [e => has(e, 'sa-card'), 'beranda', 22], [e => has(e, 'rk-card'), 'beranda', 27], [e => has(e, 'sr-card'), 'beranda', 26],
    [e => has(e, 'st-card'), 'kita', 210], [e => has(e, 'rit'), 'kita', 212],
    [e => has(e, 'bx-sec'), 'kita', 220], [e => has(e, 'ig-sec'), 'x', 0], [e => has(e, 'sk-sec'), 'kita', 240], [e => has(e, 'tj-sec'), 'kita', 250],
    [e => has(e, 'cad-link'), 'x', 0], [e => has(e, 'hl-link') || has(e, 'af-row'), 'x', 0],
    [e => has(e, 'rnd-btn'), 'jelajah', 118, 1], [e => has(e, 'mem-card'), 'jelajah', 176, 'u2-lain'], [e => has(e, 'otd-card'), 'jelajah', 177, 'u2-lain'],
    [e => has(e, 'hx-sec') && /^⭐/.test(ttl(e)), 'x', 0], [e => has(e, 'hx-sec') && /^🆕/.test(ttl(e)), 'x', 0],
    [e => has(e, 'hx-sec') && /^▶/.test(ttl(e)), 'beranda', 60], [e => has(e, 'hx-sec') && /^🕘/.test(ttl(e)), 'beranda', 61]
  ];
  function tag(e) {
    if (!e || e.nodeType !== 1 || e.dataset.u2) return;
    if (['today-slot', 'hx', 'home-rows', 'ib-btn', 'who-pill', 'theme-btn'].includes(e.id) || has(e, 'home-top') || has(e, 'card-area')) return;
    const r = RULES.find(x => { try { return x[0](e); } catch (er) { return false; } });
    const pane = r ? r[1] : 'beranda', ord = r ? r[2] : 90;
    if (e.dataset.pane !== pane) e.dataset.pane = pane;
    if (e.style.order !== String(ord)) e.style.order = ord;
    if (r && r[3]) { e.classList.add('u2-ns'); if (typeof r[3] === 'string') e.classList.add(r[3]); }
    const tile = pane === 'beranda' && ord >= 18 && ord <= 27; if (tile !== e.classList.contains('u2-tiled')) e.classList.toggle('u2-tiled', tile);
  }
  function route() {
    [...home.children].forEach(tag);
    ['today-slot', 'home-rows'].forEach(id => { const h = $(id); if (h) [...h.children].forEach(tag); });
    paintTiles();
    const bx = home.querySelector('.bx-sec .bx-row');
    if (bx && !bx.querySelector('.u2-bxm') && bx.children.length > 8) { const m = document.createElement('button'); m.className = 'bx u2-bxm'; m.innerHTML = '<span>➕</span>Lainnya'; m.onclick = () => { bx.classList.add('open'); m.remove(); vib(6); }; bx.insertBefore(m, bx.children[7]); }
    const vis = tilesEl.children.length > 0 || [...home.querySelectorAll('[data-pane="beranda"]')].some(e => +e.style.order === 16 && e.style.display !== 'none' && e.offsetParent !== null);
    lblBuat.style.display = vis ? '' : 'none';
  }
  // 🧩 kartu kabar → kotak kecil 3 kolom (kartu aslinya tetep ada, cuma ngumpet; tap kotak = tap kartu aslinya)
  const cut = (t, n) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
  const emo = t => { const m = /(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/u.exec(t || ''); return m ? m[1] : '✨'; };
  let tileSig = '';
  function paintTiles() {
    const L = [];
    home.querySelectorAll('.u2-tiled').forEach(e => {
      if (e.style.display === 'none') return;
      const b = (e.querySelector('b') || {}).textContent || '', sm = (e.querySelector('small') || {}).textContent || '', ic = (e.querySelector('.sr-e, .e, .st-e, .ck-e, span') || {}).textContent || e.textContent;
      let t = b, s2 = sm, m;
      if (has(e, 'rk-card')) { m = /ke-(\d+)/.exec(b); t = 'Rekap bulan'; s2 = m ? `ke-${m[1]} siap` : 'udah siap'; }
      else if (has(e, 'sr-card') && (m = /Surat dari (\w+)/.exec(b))) { t = 'Surat baru'; s2 = 'dari ' + m[1]; }
      else if (has(e, 'ib-card') && (m = /(\d+) kiriman baru dari (\w+)/.exec(b))) { t = m[1] + ' kiriman'; s2 = 'dari ' + m[2]; }
      L.push({ e, ic: emo(ic), t: cut(t.replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, ''), 22), s: cut(s2, 26), hot: has(e, 'hot') || has(e, 'ib-card') || has(e, 'ch-card') });
    });
    const rit = home.querySelector('.rit');
    if (rit) { const tx = ttl(rit), m = /·\s*(.+)$/.exec(tx); L.push({ rit: 1, ic: emo(tx), t: cut(tx.replace(/·.*$/, '').replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, '').replace(/ hari ini/i, ''), 18), s: m ? m[1] + ' hari ini' : 'hari ini' }); }
    const sig = L.map(x => x.ic + x.t + x.s + (x.hot ? 1 : 0)).join('|'); if (sig === tileSig) return; tileSig = sig;
    tilesEl.innerHTML = L.map((x, i) => `<button data-i="${i}">${x.hot ? '<em></em>' : ''}<span>${x.ic}</span><b>${esc(x.t)}</b><small>${esc(x.s)}</small></button>`).join('');
    tilesEl.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const x = L[+b.dataset.i]; vib(6); if (x.rit) { setTab('kita'); setTimeout(() => { const r = home.querySelector('.rit'); if (r) home.scrollTop = Math.max(0, r.offsetTop - 12); }, 60); return; } x.e.click(); });
  }
  let rq = 0; const routeSoon = () => { if (rq) return; rq = requestAnimationFrame(() => { rq = 0; route(); }); };
  try { const mo = new MutationObserver(routeSoon); [home, $('today-slot'), $('home-rows')].forEach(h => h && mo.observe(h, { childList: true })); } catch (e) {}

  // ── tab ──
  const pos = {}; let cur = null;
  function setTab(t, keep) {
    if (!TABS.includes(t)) t = 'beranda';
    if (cur && cur !== t) { pos[cur] = home.scrollTop; if (cur === 'jelajah' && home.classList.contains('searching') && window.clearSearch) try { clearSearch(); } catch (e) {} }
    const was = cur; cur = t; home.dataset.tab = t; ss.set('u2-tab', t);
    nav.querySelectorAll('[data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === t));
    if (t === 'jelajah' && cb && !cb.children.length) { if (catNow === 'lain') { paintSeg(); } else openCat(catNow === 'hadiah' ? 'hadiah' : catNow === 'fav' ? 'fav' : 'games', true); }
    if (t === 'sehat' && window.Sehat && !shHost.dataset.m) { shHost.dataset.m = 1; Sehat.mount(shHost); } else if (t === 'sehat' && window.Sehat) Sehat.paint();
    if (t === 'kita') paintKita();
    if (t === 'beranda') paintBeranda();
    route();
    if (!keep && was !== t) home.scrollTop = pos[t] || 0;
  }
  window.__u2 = { setTab, refresh: () => { paintBeranda(); if (cur === 'sehat' && window.Sehat) Sehat.paint(); }, sambut };

  // ── menu bawah ──
  const nav = $('bnav');
  nav.className = 'bnav u2-nav';
  nav.innerHTML = `<button data-t="beranda"><span>🏠</span>Beranda</button><button data-t="jelajah"><span>🧭</span>Jelajah</button><button class="u2-fab" id="u2-fab" aria-label="Kirim kangen"><span>💗</span></button><button data-t="sehat"><span>🏃</span>Sehat</button><button data-t="kita"><span>👫</span>Kita</button>`;
  nav.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { if (b.dataset.t === cur) { home.scrollTo({ top: 0, behavior: 'smooth' }); return; } vib(6); setTab(b.dataset.t); });
  $('u2-fab').onclick = () => { vib(12); location.href = 'tombol-kangen.html'; };
  const nav0 = window.navGo;
  window.navGo = k => { if (k === 'home') return setTab('beranda'); openCat(k); };

  // ── Jelajah: kategori ──
  const SEGS = [['games', '🎮', 'Game'], ['hadiah', '🎁', 'Hadiah'], ['lain', '✨', 'Lainnya']];
  let catNow = ss.get('u2-cat') || 'games', catAsk = false;
  const segOf = k => k === 'games' || k === 'hadiah' ? k : 'lain';
  function paintMore() {
    more.innerHTML = `<div class="u2-card u2-set"><button data-m="fav"><span>⭐</span>Favorit kamu<small></small></button><button data-m="keuangan"><span>💰</span>Kantong (keuangan)<small>pakai sandi</small></button><button data-m="secret"><span>🔒</span>Rahasia tahunan<small>pakai sandi</small></button><button data-m="az"><span>📚</span>Semua fitur A–Z<small></small></button><button data-m="tour"><span>🧭</span>Fitur pindah ke mana?<small></small></button></div>`;
    more.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { const k = b.dataset.m; vib(6); if (k === 'az') return window.__allFitur && __allFitur(); if (k === 'tour') return window.__tourPindah && __tourPindah(); openCat(k, false, true); });
  }
  function cnt(k) { try { const c = CATS.find(x => x.key === k); return c && c.sections ? c.sections.reduce((a, s) => a + s.items.reduce((b, it) => b + (it.folder ? it.folder.length : 1), 0), 0) : 0; } catch (e) { return 0; } }
  function paintSeg() {
    seg.innerHTML = SEGS.map(([k, e, n]) => { const c = k === 'games' || k === 'hadiah' ? cnt(k) : 0; return `<button data-c="${k}" class="${k === segOf(catNow) ? 'on' : ''}">${e} ${n}${c ? `<small>${c}</small>` : ''}</button>`; }).join('');
    seg.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { vib(6); if (b.dataset.c === 'lain') { catNow = 'lain'; ss.set('u2-cat', 'lain'); paintSeg(); return; } openCat(b.dataset.c, false, true); });
    home.dataset.jv = catNow === 'lain' ? 'lain' : 'cat';
  }
  function openCat(k, silent, scroll) {
    if (k === 'fav') { catNow = 'fav'; ss.set('u2-cat', k); paintSeg(); if (nav0) nav0('fav'); }
    else { let i = -1; try { i = CATS.findIndex(c => c.key === k); } catch (e) {} if (i < 0) return; if (k === 'keuangan' || k === 'secret') catAsk = k; else { catNow = k; ss.set('u2-cat', k); } paintSeg(); try { showCat(i); } catch (e) { try { renderCatScreen(i); } catch (er) {} } }
    if (scroll) setTimeout(() => { home.scrollTop = Math.max(0, seg.offsetTop - 8); }, 30);
  }
  // layar kategori lama → tetep di tab Jelajah
  const cs = $('cat-screen');
  if (cs) new MutationObserver(() => {
    if (!cs.classList.contains('active')) return;
    cs.classList.remove('active'); home.classList.add('active');
    if (catAsk) { catNow = catAsk; catAsk = false; ss.set('u2-cat', catNow); paintSeg(); }
    if (cur !== 'jelajah') setTab('jelajah', true);
    nav.querySelectorAll('[data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === cur));
  }).observe(cs, { attributes: true, attributeFilter: ['class'] });

  // ══════════ 🏠 BERANDA ══════════
  function paintBeranda() {
    const [sp, se] = sapa(), w = me();
    $('u2-av').textContent = w[0]; $('u2-sp').textContent = `Selamat ${sp.toLowerCase() === 'malem' ? 'malam' : sp.toLowerCase()} ${se}`; $('u2-nm').textContent = w;
    if (window.Sehat) shCard.innerHTML = Sehat.card();
    shCard.querySelectorAll('[data-sh]').forEach(a => a.onclick = e => { e.preventDefault(); setTab('sehat'); });
    badges();
  }
  function badges() {
    const c = (g('chat-peek-' + me(), {}) || {}).n || 0; $('u2-chn').textContent = c ? (c > 9 ? '9+' : c) : '';
    const ib = $('ib-btn'), n = ib && ib.querySelector('i') ? ib.querySelector('i').textContent : ''; $('u2-ibn').textContent = n || '';
    let on = false; try { on = !!(window.SFX && SFX.mode === 'all' && SFX.playing); } catch (e) {} $('u2-mu').classList.toggle('on', on);
  }
  $('u2-av').onclick = () => { if (window.Who && Who.ask) Who.ask(); };
  $('u2-ch').onclick = () => { vib(6); location.href = 'chat.html'; };
  $('u2-ib').onclick = () => { vib(6); if (window.__inbox) window.__inbox(); };
  // 🎵 tap = panel suara · tahan = ganti lagu
  (function () {
    const b = $('u2-mu'); let t = 0, long = false;
    const sb = () => document.querySelector('.sfx-btn');
    b.addEventListener('pointerdown', () => { long = false; clearTimeout(t); t = setTimeout(() => { long = true; const s = sb(); if (s) { s.dispatchEvent(new PointerEvent('pointerdown')); setTimeout(() => s.dispatchEvent(new PointerEvent('pointerup')), 650); } vib(20); }, 500); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(k => b.addEventListener(k, () => clearTimeout(t)));
    b.addEventListener('contextmenu', e => e.preventDefault());
    b.addEventListener('click', () => { if (long) { long = false; setTimeout(badges, 900); return; } const s = sb(); if (!s) return; s.classList.remove('mini'); s.click(); setTimeout(badges, 400); });
  })();

  // ══════════ 👫 KITA ══════════
  function paintKita() {
    couple.innerHTML = `<div class="u2-pair"><i class="d">D</i><i class="r">R</i><em>💗</em></div><div><b>Dara &amp; Razan</b><small>bareng sejak 10 Mei 2025</small><small>${hariKe().toLocaleString('id-ID')} hari 💞</small></div>`;
    const t0 = new Date(); t0.setHours(0, 0, 0, 0);
    const nextY = (m, d) => { let x = new Date(t0.getFullYear(), m - 1, d); if (x < t0) x = new Date(t0.getFullYear() + 1, m - 1, d); return x; };
    const dd = x => Math.round((x - t0) / 864e5), an = nextY(5, 10), ul = nextY(8, 18), mt = (localStorage.getItem('idx-meet') || '').replace(/"/g, ''), mtD = /^\d{4}-\d{2}-\d{2}$/.test(mt) ? new Date(mt + 'T00:00') : null;
    const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    hs.innerHTML = `<div class="a"><p>💍 Anniv ke-${an.getFullYear() - 2025}</p><b>${dd(an) || '🎉'}</b><small>${dd(an) ? 'hari lagi · 10 Mei' : 'hari ini!'}</small></div>
      <div class="u"><p>🎂 Ultah Dara</p><b>${dd(ul) || '🎉'}</b><small>${dd(ul) ? 'hari lagi · 18 Agu' : 'hari ini!'}</small></div>
      <button class="k" data-meet><p>🤝 Ketemu</p><b>${mtD && dd(mtD) >= 0 ? (dd(mtD) || '🎉') : '?'}</b><small>${mtD && dd(mtD) >= 0 ? (dd(mtD) ? `hari lagi · ${mtD.getDate()} ${BLN[mtD.getMonth()]}` : 'hari ini!') : 'atur tanggal'}</small></button>`;
    const mb = hs.querySelector('[data-meet]'); if (mb) mb.onclick = () => { if (window.openMeet) openMeet(); };
    const th = g('idx-theme', null) || (localStorage.getItem('idx-theme') || 'auto'), TH = { auto: 'Otomatis', dark: 'Gelap', light: 'Terang' };
    sett.innerHTML = `<button data-k="tema"><span>🎨</span>Tema terang / gelap<small>${TH[th] || 'Otomatis'}</small></button>
      <button data-k="atur"><span>🧩</span>Atur tampilan &amp; mode ringan<small></small></button>
      <a href="atur-notif.html"><span>🔔</span>Notifikasi<small></small></a>
      <button data-k="suara"><span>🎵</span>Suara &amp; musik<small></small></button>
      <a href="kunci-pin.html"><span>🔒</span>Kunci PIN<small></small></a>
      <button data-k="who"><span>🙋</span>HP ini punya<small>${esc(me())}</small></button>
      <a href="cadangan.html"><span>💾</span>Cadangan &amp; pindah HP<small></small></a>
      <button data-k="az"><span>📚</span>Semua fitur A–Z<small></small></button>
      <a href="statistik-fitur.html"><span>📊</span>Statistik fitur<small></small></a>`;
    sett.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
      const k = b.dataset.k;
      if (k === 'tema' && window.cycleTheme) { cycleTheme(); setTimeout(paintKita, 50); }
      if (k === 'atur' && window.__hlEdit) __hlEdit();
      if (k === 'suara') $('u2-mu').click();
      if (k === 'who' && window.Who && Who.ask) Who.ask();
      if (k === 'az' && window.__allFitur) __allFitur();
    });
  }

  // ── mulai ──
  paintSeg(); paintMore(); pembuka();
  addEventListener('hashchange', () => { const h = location.hash.slice(1); if (TABS.includes(h)) { setTab(h); history.replaceState(null, '', location.pathname); } });
  document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return; const h = a.getAttribute('href').slice(1); if (TABS.includes(h)) { e.preventDefault(); setTab(h); } });
  const h0 = location.hash.slice(1);
  setTab(TABS.includes(h0) ? h0 : (ss.get('u2-tab') || 'beranda'), true);
  if (TABS.includes(h0)) { try { history.replaceState(null, '', location.pathname); } catch (e) {} const wl = $('s-welcome'); if (wl) wl.style.display = 'none'; }
  setInterval(() => { if (!document.hidden) { badges(); route(); } }, 3000);
  setInterval(() => { if (!document.hidden && cur === 'beranda') paintBeranda(); }, 60e3);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { paintBeranda(); if (cur === 'sehat' && window.Sehat) Sehat.paint(); } });
  try { window.Berdua && Berdua.on && Berdua.on(ev => { if (ev.apps && ev.apps.length) { badges(); if (cur === 'beranda') paintBeranda(); } }); } catch (e) {}
  // kalau welcome udah dilewatin (balik dari halaman lain) & belum pernah liat sambutan
  if (document.documentElement.classList.contains('no-welcome')) setTimeout(sambutOnce, 1200);
})();
