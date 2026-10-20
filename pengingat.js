/* ═══ PENGINGAT HARI SPESIAL ═══
   Ngitung hari-hari penting (anniv, ultah, mensive, tiap 100 hari, rencana ketemu, hari penting tambahan)
   → dipakai banner di menu utama, halaman Pengingat, dan dikasih ke service worker buat notif HP. */
(function () {
  if (window.Ingat) return;
  const JADIAN = [2025, 4, 10];                 // 10 Mei 2025
  const ULTAH_DARA = [7, 18];                   // 18 Agustus
  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const day0 = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  // hari penting tambahan (nyambung 2 HP lewat app 'ingat', 1 baris per item)
  function custom() {
    const out = [];
    ['Razan', 'Dara'].forEach(w => Object.entries(g('ingat-' + w, {}) || {}).forEach(([d, v]) => { if (v && v.id && v.m) out.push(Object.assign({}, v, { owner: w, _d: d })); }));
    return out;
  }
  function settings() {
    const R = ['Razan', 'Dara'].map(w => (g('ingatset-' + w, {}) || {})['2000-01-01'] || {}).sort((a, b) => (b.at || 0) - (a.at || 0))[0] || {};
    const ur = String(R.ur || '');                 // 'YYYY-MM-DD' (baru) atau 'MM-DD' (lama)
    const full = /^\d{4}-\d{2}-\d{2}$/.test(ur);
    return { ultahRazan: full ? ur.slice(5) : ur, ultahRazanY: full ? +ur.slice(0, 4) : 0, ultahRazanFull: full ? ur : '' };
  }
  // semua kejadian dari hari ini sampai `days` hari ke depan
  function events(days) {
    days = days || 60;
    const t0 = day0(new Date()), J = new Date(JADIAN[0], JADIAN[1], JADIAN[2]), out = [], set = settings();
    const add = (date, o) => { const left = Math.round((day0(date) - t0) / 864e5); if (left >= 0 && left <= days) out.push(Object.assign({ date: ymd(date), left }, o)); };
    for (let k = 0; k <= 1; k++) {
      const y = t0.getFullYear() + k;
      const an = new Date(y, JADIAN[1], JADIAN[2]); if (y > JADIAN[0]) add(an, { key: 'anniv' + y, e: '💍', t: `Anniversary ke-${y - JADIAN[0]}`, big: 1 });
      add(new Date(y, ULTAH_DARA[0], ULTAH_DARA[1]), { key: 'ud' + y, e: '🎂', t: 'Ulang tahun Dara', big: 1 });
      if (/^\d{2}-\d{2}$/.test(set.ultahRazan)) { const [m, d] = set.ultahRazan.split('-').map(Number); const age = set.ultahRazanY && set.ultahRazanY < y ? y - set.ultahRazanY : 0; add(new Date(y, m - 1, d), { key: 'ur' + y, e: '🎉', t: 'Ulang tahun Razan' + (age ? ` ke-${age}` : ''), big: 1 }); }
      custom().forEach(c => { const [m, d] = c.m.split('-').map(Number); if (c.y && +c.y !== y) return; add(new Date(y, m - 1, d), { key: 'c' + c.id + y, e: c.e || '⭐', t: c.n, big: 1 }); });
    }
    // mensive tiap tanggal 10 (kecuali pas anniv)
    for (let k = 0; k <= Math.ceil(days / 28); k++) {
      const d = new Date(t0.getFullYear(), t0.getMonth() + k, JADIAN[2]), mo = (d.getFullYear() - JADIAN[0]) * 12 + d.getMonth() - JADIAN[1];
      if (mo > 0 && mo % 12) add(d, { key: 'm' + mo, e: '💗', t: `Mensive ke-${mo}` });
    }
    // tiap kelipatan 100 hari
    const since = Math.round((t0 - J) / 864e5);
    for (let n = Math.ceil(Math.max(1, since) / 100) * 100; n <= since + days; n += 100) add(new Date(J.getFullYear(), J.getMonth(), J.getDate() + n), { key: 'h' + n, e: '💯', t: `${n.toLocaleString('id-ID')} hari bareng` });
    // rencana ketemu
    ['Razan', 'Dara'].forEach(w => Object.entries(g('ketemu-' + w, {}) || {}).forEach(([d, row]) => (row && row.items || []).forEach(it => {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d); if (!m) return;
      add(new Date(+m[1], +m[2] - 1, +m[3]), { key: 'k' + it.id, e: it.e || '🤝', t: 'Ketemuan' + (it.t ? ': ' + it.t : ''), time: it.time || '', place: it.place || '', meet: 1 });
    })));
    // rencana weekend (Jadwal Mingguan) — yang paling baru diedit yang dipakai
    try {
      const OPT = { taman: ['🌳', 'Ke Taman'], nobi: ['🎬', 'Nobi'], larpag: ['🏃', 'Larpag (CFD)'], jauh: ['🗺️', 'Pergi Jauh'], rumah: ['🏠', 'Istirahat di rumah'], cafe: ['☕', 'Makan ke Cafe'] };
      ['Razan', 'Dara'].forEach(w => ((((g('mingguanopsi-' + w, {}) || {})['2000-01-01'] || {}).list) || []).forEach(o => { if (o && o.id && !o.del) OPT[o.id] = [o.e, o.n]; }));
      const best = {}; ['Razan', 'Dara'].forEach(w => Object.entries(g('mingguan-' + w, {}) || {}).forEach(([d, r]) => { if (r && r.at && (!best[d] || r.at > best[d].at)) best[d] = r; }));
      Object.entries(best).forEach(([d, r]) => {
        if (!r || r.del || !r.k || !OPT[r.k]) return; const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d); if (!m) return;
        add(new Date(+m[1], +m[2] - 1, +m[3]), { key: 'w' + d, e: OPT[r.k][0], t: OPT[r.k][1] + (r.tj ? ' · ' + r.tj : ''), place: r.tj || '', meet: r.k !== 'rumah' ? 1 : 0, wk: 1 });
      });
    } catch (e) {}
    return out.sort((a, b) => a.left - b.left || (a.time || '').localeCompare(b.time || ''));
  }
  const when = l => l === 0 ? 'Hari ini' : l === 1 ? 'Besok' : `${l} hari lagi`;
  const dateLabel = s => { const [y, m, d] = s.split('-').map(Number); return `${d} ${BLN[m - 1]}`; };
  // hari ke berapa sebelum acara dikasih notif
  const NOTIF_AT = e => e.big ? [7, 3, 1, 0] : [1, 0];
  function notifText(e, l) {
    // ulang tahun: kalimatnya beda buat yang ultah & pasangannya
    const me = (window.Who && Who.me()) || g('berdua-me', 'Dara'), mine = (/^ud/.test(e.key) && me === 'Dara') || (/^ur/.test(e.key) && me === 'Razan');
    if (/^u[dr]\d/.test(e.key)) {
      const who = /^ud/.test(e.key) ? 'Dara' : 'Razan';
      if (mine) return l === 0 ? { title: '🎂 Selamat ulang tahun, sayang!', body: `Hari ini hari kamu 🤍 ${who === 'Dara' ? 'Razan' : 'Dara'} sayang banget sama kamu.` } : { title: `🎂 ${when(l)} ulang tahun kamu!`, body: `${dateLabel(e.date)} — siap-siap dimanja 😆` };
      return l === 0 ? { title: `${e.e} Hari ini ulang tahun ${who}!`, body: 'Jangan lupa ucapan pertama & peluk paling erat 🎁' } : { title: `${e.e} ${when(l)}: ulang tahun ${who}`, body: `${dateLabel(e.date)} — siapin kado & kejutannya dari sekarang 🤫` };
    }
    const extra = e.meet ? [e.time && 'jam ' + e.time, e.place].filter(Boolean).join(' · ') : '';
    if (l === 0) return { title: `${e.e} ${e.t} — hari ini!`, body: e.meet ? `Hari ini ketemu 🥰${extra ? ' · ' + extra : ''}` : e.big ? 'Jangan lupa kasih ucapan & peluk yang paling erat 🤍' : 'Selamat ya kalian berdua 💕' };
    return { title: `${e.e} ${when(l)}: ${e.t}`, body: `${dateLabel(e.date)}${extra ? ' · ' + extra : ''} — siap-siap dari sekarang ya 😉` };
  }
  // jadwal notif 45 hari ke depan → dititip ke service worker
  function schedule() {
    const list = [];
    events(45).forEach(e => NOTIF_AT(e).forEach(l => {
      if (e.left < l) return;
      const [y, m, d] = e.date.split('-').map(Number), on = new Date(y, m - 1, d - l);
      list.push(Object.assign({ id: e.key + '@' + l, on: ymd(on) }, notifText(e, l)));
    }));
    try { caches.open('untuk-dara-meta').then(c => c.put('/__ingat', new Response(JSON.stringify({ at: Date.now(), list })))).catch(() => {}); } catch (e) {}
    return list;
  }
  // jadwal dari Jadwal Kita (yang berulang ikut dihitung) — buat banner "bentar lagi" di home
  function jadwal(days) {
    days = days || 7; const t0 = day0(new Date()), out = [], P = x => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(x || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
    const all = []; ['Razan', 'Dara'].forEach(w => Object.entries(g('jadwal-' + w, {}) || {}).forEach(([d, row]) => (row && row.list || []).forEach(x => { if (x && x.t) all.push(Object.assign({ owner: w, date: d }, x)); })));
    const me = (window.Who && Who.me()) || g('berdua-me', 'Dara'), seen = {};
    for (let i = 0; i <= days; i++) {
      const t = new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() + i);
      all.forEach(x => {
        const s = P(x.date); if (!s || t < s || seen[x.owner + x.id]) return;
        if (x.buat && x.buat !== me) return;     // jadwal "buat dia aja" ga usah nongol di home kita
        const ok = !x.rep ? ymd(t) === x.date : x.rep === 'minggu' ? Math.round((t - s) / 864e5) % 7 === 0 : x.rep === 'bulan' ? t.getDate() === s.getDate() : x.rep === 'tahun' ? t.getDate() === s.getDate() && t.getMonth() === s.getMonth() : false;
        if (ok) { seen[x.owner + x.id] = 1; out.push({ key: 'j' + x.id, e: x.e || '📅', t: x.t + (x.time ? ' · ' + x.time : ''), date: ymd(t), left: i, time: x.time || '', jadwal: 1 }); }
      });
    }
    return out.sort((a, b) => a.left - b.left || (a.time || '99').localeCompare(b.time || '99'));
  }
  window.Ingat = { jadwal, events, when, dateLabel, schedule, custom, settings, NOTIF_AT };
})();
