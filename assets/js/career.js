/* ============================================================================
   career.js - which role's details are open, on every input type.

   Build 2 (2026-11-08). Three layouts (see layouts/home-v2.css):
     - 1080px and up: one row, a popover under each node.
     - 720 to 1079px: a 3 by 2 grid of heads and ONE full-width drawer under it.
     - under 720px: stacked cards with every detail already showing.

   From 720px up each head is a button (tabindex, role, aria-expanded,
   aria-controls). Hover (1080 and up, real pointers only), focus, click and tap
   open the panel; Enter or Space toggles it; Escape closes it and returns focus.
   Below 720px there is nothing to open, so the head stays a plain heading.

   The row reserves exactly the open panel's height under itself, measured live,
   so an open panel never floats over the Selected work cards and never leaves a
   dead gap (this replaced a table of hard-coded margins).

   In drawer mode a pointer on its way down to the drawer crosses the second row's
   heads, so hover there opens a panel only after a short dwell. The deliberate
   gestures (click, tap, focus, keyboard) open at once.

   No JavaScript, or under 720px: every detail renders in normal flow. Nothing
   here removes content from the DOM or hides it with display:none.
   ============================================================================ */
(function () {
  "use strict";
  var tl = document.getElementById("careerTl");
  if (!tl) return;
  var nodes = Array.prototype.slice.call(tl.querySelectorAll(".tl-node"));
  if (nodes.length < 2) return;
  tl.classList.add("tl--js");

  var wide = window.matchMedia("(min-width: 720px)");
  var popover = window.matchMedia("(min-width: 1080px)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  var controls = nodes.map(function (node, i) {
    var head = node.querySelector(".tl-head"), detail = node.querySelector(".tl-detail");
    if (!head || !detail) return null;
    if (!detail.id) detail.id = "tl-detail-" + (i + 1);
    var co = node.querySelector(".tl-co");
    return { node: node, head: head, detail: detail,
             label: co && co.textContent ? "Show details for " + co.textContent.trim() : "" };
  }).filter(Boolean);
  if (!controls.length) return;

  function pinned() { return controls.filter(function (c) { return c.node.classList.contains("is-open"); })[0] || null; }

  /* Space the panel needs under the row, measured from where it is anchored
     (its own node in popover mode, the row itself in drawer mode). */
  function reserve(c) {
    if (!c || !wide.matches) { tl.style.marginBottom = ""; return; }
    var anchorBottom = (c.detail.offsetParent === tl) ? tl.offsetHeight : (c.node.offsetTop + c.node.offsetHeight);
    var need = anchorBottom + 8 + c.detail.scrollHeight - tl.offsetHeight;
    tl.style.marginBottom = Math.max(0, Math.round(need)) + 24 + "px";
  }

  function applyMode() {
    controls.forEach(function (c) {
      if (wide.matches) {
        c.head.setAttribute("tabindex", "0");
        c.head.setAttribute("role", "button");
        c.head.setAttribute("aria-controls", c.detail.id);
        c.head.setAttribute("aria-expanded", c.node.classList.contains("is-open") ? "true" : "false");
        if (c.label) c.head.setAttribute("aria-label", c.label);
      } else {
        ["tabindex", "role", "aria-controls", "aria-expanded", "aria-label"].forEach(function (a) { c.head.removeAttribute(a); });
        c.node.classList.remove("is-open");
      }
    });
    reserve(null);
  }
  function closeAll(except) {
    controls.forEach(function (c) {
      if (c.node === except) return;
      c.node.classList.remove("is-open");
      if (wide.matches) c.head.setAttribute("aria-expanded", "false");
    });
  }
  function open(c) {
    closeAll(c.node);
    c.node.classList.add("is-open");
    c.head.setAttribute("aria-expanded", "true");
    reserve(c);
  }
  function toggle(c) {
    if (c.node.classList.contains("is-open")) { closeAll(); reserve(null); }
    else open(c);
  }

  applyMode();
  if (wide.addEventListener) { wide.addEventListener("change", applyMode); popover.addEventListener("change", applyMode); }
  else { wide.addListener(applyMode); popover.addListener(applyMode); }

  var dwell = null;
  function cancelDwell() { if (dwell) { clearTimeout(dwell); dwell = null; } }

  controls.forEach(function (c) {
    c.head.addEventListener("click", function (e) { if (!wide.matches) return; e.preventDefault(); cancelDwell(); c.node.classList.remove("is-dismissed"); toggle(c); });

    c.node.addEventListener("mouseenter", function () {
      if (!wide.matches || !finePointer.matches) return;
      if (popover.matches) {
        /* The CSS :hover rule opens it at once; make the pinned state follow the pointer. */
        closeAll(c.node); reserve(c);
      } else {
        cancelDwell();
        dwell = setTimeout(function () { dwell = null; open(c); }, pinned() ? 260 : 140);
      }
    });
    c.node.addEventListener("mouseleave", function () { cancelDwell(); c.node.classList.remove("is-dismissed"); });
    c.node.addEventListener("focusout", function (e) { if (!c.node.contains(e.relatedTarget)) c.node.classList.remove("is-dismissed"); });
    c.node.addEventListener("focusin", function () { if (wide.matches) reserve(c); });

    c.head.addEventListener("keydown", function (e) {
      if (!wide.matches) return;
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); toggle(c); }
      else if (e.key === "Escape") {
        /* :focus-within and :hover would keep the panel drawn while the head is focused,
           so Escape also marks the node dismissed until focus or the pointer leaves it. */
        closeAll(); reserve(null); c.node.classList.add("is-dismissed");
      }
    });
  });

  tl.addEventListener("mouseleave", function () { cancelDwell(); if (popover.matches) reserve(pinned()); });
  tl.addEventListener("focusout", function (e) { if (!tl.contains(e.relatedTarget)) reserve(pinned()); });
  document.addEventListener("click", function (e) { if (!tl.contains(e.target)) { closeAll(); reserve(null); } });
})();
