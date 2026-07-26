## Why

`wire-real-digests` shipped a "Weekly" tab that just pages through individual daily files via day-chips — mechanical bundling, not a real weekly brief. The intended product is different:

- **Weekly** should be an *editorially aggregated* document — the most salient stories across the last 7 days, in an expanded layout (≈2 "are they ok", 5 conversation starters, 5 you-should-know, all sports). Choosing the salient points is judgment work, so it belongs in the **generator**, per the contract boundary ("the generator owns data correctness… the UI owns presentation and packaging").
- **Daily** should stay a single-day brief, but let a reader step back through the **recent** days (e.g. catch up on the weekend). The day-chips belong here, not on Weekly.

This also resolves review finding #7: the loader lazily ingests only the newest 4 daily files per metro (+ the weekly), so the bundle no longer grows with history.

## What Changes

- Introduce a **weekly digest document** produced by the generator: one per metro, rolling last-7-days, regenerated daily, **overwriting** a single `digests/<slug>/weekly.json` (no weekly history — only the current week is ever shown). Same `Article` shape as daily; `are_you_ok` holds up to ~2, the two lists up to ~5 each, sports all teams. The coverage window is a `range: { start, end }` field in the **body** (display-only). Captured as a generator handoff in `docs/WEEKLY_DIGEST_CONTRACT.md`.
- Change the **daily** document so `are_you_ok` is an **array** (0–1), matching weekly — one shape end to end, no `null` case. (A daily-contract change; the 42 existing files re-emit accordingly.)
- **UI-displayed values come from the JSON body** (masthead date, `metroCode`, `shortName`, weekly `range`); the loader may read the **date in a daily filename** as processing logic to order and select files.
- Loader: lazy `import.meta.glob` (no `eager`); per metro, dynamically import only the newest 4 daily files (by filename date) plus `weekly.json`. Manifest per metro: `{ days: MetroDay[] (≤4, newest-first), weekly: WeeklyDigest | null }`. `METROS` resolves asynchronously; `App` shows a loading state until it does.
- UI: the Today/Weekly toggle swaps whole documents. **Daily** shows the selected day with day-chips over the ≤4 recent days; **Weekly** shows the single aggregate with **no** chips.

## Capabilities

### Modified Capabilities
- `digest-data`: extends the metro manifest and rendering to two period documents (daily + a generator-aggregated weekly), moves day-stepping to the daily view, and bounds the bundled daily window.

## Impact

- Affected code: `src/data/digests.ts` (lazy glob, newest-4 selection, weekly discovery, async manifest), `src/types.ts` (`are_you_ok` array; weekly document type), `src/utils/format.ts` (array `are_you_ok`; weekly view model), `src/App.tsx` (period state + loading state), `src/components/{PeriodNav,NewsDigest}.tsx` (Daily keeps chips, Weekly is chipless).
- Data/contract: **new** weekly document type *and* a daily-schema change (`are_you_ok` → array) — both affect the generator. Weekly is documented in `docs/WEEKLY_DIGEST_CONTRACT.md`; the daily change updates `docs/DIGEST_OUTPUT_CONTRACT.md` and requires re-emitting the 42 existing files.
- Supersedes the day-chip "Weekly" behavior introduced in `wire-real-digests`; that change should be archived (baseline) before this one lands. Also supersedes review-#4's filename/body date cross-check (body is authoritative for display; filename is a selection key).
- Bundle: lazy-importing only the newest 4 dailies per metro (+ weekly) closes review #7 at ingest.
