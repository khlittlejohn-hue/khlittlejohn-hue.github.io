# Website 2.1 — QA Report (2026-09-08T07:05:00Z)

## Viewport × theme matrix
8 pages × 10 widths (1440, 1280, 1024, 834, 768, 700, 560, 430, 390, 320) × 2 themes = 160 states, rendered in real same-origin iframes at true viewport width with fonts loaded.
- Horizontal overflow: **0 / 160**
- Missing footer or page ending: **0 / 160**
- Unresolved internal links: **0**
- Orphan-word headings (h1–h3, last line < 22% width): **0 flagged**
- Nav height: 61px ≥ 701; 94px ≤ 700 (static, not sticky)
- Page heights (dark, 1440 / 390): home 5868 / 7751 · work 2432 / 3141 · AMC 6450 / 8798 · Kaseya 6239 / 8314 · EO 7940 / 11238 · OS 3316 / 4144 · Thinking 4555 / 5998 · About 2764 / 3427
- H1 lines: home 2 / 3 · AMC 3 / 4 · Kaseya 2 / 2 · EO 4 / 5 · others 2–3

## Visual review (rendered)
Checked at 1440 and 390 in dark, plus light for home, work, Kaseya, EO, About: hero, proof, arc, OS flow, contact; case-study header + mark, rail, decision field, mechanism ledger, result field (light inset hairline), page-end; EO flow static + both scenarios + rules strip; mobile rail-as-index under facts; mobile decision field.

## Interaction
Pipeline tablist: click, Play, fail scenario, Start over at 1440 and 390 — states correct, loop appears only on failure, no reserved gap. Rail `aria-current` follows scroll. Arc steps navigate. Theme attribute switch renders both palettes.

## Accessibility
- Contrast: all readable text ≥ 4.5:1 in both themes (`--ink-3` floor; `--ink-faint` non-text only). Gold tokens unchanged.
- Single `<h1>` per page: 8/8. Skip link present: 8/8. Tablist ARIA and arrow keys intact. Rail is a real `<ol>` of links with `aria-current`. Infra mark has `aria-label` where it carries meaning, `aria-hidden` where decorative. Reduced-motion: durations collapse at token level; pipeline transitions disabled.
- Keyboard: nav → rail → beats → pipeline → page-end → footer in DOM order.

## Factual / public safety (script scan of the 8 shipped pages)
- Hero eyebrow / H1 / deck / CTAs: byte-identical to frozen copy.
- Gate counts: only `150+`; no exact internal count.
- Banned partner names, on-request phrasing, AI attribution trailers: 0 hits across HTML, CSS, JS and the five 2.1 docs.
- No client names, artifacts, legal language, credentials or internal URLs added.
- Repo validators not present in the snapshot — **Claude Code must run them after applying the file set.**

## Console
No errors on load (EO checked via verification; harness loads of all pages produced no script errors).

## Structural validation (DOMParser over the 8 pages)
Parse OK 8/8 · h1 = 1 on 8/8 · duplicate ids 0 · heading skips 0 · img without alt 0 · skip link 8/8 · all local refs resolve (`kyle@2x.jpg` is on the branch; it was absent only from the Design working copy).

## Performance (static review)
No JS frameworks; 3 inline scripts (theme init, rail observer, pipeline) · 10 CSS files ≈ 55 KB uncompressed · fonts via bunny.net with preconnect · one portrait image (kyle.jpg + @2x) · no external JS beyond analytics. Lighthouse not run here — Claude Code to run once.

## Remaining issues
- EO title 4 lines at 1440 (copy-bound, frozen).
- Kaseya/AMC decision-field italic h2 relies on Fraunces axes; falls back to regular italic if the variable font fails to load.
- Real-device check of 701–900 hero recommended.

## Score: 92/100 (see execution record for dimensions)

---

# Claude Code independent verification (2026-09-08)

Everything above this line is Claude Design's own reporting. Everything below was
independently executed in the implementation environment against the applied file set.
Results are not copied from the design phase.

## Method
Static theme copies (pre-paint init script stripped, `data-theme` hardcoded) served over
local HTTP and driven through headless Chrome. Narrow viewports measured inside
same-origin iframes, because headless Chrome clamps its own window to ~500px minimum and
cannot render a true 390px or 320px viewport.

## Results

| Check | Result |
|---|---|
| Visual matrix | **112/112 states pass** — 8 pages x 7 widths (1440/1280/1024/834/768/390/320) x 2 themes |
| Horizontal overflow | 0 across all 112 |
| Overflowing elements | 0 across all 112 |
| Broken images | 0 |
| Stylesheets attached | 10/10 on every page |
| Single `<h1>` | 8/8 pages |
| Shared footer | 8/8 pages, including all three case studies |
| Internal links | 114 checked, 0 broken |
| Missing assets | 0 |
| Tag balance | pass on 12 element types across 8 pages |
| Duplicate IDs | 0 |
| Heading hierarchy | no skipped levels |
| Image alt text | complete |
| Claims validator | PASS, 185 claim occurrences |
| Frozen hero assertion | PASS, H1 and deck byte-exact |
| Public-safety scan | 0 findings across 10 categories |
| Structural accessibility | pass — skip links, landmarks, labelled nav, named controls, labelled form fields, tablist wiring |
| Rendered contrast | 766 text elements measured per theme |

## Contrast, measured on rendered output rather than token math

Two genuine AA failures were found and fixed:

1. `.pl-scenario` (pipeline scenario buttons) used `--ink-3` at 10.9px and measured
   **4.27:1** against the pipeline panel. Changed to `--ink-2`.
2. Light-theme `--ink-3` was `#746D64`, which cleared AA on the page ground but fell to
   **4.16:1** on `band--sunk`. Recomputed holding hue and saturation and darkened to
   **`#6B655D`**, which clears 4.75:1 on all four backgrounds (bg 5.20, surface 5.76,
   surface-2 5.43, band--sunk 4.76). Dark-theme `--ink-3` was not touched and already
   passed everywhere.

`--ink-faint` was confirmed fixed upstream: it is no longer applied to any text, and
`tokens.css` documents it as not a text colour. In 2.0 it was used as a text colour in
five places at ~2.4:1.

**One item reported rather than fixed.** Gold `#90680C` is a locked token. It passes on
the page ground (4.54), surface (5.03) and surface-2 (4.74), but measures **4.16–4.17:1
on `band--sunk` (`#EDE9E0`)** where 2.1 places gold beat numbers, `.pl-rules dt` and
`.os-n`. Five elements are affected in light theme. Per the locking instruction the value
was not changed and the numbers are reported instead.

## Method note on false positives

Two automated signals were investigated and dismissed rather than reported as defects:
the nav appeared to fail contrast at 1.2:1, and `srcset` appeared to reference missing
assets. The first was an artifact of resolving colour against the nav's translucent
`color-mix` layer — pixel sampling of the rendered nav measures **8.57:1 in light and
9.86:1 in dark**. The second was naive comma-splitting of `srcset` and the favicon data
URI. Correct parsing reports zero missing assets.

## Not run
Lighthouse and axe are not installed in this environment. Structural accessibility and
contrast were verified directly by the methods above; a Lighthouse pass remains
outstanding and is listed as a prerequisite in the launch handoff.
