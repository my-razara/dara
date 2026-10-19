/* ═══ PELIHARAAN KITA — satu peliharaan buat berdua ═══
   Status turun ngikutin waktu asli (dihitung dari selisih jam, ga ada timer jalan terus → ringan).
   Tiap orang nyimpen 1 baris di app 'pet' (Data Berdua); yang kepakai = aksi paling baru dari siapa pun. */
(function () {
  if (window.Pet) return;
  const APP = 'pet', ROW = '2000-01-01', H = 36e5;
  const ANIMALS = [
    { k: 'kucing', e: '🐱', n: 'Kucing', fav: 'ikan' }, { k: 'anjing', e: '🐶', n: 'Anjing', fav: 'daging' },
    { k: 'kelinci', e: '🐰', n: 'Kelinci', fav: 'wortel' }, { k: 'hamster', e: '🐹', n: 'Hamster', fav: 'kacang' },
    { k: 'panda', e: '🐼', n: 'Panda', fav: 'bambu' }, { k: 'beruang', e: '🐻', n: 'Beruang', fav: 'madu' },
    { k: 'rubah', e: '🦊', n: 'Rubah', fav: 'stroberi' }, { k: 'pinguin', e: '🐧', n: 'Pinguin', fav: 'ikan' }
  ];
  const FOODS = [
    { k: 'ikan', e: '🐟', n: 'Ikan' }, { k: 'daging', e: '🍖', n: 'Daging' }, { k: 'wortel', e: '🥕', n: 'Wortel' }, { k: 'kacang', e: '🌰', n: 'Kacang' },
    { k: 'bambu', e: '🎋', n: 'Bambu' }, { k: 'madu', e: '🍯', n: 'Madu' }, { k: 'stroberi', e: '🍓', n: 'Stroberi' }, { k: 'kue', e: '🍪', n: 'Camilan', treat: 1 }
  ];
  const ACC = [
    { k: '', e: '', n: 'Polos', lv: 1 }, { k: 'pita', e: '🎀', n: 'Pita', lv: 2 }, { k: 'bunga', e: '🌸', n: 'Bunga', lv: 3 }, { k: 'topi', e: '🎩', n: 'Topi', lv: 4 },
    { k: 'kacamata', e: '🕶️', n: 'Kacamata', lv: 5 }, { k: 'syal', e: '🧣', n: 'Syal', lv: 6 }, { k: 'mahkota', e: '👑', n: 'Mahkota', lv: 8 }, { k: 'toga', e: '🎓', n: 'Toga', lv: 10 },
    { k: 'pelangi', e: '🌈', n: 'Pelangi', lv: 1, st: 7 }, { k: 'sayap', e: '🪽', n: 'Sayap', lv: 1, st: 14 }, { k: 'bintang', e: '🌟', n: 'Bintang', lv: 1, st: 30 }
  ];
  const STATS = [['k', '🍗', 'Kenyang'], ['s', '💗', 'Senang'], ['b', '🛁', 'Bersih'], ['e', '⚡', 'Energi']];
  const DECAY = { k: 7, s: 5, b: 3, e: 4 };          // turun per jam
  const ACTS = { makan: '🍗', elus: '🤲', mandi: '🛁', main: '🎾', tidur: '🌙' };
  const ACTN = { makan: 'ngasih makan', elus: 'ngelus', mandi: 'mandiin', main: 'ngajak main', tidur: 'nidurin', hadiah: 'nyelesaiin tantangan 🏆 bareng' };

  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const clamp = v => Math.max(0, Math.min(100, v));
  const BD = () => window.Berdua;
  const me = () => (window.Who && Who.me()) || (BD() ? BD().me() : g('berdua-me', 'Dara'));
  const rowOf = w => ((g(APP + '-' + w, {}) || {})[ROW]) || null;

  // ── gabungin baris Razan & Dara ──
  function state() {
    const R = rowOf('Razan'), D = rowOf('Dara'), rows = [R && Object.assign({ w: 'Razan' }, R), D && Object.assign({ w: 'Dara' }, D)].filter(Boolean);
    if (!rows.some(r => r.a)) return null;
    const base = rows.slice().sort((a, b) => (b.t || 0) - (a.t || 0))[0];
    const cfg = rows.filter(r => r.a).sort((a, b) => (b.cfg || 0) - (a.cfg || 0))[0];
    const days = [...new Set(rows.flatMap(r => r.days || []))].sort().slice(-40);
    const log = rows.flatMap(r => (r.log || []).map(x => ({ w: r.w, a: x[0], t: x[1] }))).sort((a, b) => b.t - a.t).slice(0, 12);
    const xp = rows.reduce((s, r) => s + (r.xp || 0), 0);
    const born = Math.min(...rows.map(r => r.born || Date.now()));
    const td = ymd(new Date()), dc = {}; rows.forEach(r => { if (r.dc && r.dc.d === td) Object.entries(r.dc.c || {}).forEach(([k, n]) => dc[k] = (dc[k] || 0) + n); });
    const wd = rows.some(r => r.wd === td);
    return { a: cfg.a, n: cfg.n, acc: cfg.acc || '', v: base.v || { k: 80, s: 80, b: 80, e: 80 }, t: base.t || Date.now(), sleep: base.sleep || 0, by: base.w, days, log, xp, born, dc, wd };
  }
  // nilai sekarang setelah dikurangin waktu
  function now(st, at) {
    at = at || Date.now(); const v = Object.assign({}, st.v);
    const hrs = Math.max(0, (at - st.t) / H), slept = Math.max(0, Math.min(at, st.sleep || 0) - st.t) / H, awake = hrs - slept;
    v.k = clamp(v.k - DECAY.k * awake - DECAY.k * .5 * slept);
    v.s = clamp(v.s - DECAY.s * awake - DECAY.s * .3 * slept);
    v.b = clamp(v.b - DECAY.b * hrs);
    v.e = clamp(v.e - DECAY.e * awake + 30 * slept);
    return v;
  }
  const lvl = xp => 1 + Math.floor(Math.sqrt((xp || 0) / 40));
  const lvlXp = l => 40 * (l - 1) * (l - 1);
  const stage = l => l >= 6 ? { k: 'dewasa', n: 'Dewasa', sc: 1.1 } : l >= 3 ? { k: 'remaja', n: 'Remaja', sc: .95 } : { k: 'bayi', n: 'Bayi', sc: .8 };
  const animal = k => ANIMALS.find(a => a.k === k) || ANIMALS[0];
  const accOf = k => ACC.find(a => a.k === k) || ACC[0];
  const asleep = st => (st.sleep || 0) > Date.now();
  function streak(st) { const set = new Set(st.days); let n = 0; const d = new Date(); if (!set.has(ymd(d))) d.setDate(d.getDate() - 1); while (set.has(ymd(d))) { n++; d.setDate(d.getDate() - 1); } return n; }
  // perasaan & gelembung omongan
  function mood(st) {
    const v = now(st), nm = st.n || 'Dia';
    if (asleep(st)) return { f: 'tidur', t: `${nm} lagi bobo… sstt 💤` };
    const age = Math.floor((Date.now() - (st.born || Date.now())) / 864e5);
    if ([7, 30, 50, 100, 200, 365, 500, 730].includes(age)) return { f: 'senang', t: `🎂 Hari ini ${nm} genap ${age} hari bareng kalian! Rayain dong 🥳` };
    const avg = (v.k + v.s + v.b + v.e) / 4, low = STATS.map(s => [s[0], v[s[0]]]).sort((a, b) => a[1] - b[1])[0];
    if (avg < 25) return { f: 'ngambek', t: `${nm} ngambek 😤 tapi masih sayang kok… urusin dong` };
    if (low[1] < 30) return { f: 'sedih', t: { k: `${nm} laper 🥺 kasih makan dong`, s: `${nm} kesepian 🥺 ajak main yuk`, b: `${nm} bau acem 🙈 mandiin yuk`, e: `${nm} ngantuk banget 😪` }[low[0]] };
    if (avg > 75) return { f: 'senang', t: `${nm} lagi seneng banget 💕` };
    const h = new Date().getHours(), w = me(), last = st.log && st.log[0], o = w === 'Razan' ? 'Dara' : 'Razan';
    if (last && last.w === o && Date.now() - last.t < 2 * H) return { f: 'biasa', t: `${o} barusan ${ACTN[last.a] || 'ngurus'} ${nm} 💕 sekarang giliran ${w}!` };
    return { f: 'biasa', t: [`${nm} lagi santai ✨`, `${nm} nungguin kalian 🐾`, `${nm} kangen dielus 🤲`, h < 11 ? `Pagi ${w}! ${nm} udah bangun nih ☀️` : h < 18 ? `Hai ${w}! ${nm} seneng kamu dateng 🐾` : `Malem ${w}, ${nm} pengen ditemenin 🌙`][(h + new Date().getDate()) % 4] };
  }
  // ── 🎯 keinginan harian: sama buat berdua (diacak dari tanggal), diisi bareng-bareng ──
  const WISH = [['elus', 3, 'dielus'], ['main', 2, 'diajak main'], ['makan', 2, 'dikasih makan'], ['mandi', 1, 'dimandiin'], ['elus', 5, 'dielus'], ['main', 3, 'diajak main']];
  function wish(st) {
    if (!st) return null;
    const td = ymd(new Date()); let hsh = 0; for (const ch of td + (st.a || '')) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
    const [a, n, txt] = WISH[hsh % WISH.length], p = Math.min(n, (st.dc || {})[a] || 0);
    return { a, n, p, txt, e: ACTS[a], done: !!st.wd || p >= n };
  }
  function ago(t) { const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? 'barusan' : m < 60 ? `${m} menit lalu` : m < 1440 ? `${Math.round(m / 60)} jam lalu` : `${Math.round(m / 1440)} hari lalu`; }

  function save(w, row) {
    if (BD() && BD().put) BD().put(APP, w, ROW, row);
    else { const m = g(APP + '-' + w, {}) || {}; m[ROW] = row; try { localStorage.setItem(APP + '-' + w, JSON.stringify(m)); } catch (e) {} }
    tellSW();
  }
  // adopsi / ganti hewan / nama / aksesoris
  function setup(o) {
    const w = me(), old = rowOf(w) || {}, st = state();
    const row = Object.assign({}, old, { cfg: Date.now() });
    ['a', 'n', 'acc'].forEach(k => { if (o[k] != null) row[k] = o[k]; else if (st && st[k] != null && row[k] == null) row[k] = st[k]; });
    if (!st) Object.assign(row, { v: { k: 80, s: 80, b: 90, e: 90 }, t: Date.now(), born: Date.now(), xp: 0, days: [], log: [] });
    else if (!old.t) Object.assign(row, { v: now(st), t: Date.now(), sleep: st.sleep || 0, born: st.born });
    save(w, row); return state();
  }
  // aksi → { ok, msg, gain }
  function act(name, opt) {
    opt = opt || {};
    const st = state(); if (!st) return { ok: false, msg: 'Adopsi dulu yuk 🐾' };
    const w = me(), v = now(st), nm = st.n || 'Dia', A = animal(st.a);
    let sleep = st.sleep || 0, gain = 10, msg = '';
    if (asleep(st) && name !== 'tidur') {
      if (name !== 'elus') return { ok: false, msg: `${nm} lagi bobo 💤 bangun ±${Math.max(1, Math.round((sleep - Date.now()) / 6e4))} menit lagi` };
    }
    if (name === 'makan') {
      const f = FOODS.find(x => x.k === opt.food) || FOODS.find(x => x.k === A.fav);
      if (v.k >= 95 && !f.treat) return { ok: false, msg: `${nm} masih kenyang 😋` };
      if (f.treat) { v.k += 12; v.s += 15; gain = 6; msg = `${f.e} Nyam! ${nm} suka camilan`; }
      else if (f.k === A.fav) { v.k += 45; v.s += 8; msg = `${f.e} Makanan favorit! ${nm} seneng banget`; gain = 14; }
      else { v.k += 32; msg = `${f.e} ${nm} makan lahap`; }
    } else if (name === 'elus') {
      if (asleep(st)) { v.s += 5; gain = 2; msg = `${nm} senyum sambil tidur 🥰`; }
      else { if (v.s >= 97) gain = 1; v.s += opt.amt || 14; msg = `🤲 ${nm} merem melek keenakan`; if (gain > 1) gain = 6; }
    } else if (name === 'mandi') {
      if (v.b >= 92) return { ok: false, msg: `${nm} masih wangi kok ✨` };
      v.b = 100; v.e -= 5; v.s += A.k === 'kucing' ? -4 : 6; msg = A.k === 'kucing' ? `🛁 ${nm} agak sebel dimandiin, tapi sekarang wangi` : `🛁 ${nm} seger & wangi`;
    } else if (name === 'main') {
      if (v.e < 15) return { ok: false, msg: `${nm} capek 😪 tidurin dulu` };
      if (v.k < 10) return { ok: false, msg: `${nm} kelaperan, kasih makan dulu 🥺` };
      const sc = Math.max(.5, Math.min(1.5, opt.score != null ? opt.score / 8 : 1));
      v.s += Math.round(28 * sc); v.e -= 15; v.k -= 5; v.b -= 6; gain = Math.round(10 * sc); msg = `🎾 ${nm} seneng diajak main!`;
    } else if (name === 'tidur') {
      if (asleep(st)) return { ok: false, msg: `${nm} udah bobo 💤` };
      if (v.e > 85) return { ok: false, msg: `${nm} belum ngantuk, masih pengen main 😆` };
      sleep = Date.now() + Math.round((100 - v.e) / 30 * H); msg = `🌙 ${nm} bobo dulu ya… nyenyak`;
    }
    STATS.forEach(([k]) => v[k] = Math.round(clamp(v[k])));
    const old = rowOf(w) || {}, today = ymd(new Date());
    const dc0 = old.dc && old.dc.d === today ? old.dc : { d: today, c: {} }, dc = { d: today, c: Object.assign({}, dc0.c, { [name]: (dc0.c[name] || 0) + 1 }) };
    const W0 = wish(st), wishNow = W0 && !W0.done && W0.a === name && W0.p + 1 >= W0.n;
    if (wishNow) { gain += 25; msg += ` · 🎁 Keinginan ${nm} kepenuhin! +25 XP`; }
    const row = Object.assign({}, old, { dc, wd: wishNow ? today : old.wd, v, t: Date.now(), sleep, xp: (old.xp || 0) + gain, days: [...new Set((old.days || []).concat(today))].slice(-40), log: (old.log || []).concat([[name, Date.now()]]).slice(-6) });
    if (!old.a) { row.a = st.a; row.n = st.n; row.acc = st.acc; row.cfg = 1; row.born = st.born; }
    const before = lvl(st.xp); save(w, row);
    const after = lvl(st.xp + gain);
    try { const k = 'pet-tell', l = g(k, 0); if (window.Push && Date.now() - l > 4 * H) { localStorage.setItem(k, JSON.stringify(Date.now())); Push.notify({ title: `${A.e} ${w} barusan ${ACTN[name]} ${nm}`, body: wishNow ? `Keinginan ${nm} hari ini kepenuhin 🎁` : `Giliran kamu nengokin ${nm} yuk 🐾`, url: 'peliharaan.html', tag: 'pet' }); } } catch (e) {}
    return { ok: true, msg, gain, up: after > before ? after : 0, wish: wishNow };
  }
  // titip ke service worker buat notif "laper"
  function tellSW() {
    try {
      const st = state(); if (!st || !window.caches) return;
      const A = animal(st.a), last = st.log.find(x => x.a === 'makan');
      caches.open('untuk-dara-meta').then(c => c.put('/__pet', new Response(JSON.stringify({ n: st.n || A.n, e: A.e, v: st.v, t: st.t, sleep: st.sleep, fed: last ? { w: last.w, t: last.t } : null, at: Date.now() })))).catch(() => {});
    } catch (e) {}
  }
  const accLock = (a, st) => (st ? lvl(st.xp) : 1) < a.lv || (a.st && (!st || streak(st) < a.st));
  // bonus XP dari luar (misal hadiah Tantangan Mingguan)
  function bonus(xp, why) {
    const st = state(); if (!st) return false;
    const w = me(), old = rowOf(w) || {}, row = Object.assign({}, old, { xp: (old.xp || 0) + (xp || 0), log: (old.log || []).concat([['hadiah', Date.now()]]).slice(-6) });
    if (!old.a) { row.a = st.a; row.n = st.n; row.acc = st.acc; row.cfg = 1; row.born = st.born; }
    save(w, row); return true;
  }
  window.Pet = { bonus, APP, ANIMALS, FOODS, ACC, STATS, ACTS, ACTN, state, now, lvl, lvlXp, stage, animal, accOf, asleep, streak, mood, ago, setup, act, tellSW, me, wish, accLock };
  setTimeout(tellSW, 1500);
})();
