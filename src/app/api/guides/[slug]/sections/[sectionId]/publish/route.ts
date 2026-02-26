import { NextRequest, NextResponse } from 'next/server';
import { publishSection } from '@/lib/repositories/section-repository';
import { getCurrentUser } from '@/lib/auth';

type Params = { params: Promise<{ slug: string; sectionId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { sectionId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await publishSection({
      sectionId,
      title: body.title,
      content: body.content,
      notes: body.notes,
      displayData: body.displayData,
      editedByUserId: user.sub,
      editSummary: body.editSummary,
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('Error publishing section:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
