# Repository Guidelines

## Project Structure & Module Organization

- Root static site served by GitHub Pages. Key paths:
  - `index.html`: main page markup
  - `_config.yml`: Pages/Jekyll metadata (no Gemfile used)
  - `src/input.css`: Tailwind source; edit styles here
  - `style.css`: compiled CSS; do not edit directly
  - `js/sections.js`: Play/replay animations for the pipeline (Fig. 01) and agents (Fig. 02) sections, and the website wall lightbox
  - `favicon.svg`: gold "TE" monogram favicon
  - `fonts/`: self-hosted Space Grotesk variable font (display typeface)
  - `og.png`: social share (Open Graph) image
  - `package.json`: scripts and tooling

## Build, Test, and Development Commands

- `npm run dev`: compile Tailwind from `src/input.css` to `style.css` in watch mode (minified).
- `npm run build`: one-off Tailwind build for commits/CI. It also runs `npm run stamp`, which adds a content hash (`?v=…`) to the `style.css` and `js/sections.js` links in `index.html` so browsers skip stale cached copies after a deploy.
- After changing `js/sections.js` alone, run `npm run stamp` (or `npm run build`) before committing.
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

The site commits to a single dark theme (no light mode): blueprint blue paper
with a marker yellow accent. Brand tokens live in `src/input.css` via `@theme`:

- `--color-page` `#0f2a4a`: page background (`bg-page`).
- `--color-surface` `#163a63`: raised surfaces (`bg-surface`).
- `--color-panel` `#11304f`: opaque card and panel fill over the grid (`bg-panel`).
- `--color-edge` `#35608f`: borders and section dividers (`border-edge`).
- `--color-marker` `#ffd84d`: accent for icons, links, eyebrows and the CTA (`text-marker`, `bg-marker`).
- `--color-pen` `#ff9d5c`: handwritten margin notes.

Text: headings `text-head`, body `text-body`, supporting `text-muted`.

Contact CTA: `btn-fill bg-marker text-page border-marker border`.

## Blueprint Look

- A faint drafting grid sits behind the page (`body` in `src/input.css`).
- Square corners: `rounded-[3px]` for cards and panels, `rounded-[2px]` for buttons. Phone mockups keep device rounding.
- Cards and figure panels add `bp-card` for pale corner registration ticks.
- Section eyebrows use `.eyebrow` (monospace, uppercase). Sections are labelled `Fig. 01` to `Fig. 07`.
- Handwritten margin notes use `.hand` (Caveat, `fonts/caveat-latin-600.woff2`, SIL OFL in `fonts/caveat-OFL.txt`). Keep them short and lowercase.
- The diagrams use `--bp-*` variables defined on `:root` in `src/input.css`. Animations start empty and run when Play is pressed; with reduced motion, Play jumps to the finished state.

## Sketch to Finished

`js/site.js` tells the story of the build as you scroll:

- The hero (`#top`, `ink inked`) is finished from the start. It keeps faint construction marks only: `.trace` on the headline, `.pencil-ring` around the main button, `.smudge`.
- Each section below is `.ink` with a `data-stage` (`framing`, `wiring`, `polish`, `shipped`). Its inner wrapper has `.guides` for the corner construction lines.
- While `html.sketchy` is set (motion allowed), a section's frame starts as linework and refines when it scrolls into view: `bp-card` outlines go solid, panels fill, `.btn-fill` fills, screenshots go from blueprint print to color, `.hand` notes appear. Text never changes color or moves, so nothing reflows while someone reads.
- "Show the blueprint" in the top strip sets `html.show-bp`, which puts every frame back to linework.
- With reduced motion, `sketchy` is never set and the page shows finished.
