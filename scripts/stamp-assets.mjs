// Add a content hash to the stylesheet and script links in index.html so
// browsers fetch fresh copies after each deploy instead of cached ones.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const assets = ["style.css", "js/sections.js", "js/site.js"];
let html = readFileSync("index.html", "utf8");

for (const file of assets) {
  const hash = createHash("sha256")
    .update(readFileSync(file))
    .digest("hex")
    .slice(0, 8);
  const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(["'])${escaped}(\\?v=[0-9a-f]*)?\\1`, "g");
  if (!pattern.test(html)) throw new Error(`No link to ${file} in index.html`);
  html = html.replace(pattern, `$1${file}?v=${hash}$1`);
}

writeFileSync("index.html", html);
