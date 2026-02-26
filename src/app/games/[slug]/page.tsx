import { notFound } from 'next/navigation';
import { getGuideBySlug, getSectionsByGuideSlug, getGlossaryByGuideSlug } from '@/lib/repositories/section-repository';
import { getAllGuides } from '@/lib/repositories/section-repository';
import { renderAllSections } from '@/lib/section-renderer';
import { DesktopGuide } from '@/components/DesktopGuide';

export const revalidate = 3600; // ISR: revalidate every hour as fallback

export async function generateStaticParams() {
  const guides = await getAllGuides();
  return guides.map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: 'Game Not Found' };
  return {
    title: `${guide.title} — Learn to Play`,
    description: guide.subtitle,
  };
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [guide, sections, glossary] = await Promise.all([
    getGuideBySlug(slug),
    getSectionsByGuideSlug(slug),
    getGlossaryByGuideSlug(slug),
  ]);

  if (!guide || sections.length === 0) {
    notFound();
  }

  const renderedSections = renderAllSections(sections);

  return (
    <DesktopGuide
      guide={guide}
      sections={renderedSections}
      glossary={glossary}
    />
  );
}
