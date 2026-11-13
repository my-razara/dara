/* ═══ 🌅 LAYAR PEMBUKA — dimuat langsung abis #s-welcome biar yang pertama keliatan udah layar baru ═══ */
(function () {
  const $ = id => document.getElementById(id);
  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const me = () => (window.Who && Who.me && Who.me()) || g('berdua-me', 'Dara');
  const other = () => me() === 'Razan' ? 'Dara' : 'Razan';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const vib = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  const JADIAN0 = new Date(2025, 4, 10);
  const hariKe = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((t - JADIAN0) / 864e5); };
  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const setTab = t => { try { window.__u2 && __u2.setTab(t); } catch (e) {} };
  function sapa() {
    const h = new Date().getHours();
    return h >= 4 && h < 10 ? ['Pagi', '🌷'] : h >= 10 && h < 15 ? ['Siang', '☀️'] : h >= 15 && h < 18 ? ['Sore', '🌇'] : ['Malem', '🌙'];
  }
  function photos() {
    let D = null, pw = null; try { D = JSON.parse(localStorage.getItem('mem-idx') || 'null'); pw = localStorage.getItem('mem-pw'); } catch (e) {}
    if (!D || !pw || !Array.isArray(D.albums)) return [];
    const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const cap = a => { if (!a) return 'momen random'; if (a.title || a.name) return a.title || a.name; const p = (a.date || '').split('-').map(Number); return p.length === 3 ? `${p[2]} ${BLN[p[1] - 1]} ${p[0]}` : 'kenangan kita'; };
    const pool = [];
    D.albums.forEach(a => (a.items || [{ id: a.cover, type: a.coverType || 'image' }]).forEach(it => { if (it && it.id && it.type === 'image') pool.push({ id: it.id, c: cap(a) }); }));
    ((D.random && D.random.items) || []).forEach(it => { if (it && it.type === 'image') pool.push({ id: it.id, c: 'momen random' }); });
    if (pool.length < 3) return [];
    const n = new Date(), seed = n.getFullYear() * 400 + n.getMonth() * 31 + n.getDate(), out = [], used = new Set();
    for (let k = 0; out.length < 3 && k < 40; k++) { const i = (seed * 9301 + 49297 + k * 7919) % 233280 % pool.length; if (!used.has(i)) { used.add(i); out.push(pool[i]); } }
    return out;
  }
  function pembuka() {
    const w = $('s-welcome'); if (!w) return;
    const night = document.documentElement.classList.contains('night'), [sp, se] = sapa(), who = me(), dara = who === 'Dara';
    let pet = null; try { pet = window.Pet && Pet.state(); } catch (e) {}
    const PE = pet ? (Pet.animal(pet.a) || {}).e : '🐱', PN = pet ? (pet.n || 'Miko') : '';
    const P = photos(), FB = [['🎞️', 'photobooth pertama', '#fde2c8,#f6b98f'], ['🦌', 'kandang rusa', '#d7ecd9,#9fcfa8'], ['🥟', 'dimsum pertama 🤍', '#fbd3df,#e98fa8']];
    const pol = (cls, i) => { const p = P[i], f = FB[i]; return `<div class="pb-pol ${cls}"><div class="ph" style="background:linear-gradient(135deg,${f[2]})">${p ? `<img alt="" data-id="${esc(p.id)}" src="https://lh3.googleusercontent.com/d/${esc(p.id)}=w400-rw">` : f[0]}</div><p>${esc(p ? p.c : f[1])}</p></div>`; };
    const line = night
      ? (dara ? 'Capek ya abis kerja? Istirahat yang cukup, terus <b>bobo yang nyenyak</b> 🤍' : `Udah malem. Jangan lupa ucapin <b>selamat bobo</b> buat ${other()} 🌙`)
      : sp === 'Pagi' ? (dara ? 'Semangat hari ini ya. Razan udah nitip <b>pesan hari ini</b> buat kamu 💌' : `Semangat hari ini! Jangan lupa sapa ${other()} ☀️`)
      : sp === 'Siang' ? (dara ? 'Jangan lupa <b>makan siang</b> sama minum air ya 🥤' : `Udah makan siang? Tanyain ${other()} juga ya 🍜`)
      : (dara ? 'Udah pulang? Istirahat bentar, terus <b>cerita-cerita</b> yuk 🤍' : `Sore! Cek kabar ${other()} di Kita 🤍`);
    const note = night
      ? `<a class="pb-note" href="tidur-kita.html"><span class="e">😴</span><span><b>Bobo &amp; Bangun</b><small>kasih tau ${other()} kamu mau bobo</small></span></a>`
      : `<button class="pb-note" data-go><span class="e">💌</span><span><b>Pesan hari ini dari ${dara ? 'Razan' : 'kamu buat Dara'}</b><small>tap buat baca</small></span></button>`;
    w.className = 'pb';
    w.innerHTML = `<div class="pb-moon"></div><div class="pb-brand">RAZARA</div>
      <div class="pb-stack ${night ? 'bed' : ''}">${pol('a', 0)}${pol('b', 1)}${pol('c', 2)}<div class="pb-bed"><b>💤</b><span>${PE}</span><i></i></div></div>
      <div class="pb-gt"><small>${HARI[new Date().getDay()]} · hari ke-${hariKe().toLocaleString('id-ID')}</small><h1>${sp}, <span>${who}</span> ${se}</h1><p>${line}</p></div>
      ${note}
      ${!night && pet ? `<div class="pb-bub">hai ${who}! 🐾</div><div class="pb-peek">${PE}</div>` : ''}
      <div class="pb-slide" id="pb-slide"><div class="pb-knob" id="pb-knob">${night ? '🌙' : '💗'}</div><p>Geser buat masuk<small>atau tap aja</small></p></div>`;
    w.querySelectorAll('.pb-pol img').forEach(im => { im.onload = () => im.classList.add('ok'); im.onerror = () => { if (!im.dataset.t) { im.dataset.t = 1; im.src = `https://drive.google.com/thumbnail?id=${im.dataset.id}&sz=w400`; } else im.remove(); }; });
    const go = () => { if (w.classList.contains('hide')) return; vib(15); try { window.enterApp(); } catch (e) { w.classList.add('hide'); } setTab('beranda'); setTimeout(sambutOnce, 700); };
    const nb = w.querySelector('[data-go]'); if (nb) nb.onclick = go;
    // geser buat masuk (tap juga bisa)
    const sl = $('pb-slide'), kn = $('pb-knob'); let x0 = null, dx = 0;
    sl.addEventListener('pointerdown', e => { x0 = e.clientX; dx = 0; sl.classList.add('drag'); try { sl.setPointerCapture(e.pointerId); } catch (er) {} });
    sl.addEventListener('pointermove', e => { if (x0 == null) return; dx = Math.max(0, Math.min(sl.clientWidth - kn.offsetWidth - 12, e.clientX - x0)); kn.style.transform = `translateX(${dx}px)`; });
    const up = () => { if (x0 == null) return; x0 = null; sl.classList.remove('drag'); const max = sl.clientWidth - kn.offsetWidth - 12; if (dx < 8 || dx > max * .6) { kn.style.transform = `translateX(${max}px)`; setTimeout(go, 120); } else kn.style.transform = ''; };
    sl.addEventListener('pointerup', up); sl.addEventListener('pointercancel', () => { x0 = null; sl.classList.remove('drag'); kn.style.transform = ''; });
  }
  // 💌 sambutan: kalimat lama Razan, muncul sekali + bisa dibuka lagi dari tab Kita
  function sambut() {
    const app = (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) || navigator.standalone === true;
    const o = document.createElement('div'); o.className = 'u2-sambut';
    o.innerHTML = `<div><small>✨ Selamat datang di</small><h2>${app ? 'Aplikasi' : 'Website'} Kesayangan Aku</h2><span class="nm">Dara Syifa Aulia 🌸</span>
      <p>Di sini ada semua yang aku buat khusus buat kamu — dari games, hadiah digital, sampai hal-hal kecil yang bikin aku inget kamu setiap hari.</p><i>— Dengan cinta, Razan 🤍</i><button>Masuk ke Dunia Kita 💝</button></div>`;
    o.onclick = e => { if (e.target === o || e.target.tagName === 'BUTTON') o.remove(); };
    document.body.appendChild(o);
  }
  function sambutOnce() { if (g('u2-sambut', 0)) return; sv('u2-sambut', Date.now()); sambut(); }

  window.Pembuka = { sapa, sambut, sambutOnce };
  pembuka();
})();
