import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { getGameContent } from '@/lib/content';
import { getCurrentVersion, saveVersion } from '@/lib/repositories/guide-repository';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Try DB first
    const version = await getCurrentVersion(slug);
    if (version) {
      return NextResponse.json({
        content: version.Content,
        frontmatter: JSON.parse(version.FrontmatterJson),
        versionNumber: version.VersionNumber,
      });
    }

    // Fallback to filesystem
    const guide = await getGameContent(slug);
    return NextResponse.json({
      content: guide.content,
      frontmatter: guide.frontmatter,
      versionNumber: 0,
    });
  } catch {
    return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { content, frontmatter, editSummary, publish } = await request.json();

  if (typeof content !== 'string' || !frontmatter) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    const currentVersion = await getCurrentVersion(slug);

    const version = await saveVersion({
      slug,
      content,
      frontmatterJson: JSON.stringify(frontmatter),
      editedByUserId: user.sub,
      editSummary,
      parentVersionId: currentVersion?.Id,
      publish: !!publish,
    });

    if (publish) {
      revalidatePath(`/games/${slug}`);
    }

    return NextResponse.json({
      id: version.Id,
      versionNumber: version.VersionNumber,
      published: version.IsPublished,
    });
  } catch (err) {
    console.error('Save version error:', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}
