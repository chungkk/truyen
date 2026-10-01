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
  slug: string;
}

export interface ChapterInfo {
  number: number;
  title: string;
  fileName: string;
}

// ── Story helpers (sync, bundled JSON) ───────────────────────────────────────

const _stories: StoryMeta[] = storiesJson as StoryMeta[];

export function getAllStories(): StoryMeta[] {
  return _stories;
}

export function getStoryBySlug(slug: string): StoryMeta | null {
  return _stories.find((s) => s.slug === slug) ?? null;
}

// ── Chapter helpers ───────────────────────────────────────────────────────────

/**
 * Generate chapter list from num_chapters (sync, no I/O).
 * Actual chapter titles are shown when each chapter is opened.
 */
export function getChapterList(slug: string): ChapterInfo[] {
  const story = getStoryBySlug(slug);
  if (!story || story.num_chapters === 0) return [];

  return Array.from({ length: story.num_chapters }, (_, i) => {
    const num = i + 1;
    return {
      number: num,
      title: `Chương ${num}`,
      fileName: `chapter_${String(num).padStart(3, "0")}.txt`,
    };
  });
}

/**
 * Fetch chapter content from GitHub raw CDN.
 * Vercel caches fetch() responses, so subsequent reads are instant.
 */
export async function getChapterContent(
  slug: string,
  chapterNum: number
): Promise<{ title: string; content: string } | null> {
  const fileName = `chapter_${String(chapterNum).padStart(3, "0")}.txt`;
  const url = `${GITHUB_RAW}/${encodeURIComponent(slug)}/${fileName}`;

  try {
    const res = await fetch(url, {
      // Cache for 1 hour; chapters rarely change
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const raw = await res.text();
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

// ── Filter helpers (sync, bundled JSON) ──────────────────────────────────────

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
