## Why

`App.tsx` currently renders a two-column placeholder layout directly with no structural separation between navigation, wayfinding, and page content. As the app grows, we need a standard page shell (top nav, side bar, content area, footer) so future features have a consistent, composable place to land instead of being wedged into `App.tsx` itself.

## What Changes

- Introduce a page shell layout composed of four stub components: a top navigation bar, a city side bar, a content area, and a footer.
- Refactor `App.tsx` to render the page shell instead of the current ad-hoc `Container`/`Row`/`Col` markup.
- Each new component is a stub: it renders minimal placeholder markup (e.g., a labeled container) and accepts no meaningful props yet — no internal logic, data fetching, or styling beyond basic layout structure.

## Capabilities

### New Capabilities
- `app-layout-shell`: Defines the page shell composed of a top nav bar, city side bar, content component, and footer, and how `App.tsx` wires them together.

### Modified Capabilities
- None (no existing specs).

## Impact

- Affected code: `src/App.tsx`, new files under `src/components/` (e.g., `TopNavBar.tsx`, `CitySideBar.tsx`, `Content.tsx`, `Footer.tsx`).
- No new dependencies; continues to use existing `react-bootstrap` primitives already in the project.
- No breaking changes to external behavior — visual output changes from the current placeholder columns to the new shell layout.
