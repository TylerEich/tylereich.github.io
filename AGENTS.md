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

## Color Scheme

- Primary brand colors: `gunmetal` `#282940` and `gold` `#d9bc66` (defined in `src/input.css` via `@theme`).
  - Source: `src/input.css:4` (`--color-gunmetal`), `src/input.css:5` (`--color-gold`).
- Base backgrounds/text:
  - Light: `bg-slate-100`, `text-slate-500`, headings `text-slate-900`.
    - Usage: `index.html:10`, `index.html:17`.
  - Dark: `dark:bg-slate-900`, `dark:text-slate-100`.
    - Usage: `index.html:10`, `index.html:17`.
- Accents:
  - Hero subtitle: light `text-amber-700`, dark `dark:text-gold`.
    - Usage: `index.html:22`.
  - Buttons: `bg-indigo-600` hover `hover:bg-indigo-500`, `text-white`.
    - Usage: `index.html:106`.
- Surfaces and borders:
  - Overlay card: light `border-slate-300/40`, `bg-slate-100/80`; dark `dark:border-slate-500/50`, `dark:bg-slate-900/70`.
    - Usage: `index.html:52`.
  - Skill tags: light `bg-slate-200`; dark `dark:bg-slate-700`.
    - Usage: `index.html:62`, `index.html:65`, `index.html:68`.
- Section backgrounds and footer:
  - Portfolio section: `bg-gunmetal`.
    - Usage: `index.html:31`.
  - Footer text: light `text-slate-500`, dark `dark:text-slate-400`.
    - Usage: `index.html:114`.
