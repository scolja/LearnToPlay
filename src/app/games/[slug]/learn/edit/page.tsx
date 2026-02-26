import { notFound } from 'next/navigation';
import { getGuideBySlug, getSectionsByGuideSlug } from '@/lib/repositories/section-repository';
import { SectionEditor } from '@/components/mobile/SectionEditor';

export const dynamic = 'force-dynamic';

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SectionEditPage({ params }: EditPageProps) {
  const { slug } = await params;

  const [guide, sections] = await Promise.all([
    getGuideBySlug(slug),
    getSectionsByGuideSlug(slug),
  ]);

  if (!guide || sections.length === 0) {
    notFound();
  }

  return <SectionEditor guide={guide} sections={sections} />;
}

export async function generateMetadata({ params }: EditPageProps) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: 'Guide Not Found' };
  return {
    title: `Edit: ${guide.title}`,
  };
}
