import { NextResponse } from 'next/server';
import { getAllStories, searchStories } from '@/lib/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

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
    },
  });
}
