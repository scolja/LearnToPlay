import { NextResponse } from 'next/server';
import { getVersionById } from '@/lib/repositories/guide-repository';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; versionId: string }> }
) {
  const { slug, versionId } = await params;

  try {
    const version = await getVersionById(versionId);
    if (!version || version.Slug !== slug) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    return NextResponse.json({
      Content: version.Content,
      VersionNumber: version.VersionNumber,
      EditedAt: version.EditedAt,
      EditSummary: version.EditSummary,
    });
  } catch (err) {
    console.error('Get version error:', err);
    return NextResponse.json({ error: 'Failed to get version' }, { status: 500 });
  }
}
