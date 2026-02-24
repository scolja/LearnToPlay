import { getGameContent } from '@/lib/content';
import { EditPage } from '@/components/editor/EditPage';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let guide;
  try {
    guide = await getGameContent(slug);
  } catch {
    notFound();
  }

  return (
    <EditPage
      slug={slug}
      initialContent={guide.content}
      initialFrontmatter={guide.frontmatter}
    />
  );
}
