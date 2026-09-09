# AGENTS.md

Static site — no build step, no dependencies, no test framework. Open `index.html` directly or serve with any static server.

- Pure HTML/CSS/JS (vanilla, no frameworks).
- Core logic in `script.js`, styles in `styles.css`.
- Canvas API used to split uploaded images into puzzle pieces.
- Drag-and-drop (mouse + touch) for piece placement.
- Puzzle completion detected by matching each piece's `correctRow`/`correctCol` to its cell position.
