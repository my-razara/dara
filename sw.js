// ═══ Untuk Dara — service worker (bikin website bisa di-install & tetap jalan pas offline) ═══
// Naikkan angka VERSI kalau mau maksa semua HP buang simpanan lama.
const VERSI = 'v2';
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

// ── disisipin ke tiap halaman: warna bar atas HP ngikutin warna bagian paling atas halaman ──
const SYNC_BAR = `<script>(function(){
function warna(el){while(el&&el!==document.documentElement){var c=getComputedStyle(el).backgroundColor;if(c&&c!=='transparent'&&!/rgba\\([^)]*,\\s*0\\)/.test(c))return c;el=el.parentElement;}
 var b=getComputedStyle(document.body).backgroundColor;if(b&&b!=='transparent'&&!/,\\s*0\\)/.test(b))return b;return getComputedStyle(document.documentElement).backgroundColor||'#faf6f0';}
function solid(c){var m=c.match(/rgba?\\(([^)]+)\\)/);if(!m)return c;var p=m[1].split(',').map(parseFloat);if(p.length<4||p[3]>=0.98)return 'rgb('+p[0]+','+p[1]+','+p[2]+')';
 var a=p[3],bg=[250,246,240];return 'rgb('+Math.round(p[0]*a+bg[0]*(1-a))+','+Math.round(p[1]*a+bg[1]*(1-a))+','+Math.round(p[2]*a+bg[2]*(1-a))+')';}
function sync(){try{var el=document.elementFromPoint(window.innerWidth/2,2)||document.body;var c=solid(warna(el));
 var m=document.querySelector('meta[name=theme-color]');if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m);}if(m.content!==c)m.content=c;}catch(e){}}
document.addEventListener('DOMContentLoaded',sync);window.addEventListener('load',sync);[300,1000,2500].forEach(function(t){setTimeout(sync,t)});
document.addEventListener('click',function(){setTimeout(sync,350)},true);document.addEventListener('visibilitychange',sync);
})();<\/script>`;
async function sisipin(res) {
  try {
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !type.includes('text/html')) return res;
    const html = await res.text();
    const out = html.includes('</head>') ? html.replace('</head>', SYNC_BAR + '</head>') : SYNC_BAR + html;
    return new Response(out, { status: res.status, statusText: res.statusText, headers: res.headers });
  } catch (e) { return res; }
}

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
    e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return sisipin(r); })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r ? sisipin(r) : caches.match('index.html').then(sisipin))));
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
