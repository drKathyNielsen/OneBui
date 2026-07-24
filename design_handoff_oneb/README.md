# Handoff: One B — News Digest (React + TypeScript + Vite + Bootstrap)

## Overview
"One B" is a news-digest surface that gives local managers/directors/sales a quick pre-meeting brief: a lead "Are they ok?" story, "Conversation starters," "You should know," and sports scores for a selected metro. This package is a **working implementation**, not a static reference — it runs with `npm install && npm run dev`.

## About the design source
This code was translated from an interactive HTML prototype (`OneB Visual Directions.dc.html`) that explored four visual directions: Classic (newspaper) and Modern (editorial), each in Light and Dark. This build ships **all four as live, switchable appearance modes** — nothing was dropped in translation. If anything here reads ambiguous next to the prototype, treat the prototype as the source of truth for exact spacing/type and this code as the pattern to extend.

## Fidelity
High-fidelity. Colors, type, spacing, and copy are carried over exactly (see Design Tokens below). Layout was rebuilt responsively using Bootstrap's grid rather than the prototype's three fixed-width frames (phone/tablet/desktop) — one fluid layout now covers all three breakpoints.

## Stack
- Vite + React 18 + TypeScript (strict)
- Bootstrap 5 (grid + reset only — `bootstrap.min.css` imported in `main.tsx`; no Bootstrap JS/components are used, all interactive bits are custom for accessibility control)
- Plain CSS with custom properties for theming (`src/styles/theme.css`), no CSS-in-JS

## Run it
```
npm install
npm run dev
```

## Screens / Views
Single view: the digest for one metro. City switching and appearance switching do not navigate — they update state in place.

### Layout (responsive, Bootstrap grid)
- **Phone (<768px):** everything stacks in one column — hero, then starters, then "you should know" + sports.
- **Tablet (≥768px, `col-md-6`):** hero spans full width, then starters and "you should know"/sports sit side by side.
- **Desktop (≥992px, `col-lg-5/4/3`):** three columns side by side, hairline `border-left` rules between them (see `.oneb-col-divider`, gated by a `min-width: 768px` media query so the rule doesn't appear while stacked).

### Header
- Appearance bar: two segmented button groups (Classic/Modern, Light/Dark), always visible.
- Masthead: "One B" badge, kicker label, city name (button, opens picker), date.
- Tabs: "Today" (active) / "Weekly (soon)" — Weekly is a real `<button disabled>`, reserved for future content, not a dead link.

### Components (`src/components/`)
- `AppearanceToggle.tsx` — style/theme segmented controls.
- `CityPicker.tsx` — button + listbox dropdown, cycles Boulder / Minneapolis–St. Paul / San Antonio / Wheeling.
- `AreTheyOk.tsx` — lead story card. Classic style renders a serif drop cap on the first letter; Modern renders plain body copy (matches prototype behavior).
- `ArticleList.tsx` — shared list renderer for both "Conversation starters" (numbered) and "You should know" (bulleted), with a hairline rule separating the number/bullet from the body (per the prototype's print-style column rule).
- `Sports.tsx` — team + scores, italic serif for scores.
- `NewsDigest.tsx` — composes the above into the responsive grid.

## Interactions & Behavior
- Style and theme are independent toggles; any of the 4 combinations is reachable and **persists** to `localStorage` (`oneb.style`, `oneb.theme`) so a returning user keeps their preference.
- City picker: click the city name or chevron to open/close; selecting a city closes the menu and returns focus to the trigger button (no focus loss for keyboard/screen-reader users).
- "Weekly" tab is inert (`disabled` + `aria-disabled`) — it should NOT be wired to any content yet; it's a placeholder for a future weekly-rollup view.
- No animations/transitions in this build (the prototype had none either — theme/style swap instantly).

## Accessibility (WCAG AA) — what's implemented and why
- **Color contrast:** every text/background pairing across all 4 theme combos is ≥4.5:1 (body/label text) or ≥3:1 (large text, 18px+/14px+bold), verified against the actual token values — see the table below. The Modern Dark palette was specifically tuned (`#818c9c` labels, `#a7b0c0` body, `#4677b8` accent) to clear AA; don't swap these for the untested originals.
- **Semantic structure:** `<header>`, `<nav role="tablist">`, `<main>`, `<section aria-labelledby>`, heading hierarchy (`h2` for section titles, `h3` for article titles) — a screen reader user can jump section-to-section.
- **Interactive controls:** all toggles are real `<button>`s (never `<div onClick>`), with `aria-pressed` on segmented toggles, `aria-haspopup`/`aria-expanded` + `role="listbox"`/`role="option"`/`aria-selected` on the city picker, `role="tab"`/`aria-selected` on the Today/Weekly tabs.
- **Decorative content hidden from AT:** drop-cap letter and bullet/number markers are `aria-hidden`, with the full un-split text exposed via `aria-label` on the parent so screen readers read the sentence once, correctly — not "T" then "he recall...".
- **Focus visibility:** every interactive element gets a visible `outline` via `:focus-visible` (2px solid, using the active theme's accent color) — never `outline: none` without a replacement.
- **Disabled control labeling:** "Weekly" uses native `disabled` + `aria-disabled="true"` + a `title` tooltip, so assistive tech and sighted users both get "not yet available," not a silent dead click.
- **Links:** default and hover states for `a` are defined explicitly per theme (`--accent`), so a future link never falls back to browser-default blue.
- **Reduced motion:** no motion effects exist in this build; if you add transitions later, gate them behind `prefers-reduced-motion: no-preference`.

## Design Tokens
All four style×theme combinations live in `src/styles/theme.css` as CSS custom properties scoped to `[data-style][data-theme]` attribute selectors on the root element. Summary (bg / surface / ink / body text / accent):

| Combo | bg | surface (card) | ink (headings) | body text | accent |
|---|---|---|---|---|---|
| Classic · Light | `#f5f3ec` | `#ece7d8` | `#1a1a17` | `#433f36` | `#1a1a17` (monochrome) |
| Classic · Dark | `#17150f` | `#39311f` | `#f2ede0` | `#b4af9f` | `#f2ede0` (monochrome) |
| Modern · Light | `#fbfaf8` | `#eef2fb` | `#1a1c22` | `#5c5f68` | `#2f5aa8` (steel blue) |
| Modern · Dark | `#10141c` | `#182437` | `#eef1f6` | `#a7b0c0` | `#4677b8` (steel blue) |

Typography: headlines/drop caps in **Newsreader** (serif), uppercase labels in **IBM Plex Mono** (Classic) or **Inter** (Modern), body copy in **Inter**. Loaded via Google Fonts `<link>` in `index.html`.

Spacing/radius: card radius 12px, hairline dividers 1px, masthead double-rule border 3px (Classic only — `border-bottom: 3px double`).

## Assets
No images/icons beyond system emoji (☀ ☾ ▾ ▪) and Unicode glyphs — no asset files to hand off.

## Data
`src/data/cities.ts` holds the 4 sample metros (Boulder, Minneapolis–St. Paul, San Antonio, Wheeling) exactly as authored in the prototype, including real sourced headlines/descriptions/URLs. Replace this with your real feed — `src/utils/format.ts#toCityViewModel` is the seam: feed it a `RawCity` and it produces everything the components need (drop cap split, date formatting, source labels from URL, ordinals).

## Files
- Prototype reference (not shipped code): `../OneB Visual Directions.dc.html` in the project root — the four fully-styled directions plus the Phone/Tablet/Desktop frames for Classic Light, all in one interactive file.
