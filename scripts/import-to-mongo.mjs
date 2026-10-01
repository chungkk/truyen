#!/usr/bin/env node
/**
 * import-to-mongo.mjs
 * Reads all stories and chapter content from output/ and imports to MongoDB Atlas.
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node scripts/import-to-mongo.mjs
 *
 * Collections created:
 *   - chapters: { slug, number, title, content }
 *
 * Note: Story metadata is kept in src/data/stories.json (static import, fast).
 *       Only chapter content goes to MongoDB (too large for serverless bundles).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "output");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI environment variable.");
  console.error("   Usage: MONGODB_URI=\"mongodb+srv://...\" node scripts/import-to-mongo.mjs");
  process.exit(1);
}

// ── helpers ─────────────────────────────────────────────────────────────────

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

const client = new MongoClient(MONGODB_URI);

try {
  await client.connect();
  console.log("✅ Connected to MongoDB Atlas");

  const db = client.db("truyen");
  const chaptersCol = db.collection("chapters");

  // Create indexes for fast lookup
  await chaptersCol.createIndex({ slug: 1, number: 1 }, { unique: true });
  await chaptersCol.createIndex({ slug: 1 });
  console.log("✅ Indexes created");

  const storyDirs = fs
    .readdirSync(OUTPUT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  let totalChapters = 0;
  let processedStories = 0;

  for (const dir of storyDirs) {
    const slug = dir.name;
    const storyDir = path.join(OUTPUT_DIR, slug);

    const chapterFiles = fs
      .readdirSync(storyDir)
      .filter((f) => /^chapter_\d+\.txt$/.test(f));

    if (chapterFiles.length === 0) continue;

    const ops = [];
    for (const file of chapterFiles) {
      const match = file.match(/^chapter_(\d+)\.txt$/);
      if (!match) continue;
      const num = parseInt(match[1], 10);
      const { title, content } = parseChapterFile(path.join(storyDir, file));

      ops.push({
        updateOne: {
          filter: { slug, number: num },
          update: { $set: { slug, number: num, title, content } },
          upsert: true,
        },
      });
    }

    if (ops.length > 0) {
      await chaptersCol.bulkWrite(ops, { ordered: false });
      totalChapters += ops.length;
    }

    processedStories++;
    if (processedStories % 100 === 0) {
      process.stdout.write(`  → ${processedStories}/${storyDirs.length} stories, ${totalChapters} chapters imported...\n`);
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Stories: ${processedStories}`);
  console.log(`   Chapters: ${totalChapters}`);

} finally {
  await client.close();
}
