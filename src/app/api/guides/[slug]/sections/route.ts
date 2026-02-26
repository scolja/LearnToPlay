import { NextRequest, NextResponse } from 'next/server';
import {
  getSectionsByGuideSlug,
  getGuideForEditing,
  createSection,
} from '@/lib/repositories/section-repository';
import { getCurrentUser } from '@/lib/auth';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
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

export async function POST(request: NextRequest, { params }: Params) {
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
    const section = await createSection({
      guideId: guide.id,
      title: body.title,
      content: body.content,
      editedByUserId: user.sub,
    });
    return NextResponse.json(section, { status: 201 });
  } catch (err) {
    console.error('Error creating section:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
