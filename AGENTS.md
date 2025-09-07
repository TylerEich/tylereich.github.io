# Repository Guidelines

## Project Structure & Module Organization
- Root static site served by GitHub Pages. Key paths:
  - `index.html`: main page markup
  - `_config.yml`: Pages/Jekyll metadata (no Gemfile used)
  - `src/input.css`: Tailwind source; edit styles here
  - `style.css`: compiled CSS; do not edit directly
  - `assets/`, `icons/`: images and static assets (e.g., `assets/ness-bros.png`)
  - `svg-generator.js`: small Node script to generate an SVG
  - `package.json`: scripts and tooling

## Build, Test, and Development Commands
- `npm run dev`: compile Tailwind from `src/input.css` to `style.css` in watch mode (minified).
- `npm run build`: one-off Tailwind build for commits/CI.
- Local preview: `python -m http.server` then open `http://localhost:8000` (or use your editor’s Live Server). Ensure `style.css` exists/updates.

## Coding Style & Naming Conventions
- Formatting: Prettier with `prettier-plugin-tailwindcss`. Run `npx prettier --write .` before PRs.
- Indentation: 2 spaces for HTML/CSS/JS.
- Tailwind: prefer utility-first classes; semantic HTML where possible. Class order is auto-sorted by the Prettier plugin.
- File names: lowercase kebab-case for assets (e.g., `project-card.png`).
- Do not edit `style.css` manually; change `src/input.css` and rebuild.

## Testing Guidelines
- No formal test suite. Validate changes by:
  - Building CSS and reloading the page locally.
  - Checking light/dark modes, mobile/desktop breakpoints, and console errors.
  - Verifying critical pages still render (`index.html`). Include repro steps for any bug fixes.

## Commit & Pull Request Guidelines
- Commits: concise, descriptive, present tense (e.g., "Add portfolio section", "Minify css"). Group related changes.
- PRs should include:
  - Summary of changes and rationale; link issues (e.g., `#123`) if relevant.
  - Screenshots or screen recordings for visual changes.
  - Any build or config updates noted in the description.

## Security & Configuration Tips
- Don’t commit secrets or tokens. Keep large binaries out of git.
- `CNAME` controls the custom domain; avoid accidental edits.
- Discuss adding heavy tooling or new frameworks before introducing them.
