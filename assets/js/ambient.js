/* ============================================================================
   ambient.js — the drifting node field behind the page.

   Same visual grammar as the 14-domain system map (points, connections, a few
   lit nodes), rendered at a fraction of its intensity so it reads as an
   environment rather than a second diagram competing with the first.

   FOUR CONSTRAINTS SHAPE EVERY NUMBER BELOW.

   1. Legibility. This canvas is behind every word on the page. The alpha
      ceilings in CFG are the budget that keeps body text at AA over the
      brightest pixel the field can produce. They were set by sampling the
      rendered composite under real text, not estimated. Raising them is a
      contrast change, not a style tweak.

   2. Restraint. Drift is ~0.012 px/frame — roughly one pixel every 1.4
      seconds. At that speed the field is perceptibly alive when you look for
      it and completely still when you are reading. That is the whole brief:
      subtle and premium, not sci-fi.

   3. Cost. Connection-finding is O(n^2). n is capped at 90 regardless of
      viewport, the render is throttled to ~30fps, and the loop stops entirely
      when the tab is hidden.

   4. Theme. Colours are read from the live custom properties, so the toggle
      restyles the field without a reload. Light theme drops the gold beacons:
      a warm lit point on a cream ground is exactly where --ink-3 loses its
      contrast margin.
   ============================================================================ */
(function () {
  "use strict";

  var cv = document.getElementById("ambient");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");
  if (!ctx) return;

  var CFG = {
    /* Density is set for the MASKED area, not the viewport. Once the content
       is punched out, the field only reads in the margins and in genuine
       whitespace — perhaps a fifth of the screen — so a density tuned for the
       full viewport leaves those regions nearly empty. At 90 nodes the two
       95px margins on a 1440 screen held about four nodes between them and
       measured flat. */
    density: 5200,       /* one node per N css px^2, before the cap */
    maxNodes: 150,
    linkDist: 132,       /* px at which two nodes stop being connected */
    drift: 0.012,
    fps: 30,
    /* These intensities are roughly 3x what an unmasked field could carry.
       That is affordable because of the mask below: the field is erased from
       under every text block, so no glyph is ever composited over a node, a
       connection or a beacon, and the contrast budget that previously capped
       these values no longer binds.

       The earlier unmasked values (dot 0.30 / beacon 0.18) were accessible and
       effectively invisible — a 540x540 crop of the hero showed zero nodes.
       The constraint was never taste; it was that text sat on the field. Move
       the text off it and the field can do its job.

       Light stays quieter: on a cream ground these marks DARKEN rather than
       glow, so the same numbers read as dirt rather than depth. Beacons remain
       off in light for the same reason. */
    /* Beacons pulled back deliberately: 10 lit points at 0.90 were the one
       element that read as decoration rather than instrumentation, and they
       were the thing most likely to tip the field from "environment" to "tech
       demo". Halved in count and cut to just over half strength. The network
       GEOMETRY — the connections and the node field — is the stronger brand
       element and is untouched. */
    dark:  { line: 0.32, dot: 0.80, beacon: 0.52, beacons: 5 },
    /* Light leans on LINES rather than points. On a cream ground every mark
       darkens, so a field of dots reads as dust while the same weight spent on
       connections reads as fine architectural linework. Beacons stay off for
       the same reason: a dark "lit" point is a contradiction. */
    light: { line: 0.34, dot: 0.30, beacon: 0.00, beacons: 0 }
  };

  /* WHAT GETS PROTECTED, AND WHY IT IS MEASURED FROM TEXT RATHER THAN BOXES.

     The first version of this mask listed CSS selectors and erased each
     element's bounding box. That fails on exactly the space this effect exists
     to fill: a block element reports the full column width whether its text
     runs the whole way or stops after four words. .hero-cta is a flex row
     holding two short buttons and reports ~1150px wide; .band-head reports
     full width for a 24ch heading. Masking those boxes wiped the hero's open
     right side — measured mean 12.0 with a standard deviation of 0.34, i.e.
     flat empty ground, which is what prompted this rewrite.

     So the mask is built from TEXT, not from layout. A TreeWalker collects
     every non-empty text node and a Range yields its per-line client rects,
     which hug the actual glyph runs. Short lines protect short rects, and the
     whitespace beside them stays live.

     Controls and images are added as whole boxes, since a Range over a button
     would only cover its label and miss the padding and border. */
  var BOX_SEL = "a.btn-primary,a.btn-quiet,button,input,textarea,img,svg,canvas";

  /* The erase is expanded past each rect and then blurred, so the field has
     already fallen to zero by the time it reaches a glyph edge rather than
     fading out underneath one.

     PAD is measured from the LINE BOX, which already extends past the glyph
     ink by the leading, so 12px lands roughly a full line-height clear of any
     letterform. The first version used 26 with a 30px blur; that put a 56px
     dead halo around every line of text, and since consecutive lines sit ~30px
     apart the halos merged and erased whole regions the text never occupied.
     The hero's open right side measured a standard deviation of 0.12 — flat
     ground — because it sat inside the halo of the headline above it. */
  var PAD = 12, BLUR = 20;

  var nodes = [], w = 0, h = 0, dpr = 1, raf = null, last = 0;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function themeIsLight() {
    var t = document.documentElement.dataset.theme;
    if (t === "light") return true;
    if (t === "dark") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  }

  /* Read the palette from the cascade so the field can never drift out of sync
     with tokens.css. Falls back only if a property is somehow absent. */
  function palette() {
    var cs = getComputedStyle(document.documentElement);
    var read = function (name, fb) { return (cs.getPropertyValue(name) || "").trim() || fb; };
    var light = themeIsLight();
    return {
      light: light,
      node: read(light ? "--line-strong" : "--line-2", light ? "#B9AF9E" : "#34313C"),
      gold: read(light ? "--gold-deep" : "--gold", light ? "#6F5008" : "#F5C451"),
      a: light ? CFG.light : CFG.dark
    };
  }

  function hexToRgb(hex) {
    var m = String(hex).replace("#", "");
    if (m.length === 3) m = m[0] + m[0] + m[1] + m[1] + m[2] + m[2];
    var n = parseInt(m, 16);
    return isNaN(n) ? [128, 128, 128] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(hex, a) { var c = hexToRgb(hex); return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }

  function build() {
    /* Narrow layouts get a smaller, cheaper field. Below ~1024px the content
       column fills the viewport, so the mask erases nearly all of it anyway —
       Kyle's rule is that readability wins there, and spending a phone's frame
       budget drawing a field that is about to be masked away is waste. */
    var narrow = w < 1024;
    var cap = narrow ? 34 : CFG.maxNodes;
    var count = Math.min(cap, Math.round((w * h) / CFG.density));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * CFG.drift * 2,
        vy: (Math.random() - 0.5) * CFG.drift * 2,
        r: 0.7 + Math.random() * 1.1,
        /* phase spreads the beacon pulses so they never blink in unison */
        phase: Math.random() * Math.PI * 2,
        beacon: false
      });
    }
    /* Beacons are assigned by stride rather than at random so they stay spread
       across the field instead of clustering. */
    var p = palette();
    if (p.a.beacons > 0 && nodes.length) {
      var stride = Math.max(1, Math.floor(nodes.length / p.a.beacons));
      for (var j = 0; j < nodes.length; j += stride) nodes[j].beacon = true;
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    draw(0);
  }

  function draw(t) {
    var p = palette();
    ctx.clearRect(0, 0, w, h);

    /* Connections first, so nodes always sit on top of their own lines.

       Sorted by x so the inner loop can stop as soon as the horizontal gap
       alone exceeds the link distance. Raising the node cap from 90 to 150
       tripled the naive pair count; this keeps the real work proportional to
       the number of nodes actually near each other rather than to n squared. */
    nodes.sort(function (a, b) { return a.x - b.x; });
    var LD = CFG.linkDist, LD2 = LD * LD;
    ctx.lineWidth = 1;
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j];
        var dx = b.x - a.x;
        if (dx > LD) break;
        var dy = a.y - b.y;
        var d2 = dx * dx + dy * dy;
        if (d2 > LD2) continue;
        ctx.strokeStyle = rgba(p.node, p.a.line * (1 - Math.sqrt(d2) / LD));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      if (n.beacon && p.a.beacon > 0) {
        /* 9s pulse. Slow enough to register as breathing rather than blinking. */
        var pulse = 0.55 + 0.45 * Math.sin(t / 9000 * Math.PI * 2 + n.phase);
        ctx.fillStyle = rgba(p.gold, p.a.beacon * pulse);
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 1.25, 0, Math.PI * 2); ctx.fill();
        /* Wider and fainter than before: the halo now reads as the node
           sitting in depth rather than as a glowing dot. */
        ctx.fillStyle = rgba(p.gold, p.a.beacon * pulse * 0.09);
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 8, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = rgba(p.node, p.a.dot);
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    maskContent();
  }

  /* ---- THE MASK ---------------------------------------------------------
     Punch the content out of the field. destination-out removes what it
     draws, and ctx.filter blurs the removal itself, so each text block sits in
     a soft well of empty ground rather than inside a hard rectangle.

     This is what makes the higher intensities above safe: it is a structural
     guarantee that no glyph is ever composited over the field, rather than an
     alpha low enough to survive being sat on.                             */

  var rects = [], rectsAt = -1, rectsW = -1;

  function push(out, r) {
    if (!r || r.width <= 0 || r.height <= 0) return;
    /* Off-screen rects cost fill time and can never affect a visible pixel. */
    if (r.bottom < -PAD || r.top > h + PAD) return;
    out.push(r);
  }

  function collectRects() {
    var out = [];

    /* Text, line box by line box. */
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        /* Skip anything not rendered, and the off-screen honeypot field. */
        if (p.closest(".cform-hp,.skip-link,script,style,noscript")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var range = document.createRange();
    var node;
    while ((node = walker.nextNode())) {
      range.selectNodeContents(node);
      var list = range.getClientRects();
      for (var i = 0; i < list.length; i++) push(out, list[i]);
    }

    /* Controls and images as whole boxes. */
    var boxes = document.querySelectorAll(BOX_SEL);
    for (var j = 0; j < boxes.length; j++) {
      if (boxes[j].id === "ambient") continue;
      push(out, boxes[j].getBoundingClientRect());
    }

    rects = out;
  }

  function maskContent() {
    /* Rects are viewport-relative and the canvas is fixed, so they only go
       stale when the page scrolls or the layout resizes. Recomputing on those
       two signals keeps this to one forced layout per scroll position rather
       than one per frame. */
    var y = window.scrollY || window.pageYOffset || 0;
    if (y !== rectsAt || w !== rectsW) { collectRects(); rectsAt = y; rectsW = w; }
    if (!rects.length) return;

    /* Every rect goes into ONE path and is filled once.
       ctx.filter applies per drawing operation, so the obvious loop of
       fillRect calls runs a separate 20px blur for each of ~250 rectangles.
       That was enough to stall a tall headless render outright. Batching makes
       it a single blurred composite regardless of how much text is on screen. */
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    if (typeof ctx.filter !== "undefined") ctx.filter = "blur(" + BLUR + "px)";
    ctx.fillStyle = "#000";
    ctx.beginPath();
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i];
      ctx.rect(r.left - PAD, r.top - PAD, r.width + PAD * 2, r.height + PAD * 2);
    }
    ctx.fill();
    ctx.restore();
  }

  function step(t) {
    raf = requestAnimationFrame(step);
    if (t - last < 1000 / CFG.fps) return;
    last = t;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      /* Wrap rather than bounce: a bounce reads as a boundary, and the field
         should feel like it continues past the edges of the window. */
      if (n.x < -10) n.x = w + 10; else if (n.x > w + 10) n.x = -10;
      if (n.y < -10) n.y = h + 10; else if (n.y > h + 10) n.y = -10;
    }
    draw(t);
  }

  function start() { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(step); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  resize();

  var rt = null;
  window.addEventListener("resize", function () {
    clearTimeout(rt); rt = setTimeout(resize, 180);
  });

  /* A hidden tab should cost nothing. */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  /* Repaint on theme change so the field switches palette with the page. */
  new MutationObserver(function () { draw(last); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* The mask is keyed to viewport-relative rects, so the field has to be
     repainted as the page scrolls. The animation loop already does that 30
     times a second; this listener exists for the reduced-motion path, where
     there is no loop and the mask would otherwise stay frozen at the position
     it was first drawn at — leaving the field sitting under text further down
     the page. Coalesced to one repaint per frame. */
  var pending = false;
  window.addEventListener("scroll", function () {
    if (!reduce || pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; draw(0); });
  }, { passive: true });

  if (reduce) draw(0); else start();
})();
