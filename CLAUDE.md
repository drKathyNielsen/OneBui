# OneBui

A Vite + React + TypeScript app that renders per-metro news digests from JSON files
in `digests/<slug>/`. Specs and changes live under `openspec/` (OpenSpec workflow).

## Build & tooling

- **Node 20 is required** for the Vite build (`vite build` uses rolldown and fails on
  Node 18). Use `nvm use 20` before `npm run build`, `npm run preview`, or the a11y checks.
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
- Enforced in three places: the `Accessibility` GitHub Actions workflow on every PR
  (`.github/workflows/a11y.yml`), a local **pre-push** hook (`.githooks/pre-push`, wired by the
  `prepare` script), and this instruction for `/code-review`.
- pa11y only sees the default theme/route (theme is toggled client-side); keep the
  `--text-secondary` / `--ink` contrast intent when adding themed UI so all four themes stay legible.
- To bypass the pre-push hook in an emergency: `git push --no-verify`.
