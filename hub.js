/* ═══ 🗂️ HUB — beberapa halaman yang mirip dilebur jadi 1 fitur bertab.
   Tiap halaman di grup dapet strip tab di atas; pindah tab = pindah halaman (tanpa numpuk riwayat "back"). ═══ */
(function () {
  if (window.__hub) return; window.__hub = 1;
  const GROUPS = {
    jadwal: { t: '📅 Jadwal Kita', tabs: [['jadwal-kita', '📅', 'Kalender'], ['jadwal-mingguan', '🗓️', 'Mingguan'], ['ketemuan', '⏰', 'Hitung Mundur']] },
    mood: { t: '🌈 Mood & Hati', tabs: [['kalender-mood', '😊', 'Mood'], ['jurnal-syukur', '🙏', 'Syukur'], ['buku-harian', '📔', 'Diary'], ['tidur-kita', '😴', 'Bobo'], ['tenangin-diri', '🌙', 'Tenang']] },
    rutin: { t: '✅ Rutinitas Bareng', tabs: [['kebiasaan-bareng', '✅', 'Habit'], ['ibadah-bareng', '🕌', 'Ibadah'], ['fokus-bareng', '📚', 'Fokus'], ['jaga-minum', '💧', 'Minum'], ['stretching', '🧘', 'Stretch']] },
    voucher: { t: '🎟️ Voucher Razan', tabs: [['voucher-harian', '🎟️', 'Harian'], ['hadiah-harian', '🎰', 'Gosok'], ['voucher-razan', '📒', 'Buku']] },
    kenangan: { t: '📸 Kenangan Kita', tabs: [['memories', '📸', 'Foto'], ['timeline-kita', '🕰️', 'Timeline'], ['polaroid-wall', '🖼️', 'Polaroid'], ['peta-kenangan', '📍', 'Peta'], ['peta-bintang', '🌌', 'Bintang']] },
    musik: { t: '🎵 Musik & Suara', tabs: [['playlist-dara', '🎵', 'Playlist'], ['playlist-dara', '🎶', 'Kotak', 'kotakmusik'], ['radio-razan', '📻', 'Radio'], ['piano-mini', '🎹', 'Piano'], ['rekam-suara', '🎙️', 'Rekam']] },
    janji: { t: '🕊️ Janji & Baikan', tabs: [['kupon-maaf', '🎟️', 'Tiket Baikan'], ['janji-kita', '📜', 'Janji Kita'], ['check-in-bulanan', '🩺', 'Check-in']] },
    kenal: { t: '🫶 Kenal Kita', tabs: [['kuis-kita', '🪞', 'Kuis'], ['dna-hubungan', '🧬', 'DNA'], ['dna-hubungan', '🧮', 'Hitung', 'kalkulator'], ['kamus-kita', '📖', 'Kamus'], ['masa-depan', '🔭', 'Masa Depan']] },
    kreasi: { t: '🎨 Studio Kreasi', tabs: [['hias-kue', '🍰', 'Kue'], ['gelang-manik', '📿', 'Gelang'], ['dandan-berdua', '👗', 'Dandan'], ['bikin-komik', '🗯️', 'Komik'], ['papan-coret', '🖊️', 'Coret']] }
  };
  const PAGE = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  let G = null; for (const k in GROUPS) if (GROUPS[k].tabs.some(x => x[0] === PAGE)) G = GROUPS[k];
  if (!G) return;
  const SUB = (/[?&]sub=([a-z0-9-]+)/.exec(location.search) || [])[1] || '';
  if (G.tabs.some(x => x[0] === PAGE && x[3])) window.__hubSubs = 1;   // sub.js ga usah bikin strip sendiri
  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const pad = n => String(n).padStart(2, '0'), now = new Date(), today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const me = () => (window.Who && Who.me && Who.me()) || g('berdua-me', 'Dara');
  // tanda kecil di tab: ✓ udah diisi hari ini / H-n ketemu
  function badge(id) {
    try {
      if (id === 'kalender-mood') return (g('mood-' + me(), {}) || {})[today] ? '✓' : '';
      if (id === 'jurnal-syukur') { const v = (g('syukur-' + me(), {}) || {})[today]; return Array.isArray(v) && v.length ? '✓' : ''; }
      if (id === 'voucher-harian') { const c = (g('vklaim-Dara', {}) || {})[today]; return c && c.id ? '✓' : (me() === 'Dara' ? '1' : ''); }
      if (id === 'buku-harian') { const r = (g('diary-' + me(), {}) || {})[today], p = (g('diary-priv-' + me(), {}) || {})[today]; return (r && r.t) || (p && p.t) ? '✓' : ''; }
      if (id === 'tidur-kita') { const r = g('tidur-' + me(), {}) || {}, h = now.getHours(), d0 = new Date(now); if (h < 12) d0.setDate(d0.getDate() - 1); const x = r[`${d0.getFullYear()}-${pad(d0.getMonth() + 1)}-${pad(d0.getDate())}`]; return x && x.b && !x.w ? '💤' : ''; }
      if (id === 'kebiasaan-bareng') { const L = {}; ['Razan', 'Dara'].forEach(w => (((g('habit-' + w, {}) || {})['2000-01-01'] || {}).list || []).forEach(h => { if (h && h.id && (!L[h.id] || (h.at || 0) > (L[h.id].at || 0))) L[h.id] = h; })); const m = me(), mine = Object.values(L).filter(h => !h.del && (h.who === 'both' || h.who === m)), dn = ((g('habitc-' + m, {}) || {})[today] || {}).ids || []; return mine.length ? (mine.every(h => dn.includes(h.id)) ? '✓' : dn.filter(i => mine.some(h => h.id === i)).length + '/' + mine.length) : ''; }
      if (id === 'check-in-bulanan') { const n2 = new Date(), m2 = n2.getDate() <= 7 ? new Date(n2.getFullYear(), n2.getMonth() - 1, 1) : n2, k2 = `${m2.getFullYear()}-${pad(m2.getMonth() + 1)}-01`, r2 = (g('checkin-' + me(), {}) || {})[k2]; return r2 && r2.s ? '✓' : (n2.getDate() >= 25 || n2.getDate() <= 7 ? '1' : ''); }
      if (id === 'ibadah-bareng') { const r = (g('ibadah-' + me(), {}) || {})[today]; const n = r ? (r.off ? 5 : Object.keys(r.s || {}).length) : 0; return n ? (n >= 5 ? '✓' : n + '/5') : ''; }
      if (id === 'ketemuan') { const m = g('idx-meet', ''); if (m && m >= today) { const a = new Date(m + 'T00:00:00'), b = new Date(today + 'T00:00:00'), n = Math.round((a - b) / 864e5); return n === 0 ? 'hari ini' : 'H-' + n; } }
    } catch (e) {}
    return '';
  }
  function build() {
    if (document.getElementById('hub-tabs')) return;
    const css = document.createElement('style');
    css.textContent = `.hub-tabs{position:relative;z-index:5;margin:0 0 .75rem;background:rgba(255,255,255,.82);border:1px solid rgba(193,122,111,.16);border-radius:18px;padding:.45rem .45rem .5rem;box-shadow:0 4px 16px rgba(193,122,111,.07);font-family:'Poppins',system-ui,sans-serif}
    .hub-tabs .ht{font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:#c9a96e;font-weight:600;text-align:center;margin:0 0 .35rem}
    .hub-tabs .hr{display:grid;grid-template-columns:repeat(${G.tabs.length},minmax(0,1fr));gap:.3rem}
    .hub-tabs a{position:relative;display:block;text-align:center;text-decoration:none;color:#9a8070;border-radius:13px;padding:.35rem .15rem .32rem;font-size:10.5px;font-weight:500;line-height:1.2;min-width:0;overflow:hidden;overflow-wrap:anywhere}
    .hub-tabs a span{display:block;font-size:1.15rem;line-height:1.25}
    .hub-tabs a.on{background:linear-gradient(135deg,#d48c80,#a8584c);color:#fff;font-weight:700;box-shadow:0 4px 12px rgba(168,88,76,.25)}
    .hub-tabs a i{position:absolute;top:2px;right:3px;font-style:normal;font-size:8.5px;font-weight:700;background:#2e7d4f;color:#fff;border-radius:50px;padding:0 .3rem;line-height:1.5}
    .hub-tabs a.on i{background:#fff;color:#a8584c}
    .hub-tabs.fx{margin:0;border-radius:0;border-width:0 0 1px;padding-top:calc(.4rem + env(safe-area-inset-top));flex:0 0 auto}
    html.night .hub-tabs{background:rgba(40,28,26,.85)}`;
    document.head.appendChild(css);
    const d = document.createElement('nav'); d.id = 'hub-tabs'; d.className = 'hub-tabs'; d.setAttribute('aria-label', G.t);
    d.innerHTML = `<div class="ht">${G.t}</div><div class="hr">${G.tabs.map(([id, e, n, sb]) => { const b = sb ? '' : badge(id), on = id === PAGE && (sb || '') === SUB; return `<a href="${id}.html${sb ? '?sub=' + sb : ''}" class="${on ? 'on' : ''}" ${on ? 'aria-current="page"' : ''}><span>${e}</span>${n}${b ? `<i>${b}</i>` : ''}</a>`; }).join('')}</div>`;
    d.querySelectorAll('a').forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); if (a.classList.contains('on')) return; const h = a.getAttribute('href'), m = /^([a-z0-9-]+)\.html(?:\?sub=([a-z0-9-]+))?$/.exec(h); if (m && m[1] === PAGE && window.Sub) { if (m[2]) Sub.open(m[2]); else Sub.close(); return; } location.replace(h); }));
    // halaman yang layarnya "fixed" penuh (ketemuan, tenangin diri) → tab masuk di atas bar-nya
    const fx = document.querySelector('body > .hub');
    if (fx && getComputedStyle(fx).position === 'fixed') {
      d.classList.add('fx'); fx.insertBefore(d, fx.firstChild);
      const bar = fx.querySelector('.bar'); if (bar) bar.style.paddingTop = '.45rem';
      return;
    }
    const vis = el => el && el.getClientRects().length > 0;
    const w0 = document.querySelector('.wrap'), w = vis(w0) ? w0 : document.body, top = w.querySelector(':scope > .top');
    if (top) top.insertAdjacentElement('afterend', d); else w.insertBefore(d, w.firstChild);
    // tombol "← Menu" yang nempel di pojok atas (absolute/fixed) jangan ketutupan strip → geser ke bawahnya
    const shift = () => { try { const sb = d.getBoundingClientRect().bottom + window.scrollY + 6, H = innerHeight; document.querySelectorAll('body *').forEach(el => { if (el === d || d.contains(el) || el.dataset.hubShift || el.closest('#sub-ov,.ov,.sheet,[role=dialog]')) return; const cs = getComputedStyle(el); const abs = cs.position === 'absolute' && (!el.offsetParent || el.offsetParent === document.body || el.offsetParent === document.documentElement); if (cs.position !== 'fixed' && !abs) return; const r = el.getBoundingClientRect(); if (!r.height || r.height > H * 0.4 || r.top > 120 || r.bottom <= 0 || r.top + window.scrollY >= sb) return; const t = parseFloat(cs.top); if (isNaN(t)) return; el.dataset.hubShift = 1; el.style.top = (t + sb - (r.top + window.scrollY)) + 'px'; }); } catch (e) {} };
    setTimeout(shift, 50);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
