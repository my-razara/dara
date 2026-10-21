/* ═══ Papan skor Razan vs Dara — nyatet siapa yang menang di tiap game, nyambung 2 HP ═══
   Cara kerja: pas layar hasil "Razan menang" / "Dara menang" muncul di halaman game, dicatet sekali.
   Main online (beda HP): tiap HP cuma nyatet kemenangannya sendiri biar ga dobel. Lawan komputer ga dihitung. */
(function () {
  if (window.Skor) return;
  const GAMES = ['misi-acak', 'ular-tangga', 'truth-or-dare', 'heart-catch', 'kartu-ngobrol', 'congklak', 'word-search', 'scramble-kata', 'balon-pompa', 'tebak-warna', 'tabletennis', 'panas-dingin', 'tarik-tambang', 'time-bomb', 'aku-belum-pernah', 'lanjut-cerita', 'cermin', 'tarik-pilihan', 'frekuensi', 'sambung-kata', 'bikin-ketawa', 'who-knows-me', 'aku-adalah', 'bunuh-serangga', 'masak-bareng', 'bangun-rumah', 'charades', 'memory-match', 'tebak-kenangan', 'puzzle-foto', 'tictactoe', 'empat-sejajar', 'perang-kapal', 'dam', 'aquarium', 'gartic-berdua', 'frog-battle', 'badminton', 'penalty', 'air-hockey', 'coin-drop', 'balance-beam', 'sort-blocks', 'bowling', 'archery', 'darts', 'titik-kotak', 'bolak-balik', 'susun-menara', 'terbang-bareng', 'dadu-lima', 'ambil-batang', 'mini-golf', 'pecah-bata', 'jejak-cahaya', 'ikutin-pola', 'dua-satu', 'potong-buah', 'lampu-mati', 'permata', 'satuin-hati', 'ulat-lapar', 'labirin-kejar', 'sapu-ranjau', 'sudoku-mini', 'ketuk-irama', 'ketik-cepat', 'balok-jatuh', 'tembak-permen', 'lompat-awan'];   // ← game baru tambahin namanya di sini
  const PAGE = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const s = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const me = () => (window.Who && Who.me && Who.me()) || (window.Berdua && Berdua.me()) || null;
  function ensureSync() { if (!window.Berdua && !document.querySelector('script[src="sync.js"]')) { const sc = document.createElement('script'); sc.src = 'sync.js'; document.head.appendChild(sc); } }

  function add(page, w) {
    const m = me(); if (!m || (w !== 'Razan' && w !== 'Dara')) return;
    const day = ymd(new Date()), k = 'skor-' + m, all = g(k, {}) || {}, row = Object.assign({ p: {}, h: [] }, all[day] || {});
    const c = row.p[page] || [0, 0]; c[w === 'Razan' ? 0 : 1]++; row.p[page] = c;
    row.h = (row.h || []).concat([[Date.now(), page, w === 'Razan' ? 'R' : 'D']]).slice(-20);
    if (window.Berdua) Berdua.put('skor', m, day, row); else { all[day] = row; s(k, all); }
  }

  // ── nonton layar hasil di halaman game ──
  const RX = /^[^A-Za-z]{0,6}(Razan|Dara|Kamu)(?: \(kamu\))?\s+(menang|juara)\b/i;
  function scan() {
    const W = innerWidth, H = innerHeight, hit = [];
    document.querySelectorAll('h1,h2,h3,h4,strong,b,p,div,span').forEach(el => {
      if (el.children.length > 3) return;
      const t = (el.innerText || '').trim(); if (t.length > 120 || !RX.test(t) || /ronde|babak|set ini|komputer/i.test(t)) return;
      if (el.closest('.tg-box,#tg-box,.tg-st,.rec,#rec,.hist,.history,[data-noskor]')) return;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) return;
      let e = el; while (e && e !== document.body) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .2) return; e = e.parentElement; }
      hit.push([RX.exec(t)[1], el]);
    });
    return hit[0] ? hit[0][1] && vsBot(hit[0][1]) ? 'BOT' : hit[0][0] : null;
  }
  // lawan komputer? (ga dihitung)
  function vsBot(el) {
    for (const v of ['BOT', 'bot', 'vsBot', 'VSBOT', 'cpu', 'CPU', 'vsCPU', 'AI']) { try { const x = (0, eval)(`typeof ${v} !== 'undefined' ? ${v} : undefined`); if (x) return true; } catch (e) {} }
    for (const v of ['MODE', 'mode', 'gameMode']) { try { const x = (0, eval)(`typeof ${v} !== 'undefined' ? ${v} : undefined`); if (typeof x === 'string' && /bot|cpu|komputer|ai|solo/i.test(x)) return true; } catch (e) {} }
    const box = el && el.closest('.ov,.overlay,.modal,.res,.result,.screen,.scr,[class*=res],[class*=end]');
    return !!(box && /komputer|🤖/i.test(box.innerText || ''));
  }
  let prev = null, armed = false, lastAt = 0, tmr = 0;
  function check() {
    const w = scan();
    if (w && w !== 'BOT' && !prev && armed && Date.now() - lastAt > 8000) {
      const online = window.Online && Online.on;
      let who = /kamu/i.test(w) ? (online ? me() : null) : (w[0].toUpperCase() + w.slice(1).toLowerCase());
      if (who && online && who !== me()) who = null;            // online: yang nyatet HP pemenangnya aja
      if (who) { add(PAGE, who); lastAt = Date.now(); }
    }
    prev = w;
  }
  function watch() {
    ensureSync();
    setTimeout(() => { prev = scan(); armed = true; }, 1500);   // yang udah keliatan pas buka halaman ga dihitung
    const mo = new MutationObserver(() => { clearTimeout(tmr); tmr = setTimeout(check, 350); });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'], characterData: true });
  }
  if (GAMES.includes(PAGE)) { if (document.body) watch(); else document.addEventListener('DOMContentLoaded', watch); }

  // ── 📊 hitung berapa kali tiap game / hadiah dibuka (buat tau mana yang beneran dimainin) ──
  const HADIAH = ['buku-harian', 'rekap-mingguan', 'liga-razara', 'kebiasaan-bareng', 'tidur-kita', 'ibadah-bareng', 'wrapped', 'kotak-surat', 'rating-ketemu', 'taman-bunga', 'period-tracker', 'kupon-maaf', 'kejutan-pesan', 'radio-razan', 'dna-hubungan', 'hal-kecil', 'polaroid-wall', 'moodboard-dara', 'playlist-dara', 'koran-dara', 'love-quest', 'kapsul-waktu', 'pertanyaan-harian', 'bucket-list', 'ketemuan', 'tombol-kangen', 'ramalan-tarot', 'hadiah-harian', 'kotak-musik', 'rapor-razan', 'kode-rahasia', 'kartu-ucapan', 'timeline-kita', 'tiup-lilin', 'lampion-harapan', 'pencapaian', 'photobooth', 'peta-bintang', 'peta-kenangan', 'gembok-cinta', 'teka-teki-surat', 'jendela-embun', 'tenangin-diri', 'kalender-mood', 'jurnal-syukur', 'stiker-wa', 'kartu-pacar', 'penghargaan', 'kalkulator-cinta', 'pop-it', 'mesin-terserah', 'mesin-gombal', 'bucket-bunga', 'kuis-kita', 'mind-reader', 'voucher-razan', 'origami-hati', 'resep-kita', 'piano-mini', 'gelang-manik', 'hias-kue', 'bikin-komik', 'masa-depan', 'kamus-kita', 'dandan-berdua', 'kaleidoskop', 'bioskop-kita', 'jarak-kita', 'rekam-suara', 'mewarnai', 'daftar-bareng', 'jaga-minum', 'janji-kita', 'kembang-api', 'stretching', 'ramuan-cinta', 'jadwal-kita', 'tantangan-mingguan', 'jadwal-mingguan', 'nonton-bareng', 'fokus-bareng'];
  (function count() {
    if (!PAGE || !(GAMES.includes(PAGE) || HADIAH.includes(PAGE))) return;
    if (sessionStorage.getItem('bk-' + PAGE)) return; try { sessionStorage.setItem('bk-' + PAGE, '1'); } catch (e) {}
    const m = me() || 'x', k = 'buka-' + m, all = g(k, {}) || {}, row = GAMES.includes(PAGE) ? '2000-01-01' : '2000-01-02';
    const r = Object.assign({}, all[row] || {}); r[PAGE] = (r[PAGE] || 0) + 1; if (!r._s) r._s = Date.now();
    all[row] = r; s(k, all); s('buka-dirty', 1);
  })();
  function opens() {
    const out = { g: {}, h: {}, since: 0 };
    ['Razan', 'Dara'].forEach(o => { const m = g('buka-' + o, {}) || {}; [['2000-01-01', 'g'], ['2000-01-02', 'h']].forEach(([d, t]) => Object.entries(m[d] || {}).forEach(([p, n]) => { if (p === '_s') { out.since = out.since ? Math.min(out.since, n) : n; return; } out[t][p] = (out[t][p] || 0) + n; })); });
    return out;
  }
  // dipanggil dari home: kirim hitungan HP ini biar ketauan dari 2 HP
  function syncOpens() { const m = me(); if (!m || !window.Berdua || !g('buka-dirty', 0)) return; const all = g('buka-' + m, {}) || {}; ['2000-01-01', '2000-01-02'].forEach(d => { if (all[d]) Berdua.put('buka', m, d, all[d]); }); s('buka-dirty', 0); }

  // ── buat home: total gabungan 2 HP ──
  function rows() { const out = []; ['Razan', 'Dara'].forEach(o => Object.entries(g('skor-' + o, {}) || {}).forEach(([d, r]) => { if (r && r.p) out.push([d, r]); })); return out; }
  function totals() {
    const now = new Date(), wk = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)), wkS = ymd(wk);
    const T = { R: 0, D: 0, wR: 0, wD: 0, games: {}, hist: [] };
    rows().forEach(([d, r]) => {
      Object.entries(r.p).forEach(([p, c]) => { T.R += c[0] || 0; T.D += c[1] || 0; if (d >= wkS) { T.wR += c[0] || 0; T.wD += c[1] || 0; } const G = T.games[p] || (T.games[p] = [0, 0]); G[0] += c[0] || 0; G[1] += c[1] || 0; });
      (r.h || []).forEach(x => T.hist.push(x));
    });
    T.hist.sort((a, b) => b[0] - a[0]);
    let st = 0, sw = T.hist[0] ? T.hist[0][2] : null; for (const x of T.hist) { if (x[2] === sw) st++; else break; }
    T.streak = sw ? { w: sw === 'R' ? 'Razan' : 'Dara', n: st } : null;
    return T;
  }
  window.Skor = { add, totals, GAMES, HADIAH, scan, opens, syncOpens };
})();
