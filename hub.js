/* ═══ 🗂️ HUB — beberapa halaman yang mirip dilebur jadi 1 fitur bertab.
   Tiap halaman di grup dapet strip tab di atas; pindah tab = pindah halaman (tanpa numpuk riwayat "back"). ═══ */
(function () {
  if (window.__hub) return; window.__hub = 1;
  const GROUPS = {
    jadwal: { t: '📅 Jadwal Kita', tabs: [['jadwal-kita', '📅', 'Kalender'], ['jadwal-mingguan', '🗓️', 'Mingguan'], ['ketemuan', '⏰', 'Hitung Mundur']] },
    mood: { t: '🌈 Mood & Hati', tabs: [['kalender-mood', '😊', 'Mood'], ['jurnal-syukur', '🙏', 'Syukur'], ['tidur-kita', '😴', 'Bobo'], ['tenangin-diri', '🌙', 'Tenangin']] },
    rutin: { t: '✅ Rutinitas Bareng', tabs: [['kebiasaan-bareng', '✅', 'Kebiasaan'], ['ibadah-bareng', '🕌', 'Ibadah'], ['fokus-bareng', '📚', 'Fokus']] }
  };
  const PAGE = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  let G = null; for (const k in GROUPS) if (GROUPS[k].tabs.some(x => x[0] === PAGE)) G = GROUPS[k];
  if (!G) return;
  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const pad = n => String(n).padStart(2, '0'), now = new Date(), today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const me = () => (window.Who && Who.me && Who.me()) || g('berdua-me', 'Dara');
  // tanda kecil di tab: ✓ udah diisi hari ini / H-n ketemu
  function badge(id) {
    try {
      if (id === 'kalender-mood') return (g('mood-' + me(), {}) || {})[today] ? '✓' : '';
      if (id === 'jurnal-syukur') { const v = (g('syukur-' + me(), {}) || {})[today]; return Array.isArray(v) && v.length ? '✓' : ''; }
      if (id === 'tidur-kita') { const r = g('tidur-' + me(), {}) || {}, h = now.getHours(), d0 = new Date(now); if (h < 12) d0.setDate(d0.getDate() - 1); const x = r[`${d0.getFullYear()}-${pad(d0.getMonth() + 1)}-${pad(d0.getDate())}`]; return x && x.b && !x.w ? '💤' : ''; }
      if (id === 'kebiasaan-bareng') { const L = {}; ['Razan', 'Dara'].forEach(w => (((g('habit-' + w, {}) || {})['2000-01-01'] || {}).list || []).forEach(h => { if (h && h.id && (!L[h.id] || (h.at || 0) > (L[h.id].at || 0))) L[h.id] = h; })); const m = me(), mine = Object.values(L).filter(h => !h.del && (h.who === 'both' || h.who === m)), dn = ((g('habitc-' + m, {}) || {})[today] || {}).ids || []; return mine.length ? (mine.every(h => dn.includes(h.id)) ? '✓' : dn.filter(i => mine.some(h => h.id === i)).length + '/' + mine.length) : ''; }
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
    d.innerHTML = `<div class="ht">${G.t}</div><div class="hr">${G.tabs.map(([id, e, n]) => { const b = badge(id); return `<a href="${id}.html" class="${id === PAGE ? 'on' : ''}" ${id === PAGE ? 'aria-current="page"' : ''}><span>${e}</span>${n}${b ? `<i>${b}</i>` : ''}</a>`; }).join('')}</div>`;
    d.querySelectorAll('a').forEach(a => a.addEventListener('click', ev => { if (a.classList.contains('on')) { ev.preventDefault(); return; } ev.preventDefault(); location.replace(a.getAttribute('href')); }));
    // halaman yang layarnya "fixed" penuh (ketemuan, tenangin diri) → tab masuk di atas bar-nya
    const fx = document.querySelector('body > .hub');
    if (fx && getComputedStyle(fx).position === 'fixed') {
      d.classList.add('fx'); fx.insertBefore(d, fx.firstChild);
      const bar = fx.querySelector('.bar'); if (bar) bar.style.paddingTop = '.45rem';
      return;
    }
    const w = document.querySelector('.wrap') || document.body, top = w.querySelector(':scope > .top');
    if (top) top.insertAdjacentElement('afterend', d); else w.insertBefore(d, w.firstChild);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
