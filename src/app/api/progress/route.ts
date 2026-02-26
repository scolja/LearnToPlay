import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllProgressByUser, getProgressByUserAndSlug, upsertProgress } from '@/lib/repositories/progress-repository';
import { getPool, sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const slug = request.nextUrl.searchParams.get('slug');

    if (slug) {
      // Single guide progress
      const progress = await getProgressByUserAndSlug(user.sub, slug);
      return NextResponse.json({
        progress: progress
          ? {
              guideId: progress.GuideId,
              currentSectionIndex: progress.CurrentSectionIndex,
              totalSections: progress.TotalSections,
              completedAt: progress.CompletedAt?.toISOString() ?? null,
            }
          : null,
      });
    }

    // All progress for homepage
    const progress = await getAllProgressByUser(user.sub);
    return NextResponse.json({ progress });
  } catch (err) {
    console.error('Error fetching progress:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, currentSectionIndex, totalSections } = body;

    if (!slug || currentSectionIndex === undefined || totalSections === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Resolve slug → guideId
    const pool = await getPool();
    const guideResult = await pool.request()
      .input('slug', sql.NVarChar, slug)
      .query<{ Id: string }>('SELECT Id FROM ltp.Guides WHERE Slug = @slug AND IsDraft = 0');

    const guide = guideResult.recordset[0];
    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    const updated = await upsertProgress({
      userId: user.sub,
      guideId: guide.Id,
      currentSectionIndex,
      totalSections,
    });

    return NextResponse.json({
      progress: {
        guideId: updated.GuideId,
        currentSectionIndex: updated.CurrentSectionIndex,
        totalSections: updated.TotalSections,
        completedAt: updated.CompletedAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    console.error('Error upserting progress:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
