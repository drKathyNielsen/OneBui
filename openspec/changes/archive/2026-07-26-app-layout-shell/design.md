## Context

`App.tsx` currently owns all layout markup directly, using `react-bootstrap`'s `Container`/`Row`/`Col` with placeholder text. There is no component boundary between navigation, side content, and main content, so there's nowhere natural to add nav links, city-specific side content, or page content without further tangling `App.tsx`. This is a small, single-page React + Vite project (no router yet), so the shell only needs to support one page for now.

## Goals / Non-Goals

**Goals:**
- Establish a `src/components/` convention with one component per shell region: `TopNavBar`, `CitySideBar`, `Content`, `Footer`.
- Wire these into `App.tsx` as the page shell, replacing the current placeholder markup.
- Keep every new component a stub — minimal placeholder JSX, no props, no state, no data fetching, no business logic.

**Non-Goals:**
- Real navigation links, routing, or active-state handling in `TopNavBar`.
- Real city data, lists, or selection behavior in `CitySideBar`.
- Any actual page content in `Content` or `Footer` beyond a placeholder label.
- Styling polish beyond basic `react-bootstrap` layout primitives already in use.

## Decisions

- **Component boundary**: one file per region under `src/components/` (`TopNavBar.tsx`, `CitySideBar.tsx`, `Content.tsx`, `Footer.tsx`), each a default-exported function component. Rationale: matches existing project conventions (function components, default export, as seen in `App.tsx`), keeps each stub trivial to extend later without renaming.
- **Layout composition**: `App.tsx` composes the shell as `TopNavBar` on top, `Footer` on bottom, and a `Row` in between splitting `CitySideBar` (narrow `Col`) and `Content` (wide `Col`). Rationale: reuses the `react-bootstrap` `Container`/`Row`/`Col` primitives already imported in `App.tsx` instead of introducing a new layout system.
- **No props/state yet**: stub components take no props and hold no state. Rationale: the proposal explicitly scopes this change to structure only; adding placeholder props now would be speculative and likely wrong once real requirements land.

## Risks / Trade-offs

- [Risk] Bootstrap grid split between side bar and content is a guess (e.g., `Col` widths) that may not match eventual design → Mitigation: keep widths minimal/obvious placeholders; revisiting layout proportions is cheap since components are stubs.
- [Risk] Introducing a components folder/convention now could be second-guessed later → Mitigation: this matches common React project structure and is trivial to reorganize.
