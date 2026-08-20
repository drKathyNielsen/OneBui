# Code review — paginate-sections-and-questions

**Date:** 2026-08-20
**Scope:** changed files of the `paginate-sections-and-questions` change
**Reviewer:** independent review agent (`/code-review`)

Verified during review: `vitest run` (43 tests, 9 files) passing, `tsc -b` and
`eslint .` clean, `node scripts/gen-pa11y-urls.mjs` emitting 10 pages / 30 runs and
failing correctly on a missing shape, and the dead-code claim in `src/data/digests.ts`
holding — a plain build emits no `00000.*` fixture chunks, a `VITE_A11Y_FIXTURES=1`
build does.

## Findings

### 1. Thumbs state leaks between paged lead stories — High · FIXED
`src/components/AreTheyOk.tsx`. The section now pages one hero at a time, but
`<ArticleFeedback>` had no `key`, so React kept one instance (and its `vote` state)
as `article` changed. A reader who thumbed-up lead 1 and clicked Next saw lead 2
already `aria-pressed="true"`; clicking 👍 there then *un*-toggled and POSTed
`vote: null` for the wrong article. Previously each lead was a separately keyed card
in `NewsDigest`'s `.map`, so the change introduced this. `ArticleList` was unaffected
(its `<li key={item.url}>` remounts per page).

**Fix:** `key={article.uid ?? article.url}` on `ArticleFeedback`, with a regression
test in `AreTheyOk.test.tsx` that reproduced the leak before the fix.

### 2. Focus destroyed when a pager control disables itself — Medium · FIXED
`src/components/Pager.tsx`. `disabled={page === pageCount}` flipped on the same click
that moved the page, so a keyboard or screen-reader user paging to the last page had
focus dropped to `<body>`; the next Tab restarted at the top of the document. pa11y
cannot detect this.

**Fix:** `aria-disabled` plus a no-op handler, so the control stays tabbable and
focused while announcing itself unavailable. `newsDigest.css` selectors moved from
`:disabled` to `[aria-disabled="true"]`. Two tests updated to assert focus retention
and that the callback does not fire.

### 3. `npm run test:a11y` could report green while auditing the wrong pages — Medium · FIXED
`package.json`. The script generated fixture URLs but did not build with
`VITE_A11Y_FIXTURES=1`; only `test:a11y:ci` did. Run against a plain `dist`, the
fixture metro is absent and `resolveViewParams` falls back to `metroIdx = 0`, so
pa11y would audit Boulder six times and pass — the exact silent-wrong-page defect
this change exists to remove.

**Fix:** removed the `test:a11y` entry point entirely. `test:a11y:ci` is now the only
script that serves and audits, and it always builds with fixtures. README updated.

### 4. README documented the deleted `.pa11yci` and the retired four-way matrix — Low · FIXED
`CLAUDE.md` had been updated for the generated config and the fixture/live tiers; the
README had not, so a contributor would look for a file this change deletes.

**Fix:** README Accessibility section rewritten to match, script table corrected, and
`digests-fixtures/` + `scripts/` added to the project layout.

### 5. Decorative emoji folded into accessible names — Low · FIXED
`Pager` derived its `aria-label` from the display heading and `ArticleQuestions` used
the per-style label verbatim, producing names like "Next chat starters 💬", announced
as "…speech balloon".

**Fix:** `accessibleName()` in `src/utils/format.ts` strips pictographic characters
(plus variation selectors and ZWJ) wherever a display string is reused as an
accessible name, applied in both components. Unit-tested against the friendly-style
strings.

### 6. `key={q}` used question text as the React key — Low · FIXED
`src/components/ArticleQuestions.tsx`. The generator does not constrain openers to be
unique, so two identical prompts on one article produced a duplicate-key warning and
unstable reconciliation.

**Fix:** index keys — the list is static per article. Test asserts two identical
openers render as two items with no React error logged.

## Disposition

All six findings fixed in this change. No findings deferred, accepted, or moved to
`docs/BACKLOG.md`. Suite after fixes: 47 tests / 9 files green, `tsc -b` and
`eslint .` clean.

Dispositions settled at archive (2026-08-20):

- **Accessibility run** — `npm run test:a11y:ci` run by the author; task 9.3 checked off.
  No longer outstanding.
- **Fixture non-leakage (task 2.11)** — verified at archive time. A plain `npm run build`
  emits no `Fixture City, ZZ` and no fixture chunk; the same build with
  `VITE_A11Y_FIXTURES=1` does. The only `00000` hits in `dist/` are Bootstrap hex colors.
- **New finding, fixed at archive: stale spec requirement.** Syncing the delta specs
  surfaced that `openspec/specs/digest-data/spec.md` → *Resilient Rendering of Sparse
  Digests* still claimed empty sections "are omitted", while the code renders an
  `emptyNote` (`ArticleList.tsx`, `AreTheyOk.tsx`, `Sports.tsx`) and the change's own
  *Uniform Array Sections* delta says the note renders. The delta did not list that
  requirement, so the contradiction would have shipped into the main specs. Scenario
  rewritten to match the implementation.

No open findings remain.
