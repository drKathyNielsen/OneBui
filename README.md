# OneBui

A Vite + React + TypeScript app that renders warm, human-scale **local news
briefs** for a handful of US metros. Each metro gets a daily "how's your city
doing" digest — a lead *Are you OK?* story, a few *conversation starters*, some
*you should know* items, and local *sports* — plus a weekly aggregate that
narrates the arc of the week. Content is authored as JSON files under
`digests/<slug>/` and bundled into the app at build time; there is no runtime
backend.

## Requirements

- **Node 20+** is required. Vite 8 uses the rolldown bundler, whose native
  binding is built against your Node version and fails on Node 18. The version
  is pinned in `.nvmrc`; run `nvm use` (or `nvm install`) before building.

## Getting started

```bash
nvm use            # honors .nvmrc (Node 20)
npm install
npm run dev        # dev server with HMR at http://localhost:5173
```

Or use the convenience wrapper, which switches Node via nvm and installs deps
for you:

```bash
./run.sh           # dev server
./run.sh build     # production build into dist/
./run.sh preview   # build, then serve dist/ locally
```

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with hot reload. |
| `npm run build` | Typecheck (`tsc -b`) + Vite production build into `dist/`. |
| `npm run preview` | Serve the built `dist/` on port 4173 (strict). |
| `npm run lint` | ESLint over the repo. |
| `npm run test:a11y` | Preview + run pa11y-ci (assumes a build exists). |
| `npm run test:a11y:ci` | Build, serve preview, and run pa11y-ci (WCAG2AA). |

## Features

- **Per-metro briefs** — pick a metro from the sidebar; each renders its daily
  brief with the `Are you OK?`, conversation-starter, you-should-know, and
  sports sections.
- **Daily and weekly periods** — daily briefs come with a day-chip rail across
  the ingested window; the weekly aggregate shows a coverage range and narrates
  the week, with each item optionally linking the contributing daily articles.
- **Deep-linkable view state** — the current metro, period, and daily date are
  mirrored in the URL query string so a view is shareable and restorable:

  ```
  ?metro=<slug>&period=<daily|weekly>&date=<yyyy-mm-dd>
  ```

  Unknown, missing, or out-of-window params fall back to safe defaults and the
  URL is canonicalized in place (`date` is dropped in weekly mode). See
  `src/utils/viewParams.ts`.
- **Appearance options** — a reading **style** (`classic` / `modern`) and color
  **theme** (`light` / `dark`), toggled client-side and persisted; design tokens
  live in `src/styles/theme.css`.

## Digest data

Digests are plain JSON, loaded via a lazy `import.meta.glob` over
`/digests/**/*.json` (see `src/data/digests.ts`). Filenames encode the metro and
period:

```
digests/<slug>/<metroCode>.<yyyy-mm-dd>.json   # a daily brief
digests/<slug>/<metroCode>.weekly.json         # the weekly aggregate
```

Only the newest **4** daily files per metro are ingested (`DAILY_WINDOW`), so
the bundle doesn't grow with history. Malformed files are skipped rather than
breaking the app. The JSON contract is the machine-readable schema in
[`docs/schema/digest.schema.json`](docs/schema/digest.schema.json) (daily and
weekly), mirrored as TypeScript types in `src/types.ts` — treat those as a stable
interface (additive fields are safe; renames/removals are breaking). The
authoritative prose contract and validator live in the generator repo.

## Accessibility

This repo gates on accessibility (WCAG2AA). The check builds the app, serves the
preview, and runs pa11y-ci **four times** — once per style×theme combination,
driving the appearance toggles via pa11y `actions`:

```bash
npm run test:a11y:ci
```

Config lives in `.pa11yci` (Chrome launched with `--no-sandbox` for CI/sandboxed
Linux). Normal-size text (meta, source links) must clear 4.5:1 contrast on both
`--bg` and `--surface` in all four themes — `--text-secondary` and `--accent`
are the usual offenders in dark modes. The gate is enforced in three places:

- the `Accessibility` GitHub Actions workflow on every PR
  (`.github/workflows/a11y.yml`),
- a local **pre-push** hook (`.githooks/pre-push`, wired by the `prepare`
  script), and
- the `/code-review` process (see `CLAUDE.md`).

To bypass the pre-push hook in an emergency: `git push --no-verify`.

## Project layout

```
digests/          per-metro brief JSON (<slug>/<metroCode>.<date|weekly>.json)
docs/             the daily and weekly digest data contracts
openspec/         OpenSpec specs and change proposals (spec-driven workflow)
src/
  components/     UI (NewsDigest, ArticleList, CitySideBar, PeriodNav, …)
  data/           digest loading & manifest (digests.ts)
  hooks/          useAppearance (style/theme state)
  styles/         theme.css design tokens, newsDigest.css
  utils/          viewParams (URL state), format
  types.ts        raw JSON + view-model types
```

Specs and changes are managed with the **OpenSpec** workflow under `openspec/`.

## Deployment

`render.yaml` is a Render Blueprint that deploys the app as a static site
(`npm ci && npm run build` → `./dist`, with SPA rewrite and asset caching).
Node 20 is pinned via `NODE_VERSION` for the build.
