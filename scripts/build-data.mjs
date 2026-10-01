#!/usr/bin/env node
/**
 * build-data.mjs
 * Converts the output/ folder (txt + metadata.json files) into static JSON
 * files inside web/src/data/ so the Next.js app works on Vercel (no fs access needed).
 *
 * Generated structure:
 *   web/src/data/stories.json            – array of StoryMeta (with slug)
 *   web/src/data/chapters/<slug>.json    – { chapters: ChapterInfo[], content: { [num]: {title, content} } }
 *
 * Usage:  node scripts/build-data.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "output");
const DATA_DIR = path.join(ROOT, "src", "data");
const CHAPTERS_DIR = path.join(DATA_DIR, "chapters");

// ── helpers ─────────────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseChapterFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const lines = raw.split("\n");
  const title = lines[0]?.trim() || "";
  const contentStart = lines.findIndex(
    (l, i) => i > 0 && !l.startsWith("=") && l.trim() !== ""
  );
  const content = contentStart >= 0 ? lines.slice(contentStart).join("\n") : "";
  return { title, content };
}

// ── main ────────────────────────────────────────────────────────────────────

ensureDir(DATA_DIR);
ensureDir(CHAPTERS_DIR);

const storyDirs = fs
  .readdirSync(OUTPUT_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory());

const stories = [];
let processed = 0;
let skipped = 0;

for (const dir of storyDirs) {
  const slug = dir.name;
  const storyDir = path.join(OUTPUT_DIR, slug);
  const metaPath = path.join(storyDir, "metadata.json");

  if (!fs.existsSync(metaPath)) {
    skipped++;
    continue;
  }

  // ── parse metadata ──
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  } catch {
    skipped++;
    continue;
  }

  stories.push({ ...meta, slug });

  // ── parse chapters ──
  const chapterFiles = fs
    .readdirSync(storyDir)
    .filter((f) => /^chapter_\d+\.txt$/.test(f))
    .sort();

  const chapterList = [];
  const chapterContent = {};

  for (const file of chapterFiles) {
    const match = file.match(/^chapter_(\d+)\.txt$/);
    if (!match) continue;
    const num = parseInt(match[1], 10);
    const { title, content } = parseChapterFile(path.join(storyDir, file));

    chapterList.push({ number: num, title: title || `Chương ${num}`, fileName: file });
    chapterContent[num] = { title: title || `Chương ${num}`, content };
  }

  // Write per-story chapter file
  const chapterData = { chapters: chapterList, content: chapterContent };
  fs.writeFileSync(
    path.join(CHAPTERS_DIR, `${slug}.json`),
    JSON.stringify(chapterData),
    "utf-8"
  );

  processed++;
  if (processed % 50 === 0) {
    process.stdout.write(`  → ${processed}/${storyDirs.length} stories done...\n`);
  }
}

// Sort stories alphabetically (Vietnamese)
stories.sort((a, b) => a.title.localeCompare(b.title, "vi"));

fs.writeFileSync(
  path.join(DATA_DIR, "stories.json"),
  JSON.stringify(stories),
  "utf-8"
);

console.log(`\n✅ Done!`);
console.log(`   Stories: ${processed} processed, ${skipped} skipped`);
console.log(`   Output:  src/data/stories.json`);
console.log(`            src/data/chapters/<slug>.json`);
