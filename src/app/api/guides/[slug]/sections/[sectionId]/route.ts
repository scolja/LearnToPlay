import { NextRequest, NextResponse } from 'next/server';
import { getSectionById, updateSection } from '@/lib/repositories/section-repository';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; sectionId: string }> }
) {
  const { sectionId } = await params;

  try {
    const section = await getSectionById(sectionId);
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }
    return NextResponse.json(section);
  } catch (err) {
    console.error('Error fetching section:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; sectionId: string }> }
) {
  const { sectionId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await updateSection({
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
    console.error('Error updating section:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
