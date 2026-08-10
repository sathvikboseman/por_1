
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* reveal on scroll */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* hero entrance — gated behind the formation-lap overlay (below)
     instead of auto-running on load */
  function go() {
    document.querySelectorAll('.go').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* formation-lap loading overlay: 5 lights lit on load, held briefly,
     then extinguished one by one before the overlay fades and the
     hero entrance plays. Gated on real page-load readiness (window
     'load', covering images/fonts) with a fail-safe timeout so a slow
     asset can never leave the page stuck behind the overlay. */
  var flOverlay = document.getElementById('formation-lap');
  if (flOverlay) {
    var flLights = Array.prototype.slice.call(flOverlay.querySelectorAll('.fl-light'));
    var flDone = false;

    function flFinish() {
      if (flDone) return;
      flDone = true;
      flOverlay.classList.add('is-done');
      document.documentElement.classList.remove('js-loading');
      go();
    }

    function flExtinguish() {
      if (reduce || !flLights.length) { flFinish(); return; }
      var n = 0;
      var seq = setInterval(function () {
        flLights[n].classList.remove('is-lit');
        n++;
        if (n >= flLights.length) { clearInterval(seq); setTimeout(flFinish, 300); }
      }, 220);
    }

    var flStarted = false;
    function flStart() {
      if (flStarted) return;
      flStarted = true;
      if (reduce) { flExtinguish(); return; }
      setTimeout(flExtinguish, 850); /* hold all 5 lit before the first one goes out */
    }

    if (document.readyState === 'complete') {
      flStart();
    } else {
      window.addEventListener('load', flStart);
    }
    setTimeout(flStart, 4000); /* fail-safe: never block the page longer than this */

    /* bfcache restores (back/forward navigation) can skip a fresh 'load'
       event on some browsers — make sure the overlay can't reappear stuck */
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) flFinish();
    });
  } else {
    go();
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

  /* ===== Cinematic F1-broadcast hero background =====
     Pure Canvas2D, no video/images, GPU-cheap, loops forever. Reuses the
     existing #speedlines canvas. Layers, bottom to top: asphalt wash ->
     red horizon glow -> drifting haze -> perspective circuit floor
     (converging lane lines, distance markers, glowing teal center line)
     -> depth particles -> volumetric light beams -> periodic broadcast
     flare sweep -> vignette. devicePixelRatio capped at 1.5; particles
     re-seed on resize; RAF is the only ongoing cost, and it's skipped
     entirely under prefers-reduced-motion like the old speed-lines did. */
  var hero = document.getElementById('speedlines');
  if (hero && !reduce) {
    var hctx = hero.getContext('2d');
    var hw = 0, hh = 0, hFrame = 0, particles = [];
    var RED = '232,0,45', TEAL = '51,255,87', WHITE = '245,246,247';

    function seedParticles() {
      particles = [];
      var count = hw < 640 ? 24 : (hw < 1200 ? 55 : 90);
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * hw,
          y: Math.random() * hh,
          r: 0.6 + Math.random() * 1.7,
          speed: 0.12 + Math.random() * 0.45,
          drift: (Math.random() - 0.5) * 0.25,
          near: Math.random() > 0.62
        });
      }
    }

    function resizeHero() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      hw = hero.offsetWidth; hh = hero.offsetHeight;
      hero.width = Math.round(hw * dpr); hero.height = Math.round(hh * dpr);
      hctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles();
    }
    resizeHero();
    window.addEventListener('resize', resizeHero);

    (function drawHero() {
      hFrame++;
      var t = hFrame / 3600;
      var horizonY = hh * 0.4;
      var vpX = hw * 0.5, vpY = horizonY;
      var topSpread = hw * 0.05, botSpread = hw * 1.25;
      var flow = (t * 1.25) % 1;

      hctx.clearRect(0, 0, hw, hh);

      /* 1. asphalt base wash */
      var base = hctx.createLinearGradient(0, 0, 0, hh);
      base.addColorStop(0, '#0e0e0e'); base.addColorStop(0.5, '#0a0a0a'); base.addColorStop(1, '#060606');
      hctx.fillStyle = base; hctx.fillRect(0, 0, hw, hh);

      /* 2. sky/horizon red glow */
      var sky = hctx.createLinearGradient(0, 0, 0, horizonY);
      sky.addColorStop(0, 'rgba(' + RED + ',0)'); sky.addColorStop(1, 'rgba(' + RED + ',0.32)');
      hctx.fillStyle = sky; hctx.fillRect(0, 0, hw, horizonY);

      /* 3. drifting haze blob */
      var hx = hw * 0.5 + Math.sin(t * 6) * hw * 0.08;
      var hy = horizonY * 0.7 + Math.cos(t * 5) * horizonY * 0.15;
      var haze = hctx.createRadialGradient(hx, hy, 0, hx, hy, hw * 0.45);
      haze.addColorStop(0, 'rgba(' + RED + ',0.22)'); haze.addColorStop(1, 'rgba(' + RED + ',0)');
      hctx.fillStyle = haze; hctx.fillRect(0, 0, hw, horizonY * 1.4);

      /* 4. perspective circuit floor — converging lane lines */
      var lanesPerSide = 16;
      for (var side = -1; side <= 1; side += 2) {
        for (var i = 1; i <= lanesPerSide; i++) {
          var f = i / lanesPerSide;
          var botX = vpX + side * botSpread * f;
          var isEdge = i >= lanesPerSide - 1;
          hctx.beginPath();
          hctx.moveTo(vpX + side * topSpread * f * 0.15, vpY);
          hctx.lineTo(botX, hh);
          hctx.strokeStyle = isEdge ? 'rgba(' + RED + ',0.35)' : 'rgba(' + WHITE + ',0.07)';
          hctx.lineWidth = isEdge ? 2 : 1;
          hctx.stroke();
        }
      }

      /* horizontal distance markers — power curve compresses toward horizon */
      var markerCount = 22;
      for (var m = 0; m < markerCount; m++) {
        var f2 = ((m / markerCount) + flow) % 1;
        var yy = vpY + Math.pow(f2, 2.4) * (hh - vpY);
        var alpha = 0.03 + f2 * 0.18;
        var halfW = (topSpread * 0.15 + (botSpread - topSpread * 0.15) * f2) / 2;
        hctx.strokeStyle = 'rgba(' + WHITE + ',' + alpha + ')';
        hctx.lineWidth = 1;
        hctx.beginPath(); hctx.moveTo(vpX - halfW, yy); hctx.lineTo(vpX + halfW, yy); hctx.stroke();
      }

      /* 5. depth particles — drift upward, respawn at bottom past horizon */
      particles.forEach(function (p) {
        p.y -= p.speed; p.x += p.drift * 0.1;
        if (p.y < horizonY) { p.y = hh + Math.random() * 20; p.x = Math.random() * hw; }
        var rgb = p.near ? RED : WHITE;
        hctx.fillStyle = 'rgba(' + rgb + ',' + (p.near ? 0.35 : 0.18) + ')';
        hctx.beginPath(); hctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); hctx.fill();
      });

      /* 6. volumetric light beams */
      hctx.save();
      hctx.globalCompositeOperation = 'lighter';
      for (var b = 0; b < 3; b++) {
        var bx = hw * (0.2 + b * 0.3) + Math.sin(t * 4 + b) * hw * 0.05;
        var bAlpha = Math.max(0, 0.05 + 0.04 * Math.sin(t * 8 + b * 2));
        var beamGrad = hctx.createLinearGradient(bx, 0, bx, hh * 0.7);
        beamGrad.addColorStop(0, 'rgba(' + WHITE + ',' + bAlpha + ')');
        beamGrad.addColorStop(1, 'rgba(' + WHITE + ',0)');
        hctx.fillStyle = beamGrad;
        hctx.beginPath();
        hctx.moveTo(bx - hw * 0.03, 0); hctx.lineTo(bx + hw * 0.03, 0);
        hctx.lineTo(bx + hw * 0.12, hh * 0.7); hctx.lineTo(bx - hw * 0.12, hh * 0.7);
        hctx.closePath(); hctx.fill();
      }
      hctx.restore();

      /* 7. periodic broadcast flare — soft white band sweeps every ~9s */
      var flareProgress = (hFrame % 540) / 540;
      var flareAlpha = Math.max(0, Math.sin(flareProgress * Math.PI)) * 0.16;
      if (flareAlpha > 0.002) {
        var fx = flareProgress * hw * 1.4 - hw * 0.2;
        var flareGrad = hctx.createLinearGradient(fx - 60, 0, fx + 60, 0);
        flareGrad.addColorStop(0, 'rgba(' + WHITE + ',0)');
        flareGrad.addColorStop(0.5, 'rgba(' + WHITE + ',' + flareAlpha + ')');
        flareGrad.addColorStop(1, 'rgba(' + WHITE + ',0)');
        hctx.fillStyle = flareGrad; hctx.fillRect(fx - 60, 0, 120, hh);
      }

      /* 8. vignette */
      var vig = hctx.createRadialGradient(hw / 2, hh / 2, hh * 0.25, hw / 2, hh / 2, hh * 0.85);
      vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.72)');
      hctx.fillStyle = vig; hctx.fillRect(0, 0, hw, hh);

      requestAnimationFrame(drawHero);
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

  /* touch color reveal: About + Photography grayscale images.
     :hover never fires on touch devices, so a finger-tap would otherwise
     never remove the grayscale filter. Mirrors the pitpass touch pattern
     above — toggle a class on touchstart, and for the photography
     marquee also pause its scroll so the touched photo holds still long
     enough to actually look at. Reverts after a short hold or as soon as
     the finger moves elsewhere. */
  (function () {
    var supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!supportsTouch) return;
    var revealables = document.querySelectorAll('#about .grayscale, #photography .grayscale');
    revealables.forEach(function (img) {
      var timer = null;
      var track = img.closest('.marquee-track');
      img.addEventListener('touchstart', function () {
        img.classList.add('is-touch-active');
        if (track) track.classList.add('is-touch-paused');
        clearTimeout(timer);
      }, { passive: true });
      function release() {
        clearTimeout(timer);
        timer = setTimeout(function () {
          img.classList.remove('is-touch-active');
          if (track) track.classList.remove('is-touch-paused');
        }, 1400);
      }
      img.addEventListener('touchend', release, { passive: true });
      img.addEventListener('touchcancel', release, { passive: true });
    });
  })();

  /* mouse-tracked tilt cards */
  if (!reduce) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var rect, raf = null;
      function onMove(e) {
        rect = rect || card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;   // 0..1
        var py = (e.clientY - rect.top) / rect.height;   // 0..1
        var rx = (0.5 - py) * 14;   // rotateX
        var ry = (px - 0.5) * 16;   // rotateY
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          card.style.transition = 'transform .06s linear';
          card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-6px) scale(1.015)';
        });
      }
      card.addEventListener('mouseenter', function () { rect = card.getBoundingClientRect(); });
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', function () {
        if (raf) cancelAnimationFrame(raf);
        card.style.transition = 'transform .6s var(--ease-out-expo)';
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
        rect = null;
      });
      window.addEventListener('resize', function () { rect = null; }, { passive: true });
    });
  }

  /* count-up telemetry numbers */
  (function () {
    var nums = document.querySelectorAll('.countup');
    if (!nums.length) return;
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        cio.unobserve(el);
        var target = parseInt(el.textContent, 10);
        if (isNaN(target)) return;
        if (reduce) { el.textContent = String(target).padStart(2, '0'); return; }
        var start = null, duration = 1100;
        function step(ts) {
          if (start === null) start = ts;
          var p = Math.min(1, (ts - start) / duration);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(eased * target)).padStart(2, '0');
          if (p < 1) requestAnimationFrame(step); else el.textContent = String(target).padStart(2, '0');
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { cio.observe(el); });
  })();

  /* scroll-driven lap counter */
  (function () {
    var counter = document.getElementById('lap-counter'), cur = document.getElementById('lap-current');
    if (!counter || !cur) return;
    var laps = [
      { id: 'top', label: '01' },
      { id: 'about', label: '02' },
      { id: 'education', label: '03' },
      { id: 'experience', label: '04' },
      { id: 'internships', label: '05' },
      { id: 'projects', label: '06' },
      { id: 'certifications', label: '07' },
      { id: 'skills', label: '08' },
      { id: 'photography', label: '09' },
      { id: 'contact', label: 'FIN' }
    ].map(function (l) { return { el: document.getElementById(l.id), label: l.label }; }).filter(function (l) { return l.el; });

    function updateLap() {
      counter.style.opacity = window.scrollY > window.innerHeight * 0.3 ? '1' : '0';
      var active = laps[0];
      laps.forEach(function (l) {
        if (l.el.getBoundingClientRect().top <= window.innerHeight * 0.45) active = l;
      });
      if (cur.textContent !== active.label) cur.textContent = active.label;
    }
    window.addEventListener('scroll', updateLap, { passive: true });
    updateLap();
  })();
})();

/* ===== Driver Ratings skills radar =====
   Vanilla JS + inline SVG. recharts and Framer Motion both require a
   React runtime and a build step, neither of which exist in this static
   HTML/CSS/JS site, so this reproduces the same radar chart, shared
   hover state, tooltip, tier coloring, and one-time entrance animation
   with plain DOM/SVG APIs and CSS transitions instead.

   Skill values below are the only invented numbers in this feature —
   everything else (names, blurbs) is pulled straight from what was
   already in the Skills section. Adjust freely, this array is the only
   thing you need to touch to retune the chart. */
(function () {
  var chartWrap = document.getElementById('dr-chart');
  var listEl = document.getElementById('dr-list');
  var tooltipEl = document.getElementById('dr-tooltip');
  var readoutLabel = document.getElementById('dr-readout-label');
  var readoutValue = document.getElementById('dr-readout-value');
  var readoutSub = document.getElementById('dr-readout-sub');
  if (!chartWrap || !listEl || !tooltipEl || !readoutValue) return;

  var SKILLS = [
    { name: 'PYTHON', value: 92, blurb: 'Primary language across ML pipelines, automation, and back-end scripting.' },
    { name: 'AUTOMATION', value: 90, blurb: 'Client-side file parsing, canvas rendering, NLP-driven document extraction.' },
    { name: 'AI / LLM', value: 93, blurb: 'OpenAI API, LangChain, RAG architecture, local LLM deployment.' },
    { name: 'JAVASCRIPT', value: 90, blurb: 'Real-time UI rendering, canvas image processing, front-end builds.' },
    { name: 'DESIGN & CREATIVE', value: 95, blurb: 'Salesforce Marketing Cloud, Premiere Pro, Lightroom, event photography.' },
    { name: 'DATA / ML', value: 86, blurb: 'scikit-learn, pandas, NumPy — feature engineering & model evaluation.' },
    { name: 'CLOUD & SECURITY', value: 83, blurb: 'Azure AI Foundry & ML, Microsoft Security, NIST CSF 1.0/2.0.' },
    { name: 'DEV TOOLS', value: 80, blurb: 'Git, Docker, Linux/Unix, Jupyter — daily build & release tooling.' }
  ];

  function tierOf(v) { return v >= 88 ? 'elite' : v >= 70 ? 'strong' : 'solid'; }
  function tierClass(v) { return 'tier-' + tierOf(v); }

  var overall = Math.round(SKILLS.reduce(function (sum, d) { return sum + d.value; }, 0) / SKILLS.length);

  var N = SKILLS.length;
  var SIZE = 400, CX = 200, CY = 200, R = 148;
  var svgNS = 'http://www.w3.org/2000/svg';

  function pt(i, radiusFrac) {
    var angle = (-90 + i * (360 / N)) * Math.PI / 180;
    var r = R * radiusFrac;
    return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)];
  }

  var svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + SIZE + ' ' + SIZE);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  [0.2, 0.4, 0.6, 0.8, 1].forEach(function (frac) {
    var poly = document.createElementNS(svgNS, 'polygon');
    var pts = [];
    for (var i = 0; i < N; i++) pts.push(pt(i, frac).join(','));
    poly.setAttribute('points', pts.join(' '));
    poly.setAttribute('class', 'dr-ring');
    svg.appendChild(poly);
  });

  for (var s = 0; s < N; s++) {
    var sp = pt(s, 1);
    var line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', CX); line.setAttribute('y1', CY);
    line.setAttribute('x2', sp[0]); line.setAttribute('y2', sp[1]);
    line.setAttribute('class', 'dr-spoke');
    svg.appendChild(line);
  }

  var dataPoly = document.createElementNS(svgNS, 'polygon');
  dataPoly.setAttribute('class', 'dr-poly');
  var centerPts = [];
  for (var c = 0; c < N; c++) centerPts.push(CX + ',' + CY);
  dataPoly.setAttribute('points', centerPts.join(' '));
  svg.appendChild(dataPoly);

  var finalPoints = SKILLS.map(function (d, i) { return pt(i, d.value / 100); });

  var axisLabels = [];
  var dots = [];
  SKILLS.forEach(function (d, i) {
    var dp = finalPoints[i];

    var dotHit = document.createElementNS(svgNS, 'circle');
    dotHit.setAttribute('cx', dp[0]); dotHit.setAttribute('cy', dp[1]); dotHit.setAttribute('r', 16);
    dotHit.setAttribute('class', 'dr-dot-hit');
    dotHit.dataset.index = i;
    svg.appendChild(dotHit);

    var dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', dp[0]); dot.setAttribute('cy', dp[1]); dot.setAttribute('r', 0);
    dot.setAttribute('class', 'dr-dot');
    svg.appendChild(dot);
    dots.push(dot);

    var lp = pt(i, 1.2);
    var anchor = 'middle';
    if (lp[0] > CX + 10) anchor = 'start';
    else if (lp[0] < CX - 10) anchor = 'end';

    var label = document.createElementNS(svgNS, 'text');
    label.setAttribute('x', lp[0]); label.setAttribute('y', lp[1]);
    label.setAttribute('text-anchor', anchor);
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('class', 'dr-axis-label');
    label.dataset.index = i;
    label.textContent = d.name;
    svg.appendChild(label);
    axisLabels.push(label);

    var labelHit = document.createElementNS(svgNS, 'circle');
    labelHit.setAttribute('cx', lp[0]); labelHit.setAttribute('cy', lp[1]); labelHit.setAttribute('r', 26);
    labelHit.setAttribute('class', 'dr-axis-hit');
    labelHit.dataset.index = i;
    svg.appendChild(labelHit);
  });

  chartWrap.insertBefore(svg, tooltipEl);

  listEl.innerHTML = '';
  var rows = [];
  SKILLS.forEach(function (d, i) {
    var tier = tierOf(d.value);
    var row = document.createElement('div');
    row.className = 'dr-row tier-' + tier;
    row.dataset.index = i;

    var name = document.createElement('div');
    name.className = 'dr-row-name font-mono';
    name.textContent = d.name;
    row.appendChild(name);

    var meter = document.createElement('div');
    meter.className = 'dr-meter';
    var lit = Math.round(d.value / 10);
    for (var b = 0; b < 10; b++) {
      var bar = document.createElement('span');
      if (b < lit) bar.className = 'is-lit tier-' + tier;
      meter.appendChild(bar);
    }
    row.appendChild(meter);

    var val = document.createElement('div');
    val.className = 'dr-row-value font-mono';
    val.textContent = d.value;
    row.appendChild(val);

    var badge = document.createElement('div');
    badge.className = 'dr-badge tier-' + tier + ' font-mono';
    badge.textContent = tier;
    row.appendChild(badge);

    listEl.appendChild(row);
    rows.push(row);
  });

  var tooltipTitle = tooltipEl.querySelector('.dr-tooltip-title');
  var tooltipValue = tooltipEl.querySelector('.dr-tooltip-value');
  var tooltipBlurb = tooltipEl.querySelector('.dr-tooltip-blurb');

  function clearTiers(el) { el.classList.remove('tier-elite', 'tier-strong', 'tier-solid'); }

  function setActive(i) {
    if (i === null || i === undefined) {
      listEl.classList.remove('has-active');
      rows.forEach(function (r) { r.classList.remove('is-active'); });
      axisLabels.forEach(clearTiers);
      tooltipEl.classList.remove('is-visible');
      readoutLabel.textContent = 'Overall pace';
      readoutValue.textContent = overall;
      clearTiers(readoutValue);
      readoutValue.classList.add(tierClass(overall));
      readoutSub.textContent = '/ 99';
      return;
    }
    var d = SKILLS[i];
    var tier = tierOf(d.value);

    listEl.classList.add('has-active');
    rows.forEach(function (r, idx) { r.classList.toggle('is-active', idx === i); });
    axisLabels.forEach(function (l, idx) {
      clearTiers(l);
      if (idx === i) l.classList.add('tier-' + tier);
    });

    readoutLabel.textContent = 'Live readout';
    readoutValue.textContent = d.value;
    clearTiers(readoutValue);
    readoutValue.classList.add('tier-' + tier);
    readoutSub.textContent = '/ 99 · ' + d.name;

    var dp = finalPoints[i];
    tooltipEl.style.left = (dp[0] / SIZE * 100) + '%';
    tooltipEl.style.top = (dp[1] / SIZE * 100) + '%';
    tooltipTitle.textContent = d.name + ' · ' + tier;
    clearTiers(tooltipTitle);
    tooltipTitle.classList.add('tier-' + tier);
    tooltipValue.textContent = d.value;
    tooltipBlurb.textContent = d.blurb;
    tooltipEl.classList.add('is-visible');
  }
  setActive(null);

  svg.querySelectorAll('[data-index]').forEach(function (el) {
    el.addEventListener('mouseenter', function () { setActive(+el.dataset.index); });
  });
  chartWrap.addEventListener('mouseleave', function () { setActive(null); });

  rows.forEach(function (row) {
    row.addEventListener('mouseenter', function () { setActive(+row.dataset.index); });
  });
  listEl.addEventListener('mouseleave', function () { setActive(null); });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setFinal() {
    dataPoly.setAttribute('points', finalPoints.map(function (p) { return p.join(','); }).join(' '));
    dots.forEach(function (dot) { dot.setAttribute('r', 4); });
  }

  if (reduceMotion) {
    setFinal();
  } else {
    var animated = false;
    function animateIn() {
      if (animated) return;
      animated = true;
      var start = null;
      var duration = 1100;
      function step(ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / duration);
        var ease = 1 - Math.pow(1 - t, 3);
        var pts = finalPoints.map(function (p) {
          return (CX + (p[0] - CX) * ease) + ',' + (CY + (p[1] - CY) * ease);
        });
        dataPoly.setAttribute('points', pts.join(' '));
        dots.forEach(function (dot) { dot.setAttribute('r', 4 * ease); });
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var drIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateIn(); drIo.unobserve(e.target); } });
    }, { threshold: 0.3 });
    drIo.observe(chartWrap);
  }
})();

/* ===== Virtual Pit Pass: flip + vCard =====
   Card itself isn't a native <button> (it holds real links/buttons for
   the channels and actions), so it's a div with tabindex + role=button
   that flips on click/Enter/Space unless the click originated on one of
   those interactive children. The two vCard actions build a plain
   VCARD 3.0 string, then either trigger a Blob download or write it to
   the clipboard (with an execCommand fallback for older browsers). */
(function () {
  var card = document.getElementById('pitpass-card');
  if (!card) return;

  function isInteractiveTarget(el) {
    return !!(el && el.closest && el.closest('a, .pitpass-action'));
  }

  function toggleFlip() {
    var flipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
  }

  card.addEventListener('click', function (e) {
    if (isInteractiveTarget(e.target)) return;
    toggleFlip();
  });
  card.addEventListener('keydown', function (e) {
    if (isInteractiveTarget(e.target)) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      toggleFlip();
    }
  });

  function buildVCard() {
    var lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Sreeram;Sathvik;;;',
      'FN:Sathvik Sreeram',
      'TITLE:AI Automation & Creative Design',
      'TEL;TYPE=CELL,VOICE:+971585464749',
      'EMAIL;TYPE=INTERNET:sbsathvik@gmail.com',
      'URL;TYPE=LinkedIn:https://www.linkedin.com/in/sathvik-sreeram-06b350280',
      'URL;TYPE=GitHub:https://github.com/sathvikboseman',
      'URL;TYPE=Instagram:https://www.instagram.com/sathvikboseman',
      'NOTE:Portfolio: https://sathviksreeram.vercel.app',
      'END:VCARD'
    ];
    return lines.join('\r\n');
  }

  var statusEl = document.getElementById('pitpass-status');
  var statusTimer = null;
  function flashStatus(msg) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.add('is-visible');
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { statusEl.classList.remove('is-visible'); }, 2400);
  }

  var saveBtn = document.getElementById('pitpass-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      var blob = new Blob([buildVCard()], { type: 'text/vcard;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'Sathvik_Sreeram.vcf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      flashStatus('Saved — check your downloads');
    });
  }

  var copyBtn = document.getElementById('pitpass-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = buildVCard();
      function done(ok) { flashStatus(ok ? 'vCard copied to clipboard' : 'Copy failed — try Save instead'); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        try {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          var ok = document.execCommand('copy');
          document.body.removeChild(ta);
          done(ok);
        } catch (err) {
          done(false);
        }
      }
    });
  }
})();

/* ===== Virtual Pit Pass: touch equivalents for hover states =====
   Grayscale avatar and the per-brand channel-link shine are :hover
   effects, which touch devices never trigger. Rather than remove them,
   fire the same class on touchstart (finger-down, ahead of the actual
   click) so touch users get the same flash of color right as they tap
   — the tap still flips the card / opens the link normally afterward,
   no extra tap required. */
(function () {
  var supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!supportsTouch) return;

  function armTouchActive(el, ms) {
    var timer;
    el.addEventListener('touchstart', function () {
      el.classList.add('is-touch-active');
      clearTimeout(timer);
      timer = setTimeout(function () { el.classList.remove('is-touch-active'); }, ms);
    }, { passive: true });
  }

  var card = document.getElementById('pitpass-card');
  if (card) armTouchActive(card, 1000);

  var channels = document.querySelectorAll('.pitpass-channel');
  for (var i = 0; i < channels.length; i++) {
    armTouchActive(channels[i], 1200);
  }
})();
