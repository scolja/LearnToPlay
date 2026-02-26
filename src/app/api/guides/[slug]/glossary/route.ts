import { NextRequest, NextResponse } from 'next/server';
import { getGlossaryByGuideSlug } from '@/lib/repositories/section-repository';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const entries = await getGlossaryByGuideSlug(slug);
    return NextResponse.json(entries);
  } catch (err) {
    console.error('Error fetching glossary:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
