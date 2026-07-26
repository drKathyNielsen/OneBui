## 1. Stub Components

- [ ] 1.1 Create `src/components/TopNavBar.tsx` — default-exported function component rendering placeholder markup identifying itself as the top nav bar, no props
- [ ] 1.2 Create `src/components/CitySideBar.tsx` — default-exported function component rendering placeholder markup identifying itself as the city side bar, no props
- [ ] 1.3 Create `src/components/Content.tsx` — default-exported function component rendering placeholder markup identifying itself as the content area, no props
- [ ] 1.4 Create `src/components/Footer.tsx` — default-exported function component rendering placeholder markup identifying itself as the footer, no props

## 2. Wire Up App Shell

- [ ] 2.1 Import `TopNavBar`, `CitySideBar`, `Content`, and `Footer` into `src/App.tsx`
- [ ] 2.2 Replace the existing `Container`/`Row`/`Col` placeholder markup in `App.tsx` with the shell layout: `TopNavBar` on top, a `Row` splitting `CitySideBar` (narrow `Col`) and `Content` (wide `Col`), then `Footer` at the bottom
- [ ] 2.3 Remove now-unused placeholder JSX from `App.tsx`

## 3. Verify

- [ ] 3.1 Run the dev server and confirm all four regions render in the correct order (nav bar, side bar + content, footer) with no console errors
- [ ] 3.2 Run typecheck/build to confirm no TypeScript errors from the new components
