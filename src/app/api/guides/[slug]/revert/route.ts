import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { revertToVersion } from '@/lib/repositories/guide-repository';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { versionId } = await request.json();
  if (!versionId) {
    return NextResponse.json({ error: 'Missing versionId' }, { status: 400 });
  }

  try {
    const newVersion = await revertToVersion(slug, versionId, user.sub);
    revalidatePath(`/games/${slug}`);

    return NextResponse.json({
      id: newVersion.Id,
      versionNumber: newVersion.VersionNumber,
    });
  } catch (err) {
    console.error('Revert error:', err);
    return NextResponse.json({ error: 'Revert failed' }, { status: 500 });
  }
}
