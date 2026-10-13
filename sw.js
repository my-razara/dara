// ═══ Untuk Dara — service worker (bikin website bisa di-install & tetap jalan pas offline) ═══
// Naikkan angka VERSI kalau mau maksa semua HP buang simpanan lama.
const VERSI = 'v26';
const CACHE = 'untuk-dara-' + VERSI;
const HALAMAN = [
"keuangan-berdua.html",
"titik-kotak.html",
"bolak-balik.html",
"susun-menara.html",
"terbang-bareng.html",
"origami-hati.html",
"resep-kita.html",
"piano-mini.html",
"gelang-manik.html",
"hias-kue.html",
"bikin-komik.html",
"masa-depan.html",
"kamus-kita.html",
"dandan-berdua.html",
"kaleidoskop.html",
"./",
"index.html",
"kotak-surat.html",
"ketemuan.html",
"kuis-kita.html",
"tenangin-diri.html",
"voucher-razan.html",
"hadiah-harian.html",
"ramalan-tarot.html",
"kejutan-pesan.html",
"misi-acak.html",
"kartu-ngobrol.html",
"wishlist.html",
"rekap-bulanan.html",
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
"bowling.html",
"bucket-bunga.html",
"bucket-list.html",
"bunuh-serangga.html",
"cermin.html",
"charades.html",
"coin-drop.html",
"congklak.html",
"dam.html",
"darts.html",
"detak-jantung.html",
"dna-hubungan.html",
"empat-sejajar.html",
"frekuensi.html",
"frog-battle.html",
"gartic-berdua.html",
"gembok-cinta.html",
"guess-number.html",
"hal-kecil.html",
"heart-catch.html",
"high-card.html",
"jendela-embun.html",
"jurnal-syukur.html",
"kalender-mood.html",
"kalkulator-cinta.html",
"kapsul-waktu.html",
"kartu-pacar.html",
"kartu-ucapan.html",
"keuangan-dara.html",
"keuangan-razan.html",
"kode-rahasia.html",
"koran-dara.html",
"kotak-musik.html",
"kupon-maaf.html",
"lampion-harapan.html",
"lanjut-cerita.html",
"love-quest.html",
"masak-bareng.html",
"memories.html",
"memory-match.html",
"menit-bisu.html",
"mesin-gombal.html",
"mesin-terserah.html",
"mind-reader.html",
"moodboard-dara.html",
"pagi-sayang.html",
"panas-dingin.html",
"penalty.html",
"pencapaian.html",
"penghargaan.html",
"perang-kapal.html",
"period-tracker.html",
"pertanyaan-harian.html",
"pet-sim.html",
"peta-bintang.html",
"peta-emosi.html",
"peta-kenangan.html",
"photobooth.html",
"playlist-dara.html",
"polaroid-wall.html",
"pop-it.html",
"puzzle-foto.html",
"radio-razan.html",
"rapor-razan.html",
"rating-ketemu.html",
"reaksi-tercepat.html",
"sambung-kata.html",
"scramble-kata.html",
"sort-blocks.html",
"stiker-wa.html",
"suit-digital.html",
"tabletennis.html",
"taman-bunga.html",
"tantangan-kecepatan.html",
"tarik-pilihan.html",
"tarik-tambang.html",
"tebak-kata.html",
"tebak-kenangan.html",
"tebak-warna.html",
"teka-teki-surat.html",
"tictactoe.html",
"time-bomb.html",
"timeline-kita.html",
"tiup-lilin.html",
"tombol-kangen.html",
"truth-or-dare.html",
"ular-tangga.html",
"who-knows-me.html",
"word-search.html"
];
const ASET = ['sfx.js', 'sync.js', 'online.js', 'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

// ── disisipin ke tiap halaman: warna bar atas HP ngikutin warna bagian paling atas halaman ──
const SYNC_BAR = `<script>(function(){
function grad(el){var g=getComputedStyle(el).backgroundImage;if(!g||g==='none'||!/(linear|radial)-gradient/.test(g))return null;if(/linear-gradient\\((?!\\s*(to bottom|180deg|rgb))/.test(g))return null;var m=g.match(/rgba?\\([^)]+\\)/);return m?m[0]:null;}
function kanvas(el){try{if(el&&el.tagName==='CANVAS'&&el.width&&el.height){var r=el.getBoundingClientRect(),sx=el.width/r.width,sy=el.height/r.height;
 var d=el.getContext('2d').getImageData(Math.max(0,Math.floor((window.innerWidth/2-r.left)*sx)),Math.max(0,Math.floor((2-r.top)*sy)),1,1).data;if(d[3]>200)return 'rgb('+d[0]+','+d[1]+','+d[2]+')';}}catch(e){}return null;}
function warna(el){var kv=kanvas(el);if(kv)return kv;while(el&&el!==document.documentElement){var c=getComputedStyle(el).backgroundColor;if(c&&c!=='transparent'&&!/rgba\\([^)]*,\\s*0\\)/.test(c))return c;var gg=grad(el);if(gg)return gg;el=el.parentElement;}
 var b=getComputedStyle(document.body).backgroundColor;if(b&&b!=='transparent'&&!/,\\s*0\\)/.test(b))return b;return getComputedStyle(document.documentElement).backgroundColor||'#faf6f0';}
function solid(c){var m=c.match(/rgba?\\(([^)]+)\\)/);if(!m)return c;var p=m[1].split(',').map(parseFloat);if(p.length<4||p[3]>=0.98)return 'rgb('+p[0]+','+p[1]+','+p[2]+')';
 var a=p[3],bg=[250,246,240];return 'rgb('+Math.round(p[0]*a+bg[0]*(1-a))+','+Math.round(p[1]*a+bg[1]*(1-a))+','+Math.round(p[2]*a+bg[2]*(1-a))+')';}
var app=false;try{app=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;}catch(e){}
function cap(c){if(!app||!document.body)return;var d=document.getElementById('__barcap');if(!d){d=document.createElement('div');d.id='__barcap';d.setAttribute('aria-hidden','true');
 d.style.cssText='position:fixed;top:0;left:0;right:0;height:26px;pointer-events:none;z-index:2147483647';document.body.appendChild(d);}
 var t=c.replace('rgb(','rgba(').replace(')',',');d.style.background='linear-gradient(to bottom,'+t+'1) 0,'+t+'1) 2px,'+t+'.6) 8px,'+t+'.25) 16px,'+t+'0) 26px)';}
function sync(){try{var cp=document.getElementById('__barcap');if(cp)cp.style.display='none';var el=document.elementFromPoint(window.innerWidth/2,2)||document.body;if(cp)cp.style.display='';var c=solid(warna(el));
 var m=document.querySelector('meta[name=theme-color]');if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m);}if(m.content!==c)m.content=c;cap(c);}catch(e){}}
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

// ═══ NOTIF "ADA YANG BARU" ═══
// HP ngecek sendiri secara berkala (Chrome Android, kalau web-nya udah dipasang jadi aplikasi & notif dinyalain).
// Sumbernya daftar UPDATED + KABAR di index.html — jadi tiap upload update baru, notifnya otomatis.
async function metaGet() { try { const c = await caches.open('untuk-dara-meta'); const r = await c.match('/__kabar'); return r ? await r.json() : {}; } catch (e) { return {}; } }
async function metaSet(o) { try { const c = await caches.open('untuk-dara-meta'); await c.put('/__kabar', new Response(JSON.stringify(o))); } catch (e) {} }
async function cekKabar() {
  if (self.Notification && Notification.permission !== 'granted') return;
  let html = '';
  try { const r = await fetch('index.html?cek=' + Date.now(), { cache: 'no-store' }); if (!r.ok) return; html = await r.text(); } catch (e) { return; }
  const now = new Date(), today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const upd = {}; const ub = /const UPDATED = \{([\s\S]*?)\};/.exec(html);
  if (ub) for (const m of ub[1].matchAll(/'([\w-]+\.html)':\s*'(\d{4}-\d{2}-\d{2})'/g)) upd[m[1]] = m[2];
  const kabar = []; const kb = /const KABAR = \[([\s\S]*?)\];/.exec(html);
  if (kb) for (const m of kb[1].matchAll(/d:\s*'(\d{4}-\d{2}-\d{2})',\s*t:\s*'((?:[^'\\]|\\.)*)'/g)) kabar.push({ d: m[1], t: m[2].replace(/\\'/g, "'") });
  const dates = Object.values(upd).concat(kabar.map(k => k.d)).filter(d => d <= today).sort(), maxD = dates[dates.length - 1];
  if (!maxD) return;
  const meta = await metaGet();
  if (!meta.d) { await metaSet({ d: maxD }); return; }      // pertama kali: catat aja, jangan langsung notif
  if (maxD <= meta.d) return;
  const names = [], label = l => { const m = new RegExp("label:'((?:[^'\\\\]|\\\\.)*)'[^\\n]*?link:'" + l.replace(/[.]/g, '\\.') + "'").exec(html); return m ? m[1] : null; };
  Object.entries(upd).filter(([, d]) => d > meta.d && d <= today).sort((a, b) => b[1].localeCompare(a[1])).forEach(([l]) => { const n = label(l); if (n) names.push(n); });
  const news = kabar.filter(k => k.d > meta.d && k.d <= today);
  const body = news.length ? news[0].t + (names.length ? `\n${names.slice(0, 3).join(', ')}${names.length > 3 ? ` +${names.length - 3} lagi` : ''}` : '')
    : names.length ? `${names.slice(0, 3).join(', ')}${names.length > 3 ? ` & ${names.length - 3} lainnya` : ''} — cobain yuk!` : 'Ada update baru di web kita 💝';
  await self.registration.showNotification('🎁 Ada yang baru buat kamu!', { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'kabar-baru', renotify: true, data: { url: './' } });
  await metaSet({ d: maxD });
}
self.addEventListener('periodicsync', e => { if (e.tag === 'cek-kabar') e.waitUntil(cekKabar()); });
self.addEventListener('message', e => { if (e.data === 'cek-kabar') e.waitUntil(cekKabar()); });
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => { for (const c of cs) { if ('focus' in c) { c.navigate && c.navigate(url).catch(() => {}); return c.focus(); } } return self.clients.openWindow(url); }));
});
