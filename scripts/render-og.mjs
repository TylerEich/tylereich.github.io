// Renders scripts/og.html to og.png (1200x630) with Playwright's Chromium.
// Usage: node scripts/render-og.mjs
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.goto(pathToFileURL(join(root, "scripts/og.html")).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(root, "og.png") });
await browser.close();
console.log("Wrote og.png");
