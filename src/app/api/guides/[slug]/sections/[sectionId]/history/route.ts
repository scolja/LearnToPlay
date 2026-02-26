import { NextRequest, NextResponse } from 'next/server';
import { getSectionHistory } from '@/lib/repositories/section-repository';

type Params = { params: Promise<{ slug: string; sectionId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { sectionId } = await params;

  try {
    const history = await getSectionHistory(sectionId);
    return NextResponse.json(history);
  } catch (err) {
    console.error('Error fetching section history:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
