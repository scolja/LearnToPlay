import { notFound } from 'next/navigation';
import { getGuideBySlug, getSectionsByGuideSlug } from '@/lib/repositories/section-repository';
import { renderAllSections } from '@/lib/section-renderer';
import { CardViewer } from '@/components/mobile/CardViewer';

interface LearnPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { slug } = await params;

  const [guide, sections] = await Promise.all([
    getGuideBySlug(slug),
    getSectionsByGuideSlug(slug),
  ]);

  if (!guide || sections.length === 0) {
    notFound();
  }

  const renderedSections = renderAllSections(sections);

  return (
    <main>
      <CardViewer
        guide={guide}
        sections={renderedSections}
      />
    </main>
  );
}

export async function generateMetadata({ params }: LearnPageProps) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: 'Guide Not Found' };
  return {
    title: `Learn: ${guide.title}`,
    description: guide.subtitle || `Learn to play ${guide.title}`,
  };
}
