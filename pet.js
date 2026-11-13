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
  // ── 👗 Lemari 3D: 5 bagian, dibeli pakai koin (yang lama kebuka lewat level/streak tetep gratis) ──
  const SLOTS = [['top', '🎩', 'Kepala'], ['eye', '👓', 'Mata'], ['body', '👕', 'Baju'], ['neck', '🧣', 'Leher'], ['back', '🪽', 'Punggung']];
  const ITEMS = [
    { k: 'pita', s: 'top', e: '🎀', n: 'Pita', lv: 2 }, { k: 'bunga', s: 'top', e: '🌸', n: 'Bunga', lv: 3 }, { k: 'topi', s: 'top', e: '🎩', n: 'Topi Tinggi', lv: 4 }, { k: 'mahkota', s: 'top', e: '👑', n: 'Mahkota', lv: 8 },
    { k: 'toga', s: 'top', e: '🎓', n: 'Toga', lv: 10 }, { k: 'pelangi', s: 'top', e: '🌈', n: 'Pelangi', st: 7 }, { k: 'bintang', s: 'top', e: '🌟', n: 'Bintang', st: 30 },
    { k: 'kupluk', s: 'top', e: '🧶', n: 'Kupluk', p: 40 }, { k: 'cap', s: 'top', e: '🧢', n: 'Topi Biru', p: 45 }, { k: 'ultah', s: 'top', e: '🥳', n: 'Topi Ultah', p: 30 }, { k: 'chef', s: 'top', e: '👨‍🍳', n: 'Topi Koki', p: 60 },
    { k: 'pantai', s: 'top', e: '👒', n: 'Topi Pantai', p: 55 }, { k: 'penyihir', s: 'top', e: '🧙', n: 'Topi Penyihir', p: 80 }, { k: 'florcrown', s: 'top', e: '💐', n: 'Mahkota Bunga', p: 70 }, { k: 'tiara', s: 'top', e: '💎', n: 'Tiara', p: 90 }, { k: 'headphone', s: 'top', e: '🎧', n: 'Headphone', p: 75 },
    { k: 'kacamata', s: 'eye', e: '🕶️', n: 'Kacamata Hitam', lv: 5 }, { k: 'bulat', s: 'eye', e: '👓', n: 'Kacamata Bulat', p: 35 }, { k: 'hatiglass', s: 'eye', e: '😍', n: 'Kacamata Hati', p: 50 }, { k: 'bintangglass', s: 'eye', e: '🤩', n: 'Kacamata Bintang', p: 50 },
    { k: 'monokel', s: 'eye', e: '🧐', n: 'Monokel', p: 60 }, { k: 'masker', s: 'eye', e: '😴', n: 'Masker Tidur', p: 40 },
    { k: 'kaos', s: 'body', e: '👕', n: 'Kaos Merah', p: 30 }, { k: 'belang', s: 'body', e: '🦓', n: 'Kaos Belang', p: 40 }, { k: 'polkadot', s: 'body', e: '🩷', n: 'Polkadot', p: 40 }, { k: 'hoodie', s: 'body', e: '🧥', n: 'Hoodie', p: 70 },
    { k: 'sweater', s: 'body', e: '🍂', n: 'Sweater', p: 60 }, { k: 'jas', s: 'body', e: '🤵', n: 'Jas', p: 90 }, { k: 'batik', s: 'body', e: '🟫', n: 'Batik', p: 80 }, { k: 'jersey', s: 'body', e: '⚽', n: 'Jersey Bola', p: 65 },
    { k: 'piyama', s: 'body', e: '🌙', n: 'Piyama', p: 50 }, { k: 'gaun', s: 'body', e: '👗', n: 'Gaun', p: 75 }, { k: 'overall', s: 'body', e: '👖', n: 'Overall Jeans', p: 60 }, { k: 'superhero', s: 'body', e: '🦸', n: 'Superhero', p: 85 },
    { k: 'syal', s: 'neck', e: '🧣', n: 'Syal', lv: 6 }, { k: 'dasi', s: 'neck', e: '👔', n: 'Dasi', p: 45 }, { k: 'dasikupu', s: 'neck', e: '🎗️', n: 'Dasi Kupu', p: 40 }, { k: 'lonceng', s: 'neck', e: '🔔', n: 'Kalung Lonceng', p: 35 },
    { k: 'mutiara', s: 'neck', e: '📿', n: 'Kalung Mutiara', p: 70 }, { k: 'medali', s: 'neck', e: '🏅', n: 'Medali', p: 60 },
    { k: 'sayap', s: 'back', e: '🪽', n: 'Sayap Malaikat', st: 14 }, { k: 'kupu', s: 'back', e: '🦋', n: 'Sayap Kupu', p: 80 }, { k: 'ransel', s: 'back', e: '🎒', n: 'Ransel', p: 55 }, { k: 'jubah', s: 'back', e: '🦹', n: 'Jubah', p: 70 }, { k: 'balon', s: 'back', e: '🎈', n: 'Balon', p: 45 }
  ];
  const FUR = [['asli', 'Asli', 0], ['putih', 'Putih', 40], ['abu', 'Abu', 40], ['cokelat', 'Cokelat', 40], ['hitam', 'Hitam', 40], ['pink', 'Pink', 50], ['biru', 'Biru', 50], ['ungu', 'Ungu', 50], ['mint', 'Mint', 50], ['kuning', 'Kuning', 50]];
  const COIN0 = 100;   // modal awal koin buat berdua
  const COIN = { makan: 3, elus: 2, mandi: 4, main: 2, tidur: 2 };
  const STATS = [['k', '🍗', 'Kenyang'], ['s', '💗', 'Senang'], ['b', '🛁', 'Bersih'], ['e', '⚡', 'Energi']];
  const DECAY = { k: 7, s: 5, b: 3, e: 4 };          // turun per jam
  const ACTS = { makan: '🍗', elus: '🤲', mandi: '🛁', main: '🎾', tidur: '🌙' };
  const ACTN = { makan: 'ngasih makan', elus: 'ngelus', mandi: 'mandiin', main: 'ngajak main', tidur: 'nidurin', hadiah: 'nyelesaiin tantangan 🏆 bareng', bangun: 'bangunin', obat: 'ngasih obat', panggil: 'manggil pulang', olahraga: 'olahraga bareng' };
  const ACTI = { hadiah: '🏆', bangun: '☀️', obat: '💊', panggil: '📣', olahraga: '🏃' };   // ikon riwayat buat aksi di luar ACTS
  // 🤒 dicuekin >24 jam → sakit · 🧳 >48 jam → kabur ke rumah nenek
  const SICK = 24 * H, AWAY = 48 * H, OBAT = 15;

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
    const fit = cfg.fit || legacyFit(cfg.acc), col = cfg.col || 'asli';
    const own = [...new Set(rows.flatMap(r => r.own || []))], coins = COIN0 + rows.reduce((s, r) => s + (r.ce || 0) - (r.sp || 0), 0);
    const tw = {}, call = {}; rows.forEach(r => { tw[r.w] = r.t || 0; call[r.w] = r.call || 0; });
    const sk = Math.max(0, ...rows.map(r => r.sk || 0)), cure = Math.max(0, ...rows.map(r => r.cure || 0));
    return { a: cfg.a, n: cfg.n, acc: cfg.acc || '', fit, col, own, coins, v: base.v || { k: 80, s: 80, b: 80, e: 80 }, t: base.t || Date.now(), sleep: base.sleep || 0, by: base.w, days, log, xp, born, dc, wd, tw, call, sk, cure };
  }
  function legacyFit(acc) { const it = ITEMS.find(x => x.k === acc); return it ? { [it.s]: it.k } : {}; }
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
  // terakhir kali diurus (bobo dihitung masih diurus)
  const ref = st => Math.max(st.t || 0, Math.min(st.sleep || 0, Date.now()));
  function away(st) {
    if (!st) return null; const r = ref(st); if (Date.now() - r <= AWAY) return null;
    const since = r + AWAY, c = st.call || {};
    return { since, calls: { Razan: (c.Razan || 0) >= since, Dara: (c.Dara || 0) >= since } };
  }
  function sick(st) {
    if (!st) return null; const r = ref(st), comp = Date.now() - r > SICK ? r + SICK : 0, since = Math.max(st.sk || 0, comp);
    if (!since || (st.cure || 0) >= since) return null;
    const tw = st.tw || {}, by = { Razan: (tw.Razan || 0) >= since, Dara: (tw.Dara || 0) >= since };
    if (by.Razan && by.Dara) return null;      // udah dirawat berdua → sembuh
    return { since, by };
  }
  function streak(st) { const set = new Set(st.days); let n = 0; const d = new Date(); if (!set.has(ymd(d))) d.setDate(d.getDate() - 1); while (set.has(ymd(d))) { n++; d.setDate(d.getDate() - 1); } return n; }
  // perasaan & gelembung omongan
  function mood(st) {
    const v = now(st), nm = st.n || 'Dia', sk = sick(st);
    if (away(st)) return { f: 'kabur', t: `🧳 ${nm} kabur ke rumah nenek… ga ada yang ngurus 2 hari. Panggil pulang bareng yuk` };
    if (asleep(st)) return { f: 'tidur', t: sk ? `${nm} bobo, badannya masih anget 🤒` : `${nm} lagi bobo… sstt 💤` };
    if (sk) return { f: 'sakit', t: `🤒 ${nm} lagi sakit… kasih obat 💊 atau rawat bareng ya` };
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
    ['a', 'n', 'acc', 'fit', 'col'].forEach(k => { if (o[k] != null) row[k] = o[k]; else if (st && st[k] != null) row[k] = st[k]; });
    if (!st) Object.assign(row, { v: { k: 80, s: 80, b: 90, e: 90 }, t: Date.now(), born: Date.now(), xp: 0, days: [], log: [] });
    else if (!old.t) Object.assign(row, { v: now(st), t: Date.now(), sleep: st.sleep || 0, born: st.born });
    save(w, row); return state();
  }
  // aksi → { ok, msg, gain }
  function act(name, opt) {
    opt = opt || {};
    const st = state(); if (!st) return { ok: false, msg: 'Adopsi dulu yuk 🐾' };
    const w = me(), v = now(st), nm = st.n || 'Dia', A = animal(st.a);
    let sleep = st.sleep || 0, gain = 10, msg = '', spend = 0, cure = 0;
    if (away(st)) return { ok: false, msg: `${nm} lagi di rumah nenek 🧳 panggil pulang dulu yuk` };
    const sk = sick(st), o = w === 'Razan' ? 'Dara' : 'Razan';
    if (name === 'main' && sk) return { ok: false, msg: `${nm} lagi sakit 🤒 belum kuat main. Kasih obat atau rawat bareng dulu` };
    if (asleep(st) && !['tidur', 'bangun', 'obat'].includes(name)) {
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
      if (asleep(st)) return { ok: false, msg: `${nm} udah bobo 💤 mau dibangunin? tap ☀️ Bangunin` };
      if (v.e > 85) return { ok: false, msg: `${nm} belum ngantuk, masih pengen main 😆` };
      sleep = Date.now() + Math.round((100 - v.e) / 30 * H); msg = `🌙 ${nm} bobo dulu ya… nyenyak`;
    } else if (name === 'bangun') {
      if (!asleep(st)) return { ok: false, msg: `${nm} udah melek kok 👀` };
      sleep = Date.now(); v.s -= 3; gain = 1; msg = `☀️ ${nm} bangun sambil kucek-kucek mata 🥱`;
    } else if (name === 'obat') {
      if (!sk) return { ok: false, msg: `${nm} sehat kok 💪` };
      if (st.coins < OBAT) return { ok: false, msg: `Koinnya kurang ${OBAT - st.coins} 🪙 — rawat bareng ${o} aja yuk` };
      spend = OBAT; cure = Date.now(); v.s += 10; gain = 5; msg = `💊 ${nm} minum obat… udah enakan! 🥰`;
    } else return { ok: false, msg: '…' };
    if (sk && name !== 'obat') {
      if ((st.tw || {})[o] >= sk.since) { cure = Date.now(); msg += ` · 🤗 dirawat berdua, ${nm} sembuh!`; }
      else msg += ` · 🤒 tinggal ${o} ikut ngurus biar sembuh`;
    }
    STATS.forEach(([k]) => v[k] = Math.round(clamp(v[k])));
    const old = rowOf(w) || {}, today = ymd(new Date());
    const dc0 = old.dc && old.dc.d === today ? old.dc : { d: today, c: {} }, dc = { d: today, c: Object.assign({}, dc0.c, { [name]: (dc0.c[name] || 0) + 1 }) };
    const W0 = wish(st), wishNow = W0 && !W0.done && W0.a === name && W0.p + 1 >= W0.n;
    if (wishNow) { gain += 25; msg += ` · 🎁 Keinginan ${nm} kepenuhin! +25 XP`; }
    let coin = COIN[name] || 0; if (name === 'main') coin += Math.min(10, Math.round((opt.score || 0) / 2)); if (wishNow) coin += 15;
    const first = !(st.days || []).includes(today0()); if (first) coin += 5;
    const upNow = lvl(st.xp + gain) > lvl(st.xp); if (upNow) coin += 25;
    const row = Object.assign({}, old, { sp: (old.sp || 0) + spend, sk: sk ? Math.max(old.sk || 0, sk.since) : old.sk, cure: cure || old.cure, ce: (old.ce || 0) + coin, dc, wd: wishNow ? today : old.wd, v, t: Date.now(), sleep, xp: (old.xp || 0) + gain, days: [...new Set((old.days || []).concat(today))].slice(-40), log: (old.log || []).concat([[name, Date.now()]]).slice(-6) });
    if (!old.a) { row.a = st.a; row.n = st.n; row.acc = st.acc; row.fit = st.fit; row.col = st.col; row.cfg = 1; row.born = st.born; }
    const before = lvl(st.xp); save(w, row);
    const after = lvl(st.xp + gain);
    try { const k = 'pet-tell', l = g(k, 0); if (window.Push && Date.now() - l > (sk && !cure ? 1 : 4) * H) { localStorage.setItem(k, JSON.stringify(Date.now())); Push.notify({ title: `${A.e} ${w} barusan ${ACTN[name]} ${nm}`, body: sk && !cure ? `${nm} lagi sakit 🤒 ikut rawat yuk biar sembuh` : wishNow ? `Keinginan ${nm} hari ini kepenuhin 🎁` : `Giliran kamu nengokin ${nm} yuk 🐾`, url: 'peliharaan.html', tag: 'pet' }); } } catch (e) {}
    return { ok: true, msg, gain, coin, up: after > before ? after : 0, wish: wishNow };
  }
  // titip ke service worker buat notif "laper"
  function tellSW() {
    try {
      const st = state(); if (!st || !window.caches) return;
      const A = animal(st.a), last = st.log.find(x => x.a === 'makan');
      caches.open('untuk-dara-meta').then(c => c.put('/__pet', new Response(JSON.stringify({ n: st.n || A.n, e: A.e, v: st.v, t: st.t, sleep: st.sleep, ref: ref(st), sick: !!sick(st), away: !!away(st), fed: last ? { w: last.w, t: last.t } : null, at: Date.now() })))).catch(() => {});
    } catch (e) {}
  }
  const accLock = (a, st) => (st ? lvl(st.xp) : 1) < a.lv || (a.st && (!st || streak(st) < a.st));
  // bonus XP dari luar (misal hadiah Tantangan Mingguan)
  function bonus(xp, why) {
    const st = state(); if (!st) return false;
    const w = me(), old = rowOf(w) || {}, row = Object.assign({}, old, { ce: (old.ce || 0) + Math.round((xp || 0) / 2), xp: (old.xp || 0) + (xp || 0), log: (old.log || []).concat([['hadiah', Date.now()]]).slice(-6) });
    if (!old.a) { row.a = st.a; row.n = st.n; row.acc = st.acc; row.cfg = 1; row.born = st.born; }
    save(w, row); return true;
  }
  // 🏃 koin dari olahraga (tab Sehat): ga ngubah status, cuma nambah koin + XP kecil
  function reward(coin, xp) {
    const st = state(); if (!st || !(coin > 0)) return false;
    const w = me(), old = rowOf(w) || {}, row = Object.assign({}, old, { ce: (old.ce || 0) + Math.round(coin), xp: (old.xp || 0) + (xp || 0), log: (old.log || []).concat([['olahraga', Date.now()]]).slice(-6) });
    if (!old.a) { row.a = st.a; row.n = st.n; row.acc = st.acc; row.fit = st.fit; row.col = st.col; row.cfg = 1; row.born = st.born; }
    save(w, row); return true;
  }
  // ── 🪙 koin & toko ──
  const itemOf = k => ITEMS.find(x => x.k === k);
  function owns(st, k) { const it = itemOf(k); if (!it) return false; if (it.p) return (st.own || []).includes(k); return !accLock(it, st); }
  function ownsFur(st, c) { const f = FUR.find(x => x[0] === c); return !!f && (!f[2] || (st.own || []).includes('fur:' + c)); }
  function buy(k) {
    const st = state(); if (!st) return { ok: false, msg: 'Adopsi dulu yuk 🐾' };
    const fur = k.startsWith('fur:'), it = fur ? null : itemOf(k), price = fur ? (FUR.find(x => 'fur:' + x[0] === k) || [])[2] : it && it.p;
    if (!price) return { ok: false, msg: 'Item ini kebuka lewat level/streak 🔒' };
    if ((st.own || []).includes(k)) return { ok: false, msg: 'Udah punya 😊' };
    if (st.coins < price) return { ok: false, msg: `Koinnya kurang ${price - st.coins} 🪙 — rawat & ajak main dulu yuk` };
    const w = me(), old = rowOf(w) || {}, row = Object.assign({}, old, { sp: (old.sp || 0) + price, own: [...new Set((old.own || []).concat(k))] });
    if (!old.a) { row.a = st.a; row.n = st.n; row.acc = st.acc; row.fit = st.fit; row.col = st.col; row.cfg = 1; row.born = st.born; }
    save(w, row); return { ok: true, msg: `🛍️ Kebeli! −${price} 🪙` };
  }
  // 📣 panggil pulang dari rumah nenek: harus dua-duanya manggil
  function panggil() {
    const st = state(); if (!st) return { ok: false, msg: 'Adopsi dulu yuk 🐾' };
    const nm = st.n || 'Dia', A = animal(st.a), aw = away(st); if (!aw) return { ok: false, msg: `${nm} ada di rumah kok 🏠` };
    const w = me(), o = w === 'Razan' ? 'Dara' : 'Razan', old = rowOf(w) || {}, T = Date.now();
    if (aw.calls[w]) return { ok: false, msg: `Kamu udah manggil 📣 tinggal ${o} manggil juga` };
    const row = Object.assign({}, old, { call: T, log: (old.log || []).concat([['panggil', T]]).slice(-6) });
    if (!old.a) { row.a = st.a; row.n = st.n; row.acc = st.acc; row.fit = st.fit; row.col = st.col; row.cfg = 1; row.born = st.born; }
    if (aw.calls[o]) {
      const td = today0();
      Object.assign(row, { v: { k: 60, s: 75, b: 55, e: 70 }, t: T, sleep: 0, cure: T, xp: (old.xp || 0) + 10, days: [...new Set((old.days || []).concat(td))].slice(-40) });
      save(w, row);
      try { window.Push && Push.notify({ title: `${A.e} ${nm} udah pulang! 🏠`, body: `Kalian berdua manggil, ${nm} kangen banget 🥹💕`, url: 'peliharaan.html', tag: 'pet' }); } catch (e) {}
      return { ok: true, back: true, msg: `🏠 ${nm} pulang! Kangen kalian berdua 🥹💕` };
    }
    save(w, row);
    try { window.Push && Push.notify({ title: `${A.e} ${nm} kabur ke rumah nenek 🧳`, body: `${w} udah manggil pulang. Sekarang giliran kamu 📣`, url: 'peliharaan.html', tag: 'pet' }); } catch (e) {}
    return { ok: true, msg: `📣 Kamu udah manggil ${nm}… tinggal ${o} manggil juga biar pulang` };
  }
  function wear(slot, k) { const st = state(); if (!st || (k && !owns(st, k))) return false; const fit = Object.assign({}, st.fit); if (k) fit[slot] = k; else delete fit[slot]; setup({ fit }); }
  function today0() { return ymd(new Date()); }
  window.Pet = { bonus, reward, APP, SLOTS, ITEMS, FUR, COIN0, itemOf, owns, ownsFur, buy, wear, ANIMALS, FOODS, ACC, STATS, ACTS, ACTN, ACTI, OBAT, state, sick, away, panggil, now, lvl, lvlXp, stage, animal, accOf, asleep, streak, mood, ago, setup, act, tellSW, me, wish, accLock };
  setTimeout(tellSW, 1500);
})();
