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

     1. Without JavaScript the popover never forms: every detail block renders
        in normal flow. Below 1080px (2026-11-07) the three text rows of each
        node sit behind a native <details> "Details" disclosure that works
        without this script, with company, dates, role and the Move link always
        visible; this script only closes them at narrow widths and opens them at
        wide ones (where they are the popover's content, not a disclosure).
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

  var wide = window.matchMedia("(min-width: 1080px)");

  var controls = nodes.map(function (node, i) {
    var head = node.querySelector(".tl-head");
    var detail = node.querySelector(".tl-detail");
    if (!head || !detail) return null;
    if (!detail.id) detail.id = "tl-detail-" + (i + 1);
    var coEl = node.querySelector(".tl-co");
    return { node: node, head: head, detail: detail,
             more: node.querySelector(".tl-more"),
             label: coEl && coEl.textContent ? "Show details for " + coEl.textContent.trim() : "" };
  }).filter(Boolean);

  if (!controls.length) return;

  /* Two layouts, two interaction models. At 1080px and up the row is
     horizontal and each head is a button that opens a popover (the detail
     block is absolutely positioned there). Below that the detail is in normal
     flow and each node carries its own native <details> disclosure, so the head
     is just a heading: giving it role=button and a tab stop on a phone would
     be a control that does nothing. The <details> are forced open at the wide
     width, where they are not a disclosure but the popover's own content. */
  function applyMode() {
    controls.forEach(function (c) {
      if (wide.matches) {
        c.head.setAttribute("tabindex", "0");
        c.head.setAttribute("role", "button");
        c.head.setAttribute("aria-controls", c.detail.id);
        c.head.setAttribute("aria-expanded", c.node.classList.contains("is-open") ? "true" : "false");
        if (c.label) c.head.setAttribute("aria-label", c.label);
        if (c.more) c.more.open = true;
      } else {
        ["tabindex", "role", "aria-controls", "aria-expanded", "aria-label"].forEach(function (a) { c.head.removeAttribute(a); });
        c.node.classList.remove("is-open");
        if (c.more) c.more.open = false;
      }
    });
  }

  function closeAll(except) {
    controls.forEach(function (c) {
      if (c.node === except) return;
      c.node.classList.remove("is-open");
      if (wide.matches) c.head.setAttribute("aria-expanded", "false");
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

  applyMode();
  if (wide.addEventListener) wide.addEventListener("change", applyMode);
  else if (wide.addListener) wide.addListener(applyMode);

  controls.forEach(function (c) {
    /* Mouse users who click get the same "pinned open" state a tap gets —
       useful for reading at their own pace instead of holding a hover. */
    c.head.addEventListener("click", function (e) {
      if (!wide.matches) return;
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
      if (!wide.matches) return;
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
