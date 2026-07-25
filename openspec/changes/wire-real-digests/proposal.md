## Why

The app currently renders from a hand-written sample array in `src/data/cities.ts`: four hard-coded metros, one day each, articles with a bare-string `image` and no `source` (the UI guesses the outlet from URL substrings via `sourceLabel()`). Meanwhile the generator now emits real, contract-conforming digests under `digests/<slug>/<metroCode>.<date>.json` — 5 metros, up to 9 days each, with a structured `image: {url, alt}`, an explicit `source`, `metroCode`, and optional `summary`/`published_at`.

We need the UI to consume those real files so images populate, source labels are correct, and the Weekly tab pages through real days instead of only re-labelling the masthead date.

## What Changes

- Load every `digests/<slug>/<metroCode>.<date>.json` at build time via Vite `import.meta.glob` (eager JSON import) and build an in-memory manifest grouped by metro, with each metro's dates sorted newest-first.
- Align the `RawArticle` / `RawCity` TypeScript types with the contract in `docs/DIGEST_OUTPUT_CONTRACT.md`: `image` becomes `{ url: string; alt: string } | null`; add required `source`; add optional `summary` and `published_at`; add `metroCode` to `RawCity`.
- Replace URL-guessing (`sourceLabel()`) with the emitted `source`, and map `image.url` into the article view model.
- Drive the shell from the manifest: `CitySideBar` lists the real metros; selecting a metro shows its latest day; `PeriodNav`'s Weekly chips page through that metro's actually-available dates and load the selected day's digest.
- Retire the sample `src/data/cities.ts` as the data source (kept only if useful as a typed fixture for tests).

## Capabilities

### New Capabilities
- `digest-data`: Defines how the UI discovers, loads, and shapes the generator's per-metro-per-day digest JSON into the view, including metro navigation and per-day selection.

### Modified Capabilities
- None as recorded specs (`openspec/specs/` is empty; the `app-layout-shell` change remains a pending, orthogonal proposal).

## Impact

- Affected code: `src/types.ts`, `src/utils/format.ts` (drop `sourceLabel`, adapt `mapItem`), `src/App.tsx`, `src/components/{CitySideBar,PeriodNav,NewsDigest}.tsx`, new `src/data/` loader module; `src/data/cities.ts` demoted or removed.
- Data source: `digests/**/*.json` becomes a build input. Note the generator emits an extra `metro` (CBSA) field not in the contract — the loader ignores it. A stray empty `digests/columbus-oh/` dir must be excluded, and metros have uneven day counts (Charlotte has fewer), so navigation must be per-metro, not a fixed 7-day window.
- No new dependencies (uses Vite's built-in glob). No server/runtime fetch — files are bundled.
- No changes to the generator or the contract; this is UI-side consumption only.
