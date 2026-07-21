# Repository Guidelines

## Project Structure & Module Organization

- Root static site served by GitHub Pages. Key paths:
  - `index.html`: main page markup
  - `_config.yml`: Pages/Jekyll metadata (no Gemfile used)
  - `src/input.css`: Tailwind source; edit styles here
  - `style.css`: compiled CSS; do not edit directly
  - `favicon.svg`: gold "TE" monogram favicon
  - `fonts/`: self-hosted Space Grotesk variable font (display typeface)
  - `og.png`: social share (Open Graph) image
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
- Cache busting: `index.html` links the stylesheet as `style.css?v=<hash>`. After
  rebuilding `style.css`, bump the `?v=` value (e.g. `md5sum style.css | cut -c1-8`)
  so browsers/CDN fetch the new CSS instead of a stale cached copy.

## Testing Guidelines

- No formal test suite. Validate changes by:
  - Building CSS and reloading the page locally.
  - Checking mobile/desktop breakpoints and console errors.
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

## Color Scheme

The site commits to a single dark theme (no light mode). Brand tokens live in
`src/input.css` via `@theme`:

- `--color-gunmetal` `#282940` — page background (`bg-gunmetal`).
- `--color-surface` `#2f3050` — card surfaces (`bg-surface`).
- `--color-edge` `#41436b` — borders and section dividers (`border-edge`).
- `--color-gold` `#d9bc66` — accent for eyebrows, icons, links, and the contact CTA (`text-gold`, `bg-gold`).

Text: body `text-slate-300`, headings `text-slate-50`, muted/supporting `text-slate-400` / `text-slate-500`.

Contact CTA: `bg-gold` with `text-gunmetal`.
