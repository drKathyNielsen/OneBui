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
npm run test:a11y:ci    # build, serve preview, run pa11y-ci (WCAG2AA)
```

- Config: `.pa11yci` (WCAG2AA standard; Chrome launched with `--no-sandbox` for CI/sandboxed Linux).
  It runs the app **four times** — once per style×theme combination — by clicking the appearance
  toggles via pa11y `actions` (targeted by their `aria-label^=` prefixes), since theme is client-side
  state, not a route. Add new URLs/views here as they become deep-linkable (`?metro=…`).
- Enforced in three places: the `Accessibility` GitHub Actions workflow on every PR
  (`.github/workflows/a11y.yml`), a local **pre-push** hook (`.githooks/pre-push`, wired by the
  `prepare` script), and this instruction for `/code-review`.
- Design tokens live in `src/styles/theme.css`; normal-size text (meta, source links) must clear
  4.5:1 on both `--bg` and `--surface` in all four themes — `--text-secondary` and `--accent` are the
  usual offenders in dark modes.
- To bypass the pre-push hook in an emergency: `git push --no-verify`.
