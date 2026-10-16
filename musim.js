/* ═══ Tema musiman otomatis (menu utama) — dekorasi + lagu ikut suasana ═══
   Coba liat duluan: index.html?musim=liburan / tahunbaru / valentine / ramadan / lebaran / merdeka
   Tanggal Ramadan & Lebaran itu perkiraan (bisa geser ±1 hari dari keputusan resmi) — tambahin tahun baru di RAMADAN kalau perlu. */
(function () {
  if (window.Musim) return;
  // [awal Ramadan, 1 Syawal / Idul Fitri]
  const RAMADAN = { 2026: ['2026-02-18', '2026-03-20'], 2027: ['2027-02-08', '2027-03-10'], 2028: ['2028-01-28', '2028-02-26'], 2029: ['2029-01-16', '2029-02-14'], 2030: ['2030-01-06', '2030-02-05'] };
  const T = {
    liburan:   { e: '❄️', t: 'Libur akhir tahun!', s: 'Waktunya santai & bikin rencana berdua ⛄', fx: ['❄️', '❄️', '✨', '⛄', '🎁'], c1: '#e8f3ff', c2: '#bcd8f5', mood: 'liburan' },
    tahunbaru: { e: '🎆', t: 'Selamat Tahun Baru!', s: '', fx: ['🎆', '✨', '🎇', '🥂', '⭐'], c1: '#fff4d6', c2: '#e8c46e', mood: 'pesta' },
    valentine: { e: '💘', t: 'Happy Valentine!', s: 'Hari kasih sayang — sayangnya ke kamu doang 😌', fx: ['💗', '💘', '🌹', '💕', '✨'], c1: '#ffe3ea', c2: '#f29aac', mood: 'valentine' },
    ramadan:   { e: '🌙', t: 'Ramadan Kareem', s: '', fx: ['⭐', '🌙', '✨', '🏮'], c1: '#e9f4ee', c2: '#9fcfb3', mood: 'ramadan' },
    lebaran:   { e: '🕌', t: 'Selamat Idul Fitri!', s: 'Mohon maaf lahir & batin ya 🤲', fx: ['✨', '🕌', '🌙', '🎉', '💚'], c1: '#eaf7ec', c2: '#8fcf9a', mood: 'lebaran' },
    merdeka:   { e: '🇮🇩', t: 'Dirgahayu Indonesia!', s: '', fx: ['🇮🇩', '✨', '🎉', '❤️', '🤍'], c1: '#ffe8e8', c2: '#f3a0a0', mood: 'merdeka' },
  };
  const pad = n => String(n).padStart(2, '0'), ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addD = (s, n) => { const [y, m, d] = s.split('-').map(Number); return ymd(new Date(y, m - 1, d + n)); };
  function now(at) {
    const q = (location.search.match(/[?&]musim=(\w+)/) || [])[1]; if (q && T[q]) return Object.assign({ k: q }, T[q], { s: T[q].s || 'Pratinjau tema' });
    const d = at || new Date(), y = d.getFullYear(), m = d.getMonth() + 1, dd = d.getDate(), t = ymd(d);
    for (const yy of [y, y + 1]) { const R = RAMADAN[yy]; if (!R) continue;
      if (t >= R[1] && t <= addD(R[1], 6)) return Object.assign({ k: 'lebaran' }, T.lebaran);
      if (t >= R[0] && t < R[1]) { const n = Math.round((new Date(t) - new Date(R[0])) / 864e5) + 1; return Object.assign({ k: 'ramadan' }, T.ramadan, { s: `Hari ke-${n} puasa · semangat ya, sayang 🤍` }); } }
    if ((m === 12 && dd >= 31) || (m === 1 && dd <= 1)) return Object.assign({ k: 'tahunbaru' }, T.tahunbaru, { s: m === 12 ? `Bentar lagi ${y + 1} — tahun baru bareng lagi 🥂` : `${y}, tahun baru bareng kamu 🥂` });
    if (m === 12 && dd >= 18) return Object.assign({ k: 'liburan' }, T.liburan);
    if (m === 2 && dd >= 13 && dd <= 14) return Object.assign({ k: 'valentine' }, T.valentine);
    if (m === 8 && dd >= 15 && dd <= 17) return Object.assign({ k: 'merdeka' }, T.merdeka, { s: `${y - 1945} tahun merdeka · MERDEKA! ✊` });
    return null;
  }
  window.Musim = { now, T };
  const M = now(); if (!M) return;
  document.documentElement.setAttribute('data-musim', M.k);

  function deco() {
    if (!document.body) return;
    const st = document.createElement('style');
    st.textContent = `.ms-layer{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden}
    .ms-layer span{position:absolute;top:-8%;opacity:.55;animation:msFall linear infinite;will-change:transform}
    @keyframes msFall{0%{transform:translate3d(0,0,0) rotate(0)}100%{transform:translate3d(var(--dx),112vh,0) rotate(var(--r))}}
    .ms-card{position:relative;display:flex;align-items:center;gap:.75rem;padding:.8rem .9rem;margin-bottom:.75rem;border-radius:20px;background:linear-gradient(135deg,#fff 15%,var(--c1) 65%,var(--c2));border:1px solid rgba(0,0,0,.05);box-shadow:0 6px 18px rgba(0,0,0,.06)}
    .ms-card .e{font-size:2rem;flex-shrink:0;animation:msB 2.4s ease-in-out infinite}@keyframes msB{50%{transform:translateY(-3px) rotate(-6deg)}}
    .ms-card b{display:block;font-size:14.5px;color:var(--ink,#2d1f1a)}.ms-card small{display:block;font-size:11.5px;color:var(--muted,#9a8070);margin-top:.1rem}
    .ms-card button{position:absolute;top:.35rem;right:.45rem;border:none;background:rgba(255,255,255,.6);width:24px;height:24px;border-radius:50%;font-size:11px;color:#9a8070;cursor:pointer}
    html.night .ms-card{background:linear-gradient(135deg,var(--card,#2a2030) 30%,#3a3040);border-color:rgba(255,255,255,.08)}html.night .ms-card b{color:#f3d9d2}
    @media (prefers-reduced-motion:reduce){.ms-layer{display:none}.ms-card .e{animation:none}}`;
    document.head.appendChild(st);
    const low = (navigator.hardwareConcurrency || 8) <= 4, N = low ? 8 : 14, L = document.createElement('div'); L.className = 'ms-layer'; L.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < N; i++) { const s = document.createElement('span'); s.textContent = M.fx[i % M.fx.length]; s.style.left = (Math.random() * 100) + '%'; s.style.fontSize = (12 + Math.random() * 12) + 'px'; s.style.animationDuration = (9 + Math.random() * 10) + 's'; s.style.animationDelay = (-Math.random() * 18) + 's'; s.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px'); s.style.setProperty('--r', (Math.random() * 360 - 180) + 'deg'); L.appendChild(s); }
    document.body.appendChild(L);
  }
  // kartu sapaan di atas home (bisa ditutup buat hari ini)
  window.__musimCard = function () {
    const key = 'musim-x-' + M.k + '-' + ymd(new Date()); try { if (localStorage.getItem(key)) return ''; } catch (e) {}
    return `<div class="ms-card" style="--c1:${M.c1};--c2:${M.c2}"><span class="e">${M.e}</span><span><b>${M.t}</b><small>${M.s || ''}</small></span><button aria-label="Tutup" onclick="try{localStorage.setItem('${key}','1')}catch(e){};this.parentNode.remove()">✕</button></div>`;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', deco); else deco();
})();
