## Context

The generator emits one JSON file per metro per day under `digests/<slug>/<metroCode>.<date>.json`, conforming to `docs/DIGEST_OUTPUT_CONTRACT.md`. The UI currently ignores these and renders a hand-written `src/data/cities.ts` sample. We want the UI to consume the real files. This is a static Vite SPA with no backend, so "loading" means bundling the JSON at build time, not fetching at runtime.

Observed data realities the design must absorb:
- Files carry an extra `metro` (CBSA) field not in the contract — additive, safe to ignore.
- `image` is `{ url, alt } | null`; `description` may be omitted; `summary`/`published_at` are optional; `source` is always present.
- Metros have uneven coverage (Boulder/Minneapolis/San Antonio/Wheeling ~9 days, Charlotte ~6), and there is an empty stray `digests/columbus-oh/` directory. A fixed "last 7 days" window is therefore wrong; navigation must reflect each metro's actual dates.

## Goals / Non-Goals

**Goals:**
- Discover and bundle all real digests via `import.meta.glob`, grouped into a per-metro manifest with dates sorted newest-first.
- Make types mirror the contract exactly so files render verbatim with no sanitizing.
- Drive metro selection and per-day (Weekly) navigation from the manifest.
- Remove URL-based source guessing.

**Non-Goals:**
- Runtime fetch, a generated `manifest.json` file, or any network layer.
- Cross-metro date bundling or a global calendar — the contract explicitly leaves per-date bundling to the UI, done in-memory.
- Changing the generator, the contract, or the digest files.
- Visual redesign — the layout from the design port stays; only its data source changes.

## Decisions

- **Build-time glob, eager.** Use `import.meta.glob('/digests/**/*.json', { eager: true })`. Rationale: zero runtime cost, no async/loading states, works on Render's static host. Files become part of the bundle. If bundle size later matters, switch to lazy glob + async metro loading — deferred.
- **Manifest shape.** Reduce the glob into `Metro[]`, each `{ slug, metroCode, shortName, days: { date, data }[] }` with `days` sorted descending by ISO date. Derive `slug`/`metroCode` from the file path; `shortName` from the file body. Rationale: the sidebar needs one entry per metro (not per file), and Weekly needs that metro's date list.
- **Exclude empty metros.** Drop metros with zero valid day files (handles `columbus-oh/`). Rationale: an empty sidebar entry is a dead end.
- **Types mirror the contract, not the old sample.** `RawArticle.image: { url: string; alt: string } | null`; add `source: string`, `summary?: string`, `published_at?: string`; `description?` optional. `RawCity` gains `metroCode: string`. The view-model `Article.image` becomes the resolved `string | undefined` (from `image?.url`) so components keep using a plain `src`. Rationale: keep the render layer's `<img>` simple while the raw layer stays faithful to the contract.
- **Source comes from data.** `mapItem` sets `source: it.source` and `image: it.image?.url`; delete `sourceLabel()`. Rationale: the contract makes `source` authoritative; URL-guessing was the defect it fixed.
- **Selection state.** `App` holds `metroIdx` and a selected `date` (default: that metro's newest). Switching metro resets the date to that metro's newest. `PeriodNav` Today = newest day; Weekly lists the metro's available dates as chips; picking one sets `date`, and `NewsDigest` renders `days.find(d => d.date === date)`. Rationale: replaces the placeholder `getWeekDays()` (which invented a 7-day window disconnected from real data).

## Risks / Trade-offs

- [Risk] Bundling all JSON inlines every digest into the JS bundle → grows with day/metro count. Mitigation: fine at current scale (~40 small files); documented lazy-glob fallback if it grows.
- [Risk] A malformed or partial digest file could break the eager import for the whole app. Mitigation: keep the reducer defensive (skip files failing a minimal shape check) and rely on the generator's own §7 validation upstream.
- [Risk] `date` selection can go stale when switching metros with different coverage. Mitigation: on metro change, clamp `date` to the new metro's newest available day.
- [Trade-off] Keeping `metro` and other unknown fields ignored rather than type-erroring means silent drift if the contract changes. Accepted: the contract declares additive fields safe; renames/removals are the breaking cases and would surface as type errors on the fields we do read.
