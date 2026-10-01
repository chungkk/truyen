import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

export interface StoryMeta {
  slug: string;
  title: string;
  author: string;
  genres: string[];
  categories: string[];
  status: string;
  num_chapters: number;
  chapters?: ChapterInfo[]; // embedded in stories_index.json
}

export interface ChapterInfo {
  number: number;
  title: string;
}

export interface ReaderSettings {
  fontSize: number;
  theme: 'dark' | 'light' | 'sepia';
}

const BOOKMARKS_KEY = '@truyen_bookmarks';
const HISTORY_KEY = '@truyen_history';
const READER_SETTINGS_KEY = '@truyen_reader_settings';

// ─── Stories Index (static require - OK for Metro) ──────────────────────────

let storiesCache: StoryMeta[] | null = null;
// This single static require is fine - Metro knows the exact path at build time
const STORIES_DATA = require('../data/stories_index.json') as StoryMeta[];

export async function loadStoriesIndex(): Promise<StoryMeta[]> {
  if (storiesCache) return storiesCache;
  storiesCache = STORIES_DATA;
  return storiesCache;
}

// ─── Chapter List ────────────────────────────────────────────────────────────

// Chapters are now embedded inside stories_index.json - no dynamic require needed
export async function loadChapterList(slug: string): Promise<ChapterInfo[]> {
  const stories = await loadStoriesIndex();
  const story = stories.find(s => s.slug === slug);
  if (story?.chapters && story.chapters.length > 0) {
    return story.chapters;
  }

  // Fallback: generate chapter numbers from num_chapters
  if (story && story.num_chapters > 0) {
    return Array.from({ length: story.num_chapters }, (_, i) => ({
      number: i + 1,
      title: `Chương ${i + 1}`,
    }));
  }

  return [];
}

// ─── Chapter Content ─────────────────────────────────────────────────────────

export async function loadChapterContent(
  slug: string,
  chapterNum: number,
): Promise<{ title: string; content: string } | null> {
  const padded = String(chapterNum).padStart(3, '0');

  // Option 1: Read pre-exported .txt from app bundle via RNFS
  try {
    const filePath = `${RNFS.MainBundlePath}/chapters/${slug}/chapter_${padded}.txt`;
    const raw = await RNFS.readFile(filePath, 'utf8');
    const lines = raw.split('\n');
    const title = lines[0].trim();
    const contentStart = lines.findIndex(
      (l: string, i: number) => i > 0 && !l.startsWith('=') && l.trim() !== '',
    );
    const content = contentStart >= 0 ? lines.slice(contentStart).join('\n').trim() : '';
    return { title, content };
  } catch {
    // fall through
  }

  // Option 2: Fetch from Next.js API (dev mode - web server must be running)
  try {
    const response = await fetch(
      `http://localhost:3000/api/chapter/${encodeURIComponent(slug)}/${chapterNum}`,
    );
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // no server available
  }

  return null;
}

// ─── Bookmarks ─────────────────────────────────────────────────────────────

export interface Bookmark {
  slug: string;
  title: string;
  chapterNum: number;
  chapterTitle: string;
  savedAt: number;
}

export async function getBookmarks(): Promise<Bookmark[]> {
  try {
    const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveBookmark(bookmark: Bookmark): Promise<void> {
  const existing = await getBookmarks();
  const filtered = existing.filter(
    b => !(b.slug === bookmark.slug && b.chapterNum === bookmark.chapterNum),
  );
  await AsyncStorage.setItem(
    BOOKMARKS_KEY,
    JSON.stringify([bookmark, ...filtered].slice(0, 100)),
  );
}

export async function removeBookmark(slug: string, chapterNum: number): Promise<void> {
  const existing = await getBookmarks();
  const filtered = existing.filter(
    b => !(b.slug === slug && b.chapterNum === chapterNum),
  );
  await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
}

export async function isBookmarked(slug: string, chapterNum: number): Promise<boolean> {
  const bookmarks = await getBookmarks();
  return bookmarks.some(b => b.slug === slug && b.chapterNum === chapterNum);
}

// ─── Reading History ────────────────────────────────────────────────────────

export interface HistoryEntry {
  slug: string;
  title: string;
  lastChapter: number;
  lastChapterTitle: string;
  readAt: number;
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function updateHistory(entry: HistoryEntry): Promise<void> {
  const existing = await getHistory();
  const filtered = existing.filter(h => h.slug !== entry.slug);
  await AsyncStorage.setItem(
    HISTORY_KEY,
    JSON.stringify([entry, ...filtered].slice(0, 50)),
  );
}

// ─── Reader Settings ────────────────────────────────────────────────────────

export async function getReaderSettings(): Promise<ReaderSettings> {
  try {
    const raw = await AsyncStorage.getItem(READER_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { fontSize: 17, theme: 'dark' };
  } catch {
    return { fontSize: 17, theme: 'dark' };
  }
}

export async function saveReaderSettings(settings: ReaderSettings): Promise<void> {
  await AsyncStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(settings));
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

export function useStoriesIndex() {
  const [stories, setStories] = useState<StoryMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoriesIndex().then(data => {
      setStories(data);
      setLoading(false);
    });
  }, []);

  return { stories, loading };
}

export function useFilteredStories(
  stories: StoryMeta[],
  query: string,
  genre: string,
  category: string,
) {
  return useMemo(() => {
    let result = stories;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.author.toLowerCase().includes(q),
      );
    }
    if (genre) {
      result = result.filter(s => s.genres.includes(genre));
    }
    if (category) {
      result = result.filter(s => s.categories.includes(category));
    }
    return result;
  }, [stories, query, genre, category]);
}
