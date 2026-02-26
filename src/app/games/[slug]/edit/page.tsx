import { notFound } from 'next/navigation';
import { DesktopEditorPage } from '@/components/editor/DesktopEditorPage';
import {
  getGuideForEditing,
  getSectionsWithDrafts,
  getGlossaryByGuideSlug,
} from '@/lib/repositories/section-repository';

export const dynamic = 'force-dynamic';

export default async function EditGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [guide, sections, glossary] = await Promise.all([
    getGuideForEditing(slug),
    getSectionsWithDrafts(slug),
    getGlossaryByGuideSlug(slug),
  ]);

  if (!guide) notFound();

  return (
    <DesktopEditorPage
      guide={guide}
      initialSections={sections}
      initialGlossary={glossary}
    />
  );
}
