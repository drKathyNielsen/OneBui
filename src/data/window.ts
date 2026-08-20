// How many daily files per metro enter the bundle. Older days are never
// imported, so the bundle doesn't grow with history (contract intent, review #7).
//
// Lives in its own module — with no imports and no type syntax — so both the
// loader and `scripts/gen-pa11y-urls.mjs` (run by Node, which strips TS types
// natively) share exactly one definition of which days are reachable.
export const DAILY_WINDOW = 4;
