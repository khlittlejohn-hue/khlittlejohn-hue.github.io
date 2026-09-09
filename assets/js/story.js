/* ============================================================================
   story.js — the narrative rail, the arriving career arc, and Trace a request.

   Everything here is additive and progressive. Without JavaScript the rail
   is not rendered (display:none until html.js), every arc step is already
   lit, and the trace button is simply absent. Nothing here reads or changes
   copy; the trace narration is assembled from the stage names and role lines
   already in the markup.
   ============================================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ---- 1. Narrative rail -------------------------------------------------- */
  var rail = document.getElementById("acts");
  if (rail) {
    var links = Array.prototype.slice.call(rail.querySelectorAll("a"));
    var targets = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
    var current = -1;
    function setCurrent(i) {
      if (i === current) return;
      current = i;
      links.forEach(function (a, j) {
        if (j === i) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        if (j < i) a.setAttribute("data-done", ""); else a.removeAttribute("data-done");
      });
    }
    function pick() {
      /* The act whose top has passed the upper third of the viewport. */
      var line = window.innerHeight * 0.34, best = 0;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i] && targets[i].getBoundingClientRect().top <= line) best = i;
      }
      setCurrent(best);
    }
    var pending = false;
    window.addEventListener("scroll", function () {
      if (pending) return; pending = true;
      requestAnimationFrame(function () { pending = false; pick(); });
    }, { passive: true });
    window.addEventListener("resize", pick);
    /* Belt and braces for environments where scroll events are throttled or
       swallowed (same-origin iframe harnesses, some in-app browsers): the
       rail re-evaluates at a low idle cadence as well. Cheap — eight rects. */
    setInterval(pick, 600);
    pick();
  }

  /* ---- 2. Arc steps arrive ----------------------------------------------- */
  var steps = Array.prototype.slice.call(document.querySelectorAll(".arc-step"));
  if (steps.length) {
    if (reduce || !hasIO) {
      steps.forEach(function (s) { s.classList.add("in"); });
    } else {
      var seen = 0;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var idx = steps.indexOf(en.target);
          /* Light in career order regardless of which enters first, so the
             row reads left to right even when the whole spine appears at once. */
          for (var i = 0; i <= idx; i++) {
            (function (s, delay) { setTimeout(function () { s.classList.add("in"); }, delay); })(steps[i], Math.max(0, i - seen) * 90);
          }
          seen = Math.max(seen, idx + 1);
          io.unobserve(en.target);
        });
      }, { threshold: 0.35 });
      steps.forEach(function (s) { io.observe(s); });
      /* Fail-safe, same reasoning as sysmap.js: never leave the career dim.
         Fires 2.5s after the section first comes within a viewport of the
         reader, rather than 4s after load — a visitor who lingers on the hero
         should still see the arc arrive. */
      var armed = false;
      function arm() {
        if (armed) return;
        var top = steps[0].getBoundingClientRect().top;
        if (top < window.innerHeight * 1.5) { armed = true; setTimeout(function () { steps.forEach(function (s) { s.classList.add("in"); }); }, 2500); }
      }
      window.addEventListener("scroll", arm, { passive: true }); setInterval(arm, 600); arm();
    }
  }

  /* ---- 3. Trace a request ------------------------------------------------- */
  var btn = document.getElementById("osTrace");
  var status = document.getElementById("osTraceStatus");
  var stages = Array.prototype.slice.call(document.querySelectorAll(".os-flow .os-stage"));
  var sysmap = document.getElementById("sysmap");
  if (!btn || !status || stages.length !== 6 || !sysmap) return;

  var nodes = function () { return Array.prototype.slice.call(sysmap.querySelectorAll(".sm-node")); };
  var core = function () { return sysmap.querySelector(".sm-core"); };
  var chips = function () { return Array.prototype.slice.call(sysmap.querySelectorAll(".sysmap-list button")); };
  var mapVisible = function () { var m = sysmap.querySelector(".sysmap-map"); return m && m.offsetParent !== null; };

  /* Drive the existing component through its own listeners rather than
     reaching into its closure. mouseenter is what the SVG nodes bind; the
     phone chips bind click. */
  function focusMap(which, domainIdx) {
    if (mapVisible()) {
      var el = which === "core" ? core() : nodes()[domainIdx];
      if (el) el.dispatchEvent(new Event("mouseenter"));
    } else {
      var c = chips();
      var el2 = which === "core" ? c[0] : c[domainIdx + 1];
      if (el2) el2.click();
    }
  }

  var runIdx = 0, timer = null, running = false;
  var STEP_MS = 1150;

  function label(i) {
    var name = stages[i].querySelector(".os-name").textContent.trim();
    var role = stages[i].querySelector(".os-role").textContent.trim();
    return "<b>" + (i + 1) + " · " + name + "</b> — " + role;
  }

  function reset() {
    stages.forEach(function (s) { s.removeAttribute("data-live"); s.removeAttribute("data-done"); });
    sysmap.classList.remove("tracing");
    status.textContent = "";
  }

  function finish(domainIdx) {
    running = false;
    sysmap.classList.remove("tracing");
    var n = nodes()[domainIdx];
    var lbl = n ? n.getAttribute("aria-label") : "one domain";
    status.innerHTML = "One request, six stages, one approval. Routed through <b>" + lbl + "</b>.";
    btn.textContent = "Trace another \u2192";
    btn.disabled = false;
  }

  function run() {
    if (running) return;
    running = true;
    btn.disabled = true;
    btn.textContent = "Tracing\u2026";
    reset();
    sysmap.classList.add("tracing");
    var count = nodes().length || 14;
    var domainIdx = runIdx % count; runIdx++;

    /* Where the request is on the map at each stage:
       intake and routing sit with the core; production is the domain;
       QC and human review return to the core; output leaves. */
    var where = ["core", "core", "domain", "core", "core", null];
    var i = 0;
    function tick() {
      if (i > 0) { stages[i - 1].removeAttribute("data-live"); stages[i - 1].setAttribute("data-done", ""); }
      if (i === 6) { finish(domainIdx); return; }
      stages[i].setAttribute("data-live", "");
      status.innerHTML = label(i);
      if (where[i]) focusMap(where[i], domainIdx);
      i++;
      if (reduce) {
        /* No timed motion: each click advances one stage. */
        running = false; btn.disabled = false;
        btn.textContent = i === 6 ? "Finish trace \u2192" : "Next stage \u2192";
        btn.onclick = function () { btn.onclick = start; running = true; btn.disabled = true; tick(); };
        return;
      }
      timer = setTimeout(tick, STEP_MS);
    }
    tick();
  }
  function start() { run(); }
  btn.onclick = start;
})();

