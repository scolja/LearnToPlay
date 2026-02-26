import { NextRequest, NextResponse } from 'next/server';
import { getGuideForEditing, reorderSections } from '@/lib/repositories/section-repository';
import { getCurrentUser } from '@/lib/auth';

type Params = { params: Promise<{ slug: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { slug } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const guide = await getGuideForEditing(slug);
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    const body = await request.json();
    if (!Array.isArray(body.orderedIds) || body.orderedIds.length === 0) {
      return NextResponse.json({ error: 'orderedIds array is required' }, { status: 400 });
    }

    await reorderSections(guide.id, body.orderedIds);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error reordering sections:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
