# Website 2.1 — Design Log

- Date: 2026-09-08
- Starting branch / commit: `design-review-2026-09` @ `88d895f1bb099b046520c4a78753b48325be205e`
- Production (untouched): `main` @ `17f135a38ed92d878846089db8cd252c1aa74f47`
- Initial score (2.0 audit): 78/100
- Environment: read-only against GitHub. All 2.1 work exists as files in this design project and as the specification below; Claude Code applies them to the branch. No commits, merges or deploys were made.

## Objective
Move from "very good system, flat long-form execution" to a site whose case studies and AI page carry the same authority as the home page. Improve through hierarchy, orientation and one shared diagram language, not effects.

## Systemic decisions
1. **Label floor token.** `--step--2: 0.72rem` added. All 21 hardcoded mono-label sizes (0.62–0.79rem, 8 distinct values) now resolve to it. `.label` and new `.mlabel` utility use it.
2. **`--ink-faint` is no longer a text colour.** Documented in tokens.css. Every readable string that used it (`.metric-method`, `.chain-scope`, `.method-ev`, `.entry-from`, `.pl-stage-n`, teaser/metric cues) moved to `--ink-3` (≥4.6:1 both themes). `--ink-faint` remains for dots and connector lines.
3. **Fixed-count rows replace `auto-fit`.** `.proof`, `.arc`, `.cs-facts` use `repeat(3, …)` collapsing once to one column at ≤700px. `.row-2/.row-3/.row-4` utilities added to base.css. Ends the stranded-third-item bug between 460–810px.
4. **Buttons and page endings live in nav.css** (shared), not home.css. `.page-end` = one closing move on every page: a short line + primary "Let's talk" + one quiet route.
5. **New tokens:** `--measure-quote: 34ch`, `--page-max-prose: 1120px`, `--rail-w: 15rem`.
6. **`layouts/editorial.css`** consolidates the three inline `<style>` blocks (Operating System, Thinking, About).

## Navigation
- Desktop unchanged (61px).
- ≤700px: two-row grid — brand + "Let's talk" + theme toggle on row 1, four section links on row 2 (`.nav-sections` wrapper added in all 8 pages). Static, not sticky, on phones: 94px at 390 and 320 (was 152px sticky). The CTA is now repeated at every page end so nothing is lost by unpinning.
- ≤360px: tighter gaps, label-size links.

## Case-study system (`layouts/case-study.css`)
- **Reading frame.** `.cs-frame` = text column + 15rem sticky rail (`.cs-rail`) with a beat index generated from the existing beat labels. Beats numbered (`01 Context`, `02 Problem` …) with ids; IntersectionObserver marks the current beat in the rail (`aria-current`). Below 1024 the index folds to an inline wrapped row under the facts. Works without JS (static links).
- **Pull quote fixed and strengthened.** `.cs-beat .cs-turn` now wins specificity; 34ch balanced measure, gold rule.
- **Metric breathing room.** `.cs-beat .metric { margin-block: --space-l }`.
- **Result register.** `.cs-beat--result` beats sit on a sunk field (`--bg-sunk`) so the page visibly changes when evidence lands. Full-bleed to page padding on phones (no negative-margin overflow).
- Title measure 22ch; phone clamp keeps titles at 3–5 lines without the 20ch cap.
- Shared `.site-foot` added to all three studies; `.cs-next` replaced by `.page-end`.

## Executive Office pipeline (`components/pipeline.css`, `work/executive-office.html`)
- The chip row and the schematic were merged: **the flow is the navigator.** Six tab-buttons laid out as a timeline with node dots, connecting rules, and a role line under each stage (classify · assign agents · draft · 150+ gates · judgment · approved work).
- **Return path drawn.** `.pl-loop` is a bracket under 03–04 with an arrowhead landing on Production; `display:none` until the failure scenario fires (no reserved gap on clean runs).
- States: `done` (filled grey), selected (gold), failed (`--fail`), human gate permanently marked.
- Narration moved beneath the flow as a single pane in Fraunces at `--step-1`.
- **Mobile:** vertical timeline; the loop is a red bracket placed between 04 and 05 via flex order — the loop-back is now visible on phones (previously hidden). Overflow fixed to 0.
- Pipeline escapes the text column on desktop (`width: 100% + rail`) to read as a set piece.
- JS: node-list handling removed; `data-state="done"` added to tabs. Tablist/keyboard/reduced-motion behaviour preserved.

## Home
- OS band: mono stage list replaced with `.os-flow`, the same six-stage vocabulary and node/rule drawing as the EO diagram, including the loop line under 04. One diagram language across the site.
- Proof strip: fixed 3-up, cue anchored to card bottom (`margin-top:auto`) so unequal mechanisms no longer leave stray space.
- Contact h2 26ch (2 lines); sub-line at `--step-1`, 44ch.
- Tablet (701–900): hero holds the two-area layout with a 160px portrait beside the deck instead of stacking early.
- `.hero-meta` items `min-width: 22ch` (no wrap of "Currently").

## Supporting pages
- About facts: 4-column figure grid → one inline mono ledger line (`12+ years operating · 5 industries entered cold · 30+ endurance races · 50+ countries`). Removes the only dashboard moment.
- OS / Thinking / About / Work: `.page-end` before footer.

## Copy
No hero, case-study narrative, Thinking or factual copy changed. New strings are limited to: stage role labels in the diagrams (classify, assign agents, draft, 150+ gates, judgment, approved work; "fails a gate, returns to Production"), the page-end lines (reuse of existing site sentences), and rail label "In this study". All numbers already existed on the page.

## Rejected
- Hamburger menu on mobile: hides four links to save ~30px; two rows is more honest for a four-item nav.
- Narrowing the case-study page-max alone: fixes symmetry, wastes the rail.
- Charts/timelines in case studies: no data of chart-grade precision exists; would violate the evidence rule.
- Animated connectors in the pipeline: play-driven state changes already carry the story within the 250ms ceiling.

## Unresolved
- EO title still 4 lines at 1440 (copy-bound; frozen).
- Kaseya/AMC light-theme `--bg-sunk` result field is subtle (#EDE9E0 on #F6F3EC); acceptable, could deepen by 2–3% if wanted.
- `.hero` tablet range 701–900 needs a real-device look.

## Final QA status
48-cell matrix (8 pages × 6 widths), dark and light: **0 horizontal overflow**, nav 61px desktop / 94px phones, no flagged orphan headings. Fonts loaded. Pipeline interactions verified in both scenarios at 1440 and 390.

## Final pass (same day): the signature system
- **Infrastructure mark.** Three stacked tiers; current tier gold. Home arc → work index → case-study header. Turns three stories into one thesis.
- **Beat grammar.** context / decision / mechanism / result / reflection, declared per beat, drawn in the label and the rail. Decision beats become a bracketed field with the call up front; mechanism and result lists become numbered ledgers.
- **EO rules strip.** Separation · Traceability · Authority under the flow, so governance is a static fact, not a play state.
- Score 88 → 92. See WEBSITE-2.1-AUTONOMOUS-EXECUTION.md for the dimension table.

## Self-score at 2.1 mid-pass: 88/100
Visual design 88 · hierarchy 90 · typography 90 · responsive 87 · case studies 88 · AI visualization 86 · credibility 92 · differentiation 84 · accessibility 90 · motion 92 · conversion 86 · narrative 90.
Strongest five: hero; metric object; case-study rail + numbered beats; unified six-stage diagram on home and EO; page-end system.
Weakest five: EO diagram still abstract at tablet; light-theme result field subtlety; About page is short relative to its ending; work index proof rail is text-only; no true visual "surprise" moment (deliberate).
