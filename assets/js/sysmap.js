/* ============================================================================
   sysmap.js — the interactive Executive Office map.

   Recovered from the pre-2.0 homepage, where it was inlined. Extracted to its
   own file here so the page markup stays readable and the component can be
   reused on work/executive-office.html later.

   ONE REAL BUG WAS FIXED IN RECOVERY. The legacy version placed nodes at
   (-90 + i * 30) degrees — a 30-degree step, which is correct for 12 nodes and
   wrong for the 14 the array actually held. Departments 13 and 14 were being
   drawn at 270 and 300 degrees, directly on top of departments 1 and 2. The
   step is now derived from the array length, so the ring stays correct if the
   office grows again.

   Everything the component does is progressive: without JS the <noscript>
   still image renders, and the department list is built from the same data as
   the diagram so the phone path is never a degraded second implementation.
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
    desc: "A Chief of Staff aggregates all 14 domains into one operating picture, an Executive Assistant runs the day, and an independent QA team reviews the system from the outside.",
    roles: ["Chief of Staff", "Executive Assistant", "Independent QA / Super-User Review"],
    note: "A human on every decision that leaves the system."
  };

  /* Colour per department is data, not decoration: it is what makes an
     individual packet traceable back to the domain that dispatched it. */
  var DEPTS = [
    { k: "careers", lbl: "Careers", name: "Careers & Job Search", c: "#E8954E",
      desc: "Sources roles, tailors resumes to each posting, runs a multi-stage quality-control pipeline, and drafts the outreach that follows.",
      roles: ["Talent Sourcer", "Resume Strategist", "Application QC Reviewer", "Outreach Writer"] },
    { k: "research", lbl: "Research", name: "Research & Intelligence", c: "#A78BFA",
      desc: "Deep-dive research on companies, people, and decisions, with every claim backed by a cited source.",
      roles: ["Company Analyst", "People Researcher", "Source Verifier", "Briefing Synthesizer"] },
    { k: "comms", lbl: "Comms", name: "Communications", c: "#34D399",
      desc: "Voice-matched drafting for email, networking, and writing, built to sound like the principal rather than a model.",
      roles: ["Voice-Match Writer", "Networking Strategist", "Editor", "Message Auditor"] },
    { k: "finance", lbl: "Finance", name: "Accounting & Finance", c: "#F5C451",
      desc: "Wealth strategy, an investment research desk, and the tax and portfolio operations behind them.",
      roles: ["Wealth Strategist", "Investment Analyst", "Tax Operations", "Portfolio Manager"] },
    { k: "calendar", lbl: "Calendar", name: "Calendar & Scheduling", c: "#F472B6",
      desc: "Conflict resolution, focus-block protection, and a briefing packet ready before every meeting.",
      roles: ["Scheduling Coordinator", "Focus-Block Guardian", "Briefing-Packet Builder", "Conflict Resolver"] },
    { k: "email", lbl: "Email", name: "Email Operations", c: "#6FD8E8",
      desc: "Inbox triage, categorisation, escalation of what matters, and drafted replies waiting for a click.",
      roles: ["Inbox Triage", "Categorisation", "Escalation Router", "Reply Drafter"] },
    { k: "lifestyle", lbl: "Lifestyle", name: "Lifestyle & Operations", c: "#34D399",
      desc: "The logistics of a life: bills, travel, documents, events, and reminders, handled.",
      roles: ["Bills & Payments", "Travel Planner", "Document Manager", "Events & Reminders"] },
    { k: "fitness", lbl: "Fitness", name: "Fitness & Performance", c: "#F472B6",
      desc: "Training plans, a race calendar, nutrition, and longitudinal health tracking.",
      roles: ["Training Coach", "Race-Calendar Planner", "Nutrition Lead", "Health Tracker"] },
    { k: "tools", lbl: "Tools", name: "Dashboard & Tools", c: "#F5C451",
      desc: "The internal tooling, data pipelines, and rendering layer the rest of the office runs on.",
      roles: ["Tooling Engineer", "Data-Pipeline Owner", "Rendering Engineer", "UX Designer"] },
    { k: "learning", lbl: "Learning", name: "Learning & Improvement", c: "#FFD47E",
      desc: "Captures incoming ideas, evaluates them on the merits, and implements the ones worth adopting.",
      roles: ["Capture", "Evaluation Reviewer", "Implementation Engineer", "Adoption Tracker"] },
    { k: "marketing", lbl: "Marketing", name: "Social & Marketing", c: "#A78BFA",
      desc: "A content pipeline with a consistent voice, a posting cadence, and a path to monetisation.",
      roles: ["Content Producer", "Brand-Voice Lead", "Cadence Planner", "Monetisation Strategist"] },
    { k: "ventures", lbl: "Ventures", name: "Entrepreneur & Ventures", c: "#34D399",
      desc: "Pressure-tests new business ideas through a full investor-panel review before any commitment.",
      roles: ["Venture Analyst", "Investor Panel", "Market Validator", "Go / No-Go Reviewer"] },
    { k: "apps", lbl: "Apps", name: "App Development", c: "#22D3EE",
      desc: "Runs the product teams behind the software I build, from sprint plan through release gate.",
      roles: ["Product Manager", "Engineering Lead", "QA Lead", "Design Lead"] },
    { k: "clients", lbl: "Clients", name: "Client Engagements", c: "#A3E635",
      desc: "Scopes and delivers outside consulting work, and keeps the commercial side of it in order.",
      roles: ["Client Partner", "Engagement Manager", "Scope & Agreements", "Delivery Reporting"] }
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
    role: "img",
    "aria-label": DEPTS.length + " domains orbiting a Chief of Staff orchestration core"
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
  var ct = el("text", { x: cx, y: cy - 3, class: "ttl" }); ct.textContent = "Chief";
  var ct2 = el("text", { x: cx, y: cy + 15, class: "ttl" }); ct2.textContent = "of Staff";
  var cs = el("text", { x: cx, y: cy + 33, class: "sub" }); cs.textContent = "orchestration";
  core.appendChild(ct); core.appendChild(ct2); core.appendChild(cs);
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
  coreChip.textContent = "Chief of Staff · orchestration core";
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
      /* cx/cy and opacity are set explicitly because a packet is created up to
         5.7s before its animation begins. Until then SMIL has not taken over,
         so the circle renders at its BASE values — which default to cx=0, cy=0,
         opacity=1, i.e. a fully opaque coloured dot parked at the SVG origin in
         the top-left corner. Seeding the base state to the animation's own
         first keyframe makes the pre-roll invisible. */
      var pk = el("circle", {
        cx: ln.getAttribute("x1"), cy: ln.getAttribute("y1"),
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
         holds the edges at full stroke-dashoffset — the diagram is not merely
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
