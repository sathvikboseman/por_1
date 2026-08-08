
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* reveal on scroll */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* start lights + hero entrance */
  var lights = Array.prototype.slice.call(document.querySelectorAll('#lights .light'));
  function litOn(el) { el.classList.add('is-lit'); }
  function litOff(el) { el.classList.remove('is-lit'); }
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
