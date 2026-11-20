import { NextResponse } from 'next/server';
import { getChapterContent } from '@/lib/data';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; chapter: string }> }
) {
  const { slug, chapter } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const chapterNum = parseInt(chapter, 10);

  if (!/^\d+$/.test(chapter) || Number.isNaN(chapterNum) || chapterNum < 1) {
    return NextResponse.json({ error: 'Invalid chapter number' }, { status: 400 });
  }

  const data = await getChapterContent(decodedSlug, chapterNum);
  if (!data) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
  }

  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
