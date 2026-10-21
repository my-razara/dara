/* ═══ 🧩 SUB — fitur hadiah lain yang dilebur ke halaman ini.
   Pakai: <script src="sub.js" data-main="🧬|DNA Hubungan" data-subs='[["kalkulator","🧮","Kalkulator","_kalkulator-cinta.html"]]'></script>
   Halaman utama tetep kayak biasa; tab fitur lain baru dimuat pas dibuka (biar halaman ga berat). ═══ */
(function () {
  if (window.__sub) return; window.__sub = 1;
  var me = document.currentScript; if (!me) return;
  var SUBS = []; try { SUBS = JSON.parse(me.getAttribute('data-subs') || '[]'); } catch (e) {}
  var MAIN = (me.getAttribute('data-main') || '✨|Utama').split('|');
  if (!SUBS.length) return;
  var ov = null, frame = null, cur = '';
  var css = '.sub-tabs{position:relative;z-index:60;margin:.55rem auto .7rem;max-width:460px;width:calc(100% - 1.5rem);background:rgba(255,255,255,.9);border:1px solid rgba(193,122,111,.16);border-radius:16px;padding:.3rem;display:grid;gap:.25rem;box-shadow:0 4px 14px rgba(193,122,111,.08);font-family:Poppins,system-ui,sans-serif;box-sizing:border-box}' +
    '.sub-tabs a{display:flex;align-items:center;justify-content:center;gap:.3rem;text-align:center;text-decoration:none;color:#9a8070;border-radius:12px;padding:.42rem .3rem;font-size:11.5px;font-weight:600;line-height:1.2;min-width:0;overflow-wrap:anywhere}' +
    '.sub-tabs a span{font-size:1.05rem}.sub-tabs a.on{background:linear-gradient(135deg,#d48c80,#a8584c);color:#fff;box-shadow:0 3px 10px rgba(168,88,76,.25)}' +
    'html[data-user=Razan] .sub-tabs a.on{background:linear-gradient(135deg,#7eaee0,#4a7fc1)}html[data-user=Dara] .sub-tabs a.on{background:linear-gradient(135deg,#e891a6,#c25a78)}' +
    '#sub-ov{position:fixed;inset:0;z-index:9500;background:var(--cream,#faf6f0);display:flex;flex-direction:column}#sub-ov .sub-tabs{margin:calc(.45rem + env(safe-area-inset-top)) auto .35rem;flex:0 0 auto}' +
    '#sub-ov iframe{flex:1;width:100%;border:0;background:var(--cream,#faf6f0)}#sub-ov .ld{position:absolute;left:0;right:0;top:45%;text-align:center;font:500 12.5px Poppins,sans-serif;color:#9a8070;pointer-events:none}' +
    'html.night #sub-ov{background:#1f1716}html.night .sub-tabs{background:rgba(40,28,26,.9)}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);
  var ALL = [['', MAIN[0], MAIN[1] || 'Utama', '']].concat(SUBS);
  function strip(active) {
    var n = document.createElement('nav'); n.className = 'sub-tabs'; n.style.gridTemplateColumns = 'repeat(' + ALL.length + ',minmax(0,1fr))';
    n.innerHTML = ALL.map(function (x) { return '<a href="#" data-k="' + x[0] + '" class="' + (x[0] === active ? 'on' : '') + '"><span>' + x[1] + '</span>' + x[2] + '</a>'; }).join('');
    n.addEventListener('click', function (e) { var a = e.target.closest('a'); if (!a) return; e.preventDefault(); var k = a.getAttribute('data-k'); if (k === cur) return; if (k) open(k, true); else back(); });
    return n;
  }
  function open(k, push, q) {
    var s = SUBS.filter(function (x) { return x[0] === k; })[0]; if (!s) return;
    if (!ov) { ov = document.createElement('div'); ov.id = 'sub-ov'; document.body.appendChild(ov); }
    ov.innerHTML = ''; ov.appendChild(strip(k));
    var ld = document.createElement('div'); ld.className = 'ld'; ld.textContent = 'Lagi dibuka…'; ov.appendChild(ld);
    frame = document.createElement('iframe'); frame.title = s[2]; frame.setAttribute('allow', 'microphone; camera; clipboard-write; autoplay; fullscreen');
    frame.onload = function () { ld.remove(); };
    frame.src = s[3] + (s[3].indexOf('?') < 0 ? '?' : '&') + (q ? q + '&' : '') + 'embed=1';
    ov.appendChild(frame); ov.style.display = 'flex'; cur = k;
    document.documentElement.style.overflow = 'hidden';
    if (push) try { history.pushState({ sub: k }, '', location.pathname + '?sub=' + k); } catch (e) {}
    var t = document.querySelector('#sub-main a.on'); if (t) t.classList.remove('on');
  }
  function close() { if (ov) { ov.style.display = 'none'; ov.innerHTML = ''; } frame = null; cur = ''; document.documentElement.style.overflow = ''; }
  function back() { if (history.state && history.state.sub) history.back(); else { close(); try { history.replaceState(null, '', location.pathname); } catch (e) {} } }
  window.addEventListener('popstate', function () { var k = history.state && history.state.sub; if (k) open(k, false); else close(); });
  function build() {
    var n = strip(''); n.id = 'sub-main'; if (window.__hubSubs) n.style.display = 'none';   // tab-nya udah ada di strip hub
    var vis = function (el) { return el && el.getClientRects().length > 0; }, w0 = document.querySelector('.wrap') || document.querySelector('main');
    var w = vis(w0) ? w0 : document.body, top = w.querySelector(':scope > .top');
    if (top) top.insertAdjacentElement('afterend', n); else if (w === document.body) document.body.insertBefore(n, document.body.firstChild); else w.insertBefore(n, w.firstChild);
    // halaman layar penuh yang punya tombol melayang di atas → geser ke bawah strip biar ga ketutupan
    setTimeout(function () { try { var sb = n.getBoundingClientRect().bottom + 6, H = innerHeight; document.querySelectorAll('body *').forEach(function (el) { if (el === n || n.contains(el) || el.closest('#sub-ov')) return; var cs = getComputedStyle(el); if (cs.position !== 'fixed' && !(cs.position === 'absolute' && (!el.offsetParent || el.offsetParent === document.body || el.offsetParent === document.documentElement))) return; var r = el.getBoundingClientRect(); if (!r.height || r.height > H * 0.4 || r.top >= sb || r.bottom <= 0 || r.top > 120) return; el.style.top = (parseFloat(cs.top) || 0) + (sb - r.top) + 'px'; }); } catch (e) {} }, 60);
    var m = /[?&]sub=([a-z0-9-]+)/.exec(location.search), q = /[?&]subq=([^&#]*)/.exec(location.search);
    if (m) { try { history.replaceState(null, '', location.pathname); history.pushState({ sub: m[1] }, '', location.pathname + '?sub=' + m[1]); } catch (e) {} open(m[1], false, q ? decodeURIComponent(q[1]) : ''); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
  window.Sub = { open: function (k) { open(k, true); }, close: back };
})();
