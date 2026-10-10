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
  const GAMES = 'rodasayang ular-tangga slot-cinta truth-or-dare heart-catch deep-talk tantangan-kecepatan dadu-nasib 36-questions jar-of-questions pet-sim peta-emosi word-search scramble-kata tebak-kata suit-digital reaksi-tercepat balon-pompa tebak-warna tabletennis panas-dingin tarik-tambang time-bomb aku-belum-pernah lanjut-cerita detak-jantung cermin tarik-pilihan frekuensi menit-bisu sambung-kata bikin-ketawa who-knows-me aku-adalah bunuh-serangga masak-bareng bangun-rumah charades memory-match tebak-kenangan puzzle-foto tictactoe empat-sejajar perang-kapal dam congklak aquarium gartic-berdua frog-battle badminton penalty air-hockey coin-drop balance-beam sort-blocks guess-number high-card bowling archery darts'.split(' ');
  const CALM_GAMES = 'deep-talk 36-questions jar-of-questions peta-emosi aku-belum-pernah lanjut-cerita cermin who-knows-me aku-adalah word-search scramble-kata tebak-kata sort-blocks puzzle-foto tebak-kenangan memory-match congklak dam empat-sejajar'.split(' ');
  const NIGHT = 'lampion-harapan peta-bintang ramalan-cinta bintang-jatuh tarot-cinta cloud-wishes'.split(' ');
  // halaman yang udah punya suara sendiri / butuh hening → tanpa musik latar
  const NO_BGM = 'kotak-musik pengantar-tidur tiup-lilin jendela-embun napas-bareng radio-razan playlist-dara photobooth memories keuangan-dara keuangan-razan period-tracker time-bomb menit-bisu detak-jantung reaksi-tercepat tantangan-kecepatan slot-cinta rodasayang truth-or-dare'.split(' ');
  // halaman yang tombolnya udah bunyi sendiri → ga usah bunyi "tik" tambahan
  const NO_TAP = 'pop-it kalkulator-cinta kotak-musik pengantar-tidur jendela-embun tiup-lilin napas-bareng menit-bisu detak-jantung slot-cinta rodasayang tantangan-kecepatan time-bomb truth-or-dare 36-questions jar-of-questions peta-emosi'.split(' ');
  const base = page.replace('.html', '');
  // window.__sfxTheme = tema khusus (misal hari spesial di menu utama)
  const theme = NO_BGM.includes(base) ? null : window.__sfxTheme ? window.__sfxTheme : NIGHT.includes(base) ? 'malam' : GAMES.includes(base) ? (CALM_GAMES.includes(base) ? 'santai' : 'main') : 'romantis';
  const tapOn = !NO_TAP.includes(base);

  // ── setelan (kesimpen di HP) ──
  let mode = 'all';
  try { mode = localStorage.getItem('sfx-mode') || 'all'; } catch (e) {}
  const saveMode = () => { try { localStorage.setItem('sfx-mode', mode); } catch (e) {} };

  let ac = null, out = null, bgmGain = null, sfxGain = null, rev = null;
  function ctx() {
    if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => {}); return ac; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    try { ac = new C(); } catch (e) { return null; }
    out = ac.createDynamicsCompressor(); out.threshold.value = -18; out.connect(ac.destination);
    bgmGain = ac.createGain(); bgmGain.gain.value = 0; bgmGain.connect(out);
    sfxGain = ac.createGain(); sfxGain.gain.value = .55; sfxGain.connect(out);
    // gema tipis biar musiknya lebih lembut
    rev = ac.createDelay(1); rev.delayTime.value = .23; const fb = ac.createGain(); fb.gain.value = .28; const wet = ac.createGain(); wet.gain.value = .35; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
    rev.connect(lp); lp.connect(fb); fb.connect(rev); lp.connect(wet); wet.connect(bgmGain);
    return ac;
  }
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
    malam:    { bpm: 60, progs: [[Am, F, C, G], [Dm, Am, F, Em]], arp: [0, 2, 1, 2, 0, 2, 1, 2], oct: 24, lead: .15, drums: false, inst: 'bell', vol: .09, pad: true },
  };
  const PENTA = [0, 2, 4, 7, 9];
  let playing = false, nextT = 0, step = 0, bar = 0, prog = 0, timer = 0, leadNote = 72;
  function schedule() {
    if (!playing) return;
    const S = SONGS[theme], sp = 60 / S.bpm / 2;   // 1 langkah = not 1/8
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
  function startBgm() {
    if (!theme || mode !== 'all' || playing || !ctx()) return;
    playing = true; nextT = ac.currentTime + .1; step = 0; bar = 0; prog = Math.floor(Math.random() * SONGS[theme].progs.length);
    bgmGain.gain.cancelScheduledValues(ac.currentTime); bgmGain.gain.setValueAtTime(bgmGain.gain.value, ac.currentTime); bgmGain.gain.linearRampToValueAtTime(1, ac.currentTime + 2.5);
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
    if (name === 'win' && playing) { bgmGain.gain.cancelScheduledValues(now); bgmGain.gain.setValueAtTime(bgmGain.gain.value, now); bgmGain.gain.linearRampToValueAtTime(.25, now + .1); bgmGain.gain.linearRampToValueAtTime(1, now + 2.2); }
  }

  // ── tombol 🎵 ──
  const ICON = { all: '🎵', fx: '🔔', off: '🔇' }, LABEL = { all: 'Musik & efek suara nyala', fx: 'Efek suara aja (musik mati)', off: 'Semua suara mati' };
  let btn = null;
  function addButton() {
    const css = document.createElement('style');
    css.textContent = `.sfx-btn{position:fixed;left:12px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:9000;width:38px;height:38px;border-radius:50%;border:1px solid rgba(193,122,111,.25);background:rgba(255,255,255,.82);box-shadow:0 4px 14px rgba(0,0,0,.12);font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;-webkit-tap-highlight-color:transparent;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:.85;transition:transform .15s}
    .sfx-btn:active{transform:scale(.9)}
    .sfx-btn.mini{transform:translateX(-62%) scale(.85);opacity:.4;transition:transform .35s,opacity .35s}
    .sfx-btn.pulse{animation:sfxP 1.2s ease 2}
    @keyframes sfxP{50%{transform:scale(1.18)}}
    .sfx-tip{position:fixed;left:58px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:9000;background:#2d1f1a;color:#fff;font:500 12px Poppins,system-ui,sans-serif;padding:.45rem .8rem;border-radius:50px;opacity:0;transition:opacity .3s;pointer-events:none;max-width:calc(100vw - 80px)}
    .sfx-tip.show{opacity:1}`;
    document.head.appendChild(css);
    btn = document.createElement('button'); btn.className = 'sfx-btn'; btn.type = 'button'; btn.setAttribute('aria-label', 'Atur suara'); btn.dataset.sfxSkip = '1';
    const tip = document.createElement('div'); tip.className = 'sfx-tip';
    const paint = () => { btn.textContent = !theme && mode === 'all' ? '🔔' : ICON[mode]; };
    let tipT;
    const say = t => { tip.textContent = t; tip.classList.add('show'); clearTimeout(tipT); tipT = setTimeout(() => tip.classList.remove('show'), 2200); };
    // biar ga ganggu main: abis beberapa detik tombolnya ngumpet ke pinggir, tap sekali buat munculin
    let miniT; const shrink = () => { clearTimeout(miniT); miniT = setTimeout(() => btn.classList.add('mini'), 3500); };
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (btn.classList.contains('mini')) { btn.classList.remove('mini'); shrink(); return; }
      shrink();
      // halaman tanpa musik: cuma nyala/mati (biar setelan musik di halaman lain ga keganti)
      const order = theme ? ['all', 'fx', 'off'] : (mode === 'fx' ? ['fx', 'off'] : ['all', 'off']);
      let i = order.indexOf(mode); mode = order[(i + 1) % order.length]; saveMode(); paint();
      if (mode === 'all') { ctx(); startBgm(); } else stopBgm();
      if (mode !== 'off') play('tap');
      say(theme ? LABEL[mode] : (mode === 'off' ? LABEL.off : 'Efek suara nyala (halaman ini sengaja tanpa musik)'));
    });
    document.body.appendChild(btn); document.body.appendChild(tip); paint(); shrink();
    try { if (!localStorage.getItem('sfx-seen')) { localStorage.setItem('sfx-seen', '1'); btn.classList.add('pulse'); setTimeout(() => say('🎵 Sekarang ada musik! Tap di sini buat atur'), 900); } } catch (e) {}
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
  window.SFX = { play, music: on => on ? startBgm() : stopBgm(), get mode() { return mode; }, get playing() { return playing; }, _tap: () => out };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { addButton(); observe(); }); else { addButton(); observe(); }
})();
