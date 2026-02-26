import { NextRequest, NextResponse } from 'next/server';
import { revertSectionToVersion } from '@/lib/repositories/section-repository';
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
    if (!body.historyId) {
      return NextResponse.json({ error: 'historyId is required' }, { status: 400 });
    }
    await revertSectionToVersion({
      sectionId,
      historyId: body.historyId,
      userId: user.sub,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error reverting section:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
