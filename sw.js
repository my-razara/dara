// ═══ Untuk Dara — service worker (bikin website bisa di-install & tetap jalan pas offline) ═══
// Naikkan angka VERSI kalau mau maksa semua HP buang simpanan lama.
const VERSI = 'v1';
const CACHE = 'untuk-dara-' + VERSI;
const HALAMAN = [
"./",
"index.html",
"36-questions.html",
"air-hockey.html",
"aku-adalah.html",
"aku-belum-pernah.html",
"aquarium.html",
"archery.html",
"badminton.html",
"balance-beam.html",
"balon-pompa.html",
"bangun-rumah.html",
"bikin-ketawa.html",
"bintang-jatuh.html",
"bowling.html",
"bucket-bunga.html",
"buku-cek.html",
"bunuh-serangga.html",
"cermin.html",
"charades.html",
"cloud-wishes.html",
"coin-drop.html",
"dadu-nasib.html",
"darts.html",
"deep-talk.html",
"detak-jantung.html",
"dna-hubungan.html",
"frekuensi.html",
"frog-battle.html",
"gartic-berdua.html",
"guess-number.html",
"hal-kecil.html",
"heart-catch.html",
"high-card.html",
"jar-of-questions.html",
"jar-of-reasons.html",
"keuangan-dara.html",
"keuangan-razan.html",
"koran-dara.html",
"kupon-maaf.html",
"lanjut-cerita.html",
"love-quest.html",
"lucky-dip.html",
"marketplace-pacar.html",
"masak-bareng.html",
"memories.html",
"memory-match.html",
"menit-bisu.html",
"mesin-boneka.html",
"mesin-gombal.html",
"mind-reader.html",
"mirror-of-us.html",
"moodboard-dara.html",
"mystery-box.html",
"open-when.html",
"panas-dingin.html",
"penalty.html",
"period-tracker.html",
"pet-sim.html",
"peta-emosi.html",
"playlist-dara.html",
"polaroid-wall.html",
"radio-razan.html",
"rating-ketemu.html",
"reaksi-tercepat.html",
"rodasayang.html",
"sambung-kata.html",
"scramble-kata.html",
"slot-cinta.html",
"sort-blocks.html",
"suit-digital.html",
"tabletennis.html",
"taman-bunga.html",
"tantangan-kecepatan.html",
"tarik-pilihan.html",
"tarik-tambang.html",
"tebak-kata.html",
"tebak-warna.html",
"tictactoe.html",
"time-bomb.html",
"truth-or-dare.html",
"ular-tangga.html",
"who-knows-me.html",
"word-search.html"
];
const ASET = ['manifest.json', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

// pas di-install: simpan semua halaman game/hadiah biar bisa dimainin offline (yang gagal dilewatin aja)
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(HALAMAN.concat(ASET).map(u => c.add(u).catch(() => {})))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('untuk-dara-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;                       // kirim data (upload, keuangan) → langsung ke internet
  if (url.origin !== location.origin) {                    // Google Fonts & ikon: simpan biar tampilan tetap rapi offline
    if (/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/.test(url.host)) e.respondWith(staleWhileRevalidate(req));
    return;                                                // Google Script, Drive, foto, WhatsApp → nggak disentuh
  }
  // halaman HTML: SELALU coba ambil versi terbaru dulu (biar update dari GitHub langsung kepakai), kalau offline pakai simpanan
  if (req.mode === 'navigate' || req.destination === 'document' || url.pathname.endsWith('.html')) {
    e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
    return;
  }
  e.respondWith(staleWhileRevalidate(req));
});
function staleWhileRevalidate(req) {
  return caches.open(CACHE).then(c => c.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
}
