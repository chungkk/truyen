#!/usr/bin/env node
/**
 * build-data.mjs
 * Reads output/<slug>/metadata.json for every story and writes
 * src/data/stories.json (array of StoryMeta with slug).
 *
 * Chapter content is NOT bundled; the app fetches it from GitHub raw CDN
 * (see src/lib/data.ts). Run this after crawling and commit the result.
 *
 * Usage:  npm run build-data
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "output");
const DATA_DIR = path.join(ROOT, "src", "data");

if (!fs.existsSync(OUTPUT_DIR)) {
  console.error(`❌ Missing ${OUTPUT_DIR}. Run the crawler first.`);
  process.exit(1);
}

fs.mkdirSync(DATA_DIR, { recursive: true });

const storyDirs = fs
  .readdirSync(OUTPUT_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory());

const stories = [];
let skipped = 0;

for (const dir of storyDirs) {
  const slug = dir.name;
  const metaPath = path.join(OUTPUT_DIR, slug, "metadata.json");

  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  } catch {
    skipped++;
    continue;
  }

  // num_chapters drives the chapter list in the app. Use the highest chapter
  // file present rather than the crawler's metadata, which can overcount.
  // Some stories have gaps in the middle, so use max, not count.
  const numChapters = fs
    .readdirSync(path.join(OUTPUT_DIR, slug))
    .map((f) => f.match(/^chapter_(\d+)\.txt$/))
    .filter(Boolean)
    .reduce((max, m) => Math.max(max, parseInt(m[1], 10)), 0);

  stories.push({ ...meta, num_chapters: numChapters, slug });
}

stories.sort((a, b) => a.title.localeCompare(b.title, "vi"));

fs.writeFileSync(
  path.join(DATA_DIR, "stories.json"),
  JSON.stringify(stories),
  "utf-8"
);

console.log(`✅ Done! ${stories.length} stories written, ${skipped} skipped`);
console.log(`   Output: src/data/stories.json`);
