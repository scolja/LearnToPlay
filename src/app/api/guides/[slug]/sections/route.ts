import { NextRequest, NextResponse } from 'next/server';
import { getSectionsByGuideSlug } from '@/lib/repositories/section-repository';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const sections = await getSectionsByGuideSlug(slug);
    if (sections.length === 0) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }
    return NextResponse.json(sections);
  } catch (err) {
    console.error('Error fetching sections:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
