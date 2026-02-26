import { NextRequest, NextResponse } from 'next/server';
import { getGuideForEditing, updateGuideMetadata } from '@/lib/repositories/section-repository';
import { getCurrentUser } from '@/lib/auth';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    const guide = await getGuideForEditing(slug);
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }
    return NextResponse.json(guide);
  } catch (err) {
    console.error('Error fetching guide metadata:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    await updateGuideMetadata({
      guideId: guide.id,
      ...body,
      updatedByUserId: user.sub,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error updating guide metadata:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
