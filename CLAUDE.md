# OneBui

A Vite + React + TypeScript app that renders per-metro news digests from JSON files
in `digests/<slug>/`. Specs and changes live under `openspec/` (OpenSpec workflow).

## Build & tooling

- **Node 24 is required** (`.nvmrc`, `engines`): `vite build` uses rolldown and fails on
  Node 18, and puppeteer (behind pa11y) needs Node 22.12+. Run `nvm use` before
  `npm run build`, `npm run preview`, or the a11y checks.
- `npm run build` — typecheck (`tsc -b`) + Vite build.
- `npm run lint` — ESLint.

## Accessibility (part of code review)

This repo gates on accessibility. When reviewing or preparing changes that touch the UI
(anything under `src/`, styles, or markup), **run the accessibility check and treat new
violations as review findings to fix before merge**:

```
npm run test:a11y:ci    # build (with fixtures), generate the URL matrix, serve preview, run pa11y-ci (WCAG2AA)
```

- The URL list is **generated, not hand-maintained**: `scripts/gen-pa11y-urls.mjs` reads the
  digest files present and writes a gitignored `.pa11yci.json`. Never edit that file; change the
  predicates in `src/data/a11yUrls.ts` instead. The run prints every page it selected.
- Coverage comes in two tiers, because the gate has two jobs:
  - **fixtures** (`digests-fixtures/`, see its README) pin the required render shapes — stacked
    weather alerts, an empty section, an imageless article, a section deep enough to page — and are
    crossed with **all six style×theme combinations**, since appearance tokens are what they exist
    to stress. They load only under `VITE_A11Y_FIXTURES`, so they never ship.
  - **live** `digests/` contributes each metro's newest day and weekly in the default appearance
    only; its job is catching content drift, and no shape requirement is charged against it (a
    quiet week with no weather alerts must not fail the build).
- Generation exits non-zero, naming the shape, when a required fixture is missing or malformed —
  so lost coverage fails loudly instead of silently passing.
- Theme and style are client-side state rather than routes, so each combination is reached by
  clicking the appearance toggles via pa11y `actions` (targeted by their `aria-label^=` prefixes).
- Enforced in three places: the `Accessibility` GitHub Actions workflow on every PR
  (`.github/workflows/a11y.yml`), a local **pre-push** hook (`.githooks/pre-push`, wired by the
  `prepare` script), and this instruction for `/code-review`. The hook narrows the matrix by what
  the push touched via `A11Y_TIER` (`src/` and `tests/` → fixtures, `digests/` → live, anything else → both);
  the PR run is the backstop and always runs everything.
- Design tokens live in `src/styles/theme.css`; normal-size text (meta, source links) must clear
  4.5:1 on both `--bg` and `--surface` in all six themes — `--text-secondary` and `--accent` are the
  usual offenders in dark modes.
- To bypass the pre-push hook in an emergency: `git push --no-verify`.
