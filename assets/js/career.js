/* ============================================================================
   career.js — hover/tap disclosure for the V3 career spine.

   2026-09-10 — rewritten for the horizontal layout. Company, dates and (below
   1080px) role are permanent. This script's only job is deciding WHICH node's
   detail panel (the there-to-solve/owned/evidence/move rows) is open, and
   making that reachable on every input type:

     - Mouse:    real CSS :hover, scoped in career-arc's stylesheet to devices
                 that report genuine hover + a fine pointer. This script does
                 not need to do anything for that case.
     - Keyboard: :focus-within, also pure CSS. This script's job is making
                 .tl-head a reachable, identifiable control — tabindex, a
                 button role, and an aria-expanded state — since the markup
                 does not ship those baked in (progressive enhancement: no JS
                 means no synthetic control, and a plain heading is still a
                 plain heading).
     - Touch:    hover does not exist here, so this script adds a click/tap
                 listener that toggles an .is-open class. That is the actual
                 fallback the task requires, not a media-query trick — a tap
                 fires `click` on every input type, including a screen-reader
                 "activate" gesture, so it is also the most robust of the
                 three paths.

   The collapsing behaviour lives entirely behind .tl--js, which only this
   file adds, and only the >=1080px stylesheet rules act on it. Two
   consequences, both deliberate, both inherited from the previous version of
   this file:

     1. Without JavaScript, or below 1080px, every detail block renders fully
        expanded. Longer section, completely readable — the correct failure
        mode for a career history, and the correct default for a phone, where
        there is no natural "hover a segment" gesture to fall back on at all.
     2. If the script loads but a click handler throws or never attaches, the
        section still reads: nothing here removes content from the DOM or
        hides it with display:none, so a reader who never gets an interactive
        panel just gets the un-collapsed version instead of a dead one.

   Collapsed detail is hidden with max-height/opacity/overflow, never
   display:none or visibility:hidden, so assistive technology can still reach
   all six nodes regardless of which one is visually open.
   ============================================================================ */

(function () {
  "use strict";

  var tl = document.getElementById("careerTl");
  if (!tl) return;

  var nodes = Array.prototype.slice.call(tl.querySelectorAll(".tl-node"));
  if (nodes.length < 2) return;

  tl.classList.add("tl--js");

  var controls = nodes.map(function (node, i) {
    var head = node.querySelector(".tl-head");
    var detail = node.querySelector(".tl-detail");
    if (!head || !detail) return null;

    if (!detail.id) detail.id = "tl-detail-" + (i + 1);
    head.setAttribute("tabindex", "0");
    head.setAttribute("role", "button");
    head.setAttribute("aria-controls", detail.id);
    head.setAttribute("aria-expanded", "false");

    var coEl = node.querySelector(".tl-co");
    if (coEl && coEl.textContent) {
      head.setAttribute("aria-label", "Show details for " + coEl.textContent.trim());
    }

    return { node: node, head: head, detail: detail };
  }).filter(Boolean);

  if (!controls.length) return;

  function closeAll(except) {
    controls.forEach(function (c) {
      if (c.node === except) return;
      c.node.classList.remove("is-open");
      c.head.setAttribute("aria-expanded", "false");
    });
  }

  function toggle(c) {
    var willOpen = !c.node.classList.contains("is-open");
    closeAll();
    if (willOpen) {
      c.node.classList.add("is-open");
      c.head.setAttribute("aria-expanded", "true");
    }
  }

  controls.forEach(function (c) {
    /* Mouse users who click get the same "pinned open" state a tap gets —
       useful for reading at their own pace instead of holding a hover. */
    c.head.addEventListener("click", function (e) {
      e.preventDefault();
      toggle(c);
    });

    /* Hovering a DIFFERENT node than the one currently pinned open closes the
       pin, so a mouse user never sees two panels — one CSS-hovered, one
       JS-pinned — competing for the same space. */
    c.head.addEventListener("mouseenter", function () {
      closeAll(c.node);
    });

    c.head.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        toggle(c);
      } else if (e.key === "Escape") {
        closeAll();
        c.head.focus();
      }
    });
  });

  tl.addEventListener("mouseleave", function () {
    closeAll();
  });

  document.addEventListener("click", function (e) {
    if (!tl.contains(e.target)) closeAll();
  });
})();
