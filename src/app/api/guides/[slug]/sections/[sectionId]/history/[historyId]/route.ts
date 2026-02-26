import { NextRequest, NextResponse } from 'next/server';
import { getSectionHistoryEntry } from '@/lib/repositories/section-repository';

type Params = { params: Promise<{ slug: string; sectionId: string; historyId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { historyId } = await params;

  try {
    const entry = await getSectionHistoryEntry(historyId);
    if (!entry) {
      return NextResponse.json({ error: 'History entry not found' }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch (err) {
    console.error('Error fetching history entry:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
