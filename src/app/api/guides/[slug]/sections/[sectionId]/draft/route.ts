import { NextRequest, NextResponse } from 'next/server';
import { saveDraft, discardDraft } from '@/lib/repositories/section-repository';
import { getCurrentUser } from '@/lib/auth';

type Params = { params: Promise<{ slug: string; sectionId: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { sectionId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    await saveDraft({
      sectionId,
      title: body.title,
      content: body.content,
      notes: body.notes,
      displayData: body.displayData,
      editedByUserId: user.sub,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error saving draft:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { sectionId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await discardDraft(sectionId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error discarding draft:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
