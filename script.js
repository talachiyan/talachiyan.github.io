(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- نوار تاریخ، ساعت و شعار روز ----------
     یک نوار: به‌نوبت «تاریخ و ساعت» و «شعار روز»، هرکدام با حرکت می‌آید، مکث می‌کند و می‌رود. */
  var ticker = document.getElementById('ticker');
  if (ticker) {
    var strip = document.getElementById('tickerStrip');
    var dtEl = document.getElementById('tkDt');
    var quoteEl = document.getElementById('tkQuote');
    var sr = document.getElementById('tickerSr');
    var tz = 'Asia/Tehran';
    var slogans = [
      "هر روز یک قدم کوچک؛ در یک سال، یک مسیر بزرگ.",
      "نظم امروز، آرامش فردای کسب‌وکار است.",
      "تیم خوب را با اعتماد می‌سازند، نه با دستور.",
      "آنچه اندازه‌گیری شود، بهتر می‌شود.",
      "مشتری راضی، بهترین تبلیغ شماست.",
      "اول هدف را روشن کن، بعد گام را بردار.",
      "اشتباه، هزینهٔ یادگیری است؛ تکرارش هزینهٔ بی‌توجهی.",
      "رهبر خوب راه را نشان می‌دهد و کنار تیم می‌ماند.",
      "کار کوچکِ هر روز، از ایدهٔ بزرگِ یک شب ارزشمندتر است.",
      "بازخورد، هدیه‌ای است که رشد را سریع‌تر می‌کند.",
      "سیستم بساز تا کسب‌وکار به یک نفر وابسته نماند.",
      "شفافیت، نیمی از مسیر تیم‌سازی است.",
      "امروز را درست شروع کن؛ فردا خودش مرتب می‌شود.",
      "صبر و پیگیری، دو بال موفقیت‌اند.",
      "به جای بهانه، برنامه بنویس.",
      "فروش وقتی شروع می‌شود که اعتماد ساخته شده باشد.",
      "کیفیت، بی‌سروصدا بهترین سخنگوی توست.",
      "سؤال درست، نیمی از راه‌حل است.",
      "بزرگ فکر کن، کوچک شروع کن، پیوسته ادامه بده.",
      "برای رشد دیگران وقت بگذار؛ رشد تیم، رشد توست.",
      "تصمیم سریع‌تر، با اطلاعات درست‌تر.",
      "هر مسئولیت به اندازهٔ خودش اختیار می‌خواهد.",
      "تغییر از همان‌جا شروع می‌شود که تصمیم گرفتی.",
      "کار تیمی یعنی همه یک نقشه را ببینند.",
      "حرف خوب را بنویس و اجرا کن.",
      "برنامه‌ریزی امروز، دردسر کمتر در فردا.",
      "قدردانی از تیم، ارزان‌ترین سرمایه‌گذاری است.",
      "هر مشتری یک داستان دارد؛ بشنو.",
      "موفقیت یعنی ادامه دادن، وقتی دیگران ایستاده‌اند.",
      "ساده بگو، دقیق عمل کن.",
      "امروز بهتر از دیروز؛ همین یعنی رشد.",
      "با عدد تصمیم بگیر، با دل رهبری کن.",
      "اعتماد دیر ساخته می‌شود، اما همه‌چیز با آن ساخته می‌شود.",
      "کار را به آدم درست بسپار و پیگیرش باش.",
      "برند تو قولی است که هر روز نگهش می‌داری.",
      "فرصت‌ها برای آماده‌ها زودتر می‌رسند."
    ];
    var dateFmt = null, timeFmt = null;
    try {
      dateFmt = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz });
      timeFmt = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: tz });
    } catch (e) {}

    var part = function (parts, type) {
      for (var i = 0; i < parts.length; i++) if (parts[i].type === type) return parts[i].value;
      return '';
    };

    // شعار هر روز عوض می‌شود (بر اساس تاریخ تهران)
    var sloganOfToday = function () {
      var day;
      try {
        day = Math.floor(Date.parse(new Date().toLocaleDateString('en-CA', { timeZone: tz }) + 'T00:00:00Z') / 86400000);
      } catch (e) { day = Math.floor(Date.now() / 86400000); }
      return slogans[((day % slogans.length) + slogans.length) % slogans.length];
    };

    var fill = function () {
      var now = new Date();
      var dt = '';
      if (dateFmt) {
        var p = dateFmt.formatToParts(now);
        dt = '\u200Fامروز ' + [part(p, 'weekday'), part(p, 'day'), part(p, 'month'), part(p, 'year')].join(' ') + ' \u200F· ساعت ' + timeFmt.format(now);
      }
      dtEl.textContent = dt;
      quoteEl.textContent = sloganOfToday();
      if (sr) sr.textContent = dt + '. ' + quoteEl.textContent;
    };
    fill();
    setInterval(fill, 1000);

    // هر بار فقط یکی از دو چیز دیده می‌شود: «تاریخ و ساعت» یا «شعار».
    // از چپ وارد می‌شود (حرکت به راست)، وسط نوار مکث می‌کند، بعد از راست بیرون می‌رود.
    var ENTER = 1300, HOLD = 3800, EXIT = 1300, GAP = 1400;
    var showDate = true;
    var cycle = function () {
      dtEl.hidden = !showDate;
      quoteEl.hidden = showDate;
      var item = showDate ? dtEl : quoteEl;
      strip.style.transform = 'none';
      var cw = ticker.clientWidth;
      var sw = item.offsetWidth + 28;                       // با فاصلهٔ دو طرف
      var k = Math.min(1, Math.max(0.78, (cw - 8) / sw));  // شعار بلند کمی کوچک می‌شود تا جا شود
      var w = sw * k;
      var xStart = -w - 8, xMid = (cw - w) / 2, xEnd = cw + 8;
      var total = ENTER + HOLD + EXIT;
      var f = function (x) { return 'translateX(' + x + 'px) scale(' + k + ')'; };
      var anim = strip.animate([
        { transform: f(xStart), opacity: 0, offset: 0, easing: 'cubic-bezier(.2,.7,.2,1)' },
        { transform: f(xMid), opacity: 1, offset: ENTER / total },
        { transform: f(xMid), opacity: 1, offset: (ENTER + HOLD) / total, easing: 'cubic-bezier(.6,0,.9,.4)' },
        { transform: f(xEnd), opacity: 0.2, offset: 1 }
      ], { duration: total, fill: 'forwards' });
      anim.onfinish = function () {
        strip.style.opacity = '0';
        anim.cancel();
        showDate = !showDate;
        setTimeout(cycle, GAP);
      };
    };

    if (reduce || !strip.animate) {
      ticker.classList.add('static');
      dtEl.hidden = false;
      quoteEl.hidden = false;
    } else {
      strip.style.opacity = '0';
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(cycle);
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
