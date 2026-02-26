import { notFound } from 'next/navigation';
import { getGuideBySlug, getGlossaryByGuideSlug, getSectionsByGuideSlug } from '@/lib/repositories/section-repository';
import { GlossaryViewer } from '@/components/mobile/GlossaryViewer';

interface GlossaryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function GlossaryPage({ params }: GlossaryPageProps) {
  const { slug } = await params;

  const [guide, glossary, sections] = await Promise.all([
    getGuideBySlug(slug),
    getGlossaryByGuideSlug(slug),
    getSectionsByGuideSlug(slug),
  ]);

  if (!guide) {
    notFound();
  }

  // Build a map of sectionId → { sortOrder, title, index } for navigation links
  const sectionMap: Record<string, { sortOrder: number; title: string | null; index: number }> = {};
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    sectionMap[s.id] = { sortOrder: s.sortOrder, title: s.title, index: i };
  }

  return (
    <main>
      <GlossaryViewer
        guide={guide}
        entries={glossary}
        sectionMap={sectionMap}
      />
    </main>
  );
}

export async function generateMetadata({ params }: GlossaryPageProps) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: 'Guide Not Found' };
  return {
    title: `Glossary: ${guide.title}`,
    description: `Quick reference glossary for ${guide.title}`,
  };
}
