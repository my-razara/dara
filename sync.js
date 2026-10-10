/* ═══ Berdua Sync — Kalender Mood, Jurnal Syukur, Ritual & Tombol Kangen nyambung antar HP ═══
   Cara kerjanya: semua tetep disimpen di HP dulu (jadi langsung kebuka, ga nunggu),
   abis itu dikirim/diambil dari Google Sheet di belakang layar.
   URL dari data-berdua.gs ditempel di bawah ini. */
(function () {
  const URL = 'https://script.google.com/macros/s/AKfycbyCq294yq71M-BDzouyLttp2Kki0aumPAP0JzII0fvvnBakSQ5_eHkNTawXA01fQ3dC/exec';
  const KEY = 'razara-berdua';
  const APPS = { mood: w => 'mood-' + w, syukur: w => 'syukur-' + w, ritual: w => 'ritual-' + w, kangen: w => 'kangen-' + w, ajak: w => 'ajak-' + w };
  const WHO = ['Razan', 'Dara'];

  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const s = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const id = (app, who, date) => `${app}|${who}|${date}`;
  let state = 'idle', busy = false, flushing = false, every = 6e4;
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
    if (!force && Date.now() - g('bd-pulled-at', 0) < every) return;
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
      if (changed.has('kangen')) kangenCheck();
      if (changed.has('ajak')) ajakCheck();
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

  // ── kangen masuk: muncul di halaman mana aja ──
  const KM = { peluk: ['🫂', 'pelukan'], cium: ['😘', 'ciuman'], tangan: ['🤝', 'genggaman tangan'], puk: ['🥺', 'puk-puk'] };
  function tday() { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }
  function kangenCheck() {
    if (window.__noKangenPop) return;
    const o = other(me()), t = tday(), row = (g('kangen-' + o, {}) || {})[t];
    if (!row || !row.n) return;
    const seen = g('kangen-seen', {}); if ((seen[t] || 0) >= row.n) return;
    const nNew = row.n - (seen[t] || 0); seen[t] = row.n;
    Object.keys(seen).sort().slice(0, -7).forEach(k => delete seen[k]); s('kangen-seen', seen);
    showKangen(o, row, nNew);
  }
  function kgCss() {
    if (document.getElementById('kg-css')) return;
      const st = document.createElement('style'); st.id = 'kg-css';
      st.textContent = `.kg-ov{position:fixed;inset:0;z-index:9600;display:flex;align-items:center;justify-content:center;padding:1.2rem;background:rgba(45,31,26,.35);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:kgF .3s ease}
      @keyframes kgF{from{opacity:0}}
      .kg-card{position:relative;width:100%;max-width:330px;background:#fffaf6;border-radius:26px;padding:1.5rem 1.2rem 1.1rem;text-align:center;font-family:'Poppins',system-ui,sans-serif;box-shadow:0 20px 50px rgba(0,0,0,.25);animation:kgP .5s cubic-bezier(.3,1.5,.5,1)}
      @keyframes kgP{from{transform:scale(.6);opacity:0}}
      .kg-card .e{font-size:3.6rem;line-height:1;display:block;animation:kgB 1s ease-in-out infinite}
      @keyframes kgB{50%{transform:scale(1.12)}}
      .kg-card h3{font-size:1.15rem;font-weight:700;color:#7a3f35;margin:.6rem 0 .25rem;line-height:1.3}
      .kg-card p{font-size:12.5px;color:#9a8070;line-height:1.55;margin:0}
      .kg-card a{display:block;margin-top:1rem;padding:.85rem;border-radius:50px;background:linear-gradient(135deg,#d48c80,#a8584c);color:#fff;font-weight:700;font-size:14px;text-decoration:none}
      .kg-card button{display:block;width:100%;margin-top:.4rem;padding:.6rem;border:none;background:none;color:#9a8070;font-family:inherit;font-size:12.5px;cursor:pointer}
      .kg-fl{position:fixed;bottom:-40px;z-index:9599;pointer-events:none;font-size:26px;animation:kgU linear forwards}
      @keyframes kgU{to{transform:translate(var(--dx),-115vh) rotate(var(--r));opacity:.2}}`;
      document.head.appendChild(st);
  }
  function showKangen(o, row, nNew) {
    const L = row.last || {}, m = KM[L.k] || KM.peluk;
    kgCss();

    const em = [m[0], '💗', '🤍', '💕'];
    for (let i = 0; i < 26; i++) setTimeout(() => { const f = document.createElement('div'); f.className = 'kg-fl'; f.textContent = em[i % em.length]; f.style.left = Math.random() * 92 + 'vw'; f.style.animationDuration = 2.6 + Math.random() * 2 + 's'; f.style.setProperty('--dx', (Math.random() - .5) * 120 + 'px'); f.style.setProperty('--r', (Math.random() - .5) * 90 + 'deg'); document.body.appendChild(f); setTimeout(() => f.remove(), 5000); }, i * 70);
    const ov = document.createElement('div'); ov.className = 'kg-ov';
    const at = L.at ? new Date(L.at) : null, jam = at ? `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}` : '';
    ov.innerHTML = `<div class="kg-card"><span class="e">${m[0]}</span><h3>${o} kangen kamu!</h3><p>${o} ngirim ${m[1]}${L.p ? ` <b>${L.p}% erat</b>` : ''}${jam ? ` jam ${jam}` : ''}.<br>${nNew > 1 ? `Ada ${nNew} kangen baru · ` : ''}hari ini udah ${row.n}× 🥺</p><a href="tombol-kangen.html">💗 Bales kangennya</a><button type="button">Nanti dulu</button></div>`;
    const close = () => ov.remove();
    ov.querySelector('button').onclick = close; ov.addEventListener('click', e => { if (e.target === ov) close(); });
    (document.body || document.documentElement).appendChild(ov);
    try { navigator.vibrate && navigator.vibrate([60, 60, 60, 60, 160]); } catch (e) {}
    try { window.SFX && SFX.play && SFX.play('win'); } catch (e) {}
  }
  function fast(ms) { every = Math.max(15e3, ms || 6e4); }

  // ── game online ──
  const GNAME = { congklak: ['🐚', 'Congklak'], 'perang-kapal': ['⚓', 'Perang Kapal'], dam: ['⚫', 'Dam'], 'empat-sejajar': ['🔴', 'Empat Sejajar'] };
  function room(g) {
    return new Promise((res, rej) => {
      const x = new XMLHttpRequest();
      x.open('GET', `${URL}?action=room&key=${KEY}&g=${encodeURIComponent(g)}&t=${Date.now()}`, true); x.timeout = 15000;
      x.onload = () => { try { const r = JSON.parse(x.responseText); r.ok ? res(r.room) : rej(new Error(r.error)); } catch (e) { rej(e); } };
      x.onerror = x.ontimeout = () => rej(new Error('jaringan')); x.send();
    });
  }
  function roomPost(body) {
    return new Promise((res, rej) => {
      const x = new XMLHttpRequest();
      x.open('POST', URL, true); x.timeout = 20000; x.setRequestHeader('Content-Type', 'text/plain');
      x.onload = () => { try { res(JSON.parse(x.responseText)); } catch (e) { rej(e); } };
      x.onerror = x.ontimeout = () => rej(new Error('jaringan'));
      x.send(JSON.stringify(Object.assign({ key: KEY, action: 'room' }, body)));
    });
  }
  function ajakCheck() {
    const o = other(me()), t = tday(), a = (g('ajak-' + o, {}) || {})[t];
    if (!a || !a.at || Date.now() - a.at > 15 * 60e3) return;
    const seen = g('ajak-seen', 0); if (seen >= a.at) return; s('ajak-seen', a.at);
    if (window.__onlineGame === a.g) return;            // udah di halaman game-nya
    const N = GNAME[a.g] || ['🎮', a.g];
    const ov = document.createElement('div'); ov.className = 'kg-ov';
    ov.innerHTML = `<div class="kg-card"><span class="e">${N[0]}</span><h3>${o} ngajak main ${N[1]}!</h3><p>Online, dari HP masing-masing 🎮<br>${o} lagi nunggu kamu gabung.</p><a href="${a.g}.html?online=1">🎮 Gas main</a><button type="button">Nanti dulu</button></div>`;
    ov.querySelector('button').onclick = () => ov.remove(); ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
    kgCss(); document.body.appendChild(ov);
    try { navigator.vibrate && navigator.vibrate([40, 40, 40]); } catch (e) {}
    try { window.SFX && SFX.play && SFX.play('open'); } catch (e) {}
  }

  window.Berdua = { put, pull, flush, me, setMe, other, status, fast, kangenCheck, room, roomPost, on: f => subs.push(f), enabled: !!URL };

  seed();
  const kick = force => { flush(); pull(force); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => kick(true)); else setTimeout(() => kick(true), 0);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(false); });
  window.addEventListener('online', () => kick(true));
  setInterval(() => { if (!document.hidden) pull(false); }, 5e3);
  const firstCheck = () => setTimeout(() => { kangenCheck(); ajakCheck(); }, 900);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', firstCheck); else firstCheck();
})();
