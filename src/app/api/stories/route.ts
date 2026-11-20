import { NextResponse } from 'next/server';
import { getAllStories, searchStories } from '@/lib/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const rawLimit = parseInt(searchParams.get('limit') || '50', 10);
  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const limit = Number.isNaN(rawLimit) || rawLimit < 1 ? 50 : Math.min(rawLimit, 100);

  let stories = getAllStories();

  if (q) {
    stories = searchStories(q, stories);
  }

  if (genre) {
    stories = stories.filter(s => s.genres.includes(genre));
  }

  const total = stories.length;
  const offset = (page - 1) * limit;
  const paged = stories.slice(offset, offset + limit);

  return NextResponse.json({
    stories: paged,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
