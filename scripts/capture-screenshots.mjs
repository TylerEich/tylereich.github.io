#!/usr/bin/env node
// Capture portfolio screenshots of websites at mobile, tablet, and desktop sizes.
//
// One-time setup:
//   npm install
//   npx playwright install chromium
//
// Usage:
//   npm run screenshots                # capture every site in SITES below
//   npm run screenshots -- crflooring  # only sites whose name/url matches "crflooring"
//   node scripts/capture-screenshots.mjs https://example.com   # ad-hoc URL
//
// Output: screenshots/<site>/<device>.png (plus <device>-full.png for the
// full-page scroll capture of each site).

import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

// ---------------------------------------------------------------------------
// Edit this list as your portfolio grows. `name` becomes the output folder.
// ---------------------------------------------------------------------------
const SITES = [
  { name: "codechameleon", url: "https://codechameleon.com" },
  { name: "crflooring", url: "https://crflooring.com" },
  { name: "rjefurn", url: "https://rjefurn.com" },
  { name: "gasolineequipment", url: "https://gasolineequipment.com" },
  { name: "seed-right", url: "https://seed-right.com" },
  { name: "yourmovementmatters", url: "https://yourmovementmatters.com" },
  { name: "doolittle-enterprises", url: "https://doolittle.enterprises" },
  { name: "pena-mechanical", url: "https://penamechanical.com" },
  { name: "fwtrails", url: "https://fwtrails.org" },
  { name: "tylerana", url: "https://tylerana.com" },
  { name: "tylereich", url: "https://tylereich.com" },
];

// Device profiles. Playwright's descriptors set viewport, pixel density,
// user agent, and touch — so sites serve their real mobile/tablet layouts.
const DEVICES = {
  mobile: devices["iPhone 15"],
  tablet: devices["iPad (gen 11)"] ?? devices["iPad (gen 7)"],
  desktop: { viewport: { width: 1512, height: 982 } },
};

const OUT_DIR = "screenshots";
const NAV_TIMEOUT_MS = 45_000;
// Extra settle time after load for fonts, hero images, and entrance animations.
const SETTLE_MS = 2_500;

async function captureSite(browser, site) {
  for (const [deviceName, profile] of Object.entries(DEVICES)) {
    const context = await browser.newContext(profile);
    const page = await context.newPage();
    try {
      await page.goto(site.url, {
        waitUntil: "networkidle",
        timeout: NAV_TIMEOUT_MS,
      });
    } catch {
      // networkidle never settles on sites with long-polling/analytics;
      // fall back to plain load before giving up.
      await page.goto(site.url, { waitUntil: "load", timeout: NAV_TIMEOUT_MS });
    }
    await page.waitForTimeout(SETTLE_MS);

    const dir = path.join(OUT_DIR, site.name);
    await mkdir(dir, { recursive: true });
    // scale: "css" keeps retina profiles from producing enormous files.
    await page.screenshot({
      path: path.join(dir, `${deviceName}.png`),
      scale: "css",
    });
    await page.screenshot({
      path: path.join(dir, `${deviceName}-full.png`),
      fullPage: true,
      scale: "css",
    });
    console.log(`  ✓ ${deviceName} (${profile.viewport.width}px)`);
    await context.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  let sites;
  if (args.some((a) => a.includes("://"))) {
    sites = args.map((url) => ({
      name: new URL(url).hostname.replace(/^www\./, ""),
      url,
    }));
  } else if (args.length > 0) {
    sites = SITES.filter((s) =>
      args.some((a) => s.name.includes(a) || s.url.includes(a)),
    );
    if (sites.length === 0) {
      console.error(`No sites match: ${args.join(", ")}`);
      process.exit(1);
    }
  } else {
    sites = SITES;
  }

  // CHROMIUM_EXECUTABLE lets you point at an existing Chrome/Chromium binary
  // instead of the one `npx playwright install chromium` downloads.
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
  });
  const failures = [];
  for (const site of sites) {
    console.log(`${site.name} — ${site.url}`);
    try {
      await captureSite(browser, site);
    } catch (err) {
      console.error(`  ✗ failed: ${err.message.split("\n")[0]}`);
      failures.push(site.name);
    }
  }
  await browser.close();

  console.log(
    `\nDone. Screenshots are in ${OUT_DIR}/` +
      (failures.length ? `\nFailed: ${failures.join(", ")}` : ""),
  );
  process.exit(failures.length ? 1 : 0);
}

main();
