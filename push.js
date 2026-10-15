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

  // ── kirim notif ke pasangan ──
  const lastSent = {};
  function notify(o) {
    const w = me(); if (!ready || !w || !o || !o.title) return;
    const tag = o.tag || 'kiriman', now = Date.now();
    if (lastSent[tag] && now - lastSent[tag] < 8000) return;            // jangan dobel kalau kepencet 2x
    lastSent[tag] = now;
    // ditunda dikit biar sempet kekirim walaupun halaman langsung pindah ke WA
    const body = { action: 'notify', from: w, to: o.to || other(w), title: String(o.title).slice(0, 80), body: String(o.body || '').slice(0, 180), url: o.url || './', tag };
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

  // ── kangen, ngajak main online, usulan janji → notif ──
  function hookBerdua() {
    const B = window.Berdua; if (!B || B.__push) return; B.__push = true;
    const put = B.put;
    B.put = function (app, who, date, data) {
      const r = put.apply(this, arguments);
      try {
        const w = me();
        if (data && w && who === w) {
          if (app === 'kangen' && data.n) notify({ title: `💗 ${w} lagi kangen kamu`, body: data.n > 1 ? `Udah ${data.n}x hari ini 🥺 bales pelukannya yuk` : 'Tap buat bales kangennya 🤍', url: 'tombol-kangen.html', tag: 'kangen' });
          if (app === 'ajak' && data.g) notify({ title: `🎮 ${w} ngajak main ${GAME[data.g] || data.g}!`, body: 'Online dari HP masing-masing — dia lagi nunggu kamu gabung', url: `${data.g}.html?online=1`, tag: 'ajak' });
          if (app === 'janji' && data.t && data.sig && Object.keys(data.sig).length === 1 && data.sig[w] && Date.now() - (data.at || 0) < 6e4) notify({ title: `📜 ${w} ngusulin janji baru`, body: `“${String(data.t).slice(0, 120)}” — tanda tangan yuk ✍️`, url: 'janji-kita.html', tag: 'janji' });
        }
      } catch (e) {}
      return r;
    };
  }
  hookBerdua(); document.addEventListener('DOMContentLoaded', hookBerdua);

  // ── daftarin HP ini biar bisa nerima notif ──
  function load(src) { return new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = src; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc); }); }
  let regging = false;
  async function register(force) {
    if (!ready || regging) return false;
    const w = me(); if (!w || !('serviceWorker' in navigator) || !('Notification' in window) || Notification.permission !== 'granted') return false;
    const st = g('push-reg', {});
    if (!force && st.who === w && st.token && Date.now() - (st.at || 0) < 3 * 864e5) return true;   // udah kedaftar (dicek ulang tiap 3 hari)
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

  window.Push = { ready, notify, register, test, fromWA };
  // otomatis daftar ulang kalau notif udah diizinin (misal abis ganti orang)
  if (ready) setTimeout(() => { register(false); }, 2500);
  if (window.Who && Who.on) Who.on(() => { try { localStorage.removeItem('push-reg'); } catch (e) {} });
})();
