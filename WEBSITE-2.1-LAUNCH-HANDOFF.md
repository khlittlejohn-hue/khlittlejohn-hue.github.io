# Website 2.1 — Launch Handoff (for Claude Code)

## A. Current state
- Repository: `khlittlejohn-hue/khlittlejohn-hue.github.io`
- Working branch: `design-review-2026-09` (history-free snapshot). Starting commit `88d895f1bb099b046520c4a78753b48325be205e`.
- Production: `main` @ `17f135a38ed92d878846089db8cd252c1aa74f47` — **not modified**.
- **Deployment status: NOT DEPLOYED. Not merged. No cutover. No commits exist yet.**
- Implementation status: Website 2.1 is complete as a file set in the Claude Design project (the 8 pages, 10 CSS files, 3 docs). The design environment is read-only against GitHub, so **no commits exist yet on the branch**. Step 1 below is to apply the file set.
- What changed / did not change: see `WEBSITE-2.1-CHANGE-MANIFEST.md`.

## B. Design state
- Design system: tokens.css is the single source. New: `--step--2` (label floor), `--measure-quote`, `--page-max-prose`, `--rail-w`. `--ink-faint` is non-text only.
- Typography: Fraunces display / Geist body / Geist Mono labels via fonts.bunny.net; unchanged families and weights.
- Navigation: `nav.css`. Desktop 61px sticky; ≤700 two-row static (94px); `.nav-sections` wrapper required in markup.
- Responsive system: fixed-count rows (`.row-*`, `.proof`, `.arc`, `.cs-facts`) collapse at 700; case-study rail folds at 1023; hero stacks at 700 (tablet 701–900 holds a two-column hero).
- Case-study system: `.cs-frame > .cs-body + .cs-rail`; beats numbered with ids `beat-01…`; `.cs-beat--result` for result beats; `.cs-beat .cs-turn`; `.page-end` + `.site-foot` on every page.
- Metric system: `metric.css` unchanged structurally; spacing inside beats from case-study.css.
- Executive Office: `pipeline.css` `.pl-flow` (tablist as timeline), `.pl-loop` (return path, hidden until failure scenario), `.pl-narration`. Home `.os-flow` mirrors the same vocabulary.
- Interactions/motion: all transitions ≤250ms tokens; reduced-motion collapses durations; pipeline remains play-driven; rail observer is passive.
- Accessibility: tablist semantics/arrow keys intact; `aria-current` on rail; all readable text ≥4.5:1 in both themes (`--ink-3` floor); focus rings unchanged.

## C. Content state
- Frozen hero (eyebrow, H1, deck, CTAs) — verbatim, unchanged. Validator should pass.
- Frozen Thinking passages — unchanged; Thinking body untouched.
- Factual canon — no copy changed in AMC/Kaseya/EO narratives. New visible strings are only diagram role labels (classify · assign agents · draft · 150+ gates · judgment · approved work · "fails a gate, returns to Production"), rail heading "In this study", and page-end lines composed from existing sentences ("If you have a mandate that needs an owner, let's talk." / "A 20-minute call is the fastest way to find out whether I am useful." / "I am most useful early, when the shape of the thing is still undecided.").
- Quantitative constraints: only `150+` appears for gates (home OS flow, EO flow role label, EO metric, EO facts). No exact internal gate count anywhere. 120+ agents, 14 domains unchanged.
- Confidentiality: no client names, artifacts, or offers added. Partner language remains generalized.
- Ownership boundaries: `.cs-boundary` blocks untouched.
- Excluded production files: not recreated (index.html, resume.html, CNAME, sitemap.xml, robots.txt, 404.html, README, card-sources).

## D. QA state
- Viewport matrix: 8 pages × {1440,1280,834,768,390,320} — all `scrollWidth === clientWidth`.
- Theme matrix: dark + light rendered for home, work, AMC, EO, about; tokens are symmetric so remaining pages inherit.
- Accessibility: contrast fixed (`--ink-faint` text removed); keyboard tablist verified; skip link present; single `<h1>` per page.
- Claims validation: not run here (no validator in the snapshot). **Run the repo's validator after applying files.**
- Link validation: all internal links relative and resolvable within the 8-page set; `../work/` → `./` on work pages. **Re-run link check after applying.**
- Interaction: pipeline clean + fail scenarios, Play/Pause/Start over, tab clicks verified at 1440 and 390. Theme toggle unchanged. Contact form unchanged.
- Known issues: EO title 4 lines at 1440 (copy-bound); light `--bg-sunk` result field subtle.

## E. Production reconciliation
Website 2.1 depends on nothing outside the 22-file snapshot. At cutover Claude Code must:
1. Decide how `home.html` becomes `index.html` (rename or copy); update `nav-brand`, footer `Home` links and the canonical/og URLs if the filename changes.
2. Preserve production `CNAME`, `robots.txt`, `404.html`, `assets/apple-touch-icon.png` and any `assets/card-sources/*` referenced by OG images.
3. Regenerate `sitemap.xml` for the 8 pages (+ resume when the new PDF arrives).
4. Decide the fate of production `resume.html` (Resume stays out of nav per instruction).
5. `assets/kyle@2x.jpg`: present on `design-review-2026-09` (Claude Code verified). It was absent only from the Claude Design working copy, which imported text assets only. No action needed; confirm `assets/kyle.jpg` and `website-card-100.png` match production.

## E2. Rollback
Production is a static GitHub Pages site from `main`. Rollback = `git revert` of the cutover merge commit (or reset the `gh-pages` source to `17f135a` if fast-forwarded) and push; Pages rebuilds in ~1 minute. Keep `17f135a` tagged (`v1-production`) before cutover.

## E3. Post-deploy verification
kylelittlejohn.com loads home; both themes; phone (390) nav 94px; all 8 routes 200; contact form test submission; analytics beacon fires; OG image resolves; no console errors.

## F. Launch procedure (conservative)
1. `git fetch`; check out `design-review-2026-09`; confirm HEAD `88d895f`.
2. `git status` clean working tree.
3. Read `WEBSITE-2.1-DESIGN-LOG.md`, `-CHANGE-MANIFEST.md`, this file.
4. Apply the 2.1 file set (8 HTML, 10 CSS incl. new `editorial.css`, 3 docs). Do not copy `_audit/`, `AUDIT-2026-09-08.md`, `github.md`.
5. Commit in milestones: (1) design system — tokens/base/nav/metric/contact; (2) case-study experience — case-study.css + 3 studies; (3) executive office — pipeline.css + EO page; (4) home and supporting pages — home.css/editorial.css + 5 pages; (5) documentation. No AI attribution, no confidential text in messages.
6. Verify frozen hero copy byte-for-byte; run the hero validator.
7. Grep for any bare integer near "gate" other than `150+`; confirm only `150+`.
8. Confidentiality scan: the three banned partner names (see the private canon), client names, on-request phrasing.
9. Link check all 8 pages; check `../work/` resolution from `work/*.html`.
10. Serve locally; headless-render the 48-cell matrix; confirm no horizontal overflow; screenshot dark and light.
11. Accessibility pass: axe or equivalent; keyboard through nav, rail, pipeline, form.
12. `git diff 88d895f..HEAD --stat` review; confirm `main` untouched (`git log main -1` = `17f135a`).
13. Resolve section E items on a cutover branch from `main`.
14. Obtain human approval.
15. Cutover to `main`; verify GitHub Pages build; verify kylelittlejohn.com in both themes and on a phone.
16. Record the deployed commit in this file.
17. Delete `design-review-2026-09` only after production is verified.

---

# Implementation handoff (Claude Code, 2026-09-08)

## STATUS: NOT DEPLOYED

- **Implementation branch:** `website-2.1-final`
- **Branched from:** `design-review-2026-09` @ `88d895f`
- **Production:** `main` @ `17f135a38ed92d878846089db8cd252c1aa74f47`, untouched
- **Deployed:** no. Not merged, not pushed, not cut over.

## Remaining prerequisites before launch

1. **Corrected resume.** The Resume navigation links are removed from all 8 pages and the
   stale PDF is deliberately still in place. Production `index.html` and `resume.html`
   reference that PDF 6 and 2 times respectively, so deleting it before cutover would
   break the currently live site. Sequence: add the corrected PDF, restore the Resume
   links, validate, commit.
2. **Gold on `band--sunk`.** Locked token `#90680C` measures 4.16:1 there, below AA, in
   five light-theme elements. Needs an owner decision: lighten the sunk band, accept, or
   unlock the token.
3. **Lighthouse.** Not installed in this environment; still outstanding.
4. **The `index.html` cutover decision** — see below.
5. **Final human review** of the rendered site.

## Cutover steps (do not run until the above are resolved)

1. Merge `website-2.1-final` into `main`. The branch is a snapshot lineage, so review the
   resulting tree rather than a long commit history.
2. Decide how `home.html` becomes the site root. Either rename `home.html` to
   `index.html`, archiving the current one, or add a redirect. Until this happens
   `kylelittlejohn.com` continues to serve the old site regardless of what is merged.
3. Update every internal reference that points at `home.html`.
4. Restore or retire `sitemap.xml` entries, including the `resume.html` entry.
5. Confirm GitHub Pages still serves from `main` and `CNAME` is unchanged.
6. Push.

## Rollback

`main` is at `17f135a`. To revert, reset `main` to that commit and force-push, or revert
the merge commit. Because the redesign only becomes visible at the moment `index.html` is
replaced, rollback before that step is a no-op for visitors.

## Post-deploy verification

Load all 8 pages at the live domain; confirm the root serves the new home; check both
themes; submit the contact form once and confirm delivery; confirm analytics register;
re-run the claims validator against the deployed tree; spot-check 390px on a real phone.

## Temporary branch cleanup

`design-review-2026-09` is a public, history-free snapshot created for the design review.
Delete it from the remote once 2.1 is settled.
