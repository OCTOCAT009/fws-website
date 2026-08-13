/* ══════════════════════════════════════════════
   FORTH WORTH STUDIOS — shared scripts
══════════════════════════════════════════════ */

/* ── CONFIG ──
   Paste your GA4 measurement ID (G-XXXXXXXXXX) or a Plausible domain here to
   turn analytics on site-wide. Leave blank and every fwTrack() call no-ops. */
var FW_GA4 = '';           // e.g. 'G-ABCD123456'
var FW_PLAUSIBLE = '';     // e.g. 'forthworthstudios.space'

var prefersReduced = function () {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/* ── ANALYTICS ── */
var fwTrack = function () {};
(function () {
  if (FW_GA4) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + FW_GA4;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', FW_GA4);
    fwTrack = function (name, props) { gtag('event', name, props || {}); };
  } else if (FW_PLAUSIBLE) {
    var p = document.createElement('script');
    p.defer = true;
    p.dataset.domain = FW_PLAUSIBLE;
    p.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(p);
    window.plausible = window.plausible || function () {
      (window.plausible.q = window.plausible.q || []).push(arguments);
    };
    fwTrack = function (name, props) { window.plausible(name, { props: props || {} }); };
  }
})();
/* `var fwTrack` at top level is already window.fwTrack — don't re-alias it. */

/* ── VIDEO: always autoplay, never show controls ──
   Muted inline autoplay is allowed by every current browser, but iOS Low Power
   Mode and some data-saver modes still reject the initial play(). Retry on the
   first interaction and whenever the tab becomes visible again. */
(function () {
  var vids = [].slice.call(document.querySelectorAll('video'));
  if (!vids.length) return;

  vids.forEach(function (v) {
    v.controls = false;
    v.muted = true;              // required for autoplay to be permitted
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.disablePictureInPicture = true;
    v.setAttribute('disablepictureinpicture', '');
    v.setAttribute('controlslist', 'nodownload nofullscreen noremoteplayback');
    v.setAttribute('aria-hidden', 'true');   // decorative — keep it out of the a11y tree
    v.setAttribute('tabindex', '-1');
  });

  function playAll() {
    vids.forEach(function (v) {
      if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    });
  }
  playAll();
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) playAll();
  });
  ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(function (evt) {
    window.addEventListener(evt, playAll, { once: true, passive: true });
  });
  // block the context menu on decorative video so no "Download / Show controls" menu appears
  vids.forEach(function (v) {
    v.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  });
})();

/* ── CHEETAH LOADER ──
   Shown once per session on the first page hit. Repeat navigations get a short
   wipe instead of the full 700ms hold, so moving around the site stays fast. */
(function () {
  var loader = document.getElementById('loader');
  if (!loader) return;
  var vid = loader.querySelector('video');

  var seen = false;
  try { seen = sessionStorage.getItem('fw_loader_seen') === '1'; } catch (e) {}
  var HOLD = (seen || prefersReduced()) ? 0 : 700;   // first visit gets the full beat

  if (vid) { var pr = vid.play(); if (pr && pr.catch) pr.catch(function () {}); }

  var start = Date.now();
  function hide() {
    var wait = Math.max(0, HOLD - (Date.now() - start));
    setTimeout(function () {
      loader.classList.add('hide');
      try { sessionStorage.setItem('fw_loader_seen', '1'); } catch (e) {}
    }, wait);
  }
  if (document.readyState === 'complete') hide();
  else window.addEventListener('load', hide);

  // Internal links are NOT intercepted any more. This used to preventDefault,
  // replay the loader and redirect by hand to mask the white flash between
  // pages — cross-document view transitions now do that properly, and the
  // interception actively prevented them from running.

  // restore loader state if the user hits back (bfcache)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) loader.classList.add('hide');
  });
})();

/* ── NAV: solid on scroll + mobile menu ── */
(function () {
  var nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('solid', window.scrollY > 40);
    }, { passive: true });
  }
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  function setOpen(open) {
    menu.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.setAttribute('aria-controls', 'mobileMenu');
  setOpen(false);

  burger.addEventListener('click', function () {
    setOpen(!menu.classList.contains('open'));
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (!menu.classList.contains('open')) return;
    if (e.key === 'Escape') { setOpen(false); burger.focus(); }
    // the menu covers the whole viewport and locks body scroll, so Tab must not
    // wander into the page behind it
    else if (e.key === 'Tab') fwTrapFocus(menu, e);
  });
})();

/* ── SCROLL REVEAL ── */
(function () {
  var els = document.querySelectorAll('.rv');
  if (!els.length) return;
  if (prefersReduced()) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .12 });
  els.forEach(function (el) { io.observe(el); });
})();

/* ── CURRENCY SWITCHER (services page) ── */
function setCurrency(cur) {
  document.querySelectorAll('.cur-opt').forEach(function (b) { b.classList.toggle('active', b.dataset.cur === cur); });
  document.querySelectorAll('.price').forEach(function (el) {
    if (!el.dataset[cur]) return;
    el.classList.add('roll');
    setTimeout(function () { el.textContent = el.dataset[cur]; el.classList.remove('roll'); }, 180);
  });
  try { localStorage.setItem('fw_cur', cur); } catch (e) {}
}
function pickCurrencyByCountry(cc) {
  cc = (cc || '').toUpperCase();
  if (cc === 'IN' || cc === '') return 'inr';
  var eur = ['AT','BE','HR','CY','EE','FI','FR','DE','GR','IE','IT','LV','LT','LU','MT','NL','PT','SK','SI','ES'];
  if (eur.indexOf(cc) >= 0) return 'eur';
  return 'usd';
}
(function () {
  if (!document.querySelector('.price')) return;
  var saved = null;
  try { saved = localStorage.getItem('fw_cur'); } catch (e) {}
  if (saved) { setCurrency(saved); return; }            // respect a choice made on a past visit
  setCurrency('inr');                                   // sensible default while we detect location
  fetch('https://ipapi.co/json/')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var manual = null; try { manual = localStorage.getItem('fw_cur'); } catch (e) {}
      if (manual && manual !== 'inr') return;            // user picked a currency meanwhile — leave it
      setCurrency(pickCurrencyByCountry(d && d.country_code));
    })
    .catch(function () {});                              // offline / blocked → stay on INR
})();

/* ── SERVICES CATEGORY TABS ── */
function showCat(cat, btn) {
  document.querySelectorAll('.svc-cat').forEach(function (s) {
    var on = s.id === 'cat-' + cat;
    s.classList.toggle('active', on);
    s.setAttribute('aria-hidden', on ? 'false' : 'true');
  });
  document.querySelectorAll('.cat-tab').forEach(function (t) {
    t.classList.remove('active'); t.setAttribute('aria-selected', 'false');
  });
  if (btn) { btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); }
  fwTrack('services_tab', { tab: cat });
}

/* ── MAGNETIC BUTTONS ── */
(function () {
  if (prefersReduced()) return;
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  document.querySelectorAll('.btn,.nav-cta,.submit').forEach(function (b) {
    b.addEventListener('mousemove', function (e) {
      var r = b.getBoundingClientRect();
      b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .25 + 'px,' + (e.clientY - r.top - r.height / 2) * .35 + 'px)';
    });
    b.addEventListener('mouseleave', function () { b.style.transform = ''; });
  });
})();

/* ── HERO ROTATING SUBTEXT ──
   Pauses when the tab is hidden and when the visitor asks for reduced motion
   (WCAG 2.2.2 — no indefinitely moving content without a way to stop it). */
(function () {
  var el = document.getElementById('heroRotate');
  if (!el) return;
  // rotates the tail of a real sentence — the lead-in is static in the markup.
  // 'Premium Branding' was still in here after Brand was dropped as a service.
  var phrases = ['animated websites.', 'interactive experiences.', 'custom storefronts.',
                 'AI agents that actually work.', 'internal tools.'];
  el.textContent = phrases[0];
  if (prefersReduced()) return;

  var i = 0, timer = null;
  function step() {
    el.classList.add('rot-out');
    setTimeout(function () {
      i = (i + 1) % phrases.length;
      el.textContent = phrases[i];
      el.classList.remove('rot-out');
    }, 450);
  }
  function run() { if (!timer) timer = setInterval(step, 2600); }
  function stop() { clearInterval(timer); timer = null; }
  run();
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : run(); });
})();

/* ── HERO ENTRANCE ── */
(function () {
  var h1 = document.querySelector('.h1');
  var inner = document.querySelector('.hero-inner');
  if (!h1) return;
  var delay = prefersReduced() ? 0 : 750;
  setTimeout(function () { h1.classList.add('lit'); if (inner) inner.classList.add('lit'); }, delay);
})();

/* ── UNDERLINE DRAW ── */
(function () {
  var els = document.querySelectorAll('.draw');
  if (!els.length) return;
  if (prefersReduced()) { els.forEach(function (el) { el.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .6 });
  els.forEach(function (el) { io.observe(el); });
})();

/* ── HERO VIDEO PARALLAX ── */
(function () {
  if (prefersReduced()) return;
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  var v = document.getElementById('hero-vid');
  if (!v) return;
  var tx = 0, ty = 0, queued = false;
  document.addEventListener('mousemove', function (e) {
    tx = (e.clientX / innerWidth - .5) * 18;
    ty = (e.clientY / innerHeight - .5) * 18;
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {          // one style write per frame, not per event
      v.style.transform = 'scale(1.08) translate(' + tx + 'px,' + ty + 'px)';
      queued = false;
    });
  }, { passive: true });
})();

/* ── FOCUS TRAP helper (mobile menu) ── */
function fwTrapFocus(container, e) {
  var f = container.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
  if (!f.length) return;
  var first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* ── WORK: floating drifting cards ── */
(function () {
  var space = document.getElementById('workSpace');
  if (!space) return;
  var cards = Array.prototype.slice.call(space.querySelectorAll('.work-card'));
  var nodes = [], raf = null, drifting = !prefersReduced();

  // each card now holds a real <button> and a real <a>, so no synthetic roles here.
  // freeze a card the moment focus lands anywhere inside it — a moving target is
  // unclickable, and keyboard users can't chase one at all.
  cards.forEach(function (el) {
    el.addEventListener('focusin', function () { var n = byEl(el); if (n) n.paused = true; });
    el.addEventListener('focusout', function () { var n = byEl(el); if (n) n.paused = false; });
    // bound once, resolved through byEl — init() re-runs on resize, and closing
    // over the node object here would leave hover pausing a discarded one
    el.addEventListener('mouseenter', function () { var n = byEl(el); if (n) n.paused = true; });
    el.addEventListener('mouseleave', function () { var n = byEl(el); if (n) n.paused = false; });
  });
  function byEl(el) { for (var i = 0; i < nodes.length; i++) if (nodes[i].el === el) return nodes[i]; return null; }

  // a drifting speed with a floor — anything slower than this reads as broken
  function speed() {
    var v = (Math.random() - .5) * 3.4;
    return Math.abs(v) < .7 ? (v < 0 ? -.7 : .7) : v;
  }

  function init() {
    var W = window.innerWidth, H = window.innerHeight;
    var cw = W < 768 ? 160 : 260, ch = cw * 0.80;   // 16:10 shot + title bar
    nodes = cards.map(function (el) {
      var m = 20;
      return {
        el: el,
        x: m + Math.random() * (W - cw - m * 2),
        y: 90 + Math.random() * (H - ch - 160),
        vx: speed(), vy: speed(),
        rot: Math.random() * 8 - 4, rv: (Math.random() - .5) * .06,
        w: cw, h: ch, paused: false
      };
    });
    nodes.forEach(function (n, i) {
      if (!n.el.classList.contains('pop')) setTimeout(function () { n.el.classList.add('pop'); }, 150 + i * 130);
    });
    if (raf) cancelAnimationFrame(raf);
    if (drifting) tick(); else place();
  }
  function place() {
    nodes.forEach(function (n) { n.el.style.transform = 'translate(' + n.x + 'px,' + n.y + 'px)'; });
  }
  // card-on-card collision: separate along the shallower axis, swap that velocity
  // component, and kick the spin. Paused cards act as immovable walls so a card
  // you are aiming at never gets shoved out from under the cursor.
  function collide() {
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j];
        if (a.paused && b.paused) continue;
        if (a.x >= b.x + b.w || b.x >= a.x + a.w || a.y >= b.y + b.h || b.y >= a.y + a.h) continue;

        var ox = Math.min(a.x + a.w - b.x, b.x + b.w - a.x);
        var oy = Math.min(a.y + a.h - b.y, b.y + b.h - a.y);
        var t;
        if (ox < oy) {
          var sx = a.x < b.x ? -1 : 1;
          if (!a.paused) a.x += sx * ox / (b.paused ? 1 : 2);
          if (!b.paused) b.x -= sx * ox / (a.paused ? 1 : 2);
          t = a.vx; a.vx = b.vx; b.vx = t;
        } else {
          var sy = a.y < b.y ? -1 : 1;
          if (!a.paused) a.y += sy * oy / (b.paused ? 1 : 2);
          if (!b.paused) b.y -= sy * oy / (a.paused ? 1 : 2);
          t = a.vy; a.vy = b.vy; b.vy = t;
        }
        a.rv = (Math.random() - .5) * .1;
        b.rv = (Math.random() - .5) * .1;
      }
    }
  }

  function tick() {
    var W = window.innerWidth, H = window.innerHeight;
    // integrate → resolve collisions → clamp to the walls → draw.
    // Clamping has to come after collide(), or a card shoved by another can be
    // pushed off-screen for a frame before the wall check catches it.
    nodes.forEach(function (n) {
      if (n.paused) return;
      n.x += n.vx; n.y += n.vy; n.rot += n.rv;
      if (n.rot > 6 || n.rot < -6) n.rv = -n.rv;
    });
    collide();
    nodes.forEach(function (n) {
      if (n.x < 0) { n.x = 0; n.vx = Math.abs(n.vx); }
      if (n.x + n.w > W) { n.x = W - n.w; n.vx = -Math.abs(n.vx); }
      if (n.y < 76) { n.y = 76; n.vy = Math.abs(n.vy); }
      if (n.y + n.h > H) { n.y = H - n.h; n.vy = -Math.abs(n.vy); }
      n.el.style.transform = 'translate(' + n.x + 'px,' + n.y + 'px) rotate(' + n.rot + 'deg)';
    });
    raf = requestAnimationFrame(tick);
  }
  // stop burning frames while the tab is in the background
  document.addEventListener('visibilitychange', function () {
    if (!drifting) return;
    if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
    else if (!raf) tick();
  });

  space.classList.add('floating'); init(); window.addEventListener('resize', init);

  // Case studies used to open in modals here. They are real pages now
  // (case-*.html) so the cards are plain links — better for search, and the
  // modal copy would otherwise duplicate the page copy word for word.
  cards.forEach(function (el) {
    var a = el.querySelector('.wc-open');
    if (a) a.addEventListener('click', function () {
      fwTrack('case_open', { project: (a.getAttribute('href') || '').replace(/^case-|\.html$/g, '') });
    });
  });
})();

/* ── PREMIUM ANIMATION LAYER (reveals · stagger · tilt · marquee) ── */
(function () {
  if (prefersReduced()) return;

  var io = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });

  function reveal(el, delay, blur) {
    if (el.closest('.rv')) return;            // leave the existing reveal system alone
    el.classList.add(blur ? 'reveal-blur' : 'reveal');
    if (delay) el.style.transitionDelay = delay + 's';
    io.observe(el);
  }

  // staggered groups
  // .tier-grid/.tier-card replaced .svc-grid/.svc-card when services.html was rebuilt
  [['.tier-grid', '.tier-card'], ['.svc-rows', '.svc-row'], ['.addon-row', '.addon'],
   ['.ct-channels', '.channel'], ['.next-steps', '.ns'], ['.pillars', '.pil'],
   ['.home-work', '.hw-card'], ['.home-svc', '.hs-card'], ['.flow-row', '.flow']]
  .forEach(function (pair) {
    document.querySelectorAll(pair[0]).forEach(function (group) {
      Array.prototype.forEach.call(group.querySelectorAll(pair[1]), function (k, i) { reveal(k, i * 0.07); });
    });
  });

  // single reveals (entrance for hero-level bits on inner pages)
  document.querySelectorAll('#svc-hero .eyebrow,#svc-hero .s-title,.cur-row,.cat-tabs,#ct .eyebrow,#ct .s-title,.ct-left .intro')
    .forEach(function (el) { reveal(el, 0, true); });

  // 3D tilt on service cards (desktop pointers only)
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.svc-card').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        var rx = (((e.clientY - r.top) / r.height) - .5) * -5;
        var ry = (((e.clientX - r.left) / r.width) - .5) * 5;
        c.style.transform = 'translateY(-6px) perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
  }

  // marquee band before the closing CTA on content pages
  var cta = document.querySelector('.ab-cta, .wy-cta');
  if (cta && !document.querySelector('.marquee-band')) {
    var phrases = ['No Templates', 'Custom Code', 'Brand First', 'Built To Be Remembered', 'Real Prices', 'Premium Craft', 'Designed Around You'];
    var half = '';
    for (var n = 0; n < 2; n++) phrases.forEach(function (p) { half += '<em>' + p + '</em><span class="dot">●</span>'; });
    var band = document.createElement('div'); band.className = 'marquee-band'; band.setAttribute('aria-hidden', 'true');
    var track = document.createElement('div'); track.className = 'marquee-track';
    track.innerHTML = half + half;
    band.appendChild(track);
    cta.parentNode.insertBefore(band, cta);
  }
})();

/* ── CTA TRACKING ── */
(function () {
  document.querySelectorAll('a[href*="contact"]').forEach(function (a) {
    a.addEventListener('click', function () {
      fwTrack('cta_click', { where: a.className || 'link', page: location.pathname });
    });
  });
})();

/* ── CHAPTER PROGRESS (pinned sections on about / why-forthworth) ──
   Fills the rule under each pinned heading as you read through that chapter. */
(function () {
  var chaps = document.querySelectorAll('.chap');
  if (!chaps.length) return;
  chaps.forEach(function (c) {
    var pin = c.querySelector('.chap-pin');
    if (!pin || pin.querySelector('.chap-rule')) return;
    var r = document.createElement('div');
    r.className = 'chap-rule';
    r.setAttribute('aria-hidden', 'true');
    r.appendChild(document.createElement('i'));
    pin.appendChild(r);
  });
  function upd() {
    chaps.forEach(function (c) {
      var i = c.querySelector('.chap-rule i');
      if (!i) return;
      var b = c.getBoundingClientRect();
      var span = b.height - innerHeight * 0.35;
      var done = span > 0 ? (innerHeight * 0.55 - b.top) / span : (b.top < 0 ? 1 : 0);
      done = Math.min(Math.max(done, 0), 1);
      i.style.right = (100 - done * 100) + '%';
    });
  }
  addEventListener('scroll', upd, { passive: true });
  addEventListener('resize', upd);
  upd();
})();

/* ── PULL QUOTES, WORD BY WORD ──
   Splits text nodes only, so the red <span> wrappers inside survive intact. */
(function () {
  var pulls = document.querySelectorAll('.pull');
  if (!pulls.length || prefersReduced()) return;

  function split(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (t) {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
          var s = document.createElement('span');
          s.className = 'w';
          s.textContent = t;
          frag.appendChild(s);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) { split(n); }
    });
  }

  pulls.forEach(function (p) {
    if (p.dataset.split) return;
    p.dataset.split = '1';
    split(p);
    p.querySelectorAll('.w').forEach(function (w, i) { w.style.transitionDelay = (i * 0.055) + 's'; });
  });

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .3 });
  pulls.forEach(function (p) { io.observe(p); });
})();

/* ── AUDIENCE CHIPS ── */
(function () {
  var wrap = document.querySelector('[data-chips]');
  if (!wrap) return;
  var btns = wrap.querySelectorAll('.chip');
  var panes = document.querySelectorAll('.chip-pane');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      btns.forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
      b.classList.add('active');
      b.setAttribute('aria-selected', 'true');
      panes.forEach(function (p) { p.classList.toggle('active', p.dataset.pane === b.dataset.chip); });
      fwTrack('audience_chip', { who: b.dataset.chip });
    });
  });
})();

/* ── TEMPLATE vs FORTH WORTH COMPARE SLIDER ── */
(function () {
  var c = document.querySelector('.cmp');
  if (!c) return;
  var top = c.querySelector('.cmp-top'), handle = c.querySelector('.cmp-handle');
  if (!top || !handle) return;
  var dragging = false, pos = 50;

  // clip-path, not width — the mockup underneath must keep its full size or it squashes
  function apply() {
    top.style.clipPath = 'inset(0 ' + (100 - pos) + '% 0 0)';
    handle.style.left = pos + '%';
    handle.setAttribute('aria-valuenow', Math.round(pos));
  }
  function set(clientX) {
    var r = c.getBoundingClientRect();
    pos = Math.min(Math.max(((clientX - r.left) / r.width) * 100, 0), 100);
    apply();
  }
  function point(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
  function down(e) { dragging = true; c.classList.add('dragging'); set(point(e)); }
  function move(e) { if (dragging) set(point(e)); }
  function up() { dragging = false; c.classList.remove('dragging'); }

  c.addEventListener('mousedown', down);
  addEventListener('mousemove', move);
  addEventListener('mouseup', up);
  c.addEventListener('touchstart', down, { passive: true });
  addEventListener('touchmove', move, { passive: true });
  addEventListener('touchend', up);

  handle.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') pos = Math.max(0, pos - 5);
    else if (e.key === 'ArrowRight') pos = Math.min(100, pos + 5);
    else return;
    e.preventDefault();
    apply();
  });

  apply();
})();

/* ── PRICE ANCHOR BARS ── */
(function () {
  var bars = document.querySelectorAll('.pbar-fill');
  if (!bars.length) return;
  function fill(b) { b.style.width = b.dataset.w + '%'; }
  if (prefersReduced()) { bars.forEach(fill); return; }

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var f = e.target.querySelector('.pbar-fill');
      if (f) fill(f);
      io.unobserve(e.target);
    });
  }, { threshold: .4 });
  // observe the track, never the fill — the fill starts at width:0 and a
  // zero-area element never satisfies a threshold, so it would never animate
  document.querySelectorAll('.pbar').forEach(function (p) { io.observe(p); });
})();

/* ── HORIZONTAL EVIDENCE DECK ── */
(function () {
  var deck = document.querySelector('.deck');
  if (!deck) return;
  var track = deck.querySelector('.deck-track');
  var prev = deck.querySelector('.deck-prev'), next = deck.querySelector('.deck-next');
  if (!track) return;
  function step() {
    var card = track.querySelector('.deck-card');
    return card ? card.offsetWidth + 18 : 320;
  }
  // plain scrollLeft + CSS scroll-behavior — scrollBy({behavior:'smooth'}) is a
  // no-op in some engines, which left the arrows silently dead
  if (next) next.addEventListener('click', function () { track.scrollLeft += step(); });
  if (prev) prev.addEventListener('click', function () { track.scrollLeft -= step(); });
  function upd() {
    if (prev) prev.disabled = track.scrollLeft < 8;
    if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
  }
  track.addEventListener('scroll', upd, { passive: true });
  addEventListener('resize', upd);
  upd();
})();
