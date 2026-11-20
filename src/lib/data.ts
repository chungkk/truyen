/**
 * data.ts – Data layer (Vercel, zero-database approach)
 *
 * - Story metadata  → statically imported from stories.json (bundled, ~1.3MB)
 * - Chapter list    → generated from num_chapters field in stories.json
 * - Chapter content → fetched from GitHub raw CDN at request time
 *   (files are committed to git under output/{slug}/chapter_XXX.txt)
 *
 * GitHub raw CDN is cached by Fastly, no API rate limits for raw content.
 */

import { cache } from "react";
import storiesJson from "@/data/stories.json";

// ── Config ────────────────────────────────────────────────────────────────────

// GitHub raw base URL — files in output/ are committed to git
const GITHUB_RAW =
  "https://raw.githubusercontent.com/chungkk/truyen/main/output";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StoryMeta {
  url: string;
  title: string;
  author: string;
  genres: string[];
  categories: string[];
  status: string;
  num_chapters: number;
  missing_chapters?: number[];
  slug: string;
}

export interface ChapterInfo {
  number: number;
  title: string;
  fileName: string;
}

// ── Story helpers (sync, bundled JSON) ───────────────────────────────────────

const _stories: StoryMeta[] = storiesJson as StoryMeta[];
const _storiesBySlug = new Map<string, StoryMeta>(
  _stories.map((s) => [s.slug, s])
);

export function getAllStories(): StoryMeta[] {
  return _stories;
}

export function getStoryBySlug(slug: string): StoryMeta | null {
  return _storiesBySlug.get(slug) ?? null;
}

// ── Search ────────────────────────────────────────────────────────────────────

/**
 * Lowercase and strip Vietnamese diacritics so "co giao" matches "Cô giáo".
 * NFD splits base letters from combining marks; đ/Đ have no decomposition
 * so they are mapped by hand.
 */
export function normalizeVi(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

// Precomputed once at module load; stories.json is static.
const _searchIndex = new Map<string, string>(
  _stories.map((s) => [s.slug, normalizeVi(`${s.title} ${s.author}`)])
);

/**
 * Filter stories by title/author. Accent-insensitive, so both "cô giáo"
 * and "co giao" match. All whitespace-separated words must appear.
 */
export function searchStories(query: string, from: StoryMeta[] = _stories): StoryMeta[] {
  const words = normalizeVi(query).split(" ").filter(Boolean);
  if (words.length === 0) return from;
  return from.filter((s) => {
    const hay = _searchIndex.get(s.slug) ?? "";
    return words.every((w) => hay.includes(w));
  });
}

// ── Chapter helpers ───────────────────────────────────────────────────────────

/**
 * Generate chapter list from num_chapters (sync, no I/O).
 * Actual chapter titles are shown when each chapter is opened.
 */
export function getChapterList(slug: string): ChapterInfo[] {
  const story = getStoryBySlug(slug);
  if (!story || story.num_chapters === 0) return [];

  const missing = story.missing_chapters
    ? new Set(story.missing_chapters)
    : null;

  const chapters: ChapterInfo[] = [];
  for (let num = 1; num <= story.num_chapters; num++) {
    if (missing?.has(num)) continue;
    chapters.push({
      number: num,
      title: `Chương ${num}`,
      fileName: `chapter_${String(num).padStart(3, "0")}.txt`,
    });
  }
  return chapters;
}

export function getFirstChapterNumber(story: StoryMeta): number {
  if (story.num_chapters === 0) return 1;
  if (!story.missing_chapters?.length) return 1;
  const missing = new Set(story.missing_chapters);
  for (let num = 1; num <= story.num_chapters; num++) {
    if (!missing.has(num)) return num;
  }
  return 1;
}

/**
 * Fetch chapter content from GitHub raw CDN.
 * Deduplicated per request via React cache() (e.g. generateMetadata + page),
 * and cached across requests by Next.js fetch cache (1 hour).
 */
export const getChapterContent = cache(
  async (
    slug: string,
    chapterNum: number
  ): Promise<{ title: string; content: string } | null> => {
    const fileName = `chapter_${String(chapterNum).padStart(3, "0")}.txt`;
    const url = `${GITHUB_RAW}/${encodeURIComponent(slug)}/${fileName}`;

    try {
      const res = await fetch(url, {
        // Cache for 1 hour; chapters rarely change
        next: { revalidate: 3600 },
      });

      if (!res.ok) return null;

      const raw = (await res.text()).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const lines = raw.split("\n");
      const title = lines[0]?.trim() || `Chương ${chapterNum}`;
      const contentStart = lines.findIndex(
        (l, i) => i > 0 && !l.startsWith("=") && l.trim() !== ""
      );
      const content =
        contentStart >= 0 ? lines.slice(contentStart).join("\n") : "";

      return { title, content };
    } catch {
      return null;
    }
  }
);

// ── Filter helpers (precomputed once at module load) ─────────────────────────

const _allGenres: string[] = (() => {
  const set = new Set<string>();
  for (const s of _stories) for (const g of s.genres) set.add(g);
  return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
})();

const _allCategories: { name: string; count: number }[] = (() => {
  const map = new Map<string, number>();
  for (const s of _stories) {
    for (const c of s.categories) map.set(c, (map.get(c) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
})();

const _genresWithCount: { name: string; count: number }[] = (() => {
  const map = new Map<string, number>();
  for (const s of _stories) {
    for (const g of s.genres) map.set(g, (map.get(g) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
})();

const _allAuthors: string[] = (() => {
  const set = new Set<string>();
  for (const s of _stories) if (s.author) set.add(s.author);
  return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
})();

const _authorsWithCount: { name: string; count: number }[] = (() => {
  const map = new Map<string, number>();
  for (const s of _stories) {
    if (s.author) map.set(s.author, (map.get(s.author) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
})();

export function getAllGenres(): string[] {
  return _allGenres;
}

export function getAllCategories(): { name: string; count: number }[] {
  return _allCategories;
}

export function getGenresWithCount(): { name: string; count: number }[] {
  return _genresWithCount;
}

export function getAllAuthors(): string[] {
  return _allAuthors;
}

export function getAuthorsWithCount(): { name: string; count: number }[] {
  return _authorsWithCount;
}
