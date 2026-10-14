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
    return { ultahRazan: R.ur || '' };            // 'MM-DD'
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
      if (/^\d{2}-\d{2}$/.test(set.ultahRazan)) { const [m, d] = set.ultahRazan.split('-').map(Number); add(new Date(y, m - 1, d), { key: 'ur' + y, e: '🎉', t: 'Ulang tahun Razan', big: 1 }); }
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
    return out.sort((a, b) => a.left - b.left || (a.time || '').localeCompare(b.time || ''));
  }
  const when = l => l === 0 ? 'Hari ini' : l === 1 ? 'Besok' : `${l} hari lagi`;
  const dateLabel = s => { const [y, m, d] = s.split('-').map(Number); return `${d} ${BLN[m - 1]}`; };
  // hari ke berapa sebelum acara dikasih notif
  const NOTIF_AT = e => e.big ? [7, 3, 1, 0] : [1, 0];
  function notifText(e, l) {
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
  window.Ingat = { events, when, dateLabel, schedule, custom, settings, NOTIF_AT };
})();
