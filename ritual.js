/* ═══ PROGRES RITUAL HARIAN — langsung kekirim ke HP pasangan ═══
   Dimuat otomatis sama who.js di semua halaman. Tiap ritual beres (di halaman mana pun),
   progresnya langsung dikirim — jadi kartu "Pantau Dara" di HP Razan ikut update tanpa nunggu Dara balik ke menu.
   Daftar ritual di sini harus sama dengan RITUALS di index.html. */
(function () {
  if (window.__ritLive) return; window.__ritLive = 1;
  const URL = 'https://script.google.com/macros/s/AKfycbyCq294yq71M-BDzouyLttp2Kki0aumPAP0JzII0fvvnBakSQ5_eHkNTawXA01fQ3dC/exec';   // sama dengan sync.js
  const KEY = 'razara-berdua';
  const get = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const p2 = n => String(n).padStart(2, '0');
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };
  const me = () => (window.Who && Who.me()) || null;
  const RITUALS = [
    { link: 'kalender-mood.html', ico: '😊', done: () => !!(get('mood-' + me(), {}) || {})[today()] },
    { link: 'jurnal-syukur.html', ico: '🙏', done: () => { const v = (get('syukur-' + me(), {}) || {})[today()]; return Array.isArray(v) ? v.some(Boolean) : !!v; } },
    { link: 'pertanyaan-harian.html', ico: '❓', done: () => { const q = get('qa-cache', null); const d = q && Array.isArray(q.days) && q.days.find(x => x.date === today()); return !!(d && d.mine); } },
    { link: 'buku-harian.html', ico: '📔', done: () => { const a = (get('diary-' + me(), {}) || {})[today()], b = (get('diary-priv-' + me(), {}) || {})[today()]; return !!((a && a.t) || (b && b.t)); } },
    { link: 'voucher-harian.html', ico: '🎟️', show: () => me() === 'Dara', done: () => { const c = (get('vklaim-Dara', {}) || {})[today()]; return !!(c && c.sent); } },
    { link: 'kebiasaan-bareng.html', ico: '✅', show: () => habits().length > 0, done: () => { const ids = ((get('habitc-' + me(), {}) || {})[today()] || {}).ids || []; return habits().every(h => ids.includes(h.id)); } },
    { link: 'ibadah-bareng.html', ico: '🕌', show: () => !!get('ibd-push', false) || Object.keys(get('ibadah-' + me(), {}) || {}).length > 0, done: () => { const r = (get('ibadah-' + me(), {}) || {})[today()]; return !!(r && (r.off || Object.keys(r.s || {}).length >= 5)); } }
  ];
  function habits() { const m = {}, w = me(); ['Razan', 'Dara'].forEach(x => (((get('habit-' + x, {}) || {})['2000-01-01'] || {}).list || []).forEach(h => { if (h && h.id && (!m[h.id] || (h.at || 0) > (m[h.id].at || 0))) m[h.id] = h; })); return Object.values(m).filter(h => !h.del && (h.who === 'both' || h.who === w)); }
  function state() {
    const off = get('idx-ritual-off', []) || [];
    const shown = RITUALS.filter(r => (!r.show || r.show()) && !off.includes(r.link)).map(r => { let d = false; try { d = r.done(); } catch (e) {} return { ico: r.ico, d }; });
    return { n: shown.filter(r => r.d).length, t: shown.length, d: shown.filter(r => r.d).map(r => r.ico).join('') };
  }
  // kirim: pakai Data Berdua kalau ada di halaman ini, kalau ga ada kirim langsung
  function put(app, who, date, data) {
    if (window.Berdua && Berdua.put) { Berdua.put(app, who, date, data); return; }
    const k = app + '-' + who, m = get(k, {}) || {}; m[date] = data; set(k, m);
    const now = Date.now(), st = get('bd-stamp', {}) || {}; st[`${app}|${who}|${date}`] = now; set('bd-stamp', st);
    const body = JSON.stringify({ key: KEY, action: 'put', rows: [{ app, who, date, data, updated: now }] });
    try { if (navigator.sendBeacon && navigator.sendBeacon(URL, new Blob([body], { type: 'text/plain' }))) return; } catch (e) {}
    try { const x = new XMLHttpRequest(); x.open('POST', URL, true); x.setRequestHeader('Content-Type', 'text/plain'); x.send(body); } catch (e) {}
  }
  function send() {
    const w = me(); if (!w) return;
    const v = state(), t = today(), cur = (get('ritual-' + w, {}) || {})[t];
    if (!cur && !v.n) return;
    if (cur && cur.n === v.n && cur.t === v.t && cur.d === v.d) return;
    put('ritual', w, t, v);
  }
  window.RitualLive = { send, state };
  setTimeout(send, 2500);
  setInterval(() => { if (!document.hidden) send(); }, 20000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) send(); });
  addEventListener('pagehide', send);
})();
