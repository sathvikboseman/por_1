
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* reveal on scroll */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* start lights + hero entrance */
  var lights = Array.prototype.slice.call(document.querySelectorAll('#lights .light'));
  function litOn(el) { el.classList.add('bg-ember'); el.classList.remove('bg-carbon-2'); el.style.boxShadow = '0 0 24px 5px oklch(0.585 0.235 25.5 / 75%)'; }
  function litOff(el) { el.classList.remove('bg-ember'); el.classList.add('bg-carbon-2'); el.style.boxShadow = 'inset 0 0 8px oklch(0 0 0 / 70%)'; }
  lights.forEach(litOff);
  function go() {
    document.querySelectorAll('.go').forEach(function (el) { el.classList.add('is-in'); });
    var rule = document.getElementById('hero-rule');
    if (rule) rule.style.width = 'min(560px, 70vw)';
  }
  if (reduce) { go(); } else {
    var n = 0;
    var seq = setInterval(function () {
      litOn(lights[n]); n++;
      if (n >= lights.length) { clearInterval(seq); setTimeout(function () { lights.forEach(litOff); go(); }, 380); }
    }, 260);
  }

  /* typing roles */
  var roles = ['AI AUTOMATION', 'CREATIVE DESIGNER', 'PHOTOGRAPHER', 'DUBAI, UAE'];
  var typer = document.getElementById('typer');
  if (typer) {
    var ri = 0, ci = 0, back = false;
    (function tick() {
      var w = roles[ri];
      typer.textContent = back ? w.slice(0, ci--) : w.slice(0, ci++);
      var d = back ? 34 : 66;
      if (!back && ci === w.length + 1) { back = true; d = 1300; }
      else if (back && ci === 0) { back = false; ri = (ri + 1) % roles.length; d = 320; }
      setTimeout(tick, d);
    })();
  }

  /* speed lines */
  var canvas = document.getElementById('speedlines');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d'), w = 0, h = 0, lines = [];
    function resize() {
      w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight;
      lines = [];
      for (var i = 0; i < 42; i++) lines.push({ x: Math.random() * w, y: Math.random() * h, len: 60 + Math.random() * 220, speed: 1.5 + Math.random() * 5, alpha: 0.06 + Math.random() * 0.22, ember: Math.random() > 0.72 });
    }
    resize(); window.addEventListener('resize', resize);
    (function draw() {
      ctx.clearRect(0, 0, w, h);
      lines.forEach(function (l) {
        var rgb = l.ember ? '232,0,45' : '255,255,255';
        var g = ctx.createLinearGradient(l.x, l.y, l.x + l.len, l.y);
        g.addColorStop(0, 'rgba(' + rgb + ',0)'); g.addColorStop(1, 'rgba(' + rgb + ',' + l.alpha + ')');
        ctx.strokeStyle = g; ctx.lineWidth = l.ember ? 1.6 : 1;
        ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(l.x + l.len, l.y); ctx.stroke();
        l.x += l.speed; if (l.x > w) { l.x = -l.len; l.y = Math.random() * h; }
      });
      requestAnimationFrame(draw);
    })();
  }

  /* custom cursor */
  var dot = document.getElementById('cursor-dot'), ring = document.getElementById('cursor-ring');
  if (dot && ring && !window.matchMedia('(pointer: coarse)').matches) {
    var mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.opacity = '1'; ring.style.opacity = '0.7';
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
      var hot = e.target && e.target.closest && e.target.closest('a, button');
      ring.classList.toggle('size-14', !!hot); ring.classList.toggle('size-8', !hot);
      ring.classList.toggle('border-gold', !!hot); ring.classList.toggle('border-ember', !hot);
    });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
  }

  /* scroll rail + nav state + scrollspy */
  var fill = document.getElementById('rail-fill'), railDot = document.getElementById('rail-dot'), nav = document.getElementById('nav');
  var navItems = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if (fill) fill.style.height = (p * 100) + '%';
    if (railDot) railDot.style.top = (p * 100) + '%';
    if (nav) {
      var solid = window.scrollY > window.innerHeight * 0.7;
      nav.classList.toggle('border-hairline', solid);
      nav.classList.toggle('border-transparent', !solid);
      nav.classList.toggle('bg-background/80', solid);
      nav.classList.toggle('backdrop-blur-xl', solid);
      nav.classList.toggle('py-3', solid);
      nav.classList.toggle('py-6', !solid);
    }
    var active = null;
    navItems.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('data-nav'));
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) active = a;
    });
    navItems.forEach(function (a) {
      a.classList.toggle('text-gold', a === active);
      a.classList.toggle('text-smoke', a !== active);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* photography toggle */
  var toggle = document.getElementById('shots-toggle'), panel = document.getElementById('shots-panel');
  var label = document.getElementById('shots-label'), caret = document.getElementById('shots-caret');
  var open = false;
  if (toggle && panel) toggle.addEventListener('click', function () {
    open = !open;
    panel.style.maxHeight = open ? '360px' : '0';
    panel.style.marginTop = open ? '36px' : '0';
    panel.style.opacity = open ? '1' : '0';
    label.textContent = open ? 'Hide shots' : 'Show all shots';
    caret.style.transform = open ? 'rotate(180deg)' : 'none';
  });
})();
