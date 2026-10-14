/* ═══ CADANGAN DATA — biar data ga ilang pas ganti HP / cache kehapus ═══
   • File: semua data di HP ini dibungkus jadi 1 file .json (bisa disimpen di Drive/WA).
   • Online: data yang cuma ada di HP ini (rekor game, gelang, komik, dll) diam-diam
     dicadangin ke database Data Berdua tiap beberapa hari. Data yang emang udah nyambung
     2 HP (wishlist, resep, kalender mood, dst) ga ikut — itu udah aman di database.
   Dipakai di index.html (cadangan otomatis) & cadangan.html (tombol-tombolnya). */
(function () {
  if (window.Cadangan) return;
  const APP = 'cadangan', WHO = ['Razan', 'Dara'];
  const D0 = Date.UTC(1950, 0, 1), dOf = i => new Date(D0 + i * 864e5).toISOString().slice(0, 10);   // baris 0 = info, 1.. = potongan
  const CH = 2800, MAXCH = 90;                                   // server nolak > 3000 huruf per baris
  const g = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const s = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const SYNCED = /^[a-z]{2,14}-(Razan|Dara)$/;                   // data yang udah nyambung lewat database
  const SKIP = k => /^bd-/.test(k) || /^cadangan-/.test(k) || /^cad-/.test(k) || k === 'sw-reloaded';

  function keys() { const out = []; for (let i = 0; i < localStorage.length; i++) out.push(localStorage.key(i)); return out.filter(k => k != null); }
  // full = semua (buat file) · !full = cuma yang lokal & ga kegedean (buat online)
  function collect(full) {
    const data = {};
    keys().forEach(k => {
      if (SKIP(k)) return;
      if (!full && (SYNCED.test(k) || k === 'berdua-me')) return;
      const v = localStorage.getItem(k); if (v == null) return;
      if (!full && v.length > 40000) return;                      // foto dsb → cuma lewat file
      data[k] = v;
    });
    return data;
  }
  const bytes = o => new Blob([JSON.stringify(o)]).size;
  const me = () => (window.Berdua && Berdua.me && Berdua.me()) || g('berdua-me', 'Dara');

  // ── kompres (gzip → base64) biar muat lebih banyak; kalau HP ga dukung, apa adanya ──
  async function pack(str) {
    try {
      if (window.CompressionStream) {
        const cs = new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'));
        const buf = new Uint8Array(await new Response(cs).arrayBuffer());
        let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
        return { z: 1, t: btoa(bin) };
      }
    } catch (e) {}
    return { z: 0, t: str };
  }
  async function unpack(o) {
    if (!o.z) return o.t;
    const bin = atob(o.t), buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const ds = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(ds).text();
  }

  // ── FILE ──
  function fileObj() { return { app: 'razara-cadangan', v: 1, at: Date.now(), who: me(), data: collect(true) }; }
  async function toFile() {
    const o = fileObj(), d = new Date(o.at), p = n => String(n).padStart(2, '0');
    const name = `cadangan-razara-${o.who.toLowerCase()}-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
    const blob = new Blob([JSON.stringify(o)], { type: 'application/json' });
    const file = new File([blob], name, { type: 'application/json' });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Cadangan Razara' }); s('cad-file-at', o.at); return { ok: 1, name, n: Object.keys(o.data).length, size: blob.size }; } }
    catch (e) { if (e && e.name === 'AbortError') return { ok: 0 }; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    s('cad-file-at', o.at); return { ok: 1, name, n: Object.keys(o.data).length, size: blob.size };
  }
  function readFile(file) {
    return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => { try { const o = JSON.parse(r.result); if (o.app !== 'razara-cadangan' || !o.data) throw 0; res(o); } catch (e) { rej(new Error('bukan file cadangan')); } }; r.onerror = () => rej(new Error('gagal baca')); r.readAsText(file); });
  }
  // tulis balik ke HP. Data sinkron & status sinkron ga ditimpa (biar database tetep jadi patokan)
  function restore(data, opt) {
    opt = opt || {}; let n = 0, fail = 0;
    Object.entries(data).forEach(([k, v]) => {
      if (SKIP(k)) return;
      if (SYNCED.test(k) && !opt.synced) return;
      if (k === 'berdua-me' && localStorage.getItem(k) != null) return;
      try { localStorage.setItem(k, v); n++; } catch (e) { fail++; }
    });
    return { n, fail };
  }

  // ── ONLINE ──
  function rowsOf(w) { return g(APP + '-' + w, {}) || {}; }
  function info(w) { const r = rowsOf(w)[dOf(0)]; return r && r.n ? r : null; }
  async function saveOnline() {
    if (!window.Berdua || !Berdua.put) return { ok: 0, err: 'nosync' };
    const w = me(), data = collect(false), raw = JSON.stringify(data), pk = await pack(raw);
    const n = Math.ceil(pk.t.length / CH);
    if (n > MAXCH) return { ok: 0, err: 'big', size: pk.t.length };
    const old = info(w);
    for (let i = 0; i < n; i++) Berdua.put(APP, w, dOf(i + 1), { i, s: pk.t.slice(i * CH, (i + 1) * CH) });
    if (old && old.n > n) for (let i = n; i < old.n; i++) Berdua.put(APP, w, dOf(i + 1), null);
    const meta = { n, z: pk.z, at: Date.now(), keys: Object.keys(data).length, size: raw.length };
    Berdua.put(APP, w, dOf(0), meta); s('cad-online-at', meta.at);
    return Object.assign({ ok: 1 }, meta);
  }
  async function loadOnline(w) {
    const m = info(w); if (!m) return null;
    const R = rowsOf(w); let t = '';
    for (let i = 0; i < m.n; i++) { const r = R[dOf(i + 1)]; if (!r || typeof r.s !== 'string') return { err: 'kurang', have: i, n: m.n }; t += r.s; }
    try { return { data: JSON.parse(await unpack({ z: m.z, t })), meta: m }; } catch (e) { return { err: 'rusak' }; }
  }
  // dipanggil dari menu utama: cadangin online otomatis tiap 3 hari (kalau ga dimatiin)
  async function auto() {
    try {
      if (g('cad-auto', 1) === 0 || !window.Berdua || !Berdua.enabled) return;
      if (Date.now() - g('cad-online-at', 0) < 3 * 864e5) return;
      if (!Object.keys(collect(false)).length) return;
      await saveOnline();
    } catch (e) {}
  }
  window.Cadangan = { collect, bytes, toFile, readFile, restore, saveOnline, loadOnline, info, auto, me, WHO };
})();
