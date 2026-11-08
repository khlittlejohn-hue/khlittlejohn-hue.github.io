/* ============================================================================
   sysmap.js - the interactive Executive Office map.

   Restored 2026-11-08 at Kyle's request (it was cut from the homepage on
   2026-09-10 and he asked for it back). It is the one element on the page that
   lets a visitor interrogate the system instead of reading a claim about it.

   The ring is laid out from the data: the angular step is derived from the
   length of the array, so the ring stays correct if a domain is added or
   removed. All 14 functional domains are drawn.

   Everything the component does is progressive: without JS the <noscript> list
   in the page renders, and the phone list is built from the same data as the
   diagram so there is never a second, degraded implementation.
   ============================================================================ */
(function () {
  "use strict";

  var stage = document.getElementById("smStage");
  var detail = document.getElementById("smDetail");
  var list = document.getElementById("smList");
  var sysmap = document.getElementById("sysmap");
  if (!stage || !detail || !list || !sysmap) return;

  var CORE = {
    name: "Chief of Staff · Orchestration",
    tag: "The core",
    desc: "A Chief of Staff aggregates every domain into one operating picture, a daily-operations agent runs the day, and an independent QA function reviews the system from the outside.",
    roles: ["Chief of Staff", "Daily Operations", "Independent QA Review"],
    note: "A human on every decision that leaves the system."
  };

  /* PUBLIC MAP, 2026-11-08. All 14 functional domains (ACHIEVEMENT_BANK section
     16), named for a public reader. Color is data, not decoration: it is what
     makes a routed packet traceable to the domain that dispatched it. Four
     representative roles per domain; no per-domain agent count is published,
     because counts drift and the only locked public figure is the 120+ floor. */
  var DEPTS = [
    { k: "clients", lbl: "Clients", name: "Client Engagements", c: "#A3E635",
      desc: "Scopes and delivers the consulting work, and keeps the commercial side of it in order.",
      roles: ["Client Partner", "Engagement Manager", "Scope & Agreements", "Delivery Reporting"] },
    { k: "research", lbl: "Research", name: "Research & Intelligence", c: "#A78BFA",
      desc: "Deep-dive research on companies, people and decisions, with every claim backed by a cited source.",
      roles: ["Company Analyst", "People Researcher", "Source Verifier", "Briefing Synthesizer"] },
    { k: "comms", lbl: "Comms", name: "Communications", c: "#34D399",
      desc: "Voice-matched drafting for correspondence and writing, built to sound like the principal rather than a model.",
      roles: ["Voice-Match Writer", "Editor", "Message Auditor", "Review Gate"] },
    { k: "position", lbl: "Positioning", name: "Executive Positioning", c: "#FB923C",
      desc: "The resume, the narrative and every claim behind them, checked against one canonical record before anything leaves.",
      roles: ["Narrative Strategist", "Claims Registrar", "Adversarial Reviewer", "Final Gate"] },
    { k: "calendar", lbl: "Calendar", name: "Calendar & Scheduling", c: "#F472B6",
      desc: "Conflict resolution, focus-block protection, and a briefing packet ready before every meeting.",
      roles: ["Scheduling Coordinator", "Focus-Block Guardian", "Briefing-Packet Builder", "Conflict Resolver"] },
    { k: "email", lbl: "Email", name: "Email Operations", c: "#6FD8E8",
      desc: "Sorts and escalates correspondence, and drafts the replies that wait for a click.",
      roles: ["Sorting", "Categorization", "Escalation Router", "Reply Drafter"] },
    { k: "personal", lbl: "Personal", name: "Personal Operations", c: "#F59E0B",
      desc: "Travel, documents, renewals and the logistics of a life, run on the same cadence as the work.",
      roles: ["Travel Planner", "Document Manager", "Payments & Renewals", "Events & Reminders"] },
    { k: "fitness", lbl: "Fitness", name: "Fitness & Performance", c: "#F87171",
      desc: "Training plans, a race calendar, nutrition and long-run health tracking.",
      roles: ["Training Coach", "Race-Calendar Planner", "Nutrition Lead", "Health Tracker"] },
    { k: "finance", lbl: "Finance", name: "Accounting & Finance", c: "#FCD34D",
      desc: "Bookkeeping and tax operations for the business, and an investment research desk.",
      roles: ["Bookkeeper", "Tax Operations", "Investment Analyst", "Portfolio Reviewer"] },
    { k: "tools", lbl: "Tools", name: "Dashboard & Tools", c: "#F5C451",
      desc: "The internal tooling, data pipelines and rendering layer the rest of the system runs on.",
      roles: ["Tooling Engineer", "Data-Pipeline Owner", "Rendering Engineer", "UX Designer"] },
    { k: "apps", lbl: "Apps", name: "App Development", c: "#22D3EE",
      desc: "Runs the product teams behind the software I build, from sprint plan through release gate.",
      roles: ["Product Manager", "Engineering Lead", "QA Lead", "Design Lead"] },
    { k: "ventures", lbl: "Ventures", name: "Ventures & Diligence", c: "#4ADE80",
      desc: "Pressure-tests a new business case through a full review panel before any commitment is made.",
      roles: ["Venture Analyst", "Review Panel", "Market Validator", "Go / No-Go Reviewer"] },
    { k: "marketing", lbl: "Marketing", name: "Content & Marketing", c: "#C084FC",
      desc: "A content pipeline with a consistent voice, a publishing cadence, and a measurable objective.",
      roles: ["Content Producer", "Brand-Voice Lead", "Cadence Planner", "Performance Analyst"] },
    { k: "learning", lbl: "Learning", name: "Learning & Improvement", c: "#FFD47E",
      desc: "Captures incoming ideas, evaluates them on the merits, and implements the ones worth adopting.",
      roles: ["Capture", "Evaluation Reviewer", "Implementation Engineer", "Adoption Tracker"] }
  ];

  var NS = "http://www.w3.org/2000/svg";
  var cx = 300, cy = 300, ring = 206, coreR = 56, nodeR = 25, labelR = 272;
  var STEP = 360 / DEPTS.length;   /* the fix: derived, not hardcoded to 30 */

  var nodeEls = {}, lineEls = {}, chipEls = {};

  function el(t, a) {
    var e = document.createElementNS(NS, t);
    for (var k in a) { if (Object.prototype.hasOwnProperty.call(a, k)) e.setAttribute(k, a[k]); }
    return e;
  }
  function angleOf(i) { return (-90 + i * STEP) * Math.PI / 180; }

  var svg = el("svg", {
    viewBox: "-40 -28 680 656",
    role: "group",
    "aria-label": DEPTS.length + " functional domains around a Chief of Staff core"
  });

  /* Edges first so nodes paint over them. */
  DEPTS.forEach(function (d, i) {
    var a = angleOf(i);
    var ln = el("line", {
      x1: cx + coreR * Math.cos(a), y1: cy + coreR * Math.sin(a),
      x2: cx + (ring - nodeR) * Math.cos(a), y2: cy + (ring - nodeR) * Math.sin(a),
      class: "sm-line"
    });
    ln.style.animationDelay = (i * 0.045) + "s";
    lineEls[d.k] = ln;
    svg.appendChild(ln);
  });

  /* Core. */
  var core = el("g", { class: "sm-core", tabindex: "0", role: "button", "aria-label": "Orchestration core" });
  core.appendChild(el("circle", { cx: cx, cy: cy, r: coreR + 13, class: "halo" }));
  core.appendChild(el("circle", { cx: cx, cy: cy, r: coreR, class: "disc" }));
  core.appendChild(el("circle", { cx: cx, cy: cy, r: coreR, class: "ring" }));
  /* One text element, two tspans spaced in em: the line gap scales with the
     (rendered-size-constant) font, so the two lines never touch on a phone. */
  var ct = el("text", { x: cx, y: cy, class: "ttl" });
  var t1 = el("tspan", { x: cx, dy: "-0.15em" }); t1.textContent = "Chief";
  var t2 = el("tspan", { x: cx, dy: "1.2em" }); t2.textContent = "of Staff";
  ct.appendChild(t1); ct.appendChild(t2);
  /* The "orchestration" sub-label is gone. SVG text scales with the viewBox,
     so its 10.5px CSS size rendered at 8.86px on a 1440 desktop and smaller
     still on narrower screens - under the 11.52px floor tokens.css declares as
     the point below which nothing readable is set. No fixed CSS value fixes
     that, because the scale factor moves with the viewport; the string would
     have needed ~20px CSS to hold the floor at the narrowest width the map is
     shown, which does not fit inside a 112px core.

     Removing it costs nothing: the detail panel beside the map already reads
     "Chief of Staff · Orchestration" at full size, the SVG's aria-label still
     names the orchestration core for screen readers, and the phone list chip
     carries the same words. It was a third line of type inside a small circle
     that no one could read. */
  core.appendChild(ct);
  svg.appendChild(core);

  /* Nodes. */
  DEPTS.forEach(function (d, i) {
    var a = angleOf(i);
    var x = cx + (ring - nodeR) * Math.cos(a);
    var y = cy + (ring - nodeR) * Math.sin(a);
    var lx = cx + labelR * Math.cos(a);
    var ly = cy + labelR * Math.sin(a);

    var g = el("g", { class: "sm-node", tabindex: "0", role: "button", "aria-label": d.name });
    g.style.animationDelay = (0.25 + i * 0.035) + "s";
    g.appendChild(el("circle", { cx: x, cy: y, r: nodeR, class: "dot" }));
    var n = el("text", { x: x, y: y, class: "num" }); n.textContent = String(i + 1);
    g.appendChild(n);
    var l = el("text", { x: lx, y: ly + 4, class: "lbl" }); l.textContent = d.lbl;
    g.appendChild(l);

    nodeEls[d.k] = g;
    svg.appendChild(g);
  });

  stage.appendChild(svg);

  /* CONSTANT RENDERED TYPE SIZE.
     SVG text scales with the viewBox, so a fixed CSS px size renders smaller
     as the stage narrows. Measured before this fix: node labels declared at
     14px rendered 8.41px at a 900px viewport and 9.69px at 1024 - well under
     the 11.52px floor tokens.css sets, across the whole 861-1200px band where
     the map is shown. Bumping the declaration could not fix it, because the
     scale factor moves with the viewport.

     Publishing the inverse scale as a custom property lets the stylesheet ask
     for a rendered size instead of a document size: font-size: calc(11.5px *
     var(--sm-k)) resolves to 11.5 CSS pixels on screen at every width. */
  function syncTypeScale() {
    var box = svg.getBoundingClientRect();
    if (!box.width) return;
    stage.style.setProperty("--sm-k", (680 / box.width).toFixed(4));
  }
  syncTypeScale();
  if ("ResizeObserver" in window) new ResizeObserver(syncTypeScale).observe(stage);
  else window.addEventListener("resize", syncTypeScale);

  /* ---- Detail panel ------------------------------------------------------ */

  function render(d, isCore) {
    var roles = d.roles.map(function (r) { return "<li>" + r + "</li>"; }).join("");
    if (isCore && d.note) roles += '<li class="note">' + d.note + "</li>";
    detail.innerHTML =
      '<div class="dt-tag">' + (isCore ? d.tag : "Domain") + "</div>" +
      '<h3 class="dt-name">' + d.name + "</h3>" +
      '<p class="dt-desc">' + d.desc + "</p>" +
      '<div class="dt-roles-h">Roles</div>' +
      '<ul class="dt-roles">' + roles + "</ul>";
  }

  function show(key) {
    var isCore = key === "core";
    render(isCore ? CORE : DEPTS.filter(function (d) { return d.k === key; })[0], isCore);

    DEPTS.forEach(function (d) {
      var on = d.k === key;
      nodeEls[d.k].classList.toggle("active", on);
      lineEls[d.k].classList.toggle("active", on);
      if (chipEls[d.k]) chipEls[d.k].classList.toggle("active", on);
    });
    core.querySelector(".ring").style.strokeWidth = isCore ? "2.8" : "";
    if (chipEls.core) chipEls.core.classList.toggle("active", isCore);
  }

  function bind(elm, key) {
    elm.addEventListener("mouseenter", function () { show(key); });
    elm.addEventListener("focus", function () { show(key); });
    elm.addEventListener("click", function () { show(key); });
    elm.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(key); }
    });
  }
  bind(core, "core");
  DEPTS.forEach(function (d) { bind(nodeEls[d.k], d.k); });

  /* ---- Phone list: same data, same handler ------------------------------- */

  var coreChip = document.createElement("button");
  coreChip.type = "button";
  coreChip.className = "core-chip";
  coreChip.textContent = "Chief of Staff · the core";
  coreChip.addEventListener("click", function () { show("core"); });
  chipEls.core = coreChip;
  list.appendChild(coreChip);

  DEPTS.forEach(function (d, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.innerHTML = '<span class="n">' + (i + 1) + "</span>" + d.lbl;
    b.addEventListener("click", function () { show(d.k); });
    chipEls[d.k] = b;
    list.appendChild(b);
  });

  show("core");

  /* ---- Ambient work routing ---------------------------------------------
     A packet leaves the core along every edge on a staggered loop. This is
     the element that makes the diagram read as a running system rather than
     an org chart, and it is the specific thing the 2.0 rebuild lost.      */

  function addPackets() {
    if (addPackets.done) return;
    addPackets.done = true;
    DEPTS.forEach(function (d, i) {
      var ln = lineEls[d.k];
      var path = "M" + ln.getAttribute("x1") + " " + ln.getAttribute("y1") +
                 " L" + ln.getAttribute("x2") + " " + ln.getAttribute("y2");
      var begin = (1.0 + i * 0.36).toFixed(2) + "s";
      /* The packet is drawn at the origin and moved by animateMotion along an
         ABSOLUTE path, because SMIL adds the motion to the element's own position.
         (Seeding cx and cy to the path's first point, as the first version did,
         doubled the offset and sent every packet off toward the bottom right,
         clipped by the svg box. Fixed 2026-11-08.) Opacity 0 keeps the dot
         invisible until its animation begins. */
      var pk = el("circle", {
        cx: 0, cy: 0,
        r: 2.7, fill: d.c, opacity: "0", class: "sm-packet"
      });
      pk.appendChild(el("animateMotion", {
        dur: "3.4s", repeatCount: "indefinite", begin: begin, calcMode: "linear", path: path
      }));
      pk.appendChild(el("animate", {
        attributeName: "opacity", dur: "3.4s", repeatCount: "indefinite", begin: begin,
        keyTimes: "0;0.12;0.82;1", values: "0;0.95;0.95;0", calcMode: "linear"
      }));
      svg.appendChild(pk);
    });
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    sysmap.classList.add("anim");

    function light() {
      if (sysmap.classList.contains("lit")) return;
      sysmap.classList.add("lit");
      addPackets();
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { light(); io.disconnect(); }
        });
      }, { threshold: 0.3 });
      io.observe(sysmap);

      /* FAIL-SAFE. .sysmap.anim sets every node and the core to opacity 0 and
         holds the edges at full stroke-dashoffset - the diagram is not merely
         un-animated before .lit lands, it is INVISIBLE. That makes the
         observer a single point of failure for the most important element on
         the page: if it never fires, a visitor sees an empty box with a
         "hover a domain" hint under it.

         Observed exactly that while capturing screenshots through a scrolled
         iframe, where the callback did not run before paint. Rather than treat
         that as a harness quirk, the entrance now has a deadline. If the
         observer has not reported after 2.5s the diagram lights anyway; a
         visitor who never scrolls this far simply never sees it happen, and
         one who does still gets the animation in the normal case. */
      setTimeout(light, 2500);
    } else {
      light();
    }
  }
})();
