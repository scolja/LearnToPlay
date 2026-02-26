import { NextRequest, NextResponse } from 'next/server';
import {
  getGlossaryByGuideSlug,
  getGuideForEditing,
  createGlossaryEntry,
  updateGlossaryEntry,
  deleteGlossaryEntry,
} from '@/lib/repositories/section-repository';
import { getCurrentUser } from '@/lib/auth';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params;

  try {
    const entries = await getGlossaryByGuideSlug(slug);
    return NextResponse.json(entries);
  } catch (err) {
    console.error('Error fetching glossary:', err);
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
    const entry = await createGlossaryEntry({
      guideId: guide.id,
      sectionId: body.sectionId,
      term: body.term,
      definition: body.definition,
      searchTerms: body.searchTerms,
      groupName: body.groupName,
      sortOrder: body.sortOrder,
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    console.error('Error creating glossary entry:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { slug } = await params;
  void slug;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }
    await updateGlossaryEntry({
      id: body.id,
      sectionId: body.sectionId,
      term: body.term,
      definition: body.definition,
      searchTerms: body.searchTerms,
      groupName: body.groupName,
      sortOrder: body.sortOrder,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error updating glossary entry:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { slug } = await params;
  void slug;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
    }
    await deleteGlossaryEntry(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error deleting glossary entry:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
