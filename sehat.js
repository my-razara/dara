/* ═══ 🏃 SEHAT & JADWAL — tab di menu bawah index ═══
   Ngumpulin yang udah ada (💧 Jaga Minum, 😴 Tidur Kita, 📅 Jadwal Kita, 🧘 Stretching) + olahraga baru.
   Data olahraga: app 'sehat' di Data Berdua → baris per orang per tanggal { m: menit, s: [[jenis, menit, jam]], done: [id jadwal], c: koin, live: {k, at} } */
(function () {
  if (window.Sehat) return;
  const APP = 'sehat', H = 36e5, WHO = ['Razan', 'Dara'];
  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const ls = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const day0 = d => { const x = new Date(d || Date.now()); x.setHours(0, 0, 0, 0); return x; };
  const pYMD = s => { if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return null; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const BD = () => window.Berdua;
  const me = () => (window.Who && Who.me && Who.me()) || g('berdua-me', 'Dara');
  const ot = w => w === 'Razan' ? 'Dara' : 'Razan';
  const vib = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  const toast = m => { if (window.toast) return window.toast(m); const t = document.createElement('div'); t.textContent = m; t.style.cssText = 'position:fixed;left:50%;bottom:calc(6rem + env(safe-area-inset-bottom));transform:translateX(-50%);background:rgba(45,31,26,.92);color:#fff;padding:.6rem 1rem;border-radius:50px;font:500 12.5px Poppins,sans-serif;z-index:9900;max-width:88vw;text-align:center'; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); };
  const COL = { Razan: '#5a8fcc', Dara: '#d4718a' };

  // ── data ──
  const rowsOf = (app, w) => g(app + '-' + w, {}) || {};
  const sRow = (w, d) => rowsOf(APP, w)[d || ymd(new Date())] || {};
  function put(w, d, row) {
    if (BD() && BD().put) BD().put(APP, w, d, row);
    else { const m = rowsOf(APP, w); m[d] = row; ls(APP + '-' + w, m); }
  }
  const tgtGerak = () => g('sehat-tgt', 30);
  const CFG = '2000-01-01';
  function goalBerdua() { let best = null; WHO.forEach(w => { const c = rowsOf(APP, w)[CFG]; if (c && c.goal && (!best || (c.gat || 0) > best.gat)) best = { goal: c.goal, gat: c.gat || 0 }; }); return best ? best.goal : g('sehat-goal', 300); }
  function setTarget() {
    let d = tgtGerak(), wk = goalBerdua();
    const o = document.createElement('div'); o.className = 'sh-sheet';
    const draw = () => { o.innerHTML = `<div><div class="gr"></div><h3>🎯 Atur target</h3><p class="s">Pelan-pelan aja, yang penting rutin 💪</p>
      <p class="sh-day" style="margin-top:.2rem">Gerak harian kamu</p><div class="sh-dur">${[15, 20, 30, 45, 60].map(n => `<button data-d="${n}" class="${d === n ? 'on' : ''}">${n} mnt</button>`).join('')}</div>
      <p class="sh-day">Target berdua seminggu</p><div class="sh-dur">${[150, 200, 300, 400, 500].map(n => `<button data-w="${n}" class="${wk === n ? 'on' : ''}">${n}</button>`).join('')}</div>
      <p class="s" style="text-align:center">menit · keliatan sama ${ot(me())} juga</p><button class="sh-go" data-ok>Simpan</button></div>`;
      o.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { d = +b.dataset.d; draw(); });
      o.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { wk = +b.dataset.w; draw(); });
      o.querySelector('[data-ok]').onclick = () => {
        const g0 = goalBerdua(); ls('sehat-tgt', d); ls('sehat-goal', wk);
        if (wk !== g0) { const w = me(), c = Object.assign({}, rowsOf(APP, w)[CFG] || {}, { goal: wk, gat: Date.now() }); put(w, CFG, c); }
        o.remove(); vib(15); toast(`🎯 Target: ${d} mnt sehari · ${wk} mnt berdua seminggu`); paint(); try { window.__u2 && __u2.refresh(); } catch (e) {}
      };
    };
    o.onclick = e => { if (e.target === o) o.remove(); }; draw(); document.body.appendChild(o);
  }
  function minum(w, d) { const r = rowsOf('minum', w)[d || ymd(new Date())] || {}; const goal = r.g || g('minum-goal', 8); return { n: Math.floor((r.ml || 0) / 250), g: goal, p: Math.min(1, (r.ml || 0) / (goal * 250)) }; }
  function tidur(w) {
    const r = rowsOf('tidur', w), t = day0(), y = new Date(t); y.setDate(y.getDate() - 1);
    const dur = x => x && x.b && x.w && x.w > x.b && (x.w - x.b) < 16 * H && (x.w - x.b) > H / 2 ? (x.w - x.b) / H : 0;
    const h = Math.max(dur(r[ymd(t)]), dur(r[ymd(y)]));
    return { h, p: Math.min(1, h / 8) };
  }
  function gerak(w, d) { const r = sRow(w, d); return { m: Math.round(r.m || 0), p: Math.min(1, (r.m || 0) / tgtGerak()) }; }
  // jadwal (sama kayak di Jadwal Kita, termasuk yang berulang)
  function jadwalOn(ds) {
    const t = pYMD(ds), out = [];
    WHO.forEach(w => Object.entries(rowsOf('jadwal', w)).forEach(([d, row]) => (row && row.list || []).forEach(x => {
      if (!x || !x.id || !x.t) return; const s = pYMD(d); if (!s || t < s) return;
      if (x.until && pYMD(x.until) && t > pYMD(x.until)) return;
      const ok = !x.rep ? d === ds : x.rep === 'minggu' ? Math.round((t - s) / 864e5) % 7 === 0 : x.rep === 'bulan' ? t.getDate() === s.getDate() : x.rep === 'tahun' ? t.getDate() === s.getDate() && t.getMonth() === s.getMonth() : false;
      if (ok) out.push(Object.assign({ owner: w, date: d }, x));
    })));
    return out.sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
  }
  function nextAgenda() {
    const now = new Date(), hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const L = jadwalOn(ymd(now)).filter(x => x.time && x.time >= hm);
    if (!L.length) return null;
    const x = L[0], [hh, mm] = x.time.split(':').map(Number), mins = hh * 60 + mm - (now.getHours() * 60 + now.getMinutes());
    return { x, left: mins < 60 ? `${mins} mnt lagi` : `${Math.round(mins / 60)} jam lagi` };
  }
  function weekMins(w) {
    const t = day0(), mon = new Date(t); mon.setDate(t.getDate() - ((t.getDay() + 6) % 7));
    let n = 0; for (let i = 0; i < 7; i++) { const d = new Date(mon); d.setDate(mon.getDate() + i); n += sRow(w, ymd(d)).m || 0; }
    return Math.round(n);
  }
  function streak() {
    const d = day0(); const any = x => WHO.some(w => (sRow(w, ymd(x)).m || 0) > 0);
    if (!any(d)) d.setDate(d.getDate() - 1);
    let n = 0; while (any(d) && n < 400) { n++; d.setDate(d.getDate() - 1); } return n;
  }

  // ── 🍩 cincin ──
  function ring(r, p, c, bg, w) { const C = 2 * Math.PI * r; return `<circle cx="0" cy="0" r="${r}" fill="none" stroke="${bg}" stroke-width="${w}"/><circle cx="0" cy="0" r="${r}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - Math.max(.001, p))).toFixed(1)}" transform="rotate(-90)"/>`; }
  const mini = (p, c, bg, e) => `<svg width="52" height="52" viewBox="-26 -26 52 52">${ring(21, p, c, bg, 7)}<text x="0" y="5" text-anchor="middle" font-size="13">${e}</text></svg>`;

  // kartu kecil buat Beranda
  function card() {
    const w = me(), G = gerak(w), M = minum(w), T = tidur(w), nx = nextAgenda();
    return `<div class="u2-rings">
      <a class="u2-ring" href="#sehat" data-sh="go">${mini(G.p, '#d4718a', '#fbe3ea', '🏃')}<b>${G.m}/${tgtGerak()} mnt</b><small>Gerak</small></a>
      <a class="u2-ring" href="jaga-minum.html">${mini(M.p, '#6fa8dc', '#e1eef9', '💧')}<b>${M.n}/${M.g} gelas</b><small>Minum</small></a>
      <a class="u2-ring" href="tidur-kita.html">${mini(T.p, '#a08ad6', '#ece6f8', '🌙')}<b>${T.h ? (Math.round(T.h * 10) / 10).toString().replace('.', ',') + ' jam' : '–'}</b><small>Tidur</small></a></div>
      ${nx ? `<a class="u2-next" href="jadwal-kita.html?d=${ymd(new Date())}"><span>⏰</span><b>${esc(nx.x.time)} · ${esc(nx.x.t)}</b><small>${nx.left}</small></a>` : `<a class="u2-next" href="jadwal-kita.html?add=1"><span>📅</span><b>Belum ada jadwal lagi hari ini</b><small>+ Tambah</small></a>`}`;
  }

  // ── 🏋️ daftar latihan (tanpa alat, aman buat pemula) ──
  const R = (n, s, e, t, rest) => ({ n, s, e, t, rest });
  const WO = {
    yoga: { n: 'Yoga santai', e: '🧘‍♀️', bg: '#fdeef2', lv: ['Ringan', '#eef7f1', '#3a9a72'], sub: 'bisa bareng 2 HP', mv: [
      R('Napas perut', 60, '🌬️', 'Duduk bersila, tarik napas 4 hitungan, buang 6 hitungan'), R('Kucing–Sapi', 75, '🐈', 'Merangkak. Tarik napas punggung turun, buang napas punggung melengkung'),
      R('Pose anak', 75, '🙇‍♀️', 'Duduk di tumit, badan rebah ke depan, tangan lurus. Rileks'), R('Anjing menunduk', 45, '🐕', 'Pinggul naik, badan bentuk huruf V terbalik. Lutut boleh ditekuk'),
      R('Tarik samping', 75, '🙆‍♀️', 'Duduk, satu tangan ke atas lalu condong ke samping. Ganti sisi di tengah'), R('Putar duduk', 75, '🔄', 'Duduk tegak, putar badan pelan ke kanan lalu ke kiri'),
      R('Kupu-kupu', 60, '🦋', 'Telapak kaki ketemu, lutut turun pelan ke samping'), R('Rebahan santai', 90, '😌', 'Telentang, tutup mata, napas pelan. Badan dilemesin')] },
    jalan: { n: 'Jalan cepat', e: '🚶‍♀️', bg: '#e9f3fb', lv: ['Ringan', '#eef7f1', '#3a9a72'], sub: 'timer · di luar / di tempat', pick: [10, 20, 30], mv: [R('Jalan cepat', 1200, '🚶‍♀️', 'Langkah agak cepet sampe napas sedikit ngos-ngosan tapi masih bisa ngobrol')] },
    stretch: { n: 'Stretching pagi', e: '🤸', bg: '#fff4e2', lv: ['Ringan', '#eef7f1', '#3a9a72'], sub: '8 gerakan', mv: [
      R('Putar leher', 30, '🙂', 'Putar kepala pelan, setengah lingkaran kiri-kanan'), R('Putar bahu', 30, '💪', 'Putar bahu ke belakang besar-besar'),
      R('Raih langit', 30, '🙌', 'Tangan lurus ke atas, jinjit dikit, tarik badan'), R('Tekuk samping', 40, '🙆‍♀️', 'Tangan ke atas, condong ke kanan lalu ke kiri'),
      R('Sentuh jari kaki', 40, '🧎‍♀️', 'Bungkuk pelan, lutut boleh ditekuk, rasain paha belakang'), R('Tarik paha depan', 40, '🦵', 'Pegang punggung kaki ke belakang, ganti kaki di tengah'),
      R('Putar pinggang', 30, '🔄', 'Tangan di pinggang, putar pinggul pelan'), R('Napas dalam', 30, '🌬️', 'Tarik napas panjang, buang pelan. Siap jalanin hari!')] },
    kardio: { n: 'Kardio di kamar', e: '🔥', bg: '#f1ecfa', lv: ['Sedang', '#fdeef2', '#c95f7b'], sub: 'tanpa alat', mv: [
      R('Jalan di tempat', 60, '🚶‍♀️', 'Pemanasan, ayun tangan'), R('Jumping jack', 40, '⭐', 'Lompat buka-tutup. Versi pelan: langkah ke samping'), R('Istirahat', 20, '😮‍💨', 'Tarik napas', 1),
      R('Lutut tinggi', 40, '🏃‍♀️', 'Lari di tempat, lutut naik'), R('Istirahat', 20, '😮‍💨', 'Minum dikit kalau perlu', 1),
      R('Squat', 40, '🪑', 'Kayak mau duduk di kursi, punggung lurus'), R('Istirahat', 20, '😮‍💨', '', 1),
      R('Jumping jack', 40, '⭐', 'Sekali lagi!'), R('Istirahat', 20, '😮‍💨', '', 1),
      R('Pendaki gunung', 30, '⛰️', 'Posisi push-up, lutut gantian ke dada. Pelan aja'), R('Istirahat', 30, '😮‍💨', '', 1),
      R('Squat', 40, '🪑', 'Terakhir, semangat!'), R('Pendinginan', 90, '🧘‍♀️', 'Jalan pelan di tempat, tarik napas panjang')] }
  };
  const total = w => Math.round(w.mv.reduce((s, m) => s + m.s, 0) / 60);
  const MANUAL = [['🏃‍♀️', 'Lari'], ['🚴', 'Sepeda'], ['🏸', 'Badminton'], ['🏊', 'Renang'], ['🏋️', 'Gym'], ['💃', 'Senam / zumba'], ['⚽', 'Futsal'], ['🧘', 'Yoga'], ['🚶', 'Jalan']];

  // ── catat menit + koin buat peliharaan ──
  function logMins(kind, mins) {
    mins = Math.max(1, Math.round(mins)); const w = me(), d = ymd(new Date()), r = Object.assign({}, sRow(w, d));
    r.m = (r.m || 0) + mins; r.s = (r.s || []).concat([[kind, mins, Date.now()]]).slice(-12);
    const can = Math.max(0, 12 - (r.c || 0)), coin = Math.min(can, Math.floor(mins / 5)); r.c = (r.c || 0) + coin; delete r.live;
    put(w, d, r);
    let got = 0; try { if (coin && window.Pet && Pet.reward && Pet.reward(coin, Math.min(20, mins))) got = coin; } catch (e) {}
    try { if (window.Push) Push.notify({ title: `🏃 ${w} abis olahraga ${mins} menit`, body: `${kind} · ayo susul biar target berdua kekejar 💪`, url: './#sehat', tag: 'sehat' }); } catch (e) {}
    return got;
  }
  function setLive(k) { const w = me(), d = ymd(new Date()), r = Object.assign({}, sRow(w, d)); if (k) r.live = { k, at: Date.now() }; else delete r.live; put(w, d, r); }
  function partnerLive() { const o = ot(me()), r = sRow(o); return r.live && Date.now() - r.live.at < 150e3 ? r.live : null; }

  // ── tampilan tab ──
  let host = null, tab = 'hari', sel = ymd(new Date());
  function mount(el) { host = el; paint(); }
  function paint() {
    if (!host) return;
    const segs = [['hari', 'Hari ini'], ['olahraga', 'Olahraga'], ['jadwal', 'Jadwal']];
    let h = `<div class="u2-ttl"><h2>Sehat &amp; Jadwal</h2><a class="sh-add" href="jadwal-kita.html?add=1" aria-label="Tambah jadwal">+</a></div>
      <div class="sh-seg">${segs.map(([k, n]) => `<button data-t="${k}" class="${tab === k ? 'on' : ''}">${n}</button>`).join('')}</div>`;
    h += tab === 'hari' ? hariHTML() : tab === 'olahraga' ? olahragaHTML() : jadwalHTML();
    host.innerHTML = h;
    host.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; paint(); });
    host.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { sel = b.dataset.d; paint(); });
    host.querySelectorAll('[data-ck]').forEach(b => b.onclick = e => { e.preventDefault(); e.stopPropagation(); toggleDone(b.dataset.ck); });
    host.querySelectorAll('[data-wo]').forEach(b => b.onclick = () => startWO(b.dataset.wo));
    host.querySelectorAll('[data-tgt]').forEach(b => b.onclick = e => { e.preventDefault(); setTarget(); });
    const mn = host.querySelector('[data-manual]'); if (mn) mn.onclick = manual;
  }
  function hariHTML() {
    const w = me(), t = day0(), mon = new Date(t); mon.setDate(t.getDate() - ((t.getDay() + 6) % 7));
    const HR = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    let h = `<div class="sh-week">${HR.map((n, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); const k = ymd(d); return `<button data-d="${k}" class="${k === sel ? 'on' : ''} ${k === ymd(t) ? 'td' : ''}">${n}<b>${d.getDate()}</b><i class="${(sRow(w, k).m || 0) > 0 ? 'y' : ''}"></i></button>`; }).join('')}</div>`;
    const isToday = sel === ymd(t), G = gerak(w, sel), M = minum(w, sel), T = tidur(w);
    h += `<div class="u2-card sh-sum"><svg width="108" height="108" viewBox="-54 -54 108 108">${ring(47, G.p, '#d4718a', '#fbe3ea', 10)}${ring(34, M.p, '#6fa8dc', '#e1eef9', 10)}${isToday ? ring(21, T.p, '#a08ad6', '#ece6f8', 10) : ''}</svg>
      <div class="sh-lg"><a href="#" data-tgt style="justify-content:flex-end;color:var(--rose);font-weight:600;font-size:10.5px;margin:0 0 .2rem">🎯 Atur target</a><a href="#" data-wo-go><i style="background:#d4718a"></i>Gerak<b>${G.m}<small>/${tgtGerak()} mnt</small></b></a><a href="jaga-minum.html"><i style="background:#6fa8dc"></i>Minum<b>${M.n}<small>/${M.g} gelas</small></b></a>${isToday ? `<a href="tidur-kita.html"><i style="background:#a08ad6"></i>Tidur<b>${T.h ? String(Math.round(T.h * 10) / 10).replace('.', ',') : '–'}<small>/8 jam</small></b></a>` : ''}</div></div>`;
    const d = pYMD(sel), L = jadwalOn(sel), done = sRow(w, sel).done || [], now = new Date(), hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const nextId = isToday ? (L.find(x => x.time && x.time >= hm && !done.includes(x.id)) || {}).id : null;
    h += `<div class="sh-lbl"><span>${isToday ? 'Agenda hari ini' : `Agenda ${['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()]}, ${d.getDate()}`}</span><a href="jadwal-kita.html?d=${sel}">Kalender →</a></div>`;
    if (!L.length) h += `<div class="sh-empty">Belum ada jadwal ${isToday ? 'hari ini' : 'di tanggal ini'} 🌿<br><a href="jadwal-kita.html?add=1">+ Tambah jadwal</a></div>`;
    h += L.map(x => { const dn = done.includes(x.id), tag = x.buat === 'Razan' || x.buat === 'Dara' ? (x.buat === w ? 'buat aku' : 'buat ' + x.buat) : 'berdua';
      return `<div class="sh-ev ${dn ? 'done' : ''} ${x.id === nextId ? 'now' : ''}"><time>${esc(x.time || '—')}</time><a class="b" href="jadwal-kita.html?d=${sel}"><span>${esc(x.e || '⭐')}</span><div><b>${esc(x.t)}</b><small>${x.owner === w ? 'dari kamu' : 'dari ' + x.owner}<span class="sh-tag">${tag}</span></small></div><button class="sh-ck ${dn ? 'y' : ''}" data-ck="${esc(x.id)}" aria-label="Centang">${dn ? '✓' : ''}</button></a></div>`; }).join('');
    // rutinitas harian (selalu ada)
    const S = sRow(w, sel);
    h += `<div class="sh-ev ${G.m >= tgtGerak() ? 'done' : ''}"><time>🏃</time><a class="b" href="#" data-wo-go><span>🏃‍♀️</span><div><b>Gerak ${tgtGerak()} menit</b><small>${G.m ? `udah ${G.m} mnt${(S.s || []).length ? ' · ' + esc(S.s[S.s.length - 1][0]) : ''}` : 'yoga, jalan, stretching, apa aja'}</small></div></a></div>
      <div class="sh-ev ${M.p >= 1 ? 'done' : ''}"><time>💧</time><a class="b" href="jaga-minum.html"><span>💧</span><div><b>Minum ${M.g} gelas</b><small>${M.n} gelas sejauh ini</small></div></a></div>`;
    if (isToday) h += `<div class="sh-ev"><time>🌙</time><a class="b" href="tidur-kita.html"><span>😴</span><div><b>Bobo jam ${String(g('tidur-tgt', 22)).padStart(2, '0')}.00</b><small>${T.h ? `semalem ${String(Math.round(T.h * 10) / 10).replace('.', ',')} jam` : 'tap "Aku mau bobo" biar kecatet'}</small></div></a></div>`;
    setTimeout(() => host && host.querySelectorAll('[data-wo-go]').forEach(a => a.onclick = e => { e.preventDefault(); tab = 'olahraga'; paint(); }), 0);
    return h;
  }
  function olahragaHTML() {
    const wr = weekMins('Razan'), wd = weekMins('Dara'), goal = goalBerdua(), mx = Math.max(goal / 2, wr, wd, 1), st = streak();
    let h = `<div class="u2-card sh-duo"><div class="h"><b>Minggu ini berdua</b>${st ? `<span>🔥 ${st} hari beruntun</span>` : ''}</div>
      ${WHO.map(w => { const n = w === 'Razan' ? wr : wd; return `<div class="sh-vs"><span class="w" style="color:${COL[w]}">${w}</span><div class="tr"><b style="width:${Math.round(n / mx * 100)}%;background:${COL[w]}"></b></div><small>${n} mnt</small></div>`; }).join('')}
      <div class="sh-goal" data-tgt style="cursor:pointer">🎯<div class="tr"><b style="width:${Math.min(100, Math.round((wr + wd) / goal * 100))}%"></b></div><span><b>${wr + wd}</b>/${goal} mnt ✏️</span></div></div>`;
    let pet = null; try { pet = window.Pet && Pet.state(); } catch (e) {}
    if (pet) { const A = Pet.animal(pet.a); h += `<a class="sh-pet" href="peliharaan.html"><span class="e">${A.e}</span><span><b>${esc(pet.n || A.n)} ikut semangat!</b><br>Tiap 5 menit olahraga = +1 🪙 buat ${esc(pet.n || A.n)} (maks 12 sehari)</span></a>`; }
    const lv = partnerLive(); if (lv) h += `<div class="u2-card" style="padding:.7rem .9rem;margin-bottom:.8rem;font-size:12px">🟢 <b>${ot(me())}</b> lagi latihan <b>${esc((WO[lv.k] || {}).n || lv.k)}</b> sekarang. Ikutan yuk!</div>`;
    h += `<div class="sh-lbl"><span>Mulai latihan</span></div><div class="sh-wo">${Object.entries(WO).map(([k, w]) => `<button class="sh-wk" data-wo="${k}"><span style="background:${w.bg}">${w.e}</span><div><b>${w.n}<i style="background:${w.lv[1]};color:${w.lv[2]}">${w.lv[0]}</i></b><small>${w.pick ? w.pick.join('/') + ' mnt' : total(w) + ' mnt'} · ${w.sub}</small></div><span class="go">▶</span></button>`).join('')}
      <button class="sh-wk" data-manual><span style="background:#eef7f1">✍️</span><div><b>Catat olahraga lain</b><small>lari, sepeda, badminton, gym…</small></div><span class="go">＋</span></button></div>`;
    const H2 = [];
    WHO.forEach(w => Object.entries(rowsOf(APP, w)).forEach(([d, r]) => (r && r.s || []).forEach(s => H2.push({ w, k: s[0], m: s[1], at: s[2] }))));
    H2.sort((a, b) => b.at - a.at);
    if (H2.length) h += `<div class="sh-lbl"><span>Terakhir</span></div><div class="u2-card sh-hist">${H2.slice(0, 5).map(x => `<div><b style="color:${COL[x.w]}">${x.w}</b> ${esc(x.k)} · ${x.m} mnt<small>${ago(x.at)}</small></div>`).join('')}</div>`;
    return h;
  }
  function jadwalHTML() {
    let h = `<div class="sh-links"><a href="jadwal-kita.html"><span>📅</span>Kalender</a><a href="jadwal-mingguan.html"><span>🗓️</span>Mingguan</a><a href="ketemuan.html"><span>⏰</span>Hitung mundur</a><a href="kebiasaan-bareng.html"><span>✅</span>Habit</a></div>`;
    const t = day0(); let any = false;
    for (let i = 0; i < 7; i++) {
      const d = new Date(t); d.setDate(t.getDate() + i); const k = ymd(d), L = jadwalOn(k); if (!L.length) continue; any = true;
      h += `<p class="sh-day">${i === 0 ? 'Hari ini' : i === 1 ? 'Besok' : ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()] + ', ' + d.getDate()}</p>` +
        L.map(x => `<div class="sh-ev"><time>${esc(x.time || '—')}</time><a class="b" href="jadwal-kita.html?d=${k}"><span>${esc(x.e || '⭐')}</span><div><b>${esc(x.t)}</b><small>${x.buat === 'Razan' || x.buat === 'Dara' ? 'buat ' + x.buat : 'berdua'}</small></div></a></div>`).join('');
    }
    if (!any) h += `<div class="sh-empty">Seminggu ke depan masih kosong 🌿<br><a href="jadwal-kita.html?add=1">+ Tambah jadwal</a></div>`;
    h += `<div class="sh-lbl" style="margin-top:.8rem"><span>Rutinitas</span></div><div class="sh-links"><a href="jaga-minum.html"><span>💧</span>Minum</a><a href="stretching.html"><span>🧘</span>Stretch</a><a href="tidur-kita.html"><span>😴</span>Bobo</a><a href="ibadah-bareng.html"><span>🕌</span>Ibadah</a></div>`;
    return h;
  }
  function ago(t) { const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? 'barusan' : m < 60 ? m + ' mnt lalu' : m < 1440 ? Math.round(m / 60) + ' jam lalu' : Math.round(m / 1440) + ' hari lalu'; }
  function toggleDone(id) { const w = me(), r = Object.assign({}, sRow(w, sel)), dn = (r.done || []).slice(), i = dn.indexOf(id); if (i < 0) dn.push(id); else dn.splice(i, 1); r.done = dn.slice(-30); put(w, sel, r); vib(10); paint(); }

  // ── ✍️ catat manual ──
  function manual() {
    let k = MANUAL[0][1], m = 30;
    const o = document.createElement('div'); o.className = 'sh-sheet';
    const draw = () => { o.innerHTML = `<div><div class="gr"></div><h3>Catat olahraga</h3><p class="s">Abis olahraga di luar? Catat biar masuk target berdua</p>
      <div class="sh-opts">${MANUAL.map(([e, n]) => `<button data-k="${n}" class="${k === n ? 'on' : ''}"><span>${e}</span>${n}</button>`).join('')}</div>
      <div class="sh-dur">${[10, 20, 30, 45, 60].map(n => `<button data-m="${n}" class="${m === n ? 'on' : ''}">${n} mnt</button>`).join('')}</div>
      <button class="sh-go" data-ok>Simpan</button></div>`;
      o.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { k = b.dataset.k; draw(); });
      o.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { m = +b.dataset.m; draw(); });
      o.querySelector('[data-ok]').onclick = () => { const c = logMins(k, m); o.remove(); vib([10, 30, 10]); toast(`💪 ${k} ${m} menit kecatet${c ? ` · +${c} 🪙` : ''}`); paint(); try { window.__u2 && __u2.refresh(); } catch (e) {} };
    };
    o.onclick = e => { if (e.target === o) o.remove(); }; draw(); document.body.appendChild(o);
  }

  // ── 🧘 mode latihan ──
  let LT = null;
  function startWO(k) {
    const W = WO[k]; if (!W) return;
    if (W.pick) { const o = document.createElement('div'); o.className = 'sh-sheet'; o.innerHTML = `<div><div class="gr"></div><h3>${W.e} ${W.n}</h3><p class="s">Mau berapa lama?</p><div class="sh-dur">${W.pick.map(n => `<button data-m="${n}">${n} mnt</button>`).join('')}</div></div>`; o.onclick = e => { if (e.target === o) o.remove(); }; o.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { o.remove(); run(k, Object.assign({}, W, { mv: [Object.assign({}, W.mv[0], { s: +b.dataset.m * 60 })] })); }); document.body.appendChild(o); return; }
    run(k, W);
  }
  function run(k, W) {
    if (LT) return;
    const el = document.createElement('div'); el.className = 'lt'; document.body.appendChild(el);
    let i = 0, left = W.mv[0].s, paused = false, used = 0, wake = null, liveT = 0;
    try { navigator.wakeLock && navigator.wakeLock.request('screen').then(w => wake = w).catch(() => {}); } catch (e) {}
    setLive(k); liveT = setInterval(() => setLive(k), 60e3);
    // 🏃 status di tab Kita otomatis "Lagi olahraga" selama latihan
    const stKey = 'status-' + me(), stLast = () => { const m = g(stKey, {}) || {}, ks = Object.keys(m).sort(); return ks.length ? m[ks[ks.length - 1]] : null; };
    const prevSt = stLast(), secs = W.mv.reduce((a, m) => a + m.s, 0);
    try { BD() && BD().put && BD().put('status', me(), ymd(new Date()), { e: '🏃', t: `Lagi olahraga · ${W.n}`, at: Date.now(), until: Date.now() + (secs + 600) * 1000, auto: 1 }); window.__renderRows && __renderRows(); } catch (e) {}
    try { window.Push && Push.notify({ title: `🏃 ${me()} mulai ${W.n}`, body: 'Ikutan yuk, biar latihan bareng 💪', url: './#sehat', tag: 'sehat' }); } catch (e) {}
    const stBack = () => { try { const c = stLast(); if (!c || !c.auto) return; const ok = prevSt && prevSt.e && !prevSt.auto && (!prevSt.until || prevSt.until > Date.now()); BD().put('status', me(), ymd(new Date()), ok ? Object.assign({}, prevSt, { at: Date.now() }) : { e: '', t: '', at: Date.now(), until: 1 }); window.__renderRows && __renderRows(); } catch (e) {} };
    const C = 2 * Math.PI * 45;
    const beep = n => { try { window.SFX && SFX.play(n || 'tap'); } catch (e) {} };
    function draw() {
      const m = W.mv[i], lv = partnerLive(), o = ot(me()), p = 1 - left / m.s;
      el.innerHTML = `<div class="lt-h"><button data-x aria-label="Selesai">✕</button><div><small>${W.n}${lv ? ' · bareng' : ''}</small><b>${W.mv.length > 1 ? `Gerakan ${i + 1} dari ${W.mv.length}` : 'Ayo gerak!'}</b></div><button data-s aria-label="Suara">${g('lt-mute', 0) ? '🔇' : '🔊'}</button></div>
        <div class="lt-big"><svg viewBox="-55 -55 110 110"><circle r="45" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="8"/><circle r="45" fill="none" stroke="${m.rest ? '#9fe0c3' : '#e895a9'}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - p)).toFixed(1)}" transform="rotate(-90)"/></svg>
          <div class="c"><span>${m.e}</span><b>${Math.floor(left / 60)}:${pad(left % 60)}</b><small>dari ${Math.floor(m.s / 60)}:${pad(m.s % 60)}</small></div></div>
        <div class="lt-mv ${m.rest ? 'rest' : ''}"><b>${esc(m.n)}</b><p>${esc(m.t || '')}</p></div>
        ${W.mv.length > 1 ? `<div class="lt-st">${W.mv.map((_, j) => `<i class="${j < i ? 'y' : j === i ? 'n' : ''}"></i>`).join('')}</div>` : '<div style="height:1rem"></div>'}
        ${lv ? `<div class="lt-live"><div class="d" style="background:${COL[o]}">${o[0]}</div><div><b>${o} lagi latihan juga</b><small>${esc((WO[lv.k] || {}).n || lv.k)} · nyambung</small></div><span style="margin-left:auto;font-size:18px">💪</span></div>` : `<div class="lt-live" style="opacity:.75"><div class="d off" style="background:rgba(255,255,255,.12)">🤍</div><div><b>Latihan sendiri dulu</b><small>${o} dapet kabar pas kamu selesai</small></div></div>`}
        <div class="lt-c"><button data-p>${paused ? '▶ Lanjut' : '⏸ Jeda'}</button><button class="m" data-n>${i < W.mv.length - 1 ? 'Gerakan berikutnya →' : 'Selesai ✓'}</button></div>`;
      el.querySelector('[data-x]').onclick = () => finish(true);
      el.querySelector('[data-s]').onclick = () => { ls('lt-mute', g('lt-mute', 0) ? 0 : 1); draw(); };
      el.querySelector('[data-p]').onclick = () => { paused = !paused; draw(); };
      el.querySelector('[data-n]').onclick = () => next();
    }
    function next() { if (i >= W.mv.length - 1) return finish(false); i++; left = W.mv[i].s; vib([20, 40, 20]); if (!g('lt-mute', 0)) beep(W.mv[i].rest ? 'tap' : 'pop'); draw(); }
    const tick = setInterval(() => { if (paused || document.hidden) return; left--; used++; if (left <= 3 && left > 0 && !g('lt-mute', 0)) beep('tap'); if (left <= 0) next(); else { const b = el.querySelector('.lt-big .c b'), c = el.querySelectorAll('.lt-big circle')[1]; if (b) b.textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`; if (c) c.setAttribute('stroke-dashoffset', (C * (1 - (1 - left / W.mv[i].s))).toFixed(1)); } }, 1000);
    function finish(quit) {
      clearInterval(tick); clearInterval(liveT); try { wake && wake.release(); } catch (e) {} stBack();
      const mins = Math.round(used / 60);
      if (quit && mins < 1) { setLive(null); el.remove(); LT = null; return; }
      const c = mins >= 1 ? logMins(W.n, mins) : (setLive(null), 0);
      if (!g('lt-mute', 0)) beep('win');
      el.innerHTML = `<div class="lt-done"><span>${quit ? '👏' : '🎉'}</span><h3>${quit ? 'Lumayan banget!' : 'Mantap, selesai!'}</h3><p>${esc(W.n)} · <b>${Math.max(1, mins)} menit</b> kecatet buat target berdua${c ? '' : ''}</p>${c ? `<span class="k">+${c} 🪙 buat peliharaan</span>` : ''}</div><div class="lt-c"><button class="m" data-ok>Balik</button></div>`;
      el.querySelector('[data-ok]').onclick = () => { el.remove(); LT = null; paint(); try { window.__u2 && __u2.refresh(); } catch (e) {} };
      vib([30, 60, 30]);
    }
    LT = el; draw();
  }

  try { BD() && BD().on && BD().on(ev => { if (ev.apps && ev.apps.some(a => ['sehat', 'minum', 'tidur', 'jadwal'].includes(a))) { if (!LT) paint(); try { window.__u2 && __u2.refresh(); } catch (e) {} } }); } catch (e) {}
  window.Sehat = { card, mount, paint, logMins, WO };
})();
