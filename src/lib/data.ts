/**
 * data.ts – Data layer (Vercel + MongoDB Atlas)
 *
 * - Story metadata  → statically imported from stories.json (bundled, fast)
 * - Chapter data    → fetched from MongoDB Atlas at request time
 *
 * Setup:
 *   1. Run: MONGODB_URI="..." node scripts/import-to-mongo.mjs
 *   2. Set MONGODB_URI env var in Vercel project settings
 */

import storiesJson from "@/data/stories.json";
import { getDb } from "@/lib/db";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StoryMeta {
  url: string;
  title: string;
  author: string;
  genres: string[];
  categories: string[];
  status: string;
  num_chapters: number;
  slug: string;
}

export interface ChapterInfo {
  number: number;
  title: string;
  fileName: string;
}

// ── Story helpers (sync, uses bundled JSON) ───────────────────────────────────

const _stories: StoryMeta[] = storiesJson as StoryMeta[];

export function getAllStories(): StoryMeta[] {
  return _stories;
}

export function getStoryBySlug(slug: string): StoryMeta | null {
  return _stories.find((s) => s.slug === slug) ?? null;
}

// ── Chapter helpers (async, uses MongoDB) ─────────────────────────────────────

export async function getChapterList(slug: string): Promise<ChapterInfo[]> {
  const db = await getDb();
  const docs = await db
    .collection("chapters")
    .find({ slug }, { projection: { number: 1, title: 1, _id: 0 } })
    .sort({ number: 1 })
    .toArray();

  return docs.map((d) => ({
    number: d.number as number,
    title: (d.title as string) || `Chương ${d.number}`,
    fileName: `chapter_${String(d.number).padStart(3, "0")}.txt`,
  }));
}

export async function getChapterContent(
  slug: string,
  chapterNum: number
): Promise<{ title: string; content: string } | null> {
  const db = await getDb();
  const doc = await db
    .collection("chapters")
    .findOne(
      { slug, number: chapterNum },
      { projection: { title: 1, content: 1, _id: 0 } }
    );

  if (!doc) return null;
  return {
    title: (doc.title as string) || `Chương ${chapterNum}`,
    content: (doc.content as string) || "",
  };
}

// ── Filter helpers (sync, uses bundled JSON) ──────────────────────────────────

export function getAllGenres(): string[] {
  const set = new Set<string>();
  for (const s of _stories) for (const g of s.genres) set.add(g);
  return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
}

export function getAllCategories(): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const s of _stories) {
    for (const c of s.categories) map.set(c, (map.get(c) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getGenresWithCount(): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const s of _stories) {
    for (const g of s.genres) map.set(g, (map.get(g) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAllAuthors(): string[] {
  const set = new Set<string>();
  for (const s of _stories) if (s.author) set.add(s.author);
  return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
}

export function getAuthorsWithCount(): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const s of _stories) {
    if (s.author) map.set(s.author, (map.get(s.author) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
