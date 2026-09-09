# AGENTS.md

React single-page app for building jigsaw puzzles from user-uploaded photos or 3 built-in images.

## Commands

- `npm install` — install dependencies
- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run lint` — oxlint (no config file needed; `.oxlintrc.json` present)
- `npm run preview` — preview the production build

## Architecture

- React 19 + Vite 8 + react-router-dom 7. No TypeScript, no build-time codegen.
- Two routes: `/` (Landing) and `/puzzle` (game).
- Landing flow is state-driven inside `Landing.jsx` (`intro` → `image` → `pieces`); it passes `{ imageSrc, pieceCount }` to `/puzzle` via router `location.state`. Image data is never persisted anywhere; reloading `/puzzle` without state redirects to `/`.
- Image is split into rectangular pieces with the Canvas API in `src/utils/puzzle.js`. The board is a fixed grid (`data-cell`), game state is a flat `board` object keyed by `"row-col"`.
- Drag-and-drop is hand-rolled with Pointer Events (`PuzzlePiece.jsx`) + `elementFromPoint` hit-testing (`src/utils/dnd.js`). No dnd library.
- Only correctly-placed pieces snap to cells; wrong pieces trigger a shake + cell flash. Completion = every cell contains a piece whose `correctRow`/`correctCol` match.

## Conventions

- All logic lives in plain JS/JSX (no TS), Spanish UI strings.
- Styles: CSS Modules co-located (`*.module.css`). No Tailwind/CSS-in-JS.
- Theme is a CSS-var swap on `:root[data-theme='…']` in `src/index.css`; toggle in `ThemeToggle.jsx`, persisted to `localStorage` key `rompecabezas-theme`.
- Shared constants (piece counts, max upload MB, predefined images) live in `src/constants.js`. Predefined images are static files in `public/imagenes/` referenced as `/imagenes/….jfif`.
- Keep puzzle piece counts web-safe: 50/100/250/500. Grid rows×cols is derived from image aspect ratio (`getGridForCount`).

## Gotchas

- No backend, no database — do not introduce auth, storage, or server code.
- Unrelated to repo changes: use `gh` for GitHub ops; the remote is `origin` on `master`.