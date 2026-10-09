(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- کپی آیدی (واتساپ) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (a) {
    var idEl = a.querySelector('.id');
    var orig = idEl ? idEl.textContent : '';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var txt = a.getAttribute('data-copy');
      var done = function () {
        if (!idEl) return;
        idEl.textContent = 'کپی شد ✓';
        setTimeout(function () { idEl.textContent = orig; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done, function () { fallback(txt, done); });
      } else { fallback(txt, done); }
    });
  });
  function fallback(txt, done) {
    var ta = document.createElement('textarea');
    ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- سربرگ: هنگام اسکرول کمرنگ‌تر و جمع‌تر می‌شود ---------- */
  (function () {
    var bar = document.querySelector('.topbar');
    if (!bar) return;
    var compact = false, fullH = 0, ticking = false;
    var measure = function () {
      var was = bar.classList.contains('compact');
      bar.classList.remove('compact');
      bar.style.marginBottom = '0px';
      fullH = bar.offsetHeight;
      if (was) apply(true);
    };
    var apply = function (on) {
      compact = on;
      bar.classList.toggle('compact', on);
      // ارتفاع صفحه ثابت می‌ماند تا محتوا نپرد
      bar.style.marginBottom = on ? Math.max(0, fullH - bar.offsetHeight) + 'px' : '0px';
    };
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var y = window.pageYOffset || document.documentElement.scrollTop;
        if (!compact && y > 70) apply(true);
        else if (compact && y < 12) apply(false);
      });
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    onScroll();
  })();

  /* ---------- دکمهٔ «راهنمایی یا مشاوره»: وقتی پاورقی دیده شود کنار می‌رود ---------- */
  (function () {
    var fab = document.querySelector('.fab');
    var foot = document.querySelector('.site-footer');
    if (!fab) return;
    // اول ۵ ثانیه باز است، بعد کوچک می‌شود؛ لمسِ حالت کوچک دوباره بازش می‌کند
    var t;
    function shrink() { clearTimeout(t); t = setTimeout(function () { fab.classList.add('mini'); }, 5000); }
    fab.addEventListener('click', function (e) {
      if (fab.classList.contains('mini')) { e.preventDefault(); fab.classList.remove('mini'); shrink(); }
    });
    shrink();
    if (!foot || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (e) {
      fab.classList.toggle('away', e[0].isIntersecting);
    }, { threshold: 0.05 }).observe(foot);
  })();

  /* ---------- نوار تاریخ، ساعت و شعار روز ----------
     سه مورد پشت‌سرهم روی یک ریل کنار هم‌اند. هر مورد وسط نوار مکث می‌کند و بعد ریل
     آرام به راست می‌رود: مورد قبلی از راست بیرون می‌رود و همان لحظه بعدی از چپ می‌آید،
     پس هیچ لحظه‌ای نوار خالی نیست. */
  var ticker = document.getElementById('ticker');
  if (ticker) {
    var track = document.getElementById('tickerTrack');
    var sr = document.getElementById('tickerSr');
    var tz = 'Asia/Tehran';
    var slogans = [
      "تیم قوی، با ساختار درست ساخته می‌شود.",
      "اصلاح ساختار، اولین قدم برای رهایی از بی‌نظمی است.",
      "تیم‌سازی یعنی آدم‌های درست، در نقش‌های درست.",
      "مشاورهٔ خوب، مسیر را کوتاه می‌کند.",
      "وقتی نقش‌ها روشن باشد، تیم هماهنگ می‌شود.",
      "بازاریابی درست، مشتری مناسب را می‌آورد.",
      "کسب‌وکار منظم، سودآوری پایدار می‌آورد.",
      "مشکل را در ساختار ببین، نه در آدم‌ها.",
      "نیروی خوب را جذب کن، نگهش دار، پرورشش بده.",
      "شرح وظایف شفاف، نیمی از دعواهای تیم را حل می‌کند.",
      "سیستم بساز تا کسب‌وکار به یک نفر وابسته نماند.",
      "برنامهٔ مارکتینگ بدون شناخت مشتری، تیر در تاریکی است.",
      "ساختار سازمانی، اسکلت رشد کسب‌وکار است.",
      "با تیم درست، فروش آسان‌تر می‌شود.",
      "ارزیابی عملکرد، ابزار رشد است، نه بازخواست.",
      "اصلاح فرایندها، هدررفت را به سود تبدیل می‌کند.",
      "اعتماد در تیم، با شفافیت ساخته می‌شود.",
      "پیش از استخدام بعدی، ساختار را اصلاح کن.",
      "مدیریت یعنی دیدن تصویر کامل، نه فقط کارهای امروز.",
      "پیام برند باید با رفتار تیم یکی باشد.",
      "تیمی که هدف را می‌شناسد، کنترل نمی‌خواهد.",
      "گزارش درست، تصمیم درست می‌سازد.",
      "مشاوره یعنی نگاهی تازه به مشکلی که می‌شناسی.",
      "رشد پایدار، از ساختار پایدار می‌آید.",
      "آموزش نیرو، ارزان‌ترین راه افزایش بهره‌وری است.",
      "هر نقش یک مسئولیت؛ هر مسئولیت یک اختیار.",
      "بازاریابی قولی است که تیم باید به آن عمل کند.",
      "تیم هماهنگ، از تیم پرتلاش قدرتمندتر است.",
      "جلسهٔ خوب تصمیم می‌سازد؛ جلسهٔ بد وقت می‌گیرد.",
      "مدیر خوب تیمی می‌سازد که بی‌او هم کار کند.",
      "اصلاح ساختار وقتی موفق است که تیم بخشی از آن باشد.",
      "مشتری وفادار را تجربهٔ خوب می‌سازد، نه تخفیف.",
      "انتخاب نیروی مناسب، نیمی از مدیریت است.",
      "نظم در جزئیات، آزادی در تصمیم‌های بزرگ می‌آورد.",
      "کسب‌وکار سالم، فرایندی روشن و تیمی پاسخ‌گو دارد.",
      "از مشاوره شروع کن؛ مسیر روشن‌تر می‌شود."
    ];
    var SERVICES = 'مارکتینگ · تیم‌سازی · مدیریت هوشمند · داشبورد · مشاورهٔ پرسنلی';
    var dateFmt = null, timeFmt = null;
    try {
      dateFmt = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz });
      timeFmt = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: tz });
    } catch (e) {}

    var part = function (parts, type) {
      for (var i = 0; i < parts.length; i++) if (parts[i].type === type) return parts[i].value;
      return '';
    };
    var sloganOfToday = function () {
      var day;
      try {
        day = Math.floor(Date.parse(new Date().toLocaleDateString('en-CA', { timeZone: tz }) + 'T00:00:00Z') / 86400000);
      } catch (e) { day = Math.floor(Date.now() / 86400000); }
      return slogans[((day % slogans.length) + slogans.length) % slogans.length];
    };
    var dateText = function () {
      if (!dateFmt) return '';
      var now = new Date();
      var p = dateFmt.formatToParts(now);
      return '\u200Fامروز ' + [part(p, 'weekday'), part(p, 'day'), part(p, 'month'), part(p, 'year')].join(' ') + ' \u200F· ساعت ' + timeFmt.format(now);
    };

    // ترتیب نمایش: تاریخ و ساعت ← شعار ← خدمات
    var kinds = ['dt', 'quote', 'svc'];
    var make = function (kind) {
      var el = document.createElement('span');
      el.className = 'tk tk-' + kind;
      el.setAttribute('dir', 'rtl');
      el.setAttribute('data-kind', kind);
      return el;
    };
    // ریل (از چپ به راست): [نسخهٔ تکراری تاریخ] ‌ خدمات ‌ شعار ‌ تاریخ
    var order = ['dt', 'svc', 'quote', 'dt'];
    var els = order.map(make);
    els.forEach(function (el) { track.appendChild(el); });

    var fill = function () {
      var d = dateText(), q = sloganOfToday();
      els.forEach(function (el) {
        var k = el.getAttribute('data-kind');
        el.textContent = k === 'dt' ? d : (k === 'quote' ? q : SERVICES);
      });
      if (sr) sr.textContent = d + '. ' + q + '. ' + SERVICES;
    };
    fill();
    setInterval(fill, 1000);

    var HOLD = 4500, MOVE = 2600;
    var anim = null;
    var build = function () {
      if (anim) { anim.cancel(); anim = null; }
      var cw = ticker.clientWidth;
      // مقیاس هر مورد (متن بلند کمی کوچک می‌شود تا کامل جا شود)
      els.forEach(function (el) {
        el.style.transform = 'none';
        var w = el.offsetWidth;
        var k = Math.min(1, Math.max(0.78, (cw - 8) / w));
        el.style.transform = 'scale(' + k + ')';
      });
      var tx = function (el) { return cw / 2 - (el.offsetLeft + el.offsetWidth / 2); };
      // نقطه‌ها: تاریخ (راست‌ترین) ← شعار ← خدمات ← نسخهٔ تکراری تاریخ
      var P = [tx(els[3]), tx(els[2]), tx(els[1]), tx(els[0])];
      var T = 3 * (HOLD + MOVE);
      var at = function (ms) { return ms / T; };
      var f = function (x) { return 'translateX(' + x + 'px)'; };
      var ease = 'cubic-bezier(.45,0,.55,1)';
      var frames = [
        { transform: f(P[0]), offset: 0 },
        { transform: f(P[0]), offset: at(HOLD), easing: ease },
        { transform: f(P[1]), offset: at(HOLD + MOVE) },
        { transform: f(P[1]), offset: at(2 * HOLD + MOVE), easing: ease },
        { transform: f(P[2]), offset: at(2 * HOLD + 2 * MOVE) },
        { transform: f(P[2]), offset: at(3 * HOLD + 2 * MOVE), easing: ease },
        { transform: f(P[3]), offset: 1 }
      ];
      track.style.transform = f(P[0]);
      // پایان دور = همان نمای ابتدای دور (نسخهٔ تکراری)، پس تکرار بی‌پرش است
      anim = track.animate(frames, { duration: T, iterations: Infinity });
    };

    if (reduce || !track.animate) {
      ticker.classList.add('static');
      // بدون حرکت: سه مورد کنار هم، بدون نسخهٔ تکراری
      track.removeChild(els[0]);
      track.style.transform = 'none';
    } else {
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(build);
      var rt = null;
      window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 200); });
    }
  }

  /* ---------- گالری: حرکت از راست به چپ، تصویر وسط واضح و بقیه مات ---------- */
  var gal = document.getElementById('galTrack');
  if (!gal) return;

  var slides = Array.prototype.slice.call(gal.querySelectorAll('.slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('#galDots .gal-dot'));
  var next = document.getElementById('galNext');
  var prev = document.getElementById('galPrev');
  var active = 0;
  var timer = null;
  var resumeTimer = null;
  var ticking = false;

  function centerOf(el) {
    var r = el.getBoundingClientRect();
    return r.left + r.width / 2;
  }

  function setActive(i) {
    active = i;
    for (var k = 0; k < slides.length; k++) {
      slides[k].classList.toggle('is-active', k === i);
      if (dots[k]) {
        dots[k].classList.toggle('on', k === i);
        dots[k].setAttribute('aria-current', k === i ? 'true' : 'false');
      }
    }
  }

  function nearest() {
    var c = centerOf(gal);
    var best = 0, bestD = Infinity;
    for (var k = 0; k < slides.length; k++) {
      var d = Math.abs(centerOf(slides[k]) - c);
      if (d < bestD) { bestD = d; best = k; }
    }
    return best;
  }

  function goTo(i, smooth) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    var delta = centerOf(slides[i]) - centerOf(gal);
    gal.scrollBy({ left: delta, behavior: smooth === false || reduce ? 'auto' : 'smooth' });
    setActive(i);
  }

  gal.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var n = nearest();
      if (n !== active) setActive(n);
    });
  }, { passive: true });

  function step(dir) {
    var n = active + dir;
    if (n >= slides.length) n = 0;
    if (n < 0) n = slides.length - 1;
    goTo(n);
  }

  function start() {
    if (reduce || timer) return;
    timer = setInterval(function () { step(1); }, 3500);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
  }
  function pause() {
    stop();
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(start, 7000);
  }

  if (next) next.addEventListener('click', function () { pause(); step(1); });
  if (prev) prev.addEventListener('click', function () { pause(); step(-1); });
  dots.forEach(function (d, i) { d.addEventListener('click', function () { pause(); goTo(i); }); });
  ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (ev) {
    gal.addEventListener(ev, pause, { passive: true });
  });
  gal.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { step(1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { step(-1); e.preventDefault(); }
  });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

  slides.forEach(function (s, i) {
    s.addEventListener('click', function () { if (i !== active) { pause(); goTo(i); } });
  });

  gal.scrollLeft = 0;
  setActive(0);
  window.addEventListener('load', function () { goTo(0, false); });
  window.addEventListener('resize', function () { goTo(active, false); });
  start();
})();
