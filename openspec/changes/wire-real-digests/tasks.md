## 1. Align types with the contract

- [x] 1.1 In `src/types.ts`, change `RawArticle.image` from `string | undefined` to `{ url: string; alt: string } | null`
- [x] 1.2 Add `source: string` (required) and optional `summary?: string`, `published_at?: string` to `RawArticle`; make `description?: string` optional
- [x] 1.3 Add `metroCode: string` to `RawCity`
- [x] 1.4 Confirm view-model `Article.image` stays `string | undefined` (resolved thumbnail URL) and `Article.source` stays `string`

## 2. Digest loader + manifest

- [x] 2.1 Add `src/data/digests.ts` that globs `import.meta.glob('/digests/**/*.json', { eager: true })`
- [x] 2.2 Parse each path into `{ slug, metroCode, date }`; group into `Metro[]` = `{ slug, metroCode, shortName, days: { date, data: RawCity }[] }`
- [x] 2.3 Sort each metro's `days` newest-first; sort metros by `shortName`; exclude metros with zero valid day files (drops empty `columbus-oh/`)
- [x] 2.4 Skip files that fail a minimal shape check (has `shortName`, `date`, the three arrays / `are_you_ok` key) rather than throwing
- [x] 2.5 Export the manifest (e.g. `export const METROS: Metro[]`)

## 3. Shape real data into the view

- [x] 3.1 In `src/utils/format.ts`, delete `sourceLabel()` and its call
- [x] 3.2 Update `mapItem` to set `source: it.source` and `image: it.image?.url`
- [x] 3.3 Replace `getWeekDays()` usage: derive Weekly day options from the selected metro's real `days` (label from `formatDate`), not a synthetic 7-day window

## 4. Wire the shell to the manifest

- [x] 4.1 In `src/App.tsx`, source cities from `METROS` instead of `RAW_CITIES`; hold `metroIdx` and selected `date` (default = metro's newest day)
- [x] 4.2 On metro change, clamp `date` to the newly selected metro's newest available day
- [x] 4.3 `CitySideBar` lists `METROS` (shortName) and selects by index
- [x] 4.4 `PeriodNav` Today = newest day; Weekly renders the metro's available dates as chips; selecting one sets `date`
- [x] 4.5 `NewsDigest` renders the day matching the selected `date` (`days.find(d => d.date === date)`)

## 5. Retire the sample

- [x] 5.1 Remove `src/data/cities.ts` as the live data source (delete, or keep only as a typed test fixture with a comment)
- [x] 5.2 Ensure no remaining imports reference `RAW_CITIES`

## 6. Verify

- [x] 6.1 `npm run build` (Node 20) passes typecheck with the new schema and no unused-symbol errors
- [x] 6.2 Dev server: each metro shows its latest day; thumbnails load from `image.url`; `source` labels match the data (no URL guessing)
- [x] 6.3 Weekly tab lists only real available dates for the metro; selecting a day swaps the digest content; switching metros clamps to that metro's newest day
- [x] 6.4 Metros with gaps behave correctly: Charlotte shows its ~6 days, Wheeling's `are_you_ok: null` and empty arrays render without error, empty `columbus-oh` is absent from the sidebar
