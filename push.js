/* ═══ NOTIF INSTAN ANTAR HP (Firebase Cloud Messaging) ═══
   Dimuat otomatis sama who.js di semua halaman.
   - Daftarin HP ini ke server (data-berdua.gs) biar bisa dikirimin notif.
   - Tiap kirim sesuatu ke pasangan (link WA, kangen, ngajak main online, usulan janji) → pasangan dapet notif detik itu juga.
   Kalau FIREBASE di bawah belum diisi, semua ini diem aja (ga bikin eror). */
(function () {
  if (window.Push) return;

  // ── ISI DARI FIREBASE (Project settings → General → "Your apps" → Config) ──
  const FIREBASE = {
    apiKey: 'AIzaSyDNHCI7mBlFDTzn6ir8_z8lKBieE8WTNjE',
    authDomain: 'app-razara.firebaseapp.com',
    projectId: 'app-razara',
    messagingSenderId: '829840442733',
    appId: '1:829840442733:web:b94b0376826beb4b68c664'
  };
  // Project settings → Cloud Messaging → Web Push certificates → "Key pair"
  const VAPID = 'BPeNgTZVWvQ5Ho0t_Sw71EcfWVCZrjbAjU49STds2KhYFvfm4lk7rRexjIdqqCuUEKcz2bVDpMIhVdIYGu_J86A';

  const URL = 'https://script.google.com/macros/s/AKfycbyCq294yq71M-BDzouyLttp2Kki0aumPAP0JzII0fvvnBakSQ5_eHkNTawXA01fQ3dC/exec';   // sama dengan sync.js
  const KEY = 'razara-berdua';
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const ready = !!(FIREBASE.apiKey && FIREBASE.projectId && FIREBASE.messagingSenderId && FIREBASE.appId && VAPID);
  const GAME = { congklak: '🐚 Congklak', 'perang-kapal': '⚓ Perang Kapal', dam: '👑 Dam', 'empat-sejajar': '🔵 Empat Sejajar', tictactoe: '⭕ Tic Tac Toe', 'titik-kotak': '🔳 Titik & Kotak', 'bolak-balik': '🔘 Bolak-Balik', 'ular-tangga': '🐍 Ular Tangga' };

  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const s = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const me = () => (window.Who && Who.me()) || null;
  const other = w => w === 'Razan' ? 'Dara' : 'Razan';
  const base = () => location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');

  function post(body) {
    return new Promise(res => {
      try {
        const x = new XMLHttpRequest(); x.open('POST', URL, true); x.timeout = 20000; x.setRequestHeader('Content-Type', 'text/plain');
        x.onload = () => { try { res(JSON.parse(x.responseText)); } catch (e) { res(null); } }; x.onerror = x.ontimeout = () => res(null);
        x.send(JSON.stringify(Object.assign({ key: KEY }, body)));
      } catch (e) { res(null); }
    });
  }

  // ── simpen ke Kotak Masuk pasangan (app 'inbox', 60 slot muter) — tetep ada walaupun notifnya kelewat ──
  const D0 = Date.UTC(1950, 0, 1);
  function rowPut(app, who, date, data) {
    if (window.Berdua && Berdua.put) { Berdua.put(app, who, date, data); return; }
    const k = app + '-' + who, m = g(k, {}) || {}; m[date] = data; s(k, m);
    const now = Date.now(), st = g('bd-stamp', {}) || {}; st[`${app}|${who}|${date}`] = now; s('bd-stamp', st);
    const b = JSON.stringify({ key: KEY, action: 'put', rows: [{ app, who, date, data, updated: now }] });
    try { if (navigator.sendBeacon && navigator.sendBeacon(URL, new Blob([b], { type: 'text/plain' }))) return; } catch (e) {}
    post({ action: 'put', rows: [{ app, who, date, data, updated: now }] });
  }
  function inboxAdd(to, item) {
    const n = ((g('inbox-slot', -1) | 0) + 1) % 60; s('inbox-slot', n);
    rowPut('inbox', to, new Date(D0 + n * 864e5).toISOString().slice(0, 10), item);
  }
  // ── kirim notif ke pasangan ──
  const lastSent = {};
  function notify(o) {
    const w = me(); if (!w || !o || !o.title) return;
    const tag = o.tag || 'kiriman', now = Date.now(), to = o.to || other(w);
    if (lastSent[tag] && now - lastSent[tag] < 8000) return;            // jangan dobel kalau kepencet 2x
    lastSent[tag] = now;
    const title = String(o.title).slice(0, 80), text = String(o.body || '').slice(0, 180), url = o.url || './';
    if (to !== w && tag !== 'tes') { try { inboxAdd(to, { f: w, t: title, b: text, u: url, g: tag, at: now }); } catch (e) {} }
    if (!ready) return;
    // ditunda dikit biar sempet kekirim walaupun halaman langsung pindah ke WA
    const body = { action: 'notify', from: w, to, title, body: text, url, tag };
    try {
      if (navigator.sendBeacon) { const ok = navigator.sendBeacon(URL, new Blob([JSON.stringify(Object.assign({ key: KEY }, body))], { type: 'text/plain' })); if (ok) return; }
    } catch (e) {}
    post(body);
  }


  // ── kiriman lewat WhatsApp → pasangan juga dapet notif ──
  function fromWA(href) {
    try {
      if (!/wa\.me|api\.whatsapp\.com|^whatsapp:/i.test(href)) return;
      const u = new window.URL(href, location.href), text = u.searchParams.get('text') || '';
      if (!text) return;
      const w = me(); if (!w) return;
      const site = base(), links = (text.match(/https?:\/\/\S+/g) || []);
      const own = links.find(l => l.indexOf(site) === 0) || links.find(l => /github\.io/.test(l));
      const clean = text.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
      const page = (location.pathname.split('/').pop() || 'index.html');
      notify({ title: `💌 ${w} ngirimin sesuatu buat kamu`, body: clean.slice(0, 160), url: own || page, tag: 'wa-' + page });
    } catch (e) {}
  }
  document.addEventListener('click', e => { const a = e.target && e.target.closest && e.target.closest('a[href]'); if (a) fromWA(a.getAttribute('href')); }, true);
  const _open = window.open;
  window.open = function (u) { try { if (typeof u === 'string') fromWA(u); } catch (e) {} return _open.apply(window, arguments); };

  // ═══ TIAP NAMBAHIN SESUATU DI FITUR BERDUA → PASANGAN DIKABARIN ═══
  const pick = d => { if (!d) return ''; const v = d.t || d.n || d.title || d.text || d.name || d.w || ''; return String(v).slice(0, 100); };
  const newItem = (d, p) => { const A = (d && d.items) || [], B = (p && p.items) || []; const ids = new Set(B.map(x => x && (x.id || JSON.stringify(x)))); return A.find(x => x && !ids.has(x.id || JSON.stringify(x))) || null; };
  const rp = n => 'Rp' + Math.round(+n || 0).toLocaleString('id-ID');
  const seen = (() => { let S = g('push-once', []) || []; return k => { if (S.includes(k)) return false; S.push(k); if (S.length > 300) S = S.slice(-300); s('push-once', S); return true; }; })();
  const slow = {};   // 1 notif per fitur tiap 90 detik (biar nambahin banyak sekaligus ga nyepam)
  // awalan tag = kategori di 🔔 Atur Notif (mood/syukur/status → Buku harian & hati, minum → Kebiasaan, ketemu/hari penting → Jadwal, kuis/gambar → Game, surat → Chat & kiriman)
  const TCAT = { mood: 'diary-', syukur: 'diary-', status: 'diary-', minum: 'minum-', ketemu: 'jadwal-', ingat: 'jadwal-', md: 'jadwal-', gbrm: 'ajak-', kuisj: 'ajak-', 'kuisj-g': 'ajak-' };
  function tell(key, o) { const now = Date.now(); if (slow[key] && now - slow[key] < 9e4) return; slow[key] = now; notify(Object.assign({ tag: (/^srv-/.test(key) ? 'kiriman-' : TCAT[key] || '') + 'upd-' + key }, o)); }
  // [judul, isi, link] — app = nama data di Data Berdua
  const RULES = {
    mood: (d, p, w) => !p && [`🌈 ${w} nyatet mood hari ini`, 'Liat gimana perasaannya hari ini yuk', 'kalender-mood.html'],
    syukur: (d, p, w) => !p && [`🙏 ${w} nulis jurnal syukur`, pick(d) || 'Baca yuk, siapa tau ada kamunya 🤍', 'jurnal-syukur.html'],
    film: (d, p, w) => !p ? [`🎬 ${w} nambahin tontonan`, pick(d), 'bioskop-kita.html']
      : (p.s !== 'udah' && d.s === 'udah') ? [`✅ ${w} selesai nonton`, `${pick(d)} — kasih rating kamu juga yuk`, 'bioskop-kita.html']
      : (d.r && d.r[w] && (!p.r || p.r[w] !== d.r[w])) ? [`⭐ ${w} ngasih ${d.r[w]} bintang`, pick(d), 'bioskop-kita.html'] : null,
    resep: (d, p, w) => !p && [`🥘 ${w} nambahin resep`, pick(d), 'resep-kita.html'],
    kamus: (d, p, w) => !p && [`📖 ${w} nambahin kata ke Kamus Kita`, d.w ? `${d.w}${d.d ? ' — ' + d.d : ''}` : '', 'kamus-kita.html'],
    daftar: (d, p, w) => !p && [`🧳 ${w} nambahin ke Daftar Bareng`, pick(d), 'daftar-bareng.html'],
    ingat: (d, p, w) => !p && [`⭐ ${w} nambahin hari penting`, pick(d), 'pengingat.html'],
    wish: (d, p, w) => { const it = newItem(d, p); return it && [`🎁 ${w} nambahin wishlist`, pick(it), 'wishlist.html']; },
    ketemu: (d, p, w) => { const it = newItem(d, p); return it && [`📅 ${w} nambahin rencana ketemu`, pick(it) || 'Cek jadwalnya yuk', 'jadwal-mingguan.html']; },
    kbx: (d, p, w) => { const it = newItem(d, p); return it && [`🤑 ${w} nyatet di Keuangan Berdua`, [pick(it), it.v ? rp(it.v) : ''].filter(Boolean).join(' · '), 'keuangan-berdua.html']; },
    kbg: (d, p, w) => !p && [`🎯 ${w} bikin target tabungan baru`, pick(d), 'keuangan-berdua.html'],
    md: (d, p, w) => d.done && !(p && p.done) && [`🔭 ${w} udah ngisi Teropong Masa Depan`, 'Giliran kamu, biar bisa diliat seberapa sehati', 'masa-depan.html'],
    gbrm: (d, p, w) => (!p || p.id !== d.id) && [`🎨 ${w} ngirim gambar buat kamu tebak!`, 'Tebak gambarnya yuk 🖍️', 'gartic-berdua.html?beda=1'],
    status: (d, p, w) => (d.e || d.t) && (!p || p.e !== d.e || p.t !== d.t) && [`💞 ${w} pasang status`, `${d.e || ''} ${d.t || ''}`.trim(), './'],
    minum: (d, p, w) => { const goal = (d.g || 8) * 250; return (d.ml || 0) >= goal && ((p && p.ml) || 0) < goal && [`💧 ${w} udah capai target minum hari ini 🎉`, 'Kamu udah belum? 😉', 'jaga-minum.html']; }
  };
  function hookB(win) {
    const B = win && win.Berdua; if (!B || B.__push) return; B.__push = true;
    const put = B.put;
    B.put = function (app, who, date, data) {
      let prev = null; try { prev = ((JSON.parse(win.localStorage.getItem(app + '-' + who)) || {})[date]) || null; } catch (e) {}
      const r = put.apply(this, arguments);
      try {
        const w = me();
        if (data && w && who === w) {
          if (app === 'kangen' && data.n) notify({ title: `💗 ${w} lagi kangen kamu`, body: data.n > 1 ? `Udah ${data.n}x hari ini 🥺 bales pelukannya yuk` : 'Tap buat bales kangennya 🤍', url: 'tombol-kangen.html', tag: 'kangen' });
          else if (app === 'ajak' && data.g) notify({ title: `🎮 ${w} ngajak main ${GAME[data.g] || data.g}!`, body: 'Online dari HP masing-masing — dia lagi nunggu kamu gabung', url: `${data.g}.html?online=1`, tag: 'ajak' });
          else if (app === 'janji' && data.t && data.sig && Object.keys(data.sig).length === 1 && data.sig[w] && Date.now() - (data.at || 0) < 6e4) notify({ title: `📜 ${w} ngusulin janji baru`, body: `“${String(data.t).slice(0, 120)}” — tanda tangan yuk ✍️`, url: 'janji-kita.html', tag: 'janji' });
          else if (app === 'kuisj' && (!prev || prev.id !== data.id)) tell('kuisj', { title: `🧠 ${w} bikin kuis buat kamu`, body: 'Seberapa kenal kamu sama dia? Jawab yuk', url: 'who-knows-me.html?beda=1' });
          else if (RULES[app]) { const m = RULES[app](data, prev, w); if (m) tell(app, { title: m[0], body: m[1], url: m[2] }); }
        } else if (data && w && who !== w && app === 'kuisj' && data.g && !(prev && prev.g)) tell('kuisj-g', { title: `🧠 ${w} udah jawab kuismu`, body: 'Liat skornya — seberapa kenal dia sama kamu?', url: 'who-knows-me.html?beda=1' });
      } catch (e) {}
      return r;
    };
  }

  // ── fitur yang punya server sendiri (bucket list, surat, pertanyaan, kapsul, playlist, kenangan, period) ──
  const SRV = [
    ['cbzeGCcGD-moled6', (b, w) => { const it = b.item || {}; if (b.action !== 'save' || it.deleted) return null;
      if (it.done && it.doneBy === w && seen('bl-d-' + it.id)) return [`✅ ${w} nyentang bucket list!`, it.text || '', 'bucket-list.html'];
      if (!it.done && it.created && Date.now() - it.created < 6e5 && seen('bl-n-' + it.id)) return [`🪣 ${w} nambahin impian baru`, it.text || '', 'bucket-list.html']; return null; }],
    ['cbzLJHmyZ7rM00fA', (b, w) => b.action === 'answer' && seen('qa-' + (b.date || b.id || new Date().toDateString()) + w) && [`💬 ${w} udah jawab pertanyaan hari ini`, 'Giliran kamu — jawaban kebuka kalau dua-duanya udah jawab', 'pertanyaan-harian.html']],
    ['cbzpC1yfvgmtobfI', (b, w) => b.action === 'add' && seen('kw-' + ((b.item && b.item.id) || Date.now())) && [`⏳ ${w} nyimpen kapsul waktu baru`, 'Kebukanya nanti di tanggal yang udah ditentuin 🤫', 'kapsul-waktu.html']],
    ['cbyR2ZOcUe9mw8I6', (b, w) => b.action === 'add' && [`🎵 ${w} nambahin lagu ke playlist`, pick(b.song), 'playlist-dara.html']],
    ['cbxPd5lEfwBFVHE8', (b, w) => b.action === 'upload' && [`📸 ${w} nambahin kenangan baru`, 'Foto/video baru masuk album — liat yuk', 'memories.html']],
    ['cbwxqc1oPn30mM-E', (b, w) => b.action === 'save' && [`🩸 ${w} update tracking period`, '', 'period-tracker.html']],
    ['cbz14RB_aXdOTeLU', (b, w) => {
      if (b.action === 'save' && b.item && seen('sr-' + b.item.id)) return [`💌 ${w} nulis surat buat kamu`, pick(b.item) || 'Buka kotak surat yuk', 'kotak-surat.html?m=0'];
      if (b.action === 'react') { if (b.reply && seen('srr-' + b.id + String(b.reply).length)) return [`💬 ${w} bales suratmu`, String(b.reply).slice(0, 120), 'kotak-surat.html?m=0'];
        if (b.reaction && seen('srx-' + b.id + b.reaction)) return [`💗 ${w} ngasih reaksi ${b.reaction} ke suratmu`, '', 'kotak-surat.html?m=0'];
        if (b.readAt && seen('srd-' + b.id)) return [`📖 ${w} udah buka suratmu`, '', 'kotak-surat.html?m=0']; } return null; }]
  ];
  function srvCheck(url, body) {
    try {
      if (!url || !/script\.google\.com\/macros/.test(url) || typeof body !== 'string' || body.length > 20000) return;
      const r = SRV.find(x => url.indexOf(x[0]) >= 0); if (!r) return;
      const b = JSON.parse(body), w = me(); if (!w) return;
      const m = r[1](b, w); if (m) tell('srv-' + r[0].slice(0, 8) + (b.action || ''), { title: m[0], body: m[1], url: m[2] });
    } catch (e) {}
  }
  function hookNet(win) {
    try {
      if (!win || win.__pushNet) return; win.__pushNet = 1;
      const X = win.XMLHttpRequest && win.XMLHttpRequest.prototype;
      if (X) { const o = X.open, sd = X.send; X.open = function (m, u) { this.__u = String(u || ''); return o.apply(this, arguments); }; X.send = function (b) { srvCheck(this.__u, b); return sd.apply(this, arguments); }; }
      if (win.fetch) { const f = win.fetch; win.fetch = function (u, opt) { try { srvCheck(typeof u === 'string' ? u : (u && u.url), opt && opt.body); } catch (e) {} return f.apply(this, arguments); }; }
    } catch (e) {}
  }
  function attach(win) { try { hookB(win); hookNet(win); } catch (e) {} }
  attach(window); document.addEventListener('DOMContentLoaded', () => attach(window));
  // halaman di dalam hub (iframe) juga ikut
  function watchFrame(fr) { if (fr.__pw) return; fr.__pw = 1; const go = () => { try { attach(fr.contentWindow); } catch (e) {} }; fr.addEventListener('load', go); go(); }
  try { new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.tagName === 'IFRAME') watchFrame(n); else if (n.querySelectorAll) n.querySelectorAll('iframe').forEach(watchFrame); }))).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}
  document.querySelectorAll('iframe').forEach(watchFrame);

  // ── daftarin HP ini biar bisa nerima notif ──
  function load(src) { return new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = src; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc); }); }
  let regging = false;
  async function register(force) {
    if (!ready || regging) return false;
    const w = me(); if (!w || !('serviceWorker' in navigator) || !('Notification' in window) || Notification.permission !== 'granted') return false;
    const st = g('push-reg', {});
    if (!force && st.who === w && st.token && Date.now() - (st.at || 0) < 864e5) return true;   // udah kedaftar (dicek ulang tiap hari — Chrome kadang ganti alamat notif diam-diam)
    regging = true;
    try {
      if (!window.firebase || !firebase.messaging) { await load(SDK + 'firebase-app-compat.js'); await load(SDK + 'firebase-messaging-compat.js'); }
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE);
      if (firebase.messaging.isSupported && !(await firebase.messaging.isSupported())) return false;
      const reg = await navigator.serviceWorker.ready;
      const token = await firebase.messaging().getToken({ vapidKey: VAPID, serviceWorkerRegistration: reg });
      if (!token) return false;
      const r = await post({ action: 'pushreg', who: w, token, old: st.token && st.token !== token ? st.token : '' });
      if (r && r.ok) { s('push-reg', { who: w, token, at: Date.now() }); return true; }
      return false;
    } catch (e) { return false; }
    finally { regging = false; }
  }
  // kirim notif tes ke HP sendiri
  function test() { const w = me(); if (w) post({ action: 'notify', from: w, to: w, title: '🔔 Notif instan nyala!', body: 'Kalau pasangan ngirim sesuatu, langsung muncul di sini kayak chat 💌', url: './', tag: 'tes' }); }

  window.Push = { ready, notify, register, test, fromWA, status };
  // otomatis daftar ulang kalau notif udah diizinin (misal abis ganti orang)
  // kalau service worker bilang "alamat notif berubah" → daftar ulang sekarang juga
  async function pushChanged() { try { const c = await caches.open('untuk-dara-meta'), r = await c.match('/__pushchg'); if (r) { await c.delete('/__pushchg'); return true; } } catch (e) {} return false; }
  if (ready) setTimeout(async () => { register(await pushChanged()); }, 2500);
  // 🩺 status notif (dipakai halaman Atur Notif)
  async function status() {
    const out = { perm: 'Notification' in window ? Notification.permission : 'none', reg: g('push-reg', {}), got: null, srv: null };
    try { const c = await caches.open('untuk-dara-meta'), r = await c.match('/__lastpush'); if (r) out.got = await r.json(); } catch (e) {}
    try { const w = me(); if (w) { const r = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ key: KEY, action: 'pushreg', who: w, stat: 1 }) }).then(x => x.json()); if (r && r.ok) out.srv = r.stat || null; } } catch (e) {}
    return out;
  }
  if (window.Who && Who.on) Who.on(() => { try { localStorage.removeItem('push-reg'); } catch (e) {} });
})();
