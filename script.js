(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- نوار تاریخ و ساعت (حرکت از چپ به راست) ---------- */
  var track = document.getElementById('tickerTrack');
  if (track) {
    var sr = document.getElementById('tickerSr');
    var tz = 'Asia/Tehran';
    var dateFmt, timeFmt;
    try {
      dateFmt = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz });
      timeFmt = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: tz });
    } catch (e) { dateFmt = null; }

    var texts = [];
    var build = function () {
      var group = function () {
        var g = document.createElement('div');
        g.className = 'tick-group';
        for (var i = 0; i < 4; i++) {
          var span = document.createElement('span');
          span.className = 'tick-text';
          span.setAttribute('dir', 'rtl');
          g.appendChild(span);
          texts.push(span);
          var dot = document.createElement('span');
          dot.className = 'tick-dot';
          dot.textContent = '•';
          g.appendChild(dot);
        }
        return g;
      };
      track.appendChild(group());
      track.appendChild(group());
    };

    var part = function (parts, type) {
      for (var i = 0; i < parts.length; i++) if (parts[i].type === type) return parts[i].value;
      return '';
    };

    var update = function () {
      if (!dateFmt) return;
      var now = new Date();
      var p = dateFmt.formatToParts(now);
      var date = [part(p, 'weekday'), part(p, 'day'), part(p, 'month'), part(p, 'year')].join(' ');
      var msg = '\u200F' + 'امروز ' + date + ' \u200F· ساعت ' + timeFmt.format(now);
      for (var i = 0; i < texts.length; i++) texts[i].textContent = msg;
      if (sr) sr.textContent = msg;
    };

    if (dateFmt) {
      build();
      update();
      setInterval(update, 1000);
    } else {
      track.parentNode.hidden = true;
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
