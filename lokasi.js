/* ═══ 📍 LOKASI LIVE BERDUA — kayak Find My Device versi kita.
   - Masing-masing NYALAIN SENDIRI di HP-nya (Jarak Kita → Bagikan lokasi). Bisa dijeda / dimatiin kapan aja.
   - Selama app kebuka (halaman mana aja), lokasi dikirim tiap ±5 menit. Pas app ditutup, browser emang ga ngizinin baca lokasi.
   - Pasangan bisa "minta lokasi" → dapet notif → sekali tap, lokasi kekirim.
   - Jejak hari ini disimpen per hari & yang lama dihapus otomatis. ═══ */
(function () {
  if (window.Lok) return;
  try { if (window.top !== window.self) return; } catch (e) { return; }   // cukup 1 di jendela utama
  const SLOT = '2000-01-01', EVERY = 5 * 6e4, D0 = Date.UTC(1960, 0, 1);
  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const s = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const me = () => (window.Who && Who.me && Who.me()) || g('berdua-me', null);
  const op = () => me() === 'Razan' ? 'Dara' : 'Razan';
  const p2 = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  const B = () => window.Berdua;
  // sync.js belum ada di halaman ini → dimuat dulu, kirimnya nunggu bentar
  const needSync = () => { if (!window.Berdua && !document.getElementById('lok-sync')) { try { const sc = document.createElement('script'); sc.id = 'lok-sync'; sc.src = 'sync.js'; document.head.appendChild(sc); } catch (e) {} } };
  const put = (app, w, date, data, n) => {
    if (B()) return B().put(app, w, date, data);
    needSync(); if ((n || 0) < 16) return setTimeout(() => put(app, w, date, data, (n || 0) + 1), 400);
    const k = app + '-' + w, m = g(k, {}) || {}; if (data == null) delete m[date]; else m[date] = data; s(k, m);
  };
  const rad = x => x * Math.PI / 180;
  const dist = (a, b) => { const dl = rad(b.lat - a.lat), dn = rad(b.lng - a.lng), x = Math.sin(dl / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dn / 2) ** 2; return 2 * 6371000 * Math.asin(Math.sqrt(x)); };   // meter
  const PAGE = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');

  // ── mode berbagi: on | pause (sampai jam tertentu) | off ──
  function mode() { const m = g('lok-mode', { m: 'off' }) || { m: 'off' }; if (m.m === 'pause' && m.until && Date.now() > m.until) { s('lok-mode', { m: 'on' }); return { m: 'on' }; } return m; }
  const row = w => (g('lokasi-' + w, {}) || {})[SLOT] || null;
  function setMode(m, until) {
    s('lok-mode', { m, until: until || null }); const w = me(); if (!w) return;
    const cur = row(w) || {};
    if (m === 'off') put('lokasi', w, SLOT, { st: 'off', at: Date.now() });                       // mati → posisi ikut dihapus
    else if (m === 'pause') put('lokasi', w, SLOT, Object.assign({}, cur, { st: 'pause', until: until || null, sat: Date.now() }));
    else { put('lokasi', w, SLOT, Object.assign({}, cur, { st: 'on', until: null, sat: Date.now() })); send(true); }
    dot();
  }

  // ── tempat favorit (berdua) ──
  function favs() {
    const m = {};
    ['Razan', 'Dara'].forEach(w => ((((g('lokfav-' + w, {}) || {})[SLOT] || {}).list) || []).forEach(f => { if (f && f.id && (!m[f.id] || f.at > m[f.id].at)) m[f.id] = f; }));
    return Object.values(m).filter(f => !f.del).sort((a, b) => (a.at0 || 0) - (b.at0 || 0));
  }
  function saveFav(f) { const w = me(); const cur = (((g('lokfav-' + w, {}) || {})[SLOT] || {}).list) || []; put('lokfav', w, SLOT, { list: cur.filter(x => x.id !== f.id).concat([Object.assign({}, f, { at: Date.now() })]).slice(-30) }); }
  const favAt = p => favs().find(f => dist(p, f) <= (f.r || 150)) || null;

  // ── nama tempat (jalan/daerah) ──
  async function place(lat, lng) {
    const k = lat.toFixed(3) + ',' + lng.toFixed(3), C = g('lok-geo', {}) || {};
    if (C[k]) return C[k];
    let out = null;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=17&accept-language=id`, { headers: { 'Accept': 'application/json' } });
      const j = await r.json(), a = j.address || {};
      const near = a.road || a.pedestrian || a.neighbourhood || a.hamlet || a.amenity || '';
      const area = a.suburb || a.village || a.city_district || a.quarter || '';
      const city = a.city || a.town || a.county || a.municipality || a.state || '';
      out = { pl: [near, area].filter(Boolean).join(', ').slice(0, 70), city: [city, a.state && a.state !== city ? a.state : ''].filter(Boolean).join(', ').slice(0, 60) };
    } catch (e) {}
    if (!out || (!out.pl && !out.city)) {
      try { const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`); const j = await r.json(); out = { pl: j.locality || '', city: [j.city || j.locality, j.principalSubdivision].filter(Boolean).join(', ').slice(0, 60) }; } catch (e) {}
    }
    if (out) { const keys = Object.keys(C); if (keys.length > 40) keys.slice(0, keys.length - 40).forEach(x => delete C[x]); C[k] = out; s('lok-geo', C); }
    return out || { pl: '', city: '' };
  }
  let bat = null; try { navigator.getBattery && navigator.getBattery().then(b => { bat = b; }).catch(() => {}); } catch (e) {}

  // ── jejak hari ini (titik-titik, dibuang otomatis besoknya) ──
  function addHist(w, lat, lng) {
    const t = new Date(), day = ymd(t), mins = t.getHours() * 60 + t.getMinutes(), m = g('lokhist-' + w, {}) || {};
    const list = ((m[day] || {}).p || []).slice();
    const last = list[list.length - 1];
    if (last && dist({ lat: last[0], lng: last[1] }, { lat, lng }) < 40) { last[2] = mins; } else list.push([+lat.toFixed(4), +lng.toFixed(4), mins]);
    put('lokhist', w, day, { p: list.slice(-110) });
    Object.keys(m).forEach(d => { if (d < day) put('lokhist', w, d, null); });           // hari kemarin & sebelumnya dihapus
  }

  // ── kirim lokasi ──
  let sending = false;
  function send(force, once) {
    const w = me(); if (!w || sending || !navigator.geolocation) return Promise.resolve(false);
    if (!once && mode().m !== 'on') return Promise.resolve(false);
    if (!force && (document.hidden || Date.now() - g('lok-sent', 0) < EVERY)) return Promise.resolve(false);
    sending = true;
    return new Promise(res => {
      navigator.geolocation.getCurrentPosition(async p => {
        try {
          const lat = +p.coords.latitude.toFixed(5), lng = +p.coords.longitude.toFixed(5), acc = Math.round(p.coords.accuracy || 0);
          const pos = { lat, lng }, prev = row(w), moved = !prev || prev.lat == null ? 1e9 : dist(prev, pos);
          const nm = moved > 120 || !prev || !prev.pl ? await place(lat, lng) : { pl: prev.pl, city: prev.city };
          const f = favAt(pos);
          const data = { lat, lng, acc, at: Date.now(), pl: nm.pl || '', city: nm.city || '', fav: f ? f.id : null, st: once && mode().m !== 'on' ? 'once' : 'on' };
          if (bat) { data.bat = Math.round(bat.level * 100); data.chg = bat.charging ? 1 : 0; }
          put('lokasi', w, SLOT, data); s('lok-sent', Date.now());
          if (mode().m === 'on') addHist(w, lat, lng);
          // sampai di tempat favorit → kabarin pasangan
          const lf = g('lok-last-fav', 'x');
          if (f && lf !== f.id && lf !== 'x') { try { window.Push && Push.notify({ title: `${f.e || '📍'} ${w} udah sampai ${f.n}`, body: 'Barusan kedeteksi dari lokasinya 📍', url: 'jarak-kita.html', tag: 'lok-arr' }); } catch (e) {} }
          s('lok-last-fav', f ? f.id : null);
          res(true);
        } catch (e) { res(false); } finally { sending = false; }
      }, () => { sending = false; res(false); }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 6e4 });
    });
  }

  // ── minta lokasi pasangan ──
  function request() {
    const w = me(); if (!w) return;
    put('lokreq', w, SLOT, { at: Date.now() });
    try { window.Push && Push.notify({ title: `📍 ${w} pengen tau kamu lagi di mana`, body: 'Tap buat kirim lokasi terbarumu 💞', url: 'jarak-kita.html?lok=1', tag: 'lok-req' }); } catch (e) {}
  }
  function css() {
    if (document.getElementById('lok-css')) return;
    const c = document.createElement('style'); c.id = 'lok-css';
    c.textContent = `.lok-dot{position:fixed;top:calc(3px + env(safe-area-inset-top));left:3px;z-index:9400;font-size:10px;line-height:1;padding:2px 4px;border-radius:50px;background:rgba(255,255,255,.7);opacity:.75;pointer-events:none}
    .lok-ov{position:fixed;inset:0;z-index:9650;background:rgba(45,31,26,.5);display:flex;align-items:center;justify-content:center;padding:1.2rem;font-family:'Poppins',system-ui,sans-serif}
    .lok-c{background:#faf6f0;border-radius:24px;padding:1.3rem 1.1rem 1rem;max-width:330px;width:100%;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.3)}
    .lok-c .e{font-size:2.5rem;display:block}.lok-c h3{font-size:1.05rem;margin:.35rem 0 .25rem;color:#2d1f1a}.lok-c p{font-size:12.5px;color:#9a8070;line-height:1.55;margin:0 0 .8rem}
    .lok-c button{display:block;width:100%;border:none;border-radius:50px;padding:.78rem;font:700 13.5px 'Poppins',sans-serif;cursor:pointer;margin-top:.45rem;background:#c17a6f;color:#fff}
    .lok-c button.g{background:#fff;color:#c17a6f;border:1.5px solid #e8c4b0}`;
    document.head.appendChild(c);
  }
  // tanda kecil 📍 selama lokasi lagi dibagikan (biar sadar)
  function dot() {
    if (!document.body) return; let d = document.getElementById('lok-dot');
    const on = mode().m === 'on';
    if (!on) { if (d) d.remove(); return; }
    css(); if (!d) { d = document.createElement('div'); d.id = 'lok-dot'; d.className = 'lok-dot'; d.setAttribute('data-noskor', '1'); d.title = 'Lokasi lagi dibagikan'; d.textContent = '📍'; document.body.appendChild(d); }
  }
  // ada permintaan lokasi dari pasangan?
  function checkReq(fromUrl) {
    const w = me(); if (!w) return;
    const r = (g('lokreq-' + op(), {}) || {})[SLOT];
    const pend = r && r.at && r.at > g('lok-req-done', 0) && Date.now() - r.at < 6 * 36e5;
    if (!pend && !fromUrl) return;
    if (r && r.at) s('lok-req-done', r.at);
    if (mode().m === 'on') { send(true).then(ok => { if (ok) toast2(`📍 Lokasi terbarumu kekirim ke ${op()}`); }); return; }
    css(); const o = document.createElement('div'); o.className = 'lok-ov'; o.setAttribute('data-noskor', '1');
    o.innerHTML = `<div class="lok-c"><span class="e">📍</span><h3>${op()} pengen tau kamu di mana</h3><p>Berbagi lokasimu lagi ${mode().m === 'pause' ? 'dijeda' : 'mati'}. Mau kirim lokasimu sekarang?</p><button id="lok-1">📍 Kirim sekali aja</button><button class="g" id="lok-on">🟢 Nyalain berbagi lokasi</button><button class="g" id="lok-x">Nanti dulu</button></div>`;
    document.body.appendChild(o);
    o.querySelector('#lok-1').onclick = () => { o.remove(); send(true, true).then(ok => toast2(ok ? `📍 Lokasimu kekirim ke ${op()}` : '😵 Lokasi ga kebaca — cek izin lokasi')); };
    o.querySelector('#lok-on').onclick = () => { o.remove(); setMode('on'); toast2('🟢 Berbagi lokasi nyala'); };
    o.querySelector('#lok-x').onclick = () => o.remove();
  }
  function toast2(m) { if (typeof window.toast === 'function') { try { return window.toast(m); } catch (e) {} } css(); const t = document.createElement('div'); t.style.cssText = 'position:fixed;left:50%;bottom:calc(80px + env(safe-area-inset-bottom));transform:translateX(-50%);background:#2d1f1a;color:#fff;font:500 12.5px Poppins,sans-serif;padding:.6rem 1rem;border-radius:50px;z-index:9700'; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2800); }

  function start() {
    dot(); if (mode().m === 'on') needSync();
    const fromUrl = /[?&]lok=1/.test(location.search);
    setTimeout(() => { send(false); checkReq(fromUrl); }, 1500);
    setInterval(() => { if (!document.hidden) { send(false); dot(); } }, 6e4);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(() => send(false), 800); });
    const hook = n => { if (B() && B().on) B().on(ev => { if (ev.apps && ev.apps.includes('lokreq')) checkReq(false); }); else if (n < 25) setTimeout(() => hook(n + 1), 400); };
    hook(0);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.Lok = { mode, setMode, send, request, favs, saveFav, favAt, row, dist, PAGE };
})();
