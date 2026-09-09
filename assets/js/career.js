/* ============================================================================
   career.js — progressive disclosure for the V3 career spine.

   Company, dates and title are permanent. This script only decides WHICH node
   has its detail block open, based on which one is nearest the vertical centre
   of the viewport.

   The collapsing behaviour lives behind the .tl--js class, which this file
   adds. Two consequences, both deliberate:

     1. Without JavaScript the markup renders with all six nodes expanded. The
        section is longer but completely readable, which is the correct failure
        mode for a career history.
     2. If the script loads but never manages to activate a node, the fail-safe
        below removes .tl--js and restores that same expanded state. The 2.0
        system map shipped a bug of exactly this shape — an animation class set
        opacity to 0 and the "reveal" never ran, so the map rendered as an empty
        box. Same guard, same reason.

   Collapsed detail is hidden with max-height and overflow, never display:none
   or visibility:hidden, so assistive technology still reaches all six nodes in
   full regardless of which one is visually open.
   ============================================================================ */

(function () {
  "use strict";

  var tl = document.getElementById("careerTl");
  if (!tl) return;

  var nodes = Array.prototype.slice.call(tl.querySelectorAll(".tl-node"));
  if (nodes.length < 2) return;

  tl.classList.add("tl--js");

  /* Seed the first node open. At load the section sits below the fold, so the
     nearest-to-centre search below has nothing on screen to choose and would
     leave every detail collapsed until the reader scrolls into range. Opening
     the first node means the spine is never rendered fully closed, including
     for someone who arrives mid-section through the #career anchor. */
  var active = 0;
  nodes[0].classList.add("is-active");

  function pick() {
    var mid = window.innerHeight / 2;
    var best = -1;
    var bestDist = Infinity;

    for (var i = 0; i < nodes.length; i++) {
      var r = nodes[i].getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      var dist = Math.abs(r.top + r.height / 2 - mid);
      if (dist < bestDist) { bestDist = dist; best = i; }
    }

    /* Nothing on screen — the section is above or below the viewport. Keep the
       last choice rather than closing everything, so scrolling back does not
       land on a collapsed node. */
    if (best === -1 || best === active) return;

    if (active > -1) nodes[active].classList.remove("is-active");
    nodes[best].classList.add("is-active");
    active = best;
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      pick();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  pick();

  /* Fail-safe. .tl--js collapses every detail block, so if activation never
     happens the section degrades to six headings with no substance. Expanding
     everything is the honest fallback.

     The in-view test matters: "nothing is active" is the CORRECT state while
     the section is still below the fold, and firing on that alone would tear
     the behaviour out on every page load before the reader ever reached it. */
  window.setTimeout(function () {
    var r = tl.getBoundingClientRect();
    var inView = r.top < window.innerHeight && r.bottom > 0;
    if (inView && active === -1) tl.classList.remove("tl--js");
  }, 2500);
})();
