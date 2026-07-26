> Prerequisite (generator, not this repo's code): re-emit the 42 daily files with
> `are_you_ok` as an array, and produce `digests/<slug>/weekly.json` per metro,
> per `docs/WEEKLY_DIGEST_CONTRACT.md`. Implementation below starts once those land.
> **Landed:** dailies re-emitted with `are_you_ok` arrays, `<metroCode>.weekly.json`
> per metro in place (weekly items carry additive `summary`/`thread`).

## 1. Contract docs (hand-off, can be done first)

- [x] 1.1 Add `docs/WEEKLY_DIGEST_CONTRACT.md` — weekly document schema (array sections, `range`, item-count guidance, `digests/<slug>/weekly.json`, rolling last-7-days)
- [x] 1.2 Update `docs/DIGEST_OUTPUT_CONTRACT.md` §4 — daily `are_you_ok` changes from `Article | null` to `Article[]` (0–1)

## 2. Types

- [x] 2.1 `RawCity.are_you_ok`: `RawArticle | null` → `RawArticle[]`
- [x] 2.2 Add `RawWeekly` (discriminated: `period: 'weekly'`, `range: { start: string; end: string }`, `are_you_ok: RawArticle[]`, longer lists, `sports`) sharing `RawArticle`
- [x] 2.3 View model: `CityViewModel.areOk: Article[]` (drop `areOk: Article | null` / `hasAreOk`); add a weekly view model or a shared `DigestViewModel` with a `period` discriminator and optional `rangeLabel`

## 3. Loader (lazy, newest-4, async)

- [x] 3.1 Switch `import.meta.glob('/digests/**/*.json')` to **non-eager** (path → `() => import()`)
- [x] 3.2 Group loaders by directory slug; classify `weekly.json` vs daily `<metroCode>.<date>.json` by filename (processor logic)
- [x] 3.3 Per metro, sort daily paths by filename date desc and take the newest 4; dynamically import only those + `weekly.json`
- [x] 3.4 After import, read `date`/`metroCode`/`shortName`/`range` from the **body**; build `Metro { metroCode, shortName, days: MetroDay[] (≤4, newest-first), weekly: RawWeekly | null }`
- [x] 3.5 Export an async manifest (e.g. `export const metrosPromise = buildManifest()`); drop the old eager `METROS`, `parsePath` date cross-check, and the review-#4 skip
- [x] 3.6 Keep the minimal shape check; skip malformed files rather than throwing

## 4. View model (format.ts)

- [x] 4.1 `toCityViewModel`: map `are_you_ok` array → `areOk: Article[]` (no null/normalization)
- [x] 4.2 Add `toWeeklyViewModel` (or extend `toCityViewModel`) producing the weekly view model with a `rangeLabel` from `range` (e.g. "Week of Jul 19–25")
- [x] 4.3 Keep `dayChipLabel`; add range formatting helper
- [x] 4.4 Grouped-item `summary`: surface the arc-narration line only for items that cluster a multi-day sequence (carry a non-empty `thread`); single items suppress their incidental summary. Rendered in `ArticleList` and `AreTheyOk`. `thread` members themselves not yet rendered.

## 5. UI

- [x] 5.1 `App`: load `metrosPromise` (state + effect), render a loading placeholder until resolved; hold `metroIdx`, `period: 'daily' | 'weekly'`, selected daily `date`
- [x] 5.2 On metro change, clamp `date` to the metro's newest day; guard metros/day access before load resolves
- [x] 5.3 `PeriodNav`: Daily shows the ≤4-day chip rail; Weekly shows **no** chips; toggling to Daily restores the selected/newest day
- [x] 5.4 `NewsDigest`: accept either a daily or weekly view model (via `period`); render masthead date from `dateLong` (daily) or `rangeLabel` (weekly); map `areOk: Article[]` to 0–2 `AreTheyOk` cards
- [x] 5.5 Disable/hide the Weekly toggle when `metro.weekly` is null (new-feed metros)

## 6. Verify

- [x] 6.1 `npm run build` (Node 20) passes typecheck against the new schema
- [x] 6.2 Only the newest 4 daily chunks (+ weekly) per metro are fetched — history is not bundled. Verified by simulating the loader's `classifyPath` + newest-4 selection over the real `digests/` tree (each metro → 4 newest dailies + weekly; empty `columbus-oh` → dropped). Live network-panel confirmation not run (browser tools unavailable this session).
- [x] 6.3 Daily shows ≤4 chips and swaps day content; Weekly shows the aggregate (up to 2 are-they-ok, longer lists, all sports, "Week of …" label) with no chips — confirmed in-browser by the user.
- [x] 6.4 A metro without `weekly.json` renders Daily fine and hides Weekly; masthead/labels read from body values — logic in place (`hasWeekly` gate, body-sourced labels); confirmed acceptable (no daily-only-no-weekly metro in current data to exercise live).
