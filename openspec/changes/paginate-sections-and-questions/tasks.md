## 1. Test Infrastructure

> The repo has **no unit test runner** (only `lint`, `tsc -b`, and `pa11y-ci`), but the
> paging logic — clamping, reset-on-change, boundary states — is exactly the kind of
> thing the TDD requirement exists for. Adding Vitest is a scope decision for the human
> reviewer; if declined, drop this group and every "write failing test" task below,
> and verification falls back to lint + typecheck + a11y + manual checks.

- [x] 1.1 Add `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom` as devDependencies
- [x] 1.2 Add a `test` script and a separate `vitest.config.ts` (jsdom environment; kept out of `vite.config.ts` so the dev/preview-only feedback plugin never loads under test)
- [x] 1.3 Confirm the runner works on a trivial passing test, then delete it

## 2. Accessibility URL Coverage

> Sequenced first: the gate currently passes while silently checking a duplicate page
> (design decisions 7–9). The pager work below leans on it, so it is made honest before
> anything depends on it. Required shapes come from committed fixtures; live data is
> swept separately and more cheaply.

- [x] 2.1 Move `DAILY_WINDOW` from `src/data/digests.ts` into `src/data/window.ts`; import it back into the loader so the value has one definition
- [x] 2.2 Author `digests-fixtures/a11y-fixture/` by copying real digests and editing — a day with 3 stacked alerts, a day with empty sections, a day with an imageless article, a weekly deep enough to page — and validate each file against `docs/schema/digest.schema.json`
- [x] 2.3 Write a failing test: the loader merges the fixture glob only when `VITE_A11Y_FIXTURES` is set, and omits it otherwise
- [x] 2.4 Add the second static glob to `src/data/digests.ts` behind `import.meta.env.VITE_A11Y_FIXTURES`; confirm 2.3 passes
- [x] 2.5 Write failing tests for one pure selection function over an in-memory digest set: required shapes resolve to fixture URLs; every real metro contributes its newest day and weekly; no out-of-window day is emitted; a missing fixture raises naming the shape; a live set with no alerts anywhere does not
- [x] 2.6 Implement that function in `src/data/a11yUrls.ts` taking the digest set as data, so it never touches the filesystem; confirm 2.5 passes
- [x] 2.7 Implement `scripts/gen-pa11y-urls.mjs` — read both trees, apply selection, expand fixture URLs across all six style×theme action blocks and live URLs in the default appearance only, set `concurrency: 4`, write `.pa11yci.json`, print the selected URLs, exit non-zero on an unsatisfied shape
- [x] 2.8 Point `test:a11y` at the generator and `pa11y-ci --config .pa11yci.json`; build with `VITE_A11Y_FIXTURES=1` in `test:a11y:ci`; delete the hand-maintained `.pa11yci`
- [x] 2.9 Scope `.githooks/pre-push` by changed paths — `src/`/styles run the fixture matrix, `digests/`-only runs the live sweep, both or unrecognized runs everything
- [x] 2.10 Update the Accessibility section of `CLAUDE.md`, which currently documents the flat "four times, once per style×theme" matrix and the hand-edited `.pa11yci`
- [ ] 2.11 Verify non-leakage: build **without** the flag, grep `dist/` for fixture content, confirm the metro nav lists only real metros
- [ ] 2.12 Run `npm run test:a11y:ci`; confirm the generated matrix covers strictly more distinct pages than the twelve URLs it replaces, in fewer total runs than a flat 6× cross product

## 3. Types and Data Mapping

- [x] 3.1 Write a failing test: `mapItem` carries `questions` through to the view model, and yields `undefined` when the raw article omits it
- [x] 3.2 Add `questions?: string[]` to `RawArticle` and `Article` in `src/types.ts`, commenting that the generator emits it but `docs/schema/digest.schema.json` does not model it
- [x] 3.3 Add `uid?: string` to `RawAlert` with the same note
- [x] 3.4 Update the `uid` comment on `RawArticle` — the contract now requires it on every article, so drop the "older files lack it" hedge (keep the field optional in TS until every bundled file is confirmed to carry one)
- [x] 3.5 Relax the `are_you_ok` bound comments in `RawCity` / `RawWeekly` (no longer 0–1 / 0–2)
- [x] 3.6 Carry `questions` through `mapItem` in `src/utils/format.ts`; confirm 3.1 passes

## 4. Paging Hook

- [x] 4.1 Write failing tests for `usePaging(items, pageSize)`: correct slice per page; `next`/`prev` clamp at both ends; `pageCount` for exact and partial final pages; empty array yields one empty page and no controls
- [x] 4.2 Write a failing test: changing the `items` array identity resets to page 1
- [x] 4.3 Write a failing test: when `items` shrinks below the current page, the page clamps instead of stranding the reader on an empty page
- [x] 4.4 Implement `usePaging` in `src/hooks/usePaging.ts` using the in-render reset pattern already in `ArticleList` (no `useEffect`); confirm 4.1–4.3 pass

## 5. Pager Component

- [x] 5.1 Write failing tests: prev disabled on first page, next disabled on last, both buttons carry section-specific accessible names, status text reads the current range and total
- [x] 5.2 Implement `src/components/Pager.tsx` — prev/next buttons plus an `aria-live="polite"` status element
- [x] 5.3 Render nothing when `pageCount <= 1`; confirm 5.1 passes
- [x] 5.4 Style the pager in `src/styles/newsDigest.css`, taking the disabled-state color from a token already verified at 4.5:1 in all six appearances

## 6. Questions Rendering

- [x] 6.1 Write failing tests: an article with questions renders each prompt verbatim inside a labelled group; absent, empty, and all-blank arrays render no container at all
- [x] 6.2 Implement `src/components/ArticleQuestions.tsx`, placed after description/summary and before the meta line
- [x] 6.3 Render it in `ArticleList` and `AreTheyOk`; confirm 6.1 passes

## 7. Section Pagination

- [x] 7.1 Write a failing test: `ArticleList` with 15 items shows 3, pages forward and back, and every item is reachable in generator order
- [x] 7.2 Write a failing test: an item on the last page still renders its topic label and its `ArticleFeedback` control
- [x] 7.3 Replace `ArticleList`'s one-way reveal with `usePaging` + `Pager` (page size 3); confirm 7.1–7.2 pass
- [x] 7.4 Write a failing test: `AreTheyOk` given 6 leads renders one hero at a time and pages through all six
- [x] 7.5 Move lead paging into `AreTheyOk` (page size 1) and stop `NewsDigest` mapping `areOk` into one row per lead
- [x] 7.6 Write a failing test: `Sports` given 6 teams pages 3 at a time
- [x] 7.7 Paginate `Sports` by team; confirm 7.6 passes
- [x] 7.8 Write a failing test: each empty section still renders its heading and empty note, with no pager
- [x] 7.9 Confirm empty-section behavior across all three components

## 8. Microcopy Cleanup

- [x] 8.1 Add per-style pager and questions-group labels to `StyleStrings` in `src/data/strings.ts` (neutral + friendly variants)
- [x] 8.2 Remove the now-dead `moreLabel` from `StyleStrings`, both string sets, and every call site
- [x] 8.3 Grep for remaining `moreLabel` / `oneb-more-btn` references, including `newsDigest.css`

## 9. Verification

- [x] 9.1 Run the unit suite — all green
- [ ] 9.2 Run `npm run lint` and `npm run build` (Node 24 — `nvm use`)
- [ ] 9.3 Run `npm run test:a11y:ci`; treat any new WCAG2AA violation as a blocking finding
- [ ] 9.4 Spot-check in the browser: Boulder weekly (6 leads / 15 starters / 15 know), a sparse day, and Minneapolis weekly (6 sports teams)
- [x] 9.5 Changed-files code review by an independent agent; record findings in `docs/reviews/<YYYY-MM-DD>-paginate-sections-and-questions.md`
- [x] 9.6 Fix the findings that warrant fixing; surface the rest to the human before archiving
