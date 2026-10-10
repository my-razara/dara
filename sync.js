/* ═══ Berdua Sync — Kalender Mood, Jurnal Syukur & Ritual nyambung antar HP ═══
   Cara kerjanya: semua tetep disimpen di HP dulu (jadi langsung kebuka, ga nunggu),
   abis itu dikirim/diambil dari Google Sheet di belakang layar.
   URL dari data-berdua.gs ditempel di bawah ini. */
(function () {
  const URL = 'https://script.google.com/macros/s/AKfycbyCq294yq71M-BDzouyLttp2Kki0aumPAP0JzII0fvvnBakSQ5_eHkNTawXA01fQ3dC/exec';
  const KEY = 'razara-berdua';
  const APPS = { mood: w => 'mood-' + w, syukur: w => 'syukur-' + w, ritual: w => 'ritual-' + w };
  const WHO = ['Razan', 'Dara'];

  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const s = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const id = (app, who, date) => `${app}|${who}|${date}`;
  let state = 'idle', busy = false, flushing = false;
  const subs = [];

  function me() { return g('berdua-me', null) || (g('sr-pin', '') ? 'Razan' : 'Dara'); }
  function setMe(w) { if (WHO.includes(w)) s('berdua-me', w); }
  const other = w => w === 'Razan' ? 'Dara' : 'Razan';

  function emit(apps) { const ev = { apps, state }; subs.forEach(f => { try { f(ev); } catch (e) {} }); try { window.dispatchEvent(new CustomEvent('berdua', { detail: ev })); } catch (e) {} }
  function setState(v) { if (state !== v) { state = v; emit([]); } }

  function api(method, body, qs) {
    return new Promise((res, rej) => {
      const x = new XMLHttpRequest();
      x.open(method, URL + (method === 'GET' ? `?action=list&key=${KEY}${qs || ''}&t=${Date.now()}` : ''), true);
      x.timeout = 20000;
      if (method === 'POST') x.setRequestHeader('Content-Type', 'text/plain');
      x.onload = () => { try { const r = JSON.parse(x.responseText); r.ok ? res(r) : rej(Object.assign(new Error(r.error || 'gagal'), { code: r.error })); } catch (e) { rej(e); } };
      x.onerror = x.ontimeout = () => rej(new Error('jaringan'));
      x.send(method === 'POST' ? JSON.stringify(Object.assign({ key: KEY }, body)) : null);
    });
  }

  // ── tulis: langsung ke HP, kirimnya nyusul ──
  function put(app, who, date, data) {
    if (!APPS[app] || !WHO.includes(who) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    const lk = APPS[app](who), m = g(lk, {}) || {};
    if (data == null) delete m[date]; else m[date] = data;
    s(lk, m);
    const now = Date.now(), st = g('bd-stamp', {}); st[id(app, who, date)] = now; s('bd-stamp', st);
    if (!URL) return;
    const q = g('bd-queue', []).filter(x => id(x.app, x.who, x.date) !== id(app, who, date));
    q.push({ app, who, date, data: data == null ? null : data, updated: now }); s('bd-queue', q);
    flush();
  }

  async function flush() {
    if (flushing || !URL) return;
    flushing = true; let sent = 0;
    try {
      while (true) {
        const q = g('bd-queue', []); if (!q.length) break;
        const batch = q.slice(0, 40);
        try { await api('POST', { action: 'put', rows: batch }); }
        catch (e) { if (e.code === 'data') { s('bd-queue', q.slice(batch.length)); continue; } setState('err'); break; }
        const sentIds = new Map(batch.map(x => [id(x.app, x.who, x.date), x.updated]));
        s('bd-queue', g('bd-queue', []).filter(x => sentIds.get(id(x.app, x.who, x.date)) !== x.updated));
        sent += batch.length;
      }
    } finally { flushing = false; }
    if (sent) { state = 'ok'; emit([]); }
  }

  // ── ambil: cuma yang berubah sejak terakhir ──
  async function pull(force) {
    if (!URL || busy) return;
    if (!force && Date.now() - g('bd-pulled-at', 0) < 6e4) return;
    busy = true; if (state !== 'ok') setState('sync');
    try {
      const since = g('bd-since', 0);
      const r = await api('GET', null, `&since=${since}`);
      s('bd-pulled-at', Date.now());
      const st = g('bd-stamp', {}), pend = new Set(g('bd-queue', []).map(x => id(x.app, x.who, x.date)));
      const changed = new Set(), maps = {};
      let max = since;
      for (const row of r.rows || []) {
        max = Math.max(max, row.srv || 0);
        if (!APPS[row.app] || !WHO.includes(row.who)) continue;
        const k = id(row.app, row.who, row.date);
        if (pend.has(k) || (st[k] || 0) > row.updated) continue;
        const lk = APPS[row.app](row.who), m = maps[lk] || (maps[lk] = g(lk, {}) || {});
        const before = JSON.stringify(m[row.date]);
        if (row.data == null) delete m[row.date]; else m[row.date] = row.data;
        st[k] = row.updated;
        if (before !== JSON.stringify(m[row.date])) changed.add(row.app);
      }
      Object.entries(maps).forEach(([k, v]) => s(k, v));
      s('bd-stamp', st); s('bd-since', max);
      setState('ok');
      if (changed.size) emit([...changed]);
    } catch (e) { setState('err'); }
    finally { busy = false; }
  }

  // data lama yang udah ada di HP dikirim sekali (yang lebih baru di server tetep menang)
  function seed() {
    if (!URL || g('bd-seeded', 0)) return;
    const q = g('bd-queue', []), have = new Set(q.map(x => id(x.app, x.who, x.date)));
    for (const app of Object.keys(APPS)) for (const who of WHO) {
      const m = g(APPS[app](who), {}) || {};
      for (const [date, data] of Object.entries(m)) if (/^\d{4}-\d{2}-\d{2}$/.test(date) && !have.has(id(app, who, date))) q.push({ app, who, date, data, updated: 1 });
    }
    s('bd-queue', q); s('bd-seeded', 1);
  }

  function status() {
    const q = g('bd-queue', []).length;
    if (!URL) return '';
    if (state === 'err') return `⚠️ Belum nyambung${q ? ` · ${q} catatan nunggu dikirim` : ''}`;
    if (q) return `⏳ Ngirim ${q} catatan…`;
    if (state === 'sync') return '🔄 Nyocokin sama HP pasangan…';
    if (state === 'ok') return '✓ Nyambung berdua';
    return '';
  }

  window.Berdua = { put, pull, flush, me, setMe, other, status, on: f => subs.push(f), enabled: !!URL };

  seed();
  const kick = force => { flush(); pull(force); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => kick(true)); else setTimeout(() => kick(true), 0);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(false); });
  window.addEventListener('online', () => kick(true));
  setInterval(() => { if (!document.hidden) pull(false); }, 65e3);
})();
