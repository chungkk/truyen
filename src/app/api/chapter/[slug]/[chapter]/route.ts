import { NextResponse } from 'next/server';
import { getChapterContent } from '@/lib/data';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; chapter: string }> }
) {
  const { slug, chapter } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const chapterNum = parseInt(chapter, 10);

  if (isNaN(chapterNum)) {
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
    },
  });
}
