import { notFound } from 'next/navigation';
import { MobileEditorPage } from '@/components/mobile/MobileEditorPage';
import {
  getGuideForEditing,
  getSectionsWithDrafts,
  getGlossaryByGuideSlug,
} from '@/lib/repositories/section-repository';

export const dynamic = 'force-dynamic';

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SectionEditPage({ params }: EditPageProps) {
  const { slug } = await params;

  const [guide, sections, glossary] = await Promise.all([
    getGuideForEditing(slug),
    getSectionsWithDrafts(slug),
    getGlossaryByGuideSlug(slug),
  ]);

  if (!guide || sections.length === 0) {
    notFound();
  }

  return (
    <MobileEditorPage
      guide={guide}
      initialSections={sections}
      initialGlossary={glossary}
    />
  );
}

export async function generateMetadata({ params }: EditPageProps) {
  const { slug } = await params;
  const guide = await getGuideForEditing(slug);
  if (!guide) return { title: 'Guide Not Found' };
  return {
    title: `Edit: ${guide.title}`,
  };
}
