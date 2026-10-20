/* ═══════════════════════════════════════════════════════════════
   SUARA RAZARA 🎵 — musik latar + efek suara buat semua halaman
   Semua suara dibikin langsung pakai Web Audio (tanpa file mp3),
   lagunya komposisi sendiri jadi aman dipakai.
   Tombol 🎵 di pojok kiri bawah: musik+efek → efek aja → bisu.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  if (window.SFX) return;
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  // ── halaman mana pakai musik apa ──
  const GAMES = 'rodasayang ular-tangga slot-cinta truth-or-dare heart-catch deep-talk  dadu-nasib 36-questions jar-of-questions satuin-hati ulat-lapar labirin-kejar sapu-ranjau sudoku-mini ketik-cepat balok-jatuh tembak-permen lompat-awan  word-search scramble-kata    balon-pompa tebak-warna tabletennis panas-dingin tarik-tambang time-bomb aku-belum-pernah lanjut-cerita  cermin tarik-pilihan frekuensi  sambung-kata bikin-ketawa who-knows-me aku-adalah bunuh-serangga masak-bareng bangun-rumah charades memory-match tebak-kenangan puzzle-foto tictactoe empat-sejajar perang-kapal dam congklak aquarium gartic-berdua frog-battle badminton penalty air-hockey coin-drop balance-beam sort-blocks   bowling archery darts'.split(' ');
  const CALM_GAMES = 'satuin-hati sapu-ranjau sudoku-mini labirin-kejar deep-talk 36-questions jar-of-questions  aku-belum-pernah lanjut-cerita cermin who-knows-me aku-adalah word-search scramble-kata  sort-blocks puzzle-foto tebak-kenangan memory-match congklak dam empat-sejajar'.split(' ');
  const NIGHT = 'lampion-harapan peta-bintang ramalan-cinta bintang-jatuh tarot-cinta cloud-wishes'.split(' ');
  // halaman yang udah punya suara sendiri / butuh hening → tanpa musik latar
  const NO_BGM = 'chat kotak-musik ketuk-irama pengantar-tidur tiup-lilin jendela-embun napas-bareng radio-razan playlist-dara photobooth memories keuangan-dara keuangan-razan period-tracker time-bomb     slot-cinta rodasayang truth-or-dare'.split(' ');
  // halaman yang tombolnya udah bunyi sendiri → ga usah bunyi "tik" tambahan
  const NO_TAP = 'pop-it kalkulator-cinta kotak-musik pengantar-tidur jendela-embun tiup-lilin napas-bareng   slot-cinta rodasayang  time-bomb truth-or-dare 36-questions jar-of-questions '.split(' ');
  const base = page.replace('.html', '');
  // window.__sfxTheme = tema khusus (misal hari spesial di menu utama)
  // halaman yang punya lagu khusus sendiri
  const SPECIAL = { 'birthday-scrapbook': 'ultah' };
  const pageTheme = NO_BGM.includes(base) ? null : SPECIAL[base] ? SPECIAL[base] : window.__sfxTheme ? window.__sfxTheme : NIGHT.includes(base) ? 'malam' : GAMES.includes(base) ? (CALM_GAMES.includes(base) ? 'santai' : 'main') : 'romantis';
  const tapOn = !NO_TAP.includes(base);
  // suasana: pilihan sendiri (menu 🎵) > hari spesial > musim (menu utama) > bawaan halaman
  const lsG = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } };
  const lsS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const HOME0 = base === 'index' || base === '';
  function pickTheme() {
    if (!pageTheme || (SPECIAL[base])) return pageTheme;
    const mood = lsG('sfx-mood', 'auto');
    if (mood !== 'auto') return mood;
    if (window.__sfxTheme) return window.__sfxTheme;
    if (HOME0 && window.Musim) { try { const m = Musim.now(); if (m) return m.mood; } catch (e) {} }
    return pageTheme;
  }
  let theme = pageTheme;

  // ── setelan (kesimpen di HP) ──
  let mode = 'all';
  try { mode = localStorage.getItem('sfx-mode') || 'all'; } catch (e) {}
  const saveMode = () => { try { localStorage.setItem('sfx-mode', mode); } catch (e) {} };

  let ac = null, out = null, bgmGain = null, sfxGain = null, rev = null;
  function ctx() {
    if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => {}); return ac; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    try { ac = new C(); } catch (e) { return null; }
    out = ac.createDynamicsCompressor(); out.threshold.value = -18;
    // suara digedein: penguat + pembatas biar ga pecah
    const boost = ac.createGain(); boost.gain.value = 1.6; const lim = ac.createDynamicsCompressor(); lim.threshold.value = -2; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = .002; lim.release.value = .12;
    out.connect(boost); boost.connect(lim); lim.connect(ac.destination);
    bgmGain = ac.createGain(); bgmGain.gain.value = 0; bgmGain.connect(out);
    sfxGain = ac.createGain(); sfxGain.gain.value = FXV(); sfxGain.connect(out);
    // gema tipis biar musiknya lebih lembut
    rev = ac.createDelay(1); rev.delayTime.value = .23; const fb = ac.createGain(); fb.gain.value = .28; const wet = ac.createGain(); wet.gain.value = .35; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
    rev.connect(lp); lp.connect(fb); fb.connect(rev); lp.connect(wet); wet.connect(bgmGain);
    return ac;
  }
  let BGV = (+lsG('sfx-vol', 75) || 0) / 50;    // keras musik latar (75% = 1.5)
  const FXV = () => (+lsG('sfx-fxvol', 80) || 0) / 100;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  // ── alat musik ──
  function tone(dest, f, t, dur, vol, type = 'sine', attack = .005, sendRev = false) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(dest); if (sendRev && rev) g.connect(rev); o.start(t); o.stop(t + dur + .05);
  }
  function bell(f, t, vol, dur = 1.4) { tone(bgmGain, f, t, dur, vol, 'sine', .004, true); tone(bgmGain, f * 3.01, t, dur * .35, vol * .18, 'sine', .002, true); }
  function pluck(f, t, vol, dur = .35) {
    const o = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'triangle'; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.setValueAtTime(f * 6, t); fl.frequency.exponentialRampToValueAtTime(f * 1.2, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(fl); fl.connect(g); g.connect(bgmGain); g.connect(rev); o.start(t); o.stop(t + dur + .05);
  }
  function bass(f, t, vol, dur) { tone(bgmGain, f, t, dur, vol, 'sine', .01); tone(bgmGain, f * 2, t, dur * .5, vol * .15, 'triangle', .01); }
  function pad(fs, t, dur, vol) { fs.forEach(f => { const o = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = (Math.random() - .5) * 14; fl.type = 'lowpass'; fl.frequency.value = 900; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * .4); g.gain.linearRampToValueAtTime(0, t + dur); o.connect(fl); fl.connect(g); g.connect(bgmGain); o.start(t); o.stop(t + dur + .05); }); }
  function marimba(f, t, vol) { tone(bgmGain, f, t, .5, vol, 'sine', .002, true); tone(bgmGain, f * 4, t, .07, vol * .35, 'sine', .001); }
  function kalimba(f, t, vol) { tone(bgmGain, f, t, 1.1, vol, 'sine', .002, true); tone(bgmGain, f * 5.4, t, .14, vol * .22, 'sine', .001); tone(bgmGain, f * 2.01, t, .4, vol * .12, 'triangle', .002); }
  function musicbox(f, t, vol) { tone(bgmGain, f, t, 1.7, vol * .9, 'sine', .002, true); tone(bgmGain, f * 2, t, .9, vol * .3, 'sine', .002, true); tone(bgmGain, f * 3.98, t, .25, vol * .12, 'sine', .001); }
  function flute(f, t, vol, dur) {
    const o = ac.createOscillator(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
    o.type = 'triangle'; o.frequency.value = f; lfo.frequency.value = 5.2; lg.gain.value = f * .006; lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .06); g.gain.setValueAtTime(vol, t + Math.max(.07, dur * .6)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(bgmGain); g.connect(rev); o.start(t); lfo.start(t); o.stop(t + dur + .05); lfo.stop(t + dur + .05);
  }
  function inst(k, f, t, vol, dur) { if (k === 'pluck') pluck(f, t, vol); else if (k === 'marimba') marimba(f, t, vol); else if (k === 'kalimba') kalimba(f, t, vol); else if (k === 'musicbox') musicbox(f, t, vol); else if (k === 'flute') flute(f, t, vol * .8, dur || .5); else bell(f, t, vol, dur && dur > 1.4 ? dur : 1.4); }
  function clap(t, vol) { if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate * .05, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); } const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; fl.type = 'bandpass'; fl.frequency.value = 1500; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .12); s.connect(fl); fl.connect(g); g.connect(bgmGain); s.start(t); s.stop(t + .15); }
  let noiseBuf = null;
  function hat(t, vol) { if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate * .05, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); } const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = 7000; g.gain.value = vol; s.connect(f); f.connect(g); g.connect(bgmGain); s.start(t); }
  function kick(t, vol) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(45, t + .12); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .18); o.connect(g); g.connect(bgmGain); o.start(t); o.stop(t + .2); }

  // ── lagu (komposisi sendiri: akor + arpeggio + melodi acak yang tetap enak) ──
  // akor ditulis sebagai nada MIDI (root, ters, kuin, + opsional)
  const C = [60, 64, 67], G = [55, 59, 62], Am = [57, 60, 64], F = [53, 57, 60], Em = [52, 55, 59], Dm = [50, 53, 57], Fmaj7 = [53, 57, 60, 64], Cadd9 = [60, 62, 64, 67];
  const SONGS = {
    main:     { bpm: 112, progs: [[C, G, Am, F], [F, G, Em, Am], [C, Am, F, G]], arp: [0, 1, 2, 1, 0, 2, 1, 2], oct: 12, lead: .3, drums: true, inst: 'pluck', vol: .13 },
    santai:   { bpm: 88, progs: [[Fmaj7, Em, Am, G], [C, Am, Dm, G]], arp: [0, 2, 1, 3, 2, 1, 0, 2], oct: 12, lead: .2, drums: false, inst: 'pluck', vol: .11 },
    romantis: { bpm: 76, progs: [[C, Am, F, G], [F, G, Em, Am], [Fmaj7, G, Cadd9, Am]], arp: [0, 1, 2, 3, 2, 1, 2, 1], oct: 12, lead: .25, drums: false, inst: 'bell', vol: .1 },
    pesta:    { bpm: 118, progs: [[C, F, G, C], [Am, F, C, G], [F, G, Em, Am]], arp: [0, 1, 2, 3, 2, 1, 2, 3], oct: 12, lead: .45, drums: true, inst: 'bell', vol: .11 },
    // kotak musik "Selamat Ulang Tahun" (melodi tradisional, domain publik) + jeda arpeggio lembut
    ultah:    { bpm: 84, progs: [[C, Am, F, G], [Fmaj7, G, Cadd9, Am]], arp: [0, 1, 2, 3, 2, 1, 2, 1], oct: 12, lead: 0, drums: false, inst: 'bell', vol: .1,
      // [nada MIDI, panjang dalam ketukan, akor]
      seq: [[67, .75, C], [67, .25, C], [69, 1, F], [67, 1, C], [72, 1, C], [71, 2, G],
            [67, .75, G], [67, .25, G], [69, 1, G], [67, 1, G], [74, 1, G], [72, 2, C],
            [67, .75, C], [67, .25, C], [79, 1, C], [76, 1, C], [72, 1, F], [71, 1, F], [69, 2, F],
            [77, .75, F], [77, .25, F], [76, 1, C], [72, 1, C], [74, 1, G], [72, 3, C]], rest: 16 },
    malam:    { bpm: 60, progs: [[Am, F, C, G], [Dm, Am, F, Em]], arp: [0, 2, 1, 2, 0, 2, 1, 2], oct: 24, lead: .15, drums: false, inst: 'bell', vol: .09, pad: true },
  };
  const PENTA = [0, 2, 4, 7, 9];

  // ═════ PENCIPTA LAGU — tiap halaman dapet lagu sendiri (diracik dari nama halamannya) ═════
  const MAJ = [0, 2, 4, 5, 7, 9, 11];
  const PROGS = [[1, 5, 6, 4], [1, 6, 4, 5], [6, 4, 1, 5], [4, 5, 3, 6], [1, 4, 6, 5], [2, 5, 1, 6], [1, 3, 4, 5], [4, 1, 5, 6], [6, 5, 4, 5], [1, 5, 4, 4], [1, 6, 2, 5], [4, 5, 6, 6], [1, 4, 1, 5], [6, 2, 5, 1]];
  const ARPS = [[0, 1, 2, 1, 0, 2, 1, 2], [0, 2, 1, 3, 2, 1, 0, 2], [0, 1, 2, 3, 2, 1, 2, 1], [0, -1, 2, 1, 3, -1, 2, 1], [0, 2, 3, 2, 1, 2, 3, 2], [3, 2, 1, 0, 1, 2, 3, 2], [0, 1, 0, 2, 0, 3, 0, 2], [0, -1, 1, -1, 2, -1, 3, -1], [2, 1, 0, 1, 2, 3, 2, 1], [0, 3, 1, 3, 2, 3, 1, 3]];
  const RHY = [[1, 0, 1, 0, 1, 0, 0, 0], [1, 0, 0, 1, 0, 0, 1, 0], [1, 1, 1, 0, 1, 0, 0, 0], [1, 0, 1, 1, 0, 0, 1, 0], [0, 0, 1, 0, 1, 0, 1, 0], [1, 0, 0, 0, 1, 1, 1, 0], [1, 0, 1, 0, 1, 0, 1, 0], [1, 0, 0, 0, 0, 0, 1, 0]];
  const MOOD = {
    main:     { bpm: [100, 126], insts: ['pluck', 'marimba', 'kalimba', 'pluck'], leads: ['bell', 'flute', 'marimba'], drums: ['beat', 'beat', 'clap', 'shaker'], lead: [.6, .85], sev: .15, vol: .13 },
    pesta:    { bpm: [110, 126], insts: ['pluck', 'marimba', 'bell'], leads: ['bell', 'flute'], drums: ['beat', 'clap'], lead: [.7, .9], sev: .1, vol: .12 },
    santai:   { bpm: [78, 96], insts: ['kalimba', 'pluck', 'marimba', 'musicbox'], leads: ['flute', 'bell', 'kalimba'], drums: ['none', 'none', 'shaker'], lead: [.45, .7], sev: .5, vol: .11 },
    romantis: { bpm: [64, 84], insts: ['bell', 'musicbox', 'kalimba', 'pluck'], leads: ['flute', 'bell', 'musicbox'], drums: ['none'], lead: [.45, .7], sev: .6, vol: .1 },
    malam:    { bpm: [52, 66], insts: ['bell', 'kalimba', 'musicbox'], leads: ['flute', 'bell'], drums: ['none'], lead: [.3, .5], sev: .7, vol: .09, pad: true },
    liburan:  { bpm: [96, 112], insts: ['musicbox', 'bell', 'kalimba'], leads: ['bell', 'flute'], drums: ['shaker'], lead: [.6, .8], sev: .3, vol: .11 },
    valentine:{ bpm: [68, 82], insts: ['musicbox', 'bell'], leads: ['flute', 'bell'], drums: ['none'], lead: [.5, .7], sev: .7, vol: .1 },
    ramadan:  { bpm: [58, 70], insts: ['kalimba', 'musicbox'], leads: ['flute'], drums: ['none'], lead: [.4, .6], sev: .5, vol: .1, pad: true },
    lebaran:  { bpm: [96, 110], insts: ['marimba', 'kalimba'], leads: ['flute', 'bell'], drums: ['clap', 'shaker'], lead: [.6, .8], sev: .2, vol: .12 },
    merdeka:  { bpm: [110, 124], insts: ['pluck', 'marimba'], leads: ['flute', 'bell'], drums: ['beat'], lead: [.7, .9], sev: .1, vol: .12 },
  };
  const T1 = ['Senja', 'Hujan', 'Pagi', 'Rindu', 'Bintang', 'Kopi', 'Langit', 'Jalan', 'Pelukan', 'Bunga', 'Awan', 'Pelangi', 'Mimpi', 'Lampu', 'Surat', 'Teh', 'Bulan', 'Laut', 'Sepeda', 'Payung', 'Kereta', 'Es Krim', 'Kunang', 'Daun'];
  const T2 = ['Hangat', 'Berdua', 'Manis', 'di Jendela', 'Sore', 'Biru', 'Pelan-pelan', 'Kecil', 'Malam', 'Pertama', 'Lucu', 'Pink', 'di Kota', 'Minggu', 'Bahagia', 'Kita', 'Jauh', 'Pulang', 'Rahasia', 'Ceria', 'Lagi', 'Selamanya', 'di Taman', 'Kesayangan'];
  function rngOf(str) { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } let a = h >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function compose(th, seed) {
    const M = MOOD[th] || MOOD.romantis, r = rngOf(th + '|' + seed), pick = a => a[Math.floor(r() * a.length)], rin = (a, b) => a + r() * (b - a);
    const key = Math.floor(r() * 12) - 5, bpm = Math.round(rin(M.bpm[0], M.bpm[1]));
    const chordOf = deg => { const i = deg - 1, sev = r() < M.sev, n = [0, 2, 4].concat(sev ? [6] : []).map(k => 60 + key + MAJ[(i + k) % 7] + 12 * Math.floor((i + k) / 7)); while (n[0] > 64) n.forEach((x, j) => n[j] -= 12); while (n[0] < 52) n.forEach((x, j) => n[j] += 12); return n; };
    const pA = pick(PROGS).map(chordOf); let pB = pick(PROGS).map(chordOf);
    const scale = []; for (let m = 62; m <= 86; m++) if (MAJ.includes(((m - 60 - key) % 12 + 12) % 12)) scale.push(m);
    // melodi: 4 birama per bagian, nempel ke nada akor di ketukan kuat
    function phrase(prog) {
      let cur = scale[Math.floor(scale.length * .45)]; const out = [];
      for (let b = 0; b < 4; b++) {
        const rh = pick(RHY), ch = prog[b].map(x => x % 12), bar = [];
        for (let st = 0; st < 8; st++) {
          if (!rh[st]) { bar.push(null); continue; }
          const strong = st % 4 === 0, cand = scale.filter(m => Math.abs(m - cur) <= (strong ? 5 : 3) && (!strong || ch.includes(m % 12)));
          cur = cand.length ? pick(cand) : cur; if (b === 3 && st >= 4) { const end = scale.filter(m => m % 12 === ch[0] && Math.abs(m - cur) <= 7); if (end.length) cur = end[0]; }
          let len = 1; while (st + len < 8 && !rh[st + len]) len++; bar.push([cur, len]);
        }
        out.push(bar);
      }
      return out;
    }
    const mA = phrase(pA), mB = phrase(pB), mA2 = mA.map((bar, b) => b < 2 ? bar : bar.map(x => x && r() < .3 ? [scale[Math.max(0, scale.indexOf(x[0]) + (r() < .5 ? -1 : 1))] || x[0], x[1]] : x));
    const rn = rngOf('judul|' + seed), name = `${T1[Math.floor(rn() * T1.length)]} ${T2[Math.floor(rn() * T2.length)]}`;
    return { name, bpm, inst: pick(M.insts), leadI: pick(M.leads), drums: pick(M.drums), arp: pick(ARPS), arp2: pick(ARPS), lead: rin(M.lead[0], M.lead[1]), vol: M.vol, pad: !!M.pad, oct: th === 'malam' ? 24 : 12,
      bassP: pick([[0], [0, 4], [0, 3, 6], [0, 6], [0, 2, 4, 6]]),
      parts: [[pA, mA, 'arp'], [pA, mA2, 'arp'], [pB, mB, 'arp2'], [pA, mA, 'arp']] };
  }
  let SONG = null, songSeed = null;
  let playing = false, nextT = 0, step = 0, bar = 0, prog = 0, timer = 0, leadNote = 72;
  let seqI = 0, seqRest = 0;
  function scheduleSeq(S) {
    const beat = 60 / S.bpm;
    while (nextT < ac.currentTime + .3) {
      if (seqRest > 0) {                        // jeda: arpeggio pelan sebelum lagunya diulang
        const chord = S.progs[0][Math.floor((S.rest - seqRest) / 4) % 4], n = chord[(S.rest - seqRest) % chord.length] + 12;
        bell(mtof(n), nextT, S.vol * .55, 1.6); if ((S.rest - seqRest) % 4 === 0) bass(mtof(chord[0] - 12), nextT, S.vol * 1.2, beat * 3.5);
        nextT += beat; seqRest--; continue;
      }
      const [n, len, chord] = S.seq[seqI];
      bell(mtof(n), nextT, S.vol * 1.15, Math.max(1.2, len * beat * 1.6)); tone(bgmGain, mtof(n + 12), nextT, .35, S.vol * .12, 'sine', .002, true);
      if (seqI === 0 || S.seq[seqI - 1][2] !== chord || len >= 2) { bass(mtof(chord[0] - 12), nextT, S.vol * 1.3, len * beat * 1.8); chord.slice(1).forEach((c, k) => bell(mtof(c), nextT + .06 * (k + 1), S.vol * .32, 1.6)); }
      nextT += len * beat; seqI++;
      if (seqI >= S.seq.length) { seqI = 0; seqRest = S.rest; }
    }
    timer = setTimeout(schedule, 60);
  }
  function schedule() {
    if (!playing) return;
    const S = SONGS[theme] && SONGS[theme].seq ? SONGS[theme] : null;
    if (!S && !SONG) return;
    if (S) return scheduleSeq(S);
    if (SONG) return scheduleSong();
    return;
  }
  function scheduleSong() {
    const S = SONG, sp = 60 / S.bpm / 2;
    while (nextT < ac.currentTime + .25) {
      const part = S.parts[Math.floor(bar / 4) % S.parts.length], b = bar % 4, st = step % 8, chord = part[0][b], arp = S[part[2]];
      const notes = chord.concat(chord.length < 4 ? [chord[0] + 12] : []), ai = arp[st];
      if (ai >= 0) inst(S.inst, mtof(notes[ai % notes.length] + S.oct), nextT, S.vol * (st === 0 ? .85 : .6), S.bpm < 70 ? 2 : 1.4);
      if (S.bassP.includes(st)) bass(mtof(chord[0] - 12 + (st === 4 && S.bassP.length > 2 ? 7 : 0)), nextT, S.vol * (st === 0 ? 1.6 : 1.1), sp * (st === 0 ? 6 : 3));
      if (S.pad && st === 0) pad(chord.map(mtof), nextT, sp * 8, S.vol * .25);
      if (S.drums === 'beat') { if (st === 0 || st === 4) kick(nextT, S.vol * 2.1); if (st % 2 === 1) hat(nextT, S.vol * .45); }
      else if (S.drums === 'clap') { if (st === 0) kick(nextT, S.vol * 2.1); if (st === 4) clap(nextT, S.vol * 1.4); if (st % 2 === 1) hat(nextT, S.vol * .35); }
      else if (S.drums === 'shaker') hat(nextT, S.vol * (st % 2 ? .35 : .2));
      const m = part[1][b][st];
      if (m) inst(S.leadI, mtof(m[0] + (S.oct > 12 ? 12 : 0)), nextT + .01, S.vol * .62, Math.max(.35, m[1] * sp * 1.6));
      nextT += sp; step++;
      if (step % 8 === 0) bar++;
    }
    timer = setTimeout(schedule, 60);
  }
  function scheduleOld() {
    const S = SONGS[theme], sp = 60 / S.bpm / 2;
    while (nextT < ac.currentTime + .25) {
      const chord = S.progs[prog][bar % 4], st = step % 8;
      const notes = chord.concat(chord.length < 4 ? [chord[0] + 12] : []);
      const n = notes[S.arp[st] % notes.length] + S.oct;
      if (S.inst === 'bell') bell(mtof(n), nextT, S.vol * (st === 0 ? 1 : .75), S.bpm < 70 ? 2 : 1.4);
      else pluck(mtof(n), nextT, S.vol * (st % 2 ? .7 : 1));
      if (st === 0) bass(mtof(chord[0] - 12), nextT, S.vol * 1.6, sp * 7);
      if (st === 4 && S.bpm > 80) bass(mtof(chord[0] - 12), nextT, S.vol * 1.1, sp * 3);
      if (S.pad && st === 0) pad(chord.map(mtof), nextT, sp * 8, S.vol * .25);
      if (S.drums) { if (st === 0 || st === 4) kick(nextT, S.vol * 2.2); if (st % 2 === 1) hat(nextT, S.vol * .45); }
      // melodi: jalan-jalan di tangga nada pentatonik, nempel ke nada akor
      if (Math.random() < S.lead && st % 2 === 0) {
        const opts = []; for (let o = 72; o <= 86; o++) if (PENTA.includes(o % 12) || chord.some(c => c % 12 === o % 12)) opts.push(o);
        const near = opts.filter(o => Math.abs(o - leadNote) <= 4 && o !== leadNote); leadNote = near.length ? near[Math.floor(Math.random() * near.length)] : 76;
        bell(mtof(leadNote + (S.oct > 12 ? 12 : 0)), nextT + .01, S.vol * .55, 1.2);
      }
      nextT += sp; step++;
      if (step % 8 === 0) { bar++; if (bar % 8 === 0) prog = (prog + 1) % S.progs.length; }
    }
    timer = setTimeout(schedule, 60);
  }
  // menu utama: tiap dibuka lagunya ganti (biar ada variasi); halaman lain: lagunya tetap, khas halaman itu
  const HOME = base === 'index' || base === '';
  function newSong(seed) {
    theme = pickTheme();
    if (!theme || (SONGS[theme] && SONGS[theme].seq)) { SONG = null; return; }
    const id = /^(srcdoc|blank|)$/.test(base) ? (document.title || base) : base;
    songSeed = seed != null ? seed : HOME ? 'home-' + Math.floor(Math.random() * 1e6) : id;
    const ov = (() => { try { return (JSON.parse(localStorage.getItem('sfx-song') || '{}') || {})[id]; } catch (e) { return null; } })();
    if (seed == null && !HOME && ov) songSeed = ov;
    if (seed == null && HOME && lsG('sfx-home-mode', 'acak') === 'fav' && lsG('sfx-home-fav', '')) songSeed = lsG('sfx-home-fav', '');
    SONG = compose(theme, songSeed);
  }
  newSong();
  function startBgm() {
    if (!theme || mode !== 'all' || playing || !ctx()) return;
    playing = true; nextT = ac.currentTime + .1; step = 0; bar = 0; seqI = 0; seqRest = 0; prog = Math.floor(Math.random() * (SONGS[theme] || SONGS.romantis).progs.length);
    bgmGain.gain.cancelScheduledValues(ac.currentTime); bgmGain.gain.setValueAtTime(bgmGain.gain.value, ac.currentTime); bgmGain.gain.linearRampToValueAtTime(BGV, ac.currentTime + 2.5);
    schedule();
  }
  function stopBgm(fast) {
    if (!playing) return; playing = false; clearTimeout(timer);
    if (ac) { bgmGain.gain.cancelScheduledValues(ac.currentTime); bgmGain.gain.setValueAtTime(bgmGain.gain.value, ac.currentTime); bgmGain.gain.linearRampToValueAtTime(0, ac.currentTime + (fast ? .2 : .8)); }
  }

  // ── efek suara ──
  const FX = {
    tap: t => tone(sfxGain, 880, t, .06, .12, 'sine', .002),
    open: t => { tone(sfxGain, 660, t, .25, .16, 'sine'); tone(sfxGain, 990, t + .07, .3, .14, 'sine'); },
    toast: t => tone(sfxGain, 1320, t, .12, .08, 'sine'),
    win: t => [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => { tone(sfxGain, f, t + i * .09, .9, .2, 'triangle'); tone(sfxGain, f * 2, t + i * .09, .4, .05, 'sine'); }),
    coin: t => { tone(sfxGain, 988, t, .08, .18, 'square'); tone(sfxGain, 1319, t + .07, .35, .16, 'square'); },
    pop: t => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(300, t + .08); g.gain.setValueAtTime(.25, t); g.gain.exponentialRampToValueAtTime(.001, t + .1); o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + .12); },
    lose: t => [392, 349.23, 311.13].forEach((f, i) => tone(sfxGain, f, t + i * .16, .4, .15, 'triangle')),
    seed: t => { tone(sfxGain, 1500 + Math.random() * 400, t, .05, .14, 'triangle', .001); tone(sfxGain, 420, t, .06, .1, 'sine', .001); },
    boom: t => { const n = ac.createBufferSource(), b = ac.createBuffer(1, ac.sampleRate * .6, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2); n.buffer = b; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(1800, t); f.frequency.exponentialRampToValueAtTime(120, t + .5); const g = ac.createGain(); g.gain.value = .6; n.connect(f); f.connect(g); g.connect(sfxGain); n.start(t); const o = ac.createOscillator(), og = ac.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(35, t + .4); og.gain.setValueAtTime(.4, t); og.gain.exponentialRampToValueAtTime(.001, t + .45); o.connect(og); og.connect(sfxGain); o.start(t); o.stop(t + .5); },
    splash: t => { const n = ac.createBufferSource(), b = ac.createBuffer(1, ac.sampleRate * .45, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * Math.min(1, i / d.length * 3)) * (1 - i / d.length); n.buffer = b; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(2500, t); f.frequency.exponentialRampToValueAtTime(700, t + .4); f.Q.value = .8; const g = ac.createGain(); g.gain.value = .35; n.connect(f); f.connect(g); g.connect(sfxGain); n.start(t); },
    whoosh: t => { const n = ac.createBufferSource(), b = ac.createBuffer(1, ac.sampleRate * .3, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / d.length); n.buffer = b; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(2500, t + .3); const g = ac.createGain(); g.gain.value = .25; n.connect(f); f.connect(g); g.connect(sfxGain); n.start(t); },
  };
  let last = {};
  function play(name) {
    if (mode === 'off' || !FX[name] || !ctx()) return;
    const now = ac.currentTime; if (last[name] && now - last[name] < (name === 'win' ? 1.6 : .05)) return; last[name] = now;
    try { FX[name](now + .005); } catch (e) {}
    if (name === 'win' && playing) { bgmGain.gain.cancelScheduledValues(now); bgmGain.gain.setValueAtTime(bgmGain.gain.value, now); bgmGain.gain.linearRampToValueAtTime(.25, now + .1); bgmGain.gain.linearRampToValueAtTime(BGV, now + 2.2); }
  }

  // ── kalau ada bar/tombol penting nempel di bawah layar, tombol melayang naik ke atasnya (biar ga nutupin) ──
  function barH(doc, win, dx, dy, W, H) {
    let best = 0;
    try {
      const els = doc.body ? doc.body.querySelectorAll('*') : [];
      for (const el of els) {
        if (el.classList && (el.classList.contains('sfx-btn') || el.classList.contains('cfab') || el.classList.contains('sfx-tip') || el.id === 'olc-fab')) continue;
        const cs = win.getComputedStyle(el); if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .1) continue;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
        const top = r.top + dy, bot = r.bottom + dy, w = r.width;
        if (bot < H - 6 || bot > H + 30 || w < W * .55 || r.height > H * .45 || r.height < 24) continue;
        best = Math.max(best, H - top);
      }
    } catch (e) {}
    return best;
  }

  // ── tombol 🎵 ──
  const ICON = { all: '🎵', fx: '🔔', off: '🔇' }, LABEL = { all: 'Musik & efek suara nyala', fx: 'Efek suara aja (musik mati)', off: 'Semua suara mati' };
  let btn = null;
  function addButton() {
  // ── ✋ tombol melayang bisa digeser ke mana aja (posisinya diinget di HP ini) ──
  window.__fabDrag = window.__fabDrag || function (btn, key, hooks) {
    hooks = hooks || {};
    btn.style.touchAction = 'none';
    const W = () => innerWidth, H = () => innerHeight;
    function place(x, y, save) {
      const w = btn.offsetWidth || 48, h = btn.offsetHeight || 48;
      x = Math.max(4, Math.min(W() - w - 4, x)); y = Math.max(4, Math.min(H() - h - 4, y));
      btn.style.setProperty('left', x + 'px', 'important'); btn.style.setProperty('top', y + 'px', 'important');
      btn.style.setProperty('right', 'auto', 'important'); btn.style.setProperty('bottom', 'auto', 'important');
      btn.dataset.moved = '1'; btn.classList.remove('mini');
      if (save) { try { localStorage.setItem(key, JSON.stringify({ fx: x / Math.max(1, W() - w), fy: y / Math.max(1, H() - h) })); } catch (e) {} }
      if (hooks.moved) hooks.moved(x, y);
    }
    function restore() { try { const p = JSON.parse(localStorage.getItem(key)); if (p && p.fx != null) { const w = btn.offsetWidth || 48, h = btn.offsetHeight || 48; place(p.fx * (W() - w), p.fy * (H() - h), false); } } catch (e) {} }
    let sx = null, sy = 0, ox = 0, oy = 0, drag = false, pid = null, last = 0;
    btn.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; const r = btn.getBoundingClientRect(); ox = sx - r.left; oy = sy - r.top; drag = false; pid = e.pointerId; try { btn.setPointerCapture(pid); } catch (er) {} });
    btn.addEventListener('pointermove', e => {
      if (sx == null || e.pointerId !== pid) return;
      if (!drag) { if (Math.hypot(e.clientX - sx, e.clientY - sy) < 10) return; drag = true; try { btn.setPointerCapture(pid); } catch (er) {} if (hooks.start) hooks.start(); btn.style.transition = 'none'; }
      e.preventDefault(); place(e.clientX - ox, e.clientY - oy, false);
    });
    const end = () => { if (drag) { const r = btn.getBoundingClientRect(); place(r.left, r.top, true); last = Date.now(); btn.style.transition = ''; try { navigator.vibrate && navigator.vibrate(10); } catch (er) {} } sx = null; drag = false; };
    btn.addEventListener('pointerup', end); btn.addEventListener('pointercancel', end);
    btn.addEventListener('click', e => { if (Date.now() - last < 450) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
    if (document.readyState === 'complete') restore(); else addEventListener('load', restore);
    restore(); addEventListener('resize', () => { if (btn.dataset.moved) restore(); });
  };
  // lagi di dalam game → tombol melayang ngumpet biar ga ganggu pencetan
  window.__inGame = window.__inGame || function () { const P = (location.pathname.split('/').pop() || '').replace(/\.html$/, ''); return !!(window.Skor && Skor.GAMES && Skor.GAMES.includes(P)); };
    const css = document.createElement('style');
    css.textContent = `.sfx-btn{position:fixed;left:12px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:9000;width:48px;height:48px;border-radius:50%;border:1px solid rgba(193,122,111,.25);background:rgba(255,255,255,.96);box-shadow:0 4px 14px rgba(0,0,0,.14);font-size:21px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;-webkit-tap-highlight-color:transparent;opacity:.85;transition:transform .15s}
    .sfx-btn:active{transform:scale(.9)}
    .sfx-btn.mini{transform:translateX(-45%) scale(.9);opacity:.55;transition:transform .35s,opacity .35s}
    .sfx-btn.pulse{animation:sfxP 1.2s ease 2}
    @keyframes sfxP{50%{transform:scale(1.18)}}
    .sfx-tip{position:fixed;left:70px;bottom:calc(22px + env(safe-area-inset-bottom));z-index:9000;background:#2d1f1a;color:#fff;font:500 12px Poppins,system-ui,sans-serif;padding:.45rem .8rem;border-radius:50px;opacity:0;transition:opacity .3s;pointer-events:none;max-width:calc(100vw - 80px)}
    .sfx-tip.show{opacity:1}`;
    document.head.appendChild(css);
    btn = document.createElement('button'); btn.className = 'sfx-btn'; btn.type = 'button'; btn.setAttribute('aria-label', 'Atur suara'); btn.dataset.sfxSkip = '1';
    const tip = document.createElement('div'); tip.className = 'sfx-tip';
    const paint = () => { btn.textContent = !theme && mode === 'all' ? '🔔' : ICON[mode]; };
    let tipT;
    const say = t => { tip.textContent = t; tip.classList.add('show'); clearTimeout(tipT); tipT = setTimeout(() => tip.classList.remove('show'), 2200); };
    // biar ga ganggu main: abis beberapa detik tombolnya ngumpet ke pinggir, tap sekali buat munculin
    let miniT; const shrink = () => { clearTimeout(miniT); miniT = setTimeout(() => { if (!btn.dataset.moved) btn.classList.add('mini'); }, 3500); };
    // tahan lama → ganti lagu
    let lpT = 0, lpDone = false;
    btn.addEventListener('pointerdown', () => { lpDone = false; clearTimeout(lpT); lpT = setTimeout(() => { lpDone = true; nextSong(); }, 550); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(k => btn.addEventListener(k, () => clearTimeout(lpT)));
    btn.addEventListener('contextmenu', e => e.preventDefault());
    function nextSong() {
      if (!theme || !SONG) { say('Halaman ini lagunya khusus 🎶'); return; }
      try { navigator.vibrate && navigator.vibrate(20); } catch (e) {}
      const id = /^(srcdoc|blank|)$/.test(base) ? (document.title || base) : base, seed = id + '-' + Math.floor(Math.random() * 1e6); newSong(seed);
      if (!HOME) { try { const m = JSON.parse(localStorage.getItem('sfx-song') || '{}') || {}; m[id] = seed; localStorage.setItem('sfx-song', JSON.stringify(m)); } catch (e) {} }
      if (mode !== 'all') { mode = 'all'; saveMode(); paint(); }
      stopBgm(true); setTimeout(() => { ctx(); startBgm(); }, 260);
      say(`🔀 Lagu: “${SONG.name}”`);
    }
    btn.addEventListener('click', e => {
      e.stopPropagation(); if (lpDone) { lpDone = false; return; }
      if (btn.classList.contains('mini')) { btn.classList.remove('mini'); shrink(); return; }
      shrink(); return openMenu();
      // halaman tanpa musik: cuma nyala/mati (biar setelan musik di halaman lain ga keganti)
      const order = theme ? ['all', 'fx', 'off'] : (mode === 'fx' ? ['fx', 'off'] : ['all', 'off']);
      let i = order.indexOf(mode); mode = order[(i + 1) % order.length]; saveMode(); paint();
      if (mode === 'all') { ctx(); startBgm(); } else stopBgm();
      if (mode !== 'off') play('tap');
      say(theme ? (mode === 'all' && SONG ? `🎶 “${SONG.name}” · tahan buat ganti lagu` : LABEL[mode]) : (mode === 'off' ? LABEL.off : 'Efek suara nyala (halaman ini sengaja tanpa musik)'));
    });
    // ── menu suara ──
    const MOODS = [['auto', '✨ Otomatis'], ['santai', '🍃 Kalem'], ['main', '🎉 Ceria'], ['romantis', '💗 Romantis'], ['malam', '🌙 Malam']];
    const st2 = document.createElement('style');
    st2.textContent = `.sfx-ov{position:fixed;inset:0;z-index:9600;background:rgba(45,31,26,.4);display:flex;align-items:flex-end;justify-content:center;font-family:Poppins,system-ui,sans-serif}
    .sfx-sh{background:#faf6f0;width:100%;max-width:460px;border-radius:22px 22px 0 0;padding:1rem 1.1rem calc(1rem + env(safe-area-inset-bottom));animation:sfxU .25s ease;color:#2d1f1a;max-height:88vh;overflow-y:auto}
    @keyframes sfxU{from{transform:translateY(100%)}}
    .sfx-sh h3{font-size:15px;text-align:center;margin:0 0 .75rem}.sfx-sh .lb{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#c9a96e;font-weight:600;margin:.9rem 0 .4rem}
    .sfx-md{display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem}.sfx-md button,.sfx-mo button{border:1.5px solid #e8c4b0;background:#fff;border-radius:14px;padding:.55rem .3rem;font:500 12px Poppins,sans-serif;color:#7a3f35;cursor:pointer}
    .sfx-md button.on,.sfx-mo button.on{background:#c17a6f;border-color:#c17a6f;color:#fff;font-weight:600}
    .sfx-mo{display:flex;flex-wrap:wrap;gap:.35rem}.sfx-mo button{border-radius:50px;padding:.42rem .75rem}
    .sfx-now{display:flex;align-items:center;gap:.6rem;background:#fff;border-radius:16px;padding:.65rem .75rem;border:1px solid rgba(193,122,111,.15)}
    .sfx-now .e{font-size:1.5rem}.sfx-now div{flex:1;min-width:0}.sfx-now b{display:block;font-size:13.5px}.sfx-now small{display:block;font-size:11px;color:#9a8070}
    .sfx-now button{border:none;background:#f5ede0;border-radius:50%;width:38px;height:38px;font-size:1.05rem;cursor:pointer;flex-shrink:0}
    .sfx-rg{display:flex;align-items:center;gap:.6rem;font-size:12.5px}.sfx-rg span{width:4.6rem}.sfx-rg input{flex:1;accent-color:#c17a6f}.sfx-rg b{width:2.6rem;text-align:right;font-weight:600;font-size:12px;color:#7a3f35}
    .sfx-hm{display:flex;gap:.4rem}.sfx-hm button{flex:1}
    .sfx-note{font-size:11px;color:#9a8070;text-align:center;margin-top:.7rem;line-height:1.5}
    .sfx-x{display:block;width:100%;margin-top:.8rem;border:none;background:none;color:#9a8070;font:500 13px Poppins,sans-serif;padding:.5rem;cursor:pointer}`;
    document.head.appendChild(st2);
    function setMode(m) { mode = m; saveMode(); paint(); if (mode === 'all') { ctx(); startBgm(); } else stopBgm(); if (mode !== 'off') play('tap'); }
    function restart() { stopBgm(true); setTimeout(() => { if (mode === 'all') { ctx(); startBgm(); } }, 260); }
    function openMenu() {
      const old = document.getElementById('sfx-ov'); if (old) old.remove();
      const ms = HOME && window.Musim && Musim.now ? Musim.now() : null, mood = lsG('sfx-mood', 'auto'), hmode = lsG('sfx-home-mode', 'acak');
      const ov = document.createElement('div'); ov.className = 'sfx-ov'; ov.id = 'sfx-ov';
      const songRow = theme && SONG ? `<p class="lb">Lagi diputer</p><div class="sfx-now"><span class="e">🎶</span><div><b>“${SONG.name}”</b><small>${SONG.bpm} bpm · ${SONG.inst} · ${SONG.drums === 'none' ? 'tanpa drum' : SONG.drums}</small></div><button data-a="next" aria-label="Ganti lagu">🔀</button><button data-a="fav" aria-label="Simpen lagu">${HOME && lsG('sfx-home-fav', '') === songSeed ? '💖' : '🤍'}</button></div>` : theme ? `<p class="sfx-note">Halaman ini lagunya khusus 🎶</p>` : `<p class="sfx-note">Halaman ini sengaja tanpa musik latar (cuma efek suara).</p>`;
      ov.innerHTML = `<div class="sfx-sh"><h3>🎵 Atur suara</h3>
        <div class="sfx-md">${[['all', '🎵', 'Musik & efek'], ['fx', '🔔', 'Efek aja'], ['off', '🔇', 'Bisu']].map(([k, e, n]) => `<button data-m="${k}" class="${mode === k ? 'on' : ''}">${e}<br>${n}</button>`).join('')}</div>
        ${songRow}
        <p class="lb">Keras suara</p>
        <div class="sfx-rg"><span>🎶 Musik</span><input type="range" min="0" max="100" step="5" value="${lsG('sfx-vol', 75)}" data-v="sfx-vol"><b>${lsG('sfx-vol', 75)}%</b></div>
        <div class="sfx-rg" style="margin-top:.35rem"><span>🔔 Efek</span><input type="range" min="0" max="100" step="5" value="${lsG('sfx-fxvol', 80)}" data-v="sfx-fxvol"><b>${lsG('sfx-fxvol', 80)}%</b></div>
        ${pageTheme && !SPECIAL[base] ? `<p class="lb">Suasana lagu</p><div class="sfx-mo">${MOODS.map(([k, n]) => `<button data-mood="${k}" class="${mood === k ? 'on' : ''}">${n}</button>`).join('')}</div>` : ''}
        ${HOME && theme && SONG ? `<p class="lb">Lagu menu utama</p><div class="sfx-hm sfx-md"><button data-h="acak" class="${hmode === 'acak' ? 'on' : ''}">🔀 Acak tiap buka</button><button data-h="fav" class="${hmode === 'fav' ? 'on' : ''}">💖 Lagu favorit</button></div>` : ''}
        <p class="sfx-note">${ms ? `${ms.e} Lagi musim <b>${ms.t.replace(/!$/, '')}</b> — lagu menu utama ikut suasana (kalau suasana “Otomatis”).<br>` : ''}Tips: tahan tombol 🎵 buat langsung ganti lagu. Setelan ini berlaku di semua halaman.</p>
        <button class="sfx-x" data-a="x">Tutup</button></div>`;
      ov.addEventListener('click', e => {
        if (e.target === ov || e.target.closest('[data-a="x"]')) return ov.remove();
        const m = e.target.closest('[data-m]'); if (m) { setMode(m.dataset.m); return openMenu(); }
        const md = e.target.closest('[data-mood]'); if (md) { lsS('sfx-mood', md.dataset.mood); newSong(); if (mode !== 'all') setMode('all'); else restart(); return setTimeout(openMenu, 30); }
        const h = e.target.closest('[data-h]'); if (h) { if (h.dataset.h === 'fav' && !lsG('sfx-home-fav', '')) lsS('sfx-home-fav', songSeed); lsS('sfx-home-mode', h.dataset.h); newSong(); restart(); return setTimeout(openMenu, 30); }
        const a = e.target.closest('[data-a]'); if (!a) return;
        if (a.dataset.a === 'next') { nextSong(); return setTimeout(openMenu, 300); }
        if (a.dataset.a === 'fav') {
          if (HOME) { lsS('sfx-home-fav', songSeed); lsS('sfx-home-mode', 'fav'); say(`💖 “${SONG.name}” jadi lagu menu utama`); }
          else { try { const id = /^(srcdoc|blank|)$/.test(base) ? (document.title || base) : base, mm = JSON.parse(localStorage.getItem('sfx-song') || '{}') || {}; mm[id] = songSeed; localStorage.setItem('sfx-song', JSON.stringify(mm)); } catch (er) {} say(`💖 “${SONG.name}” disimpen buat halaman ini`); }
          return openMenu();
        }
      });
      ov.querySelectorAll('input[type=range]').forEach(r => r.addEventListener('input', () => {
        lsS(r.dataset.v, r.value); r.nextElementSibling.textContent = r.value + '%';
        if (r.dataset.v === 'sfx-vol') { BGV = r.value / 50; if (ac && playing) { bgmGain.gain.cancelScheduledValues(ac.currentTime); bgmGain.gain.setTargetAtTime(BGV, ac.currentTime, .05); } }
        else if (ac) { sfxGain.gain.setTargetAtTime(FXV(), ac.currentTime, .03); }
      }));
      ov.querySelectorAll('input[type=range]').forEach(r => r.addEventListener('change', () => { if (r.dataset.v === 'sfx-fxvol') play('coin'); }));
      document.body.appendChild(ov); ctx();
    }

    document.body.appendChild(btn); document.body.appendChild(tip); paint(); shrink();
    const tipAt = (x, y) => { tip.style.setProperty('bottom', 'auto', 'important'); tip.style.setProperty('top', (y > 70 ? y - 44 : y + 56) + 'px', 'important'); tip.style.setProperty('left', Math.max(8, Math.min(innerWidth - 220, x - 40)) + 'px', 'important'); };
    window.__fabDrag(btn, 'fab-pos-sfx', { start: () => clearTimeout(lpT), moved: tipAt });
    const gameHide = () => { const g2 = window.__inGame(); btn.style.display = g2 ? 'none' : ''; if (g2) tip.classList.remove('show'); }; gameHide(); setTimeout(gameHide, 600); setInterval(gameHide, 2000);
    function modalOpen(doc, win) {
      // ada pop-up/sheet yang nutupin layar (latar gelap transparan) → tombol melayang ngumpet dulu biar ga nutupin tombol Simpan dsb
      try {
        const W = win.innerWidth, H = win.innerHeight;
        for (const el of doc.body ? doc.body.children : []) {
          if (el.classList && (el.classList.contains('sfx-btn') || el.classList.contains('cfab') || el.classList.contains('sfx-tip') || el.classList.contains('sfx-menu'))) continue;
          const cs = win.getComputedStyle(el); if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .5 || cs.pointerEvents === 'none') continue;
          const m = /rgba\([^)]*,\s*([\d.]+)\)/.exec(cs.backgroundColor), a = m ? +m[1] : (cs.backgroundColor === 'transparent' ? 0 : 1);
          if (a < .15 || a > .95) continue;
          const r = el.getBoundingClientRect(); if (r.width >= W * .85 && r.height >= H * .7) return true;
        }
      } catch (e) {}
      return false;
    }
    let liftT = 0;
    const lift = () => { const H = innerHeight, h = btn.dataset.moved ? 0 : barH(document, window, 0, 0, innerWidth, H); if (btn.dataset.moved) {} else if (h > 0) { btn.style.setProperty('bottom', (h + 10) + 'px', 'important'); tip.style.setProperty('bottom', (h + 18) + 'px', 'important'); } else { btn.style.removeProperty('bottom'); tip.style.removeProperty('bottom'); } const md = modalOpen(document, window); btn.style.visibility = md ? 'hidden' : ''; if (md) tip.style.visibility = 'hidden'; else tip.style.visibility = ''; };
    const liftLater = () => { clearTimeout(liftT); liftT = setTimeout(() => { if (!document.hidden) lift(); }, 450); };
    setTimeout(lift, 900); addEventListener('resize', liftLater); setInterval(() => { if (!document.hidden) lift(); }, 4000);
    try { new MutationObserver(m => { if (m.some(x => x.target !== btn && x.target !== tip)) liftLater(); }).observe(document.body, { attributes: true, attributeFilter: ['class', 'style'], childList: true, subtree: true }); } catch (e) {}
    try { if (!localStorage.getItem('sfx-seen')) { localStorage.setItem('sfx-seen', '1'); btn.classList.add('pulse'); setTimeout(() => say('🎵 Ada musik! Tap di sini buat atur suara'), 900); } } catch (e) {}
  }

  // ── pemicu otomatis ──
  let unlocked = false;
  function firstGesture() {
    if (unlocked) return; unlocked = true;
    if (mode !== 'off') ctx();
    if (mode === 'all') startBgm();
  }
  document.addEventListener('pointerdown', e => {
    firstGesture();
    if (!tapOn || mode === 'off') return;
    const el = e.target.closest && e.target.closest('button, a, [role=button], .chip, .pill, label, summary');
    if (el && !el.dataset.sfxSkip && !el.disabled) play('tap');
  }, true);
  document.addEventListener('keydown', firstGesture, true);

  // confetti / overlay / toast → efek suara otomatis
  const isConfetti = n => n.nodeType === 1 && /(^|\s)(cp|confetti|confetti-piece)(\s|$)/.test(n.className || '');
  const isDialog = el => el.nodeType === 1 && (el.matches('.ov,.overlay,.modal,.sheet-ov,.res-ov,.result-ov,[role=dialog],.pass,.win-ov,.popup,.pop-ov') || /(^|-)ov(\s|$)/.test(el.id || ''));
  const mo = new MutationObserver(list => {
    if (mode === 'off' || !unlocked) return;
    for (const m of list) {
      if (m.type === 'childList') { for (const n of m.addedNodes) if (isConfetti(n)) { play('win'); return; } }
      else if (m.type === 'attributes' && m.target.nodeType === 1) {
        const el = m.target, was = m.oldValue || '';
        const nowShow = /(^|\s)(show|open|on)(\s|$)/.test(el.className), wasShow = /(^|\s)(show|open|on)(\s|$)/.test(was);
        if (nowShow && !wasShow) {
          if (/(^|\s)toast(\s|$)/.test(el.className) || el.id === 'toast') play('toast');
          else if (isDialog(el)) play('open');
        }
      }
    }
  });
  function observe() { mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true }); }

  document.addEventListener('visibilitychange', () => {
    if (!ac) return;
    if (document.hidden) { stopBgm(true); setTimeout(() => { if (document.hidden && ac.state === 'running') ac.suspend().catch(() => {}); }, 300); }
    else { ac.resume().catch(() => {}); if (mode === 'all' && unlocked) startBgm(); }
  });
  window.addEventListener('pagehide', () => stopBgm(true));

  // dipakai halaman lain kalau mau: SFX.play('win'), SFX.play('coin'), SFX.music(false)
  window.SFX = { play, music: on => on ? startBgm() : stopBgm(), get mode() { return mode; }, get playing() { return playing; }, get song() { return SONG && { name: SONG.name, bpm: SONG.bpm, inst: SONG.inst, lead: SONG.leadI, drums: SONG.drums }; }, _tap: () => out, _compose: compose };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { addButton(); observe(); }); else { addButton(); observe(); }
})();

/* ═══ PENJAGA PERFORMA ═══
   Banyak halaman punya puluhan bintang/partikel kecil yang kedip-kedip (60–80 elemen animasi).
   Di HP biasa itu bikin berat. Di sini: kalau ada >24 elemen dengan animasi berulang yang sama,
   sebagian dibekukan di posisinya (tetep keliatan, cuma ga gerak). HP yang spek-nya rendah → batasnya 12. */
(function () {
  if (window.__perfGuard) return; window.__perfGuard = 1;
  const low = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
  const MAX = low ? 12 : 24;
  function thin() {
    try {
      if (!document.getAnimations) return;
      const groups = {};
      document.getAnimations().forEach(a => {
        if (typeof CSSAnimation === 'undefined' || !(a instanceof CSSAnimation)) return;
        const t = a.effect && a.effect.target; if (!t || t.__pg) return;
        const it = a.effect.getTiming ? a.effect.getTiming().iterations : 0; if (it !== Infinity) return;
        const k = a.animationName + '|' + (typeof t.className === 'string' ? t.className : '');
        (groups[k] = groups[k] || []).push(t);
      });
      Object.values(groups).forEach(ts => {
        if (ts.length <= MAX) return;
        const step = Math.ceil(ts.length / MAX);
        ts.forEach((t, i) => { t.__pg = 1; if (i % step) t.style.animationPlayState = 'paused'; });
      });
    } catch (e) {}
  }
  // HP spek rendah: efek kaca buram (blur di belakang panel) dimatiin — paling berat pas scroll
  if (low) { try { const st = document.createElement('style'); st.textContent = '*,*::before,*::after{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}'; (document.head || document.documentElement).appendChild(st); } catch (e) {} }
  const go = () => { setTimeout(thin, 700); setTimeout(thin, 2500); };
  if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
})();
