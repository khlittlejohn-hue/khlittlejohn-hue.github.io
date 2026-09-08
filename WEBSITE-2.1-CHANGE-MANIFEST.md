# Website 2.1 — Change Manifest

Base: `design-review-2026-09` @ `88d895f`. All paths relative to repo root. Files in this project are the finished versions; copy them over the branch as-is.

## Created
- `assets/css/layouts/editorial.css` — consolidated styles for operating-system / thinking / about (was three inline `<style>` blocks). Labels on `--step--2`; About facts as inline ledger; `.page--editorial`.
- `WEBSITE-2.1-DESIGN-LOG.md`, `WEBSITE-2.1-CHANGE-MANIFEST.md`, `WEBSITE-2.1-LAUNCH-HANDOFF.md` — documentation.

## 2.1 final pass additions (2026-09-08, later)
- `assets/css/base.css` — `.infra`, `.infra-row`, `.infra-name` (three-tier infrastructure mark).
- `assets/css/layouts/case-study.css` — beat grammar (`[data-kind]`), rail kind glyphs + key, `.cs-eyebrow-row`, result-list ledger, merged consecutive result fields, inset hairline on result field.
- `assets/css/components/pipeline.css` — `.pl-rules` governance strip.
- `assets/css/layouts/home.css` — `a.arc-step` link states, infra mark spacing.
- `assets/css/layouts/work-index.css` — `.study .infra-row`.
- HTML: `data-kind` + rail glyphs + header mark on 3 studies; `.pl-rules` in EO; infra marks in work/index.html; arc steps → links with marks in home.html.

## Modified — CSS
- `assets/css/tokens.css` — added `--step--2`, `--measure-quote`, `--page-max-prose`, `--rail-w`; `--ink-faint` documented as non-text. Gold tokens untouched (both light declarations).
- `assets/css/base.css` — `.label` on `--step--2`; new `.mlabel`, `.row-2/3/4` utilities.
- `assets/css/components/nav.css` — two-row static mobile nav (≤700, ≤360); `.nav-sections`; shared `.btn-primary/.btn-quiet`; `.page-end`.
- `assets/css/components/metric.css` — micro sizes → `--step--2`; `--ink-faint` text → `--ink-3`.
- `assets/css/components/contact.css` — label size → `--step--2`.
- `assets/css/components/pipeline.css` — flow redesign (`.pl-flow`, node/connector drawing, `.pl-loop` bracket, states), narration pane, mobile vertical timeline with visible loop. Old `.pl-stages/.pl-panes/.pl-schematic/.pl-node` rules removed.
- `assets/css/layouts/home.css` — buttons removed (moved to nav.css); `.proof`/`.arc` fixed 3-up; cue anchoring; `.os-flow` diagram; contact measure; tablet hero band 701–900; `.hero-meta` min-width. Mobile hero breakpoint now ≤700 (was ≤900).
- `assets/css/layouts/case-study.css` — `.cs-frame/.cs-body/.cs-rail/.cs-index`; `.cs-beat .cs-turn` specificity + 34ch; `.cs-beat .metric` spacing; `.cs-beat--result`; `.cs-facts` fixed 3-up; title measure 22ch + phone clamp.
- `assets/css/layouts/work-index.css` — micro sizes → `--step--2`; `--ink-faint` → `--ink-3`.

## Modified — HTML (all 8)
- All: nav links wrapped in `<div class="nav-sections">`.
- `home.html` — OS band list → `<ol class="os-flow">`; contact sub-line class.
- `work/index.html`, `operating-system.html`, `thinking.html`, `about.html` — `.page-end` section before footer; inline `<style>` removed and `editorial.css` linked (3 pages); About facts markup → `<p class="facts">`.
- `work/amc-networks.html`, `work/kaseya.html` — beats wrapped in `.cs-frame > .cs-body`; beats numbered + `id="beat-NN"`; `.cs-rail` index; result beats `.cs-beat--result`; `.cs-next` → `.page-end`; `.site-foot` added; beat-index script added.
- `work/executive-office.html` — all of the above plus: `.pl-stages` + `.pl-panes` replaced by `.pl-flow` + `.pl-narration`; pipeline JS drops node handling, adds `done` state.

## Modified — JS
- Case studies: small IntersectionObserver for `aria-current` on the rail (progressive; index works without it).
- EO pipeline: `render()` simplified; behaviour, ARIA and reduced-motion path unchanged.

## Removed
- Inline `<style>` blocks (3 pages). `.cs-next` component (replaced). `.os-stages` list. Pipeline schematic pane.

## Assets
- No image changes. No new dependencies. No fonts added.

## Intentionally NOT changed
- Hero copy and geometry rules (H1 full-measure, balance, no max-width) — only the ≥701 tablet column split and portrait size changed.
- All case-study, Thinking and About body copy. Gold tokens. Theme mechanism. Contact form mechanism/endpoint. Analytics. `index.html`, `resume.html`, `CNAME`, sitemap, robots, 404 (excluded from snapshot; not recreated).

## Not for the repo
- `_audit/` (render/measure/qa harnesses), `AUDIT-2026-09-08.md`, `github.md` are project tooling only.

---

# Applied to `website-2.1-final` (Claude Code, 2026-09-08)

Branch created from `design-review-2026-09` (`88d895f`) in an isolated worktree so the
`website-2.0` working tree was never disturbed.

## Applied from the design file set — 23 files
- 8 HTML pages
- 10 CSS files, including the new `assets/css/layouts/editorial.css`
- 5 documentation files

## Changed by Claude Code after applying

| File | Change | Reason |
|---|---|---|
| `home.html` | pipeline QC stage role: `150+ automated gates` -> `automated quality gates` | Restores the owner's standing decision that the gate figure is scoped to the Executive Office case study and brand surfaces stay qualitative. Enforced by the claims validator's page-scope rule. |
| `assets/css/components/pipeline.css` | `.pl-scenario` colour `--ink-3` -> `--ink-2` | Measured 4.27:1 at 10.9px, below AA with no large-text exemption. |
| `assets/css/tokens.css` | light `--ink-3` `#746D64` -> `#6B655D`, both declarations | Cleared AA on the page ground but measured 4.16:1 on `band--sunk`. New value holds hue and saturation and clears 4.75:1 on all four backgrounds. Dark theme untouched. |

Both light declarations were updated — `tokens.css` declares the light palette twice, in
the `prefers-color-scheme` block and the `:root[data-theme="light"]` override.

## Not changed
- Gold tokens. `#90680C` measures 4.16:1 on `band--sunk`; the value is locked, so the
  numbers are reported in the QA report rather than adjusted.
- Frozen hero copy, Thinking entries, case-study narrative, every factual claim.
- `assets/Kyle-Littlejohn-Resume.pdf` and the Resume navigation links, which remain
  removed pending the owner's corrected resume.
- Production `index.html`, `resume.html`, `CNAME`, and GitHub Pages configuration.

## Asset resolution
`assets/kyle@2x.jpg` was reported missing during the design phase. It is present on the
branch at 60,943 bytes and referenced by `srcset` on Home and About; both references
resolve. The design working copy had imported text assets only. No action was required
and no replacement was generated.
