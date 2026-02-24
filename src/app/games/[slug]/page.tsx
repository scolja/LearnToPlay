import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllGameSlugs, getGameContent } from '@/lib/content';
import { mdxComponents } from '@/components';
import { Hero } from '@/components/Hero';
import { QuickReference } from '@/components/QuickReference';
import { Footer } from '@/components/Footer';

export const revalidate = 3600; // ISR: revalidate every hour as fallback

export async function generateStaticParams() {
  const slugs = await getAllGameSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const { frontmatter } = await getGameContent(slug);
    return {
      title: `${frontmatter.title} — Learn to Play`,
      description: frontmatter.subtitle,
    };
  } catch {
    return { title: 'Game Not Found' };
  }
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let guide;
  try {
    guide = await getGameContent(slug);
  } catch {
    notFound();
  }

  const { frontmatter, content } = guide;

  return (
    <>
      <Hero {...frontmatter} />
      <div className="page-wrap">
        <MDXRemote source={content} components={mdxComponents} />
      </div>
      {frontmatter.glossary && frontmatter.glossary.length > 0 && (
        <QuickReference entries={frontmatter.glossary} />
      )}
      <Footer
        title={frontmatter.title}
        year={frontmatter.year}
        designer={frontmatter.designer}
        artist={frontmatter.artist}
        publisher={frontmatter.publisher}
        publisherUrl={frontmatter.publisherUrl}
        bggUrl={frontmatter.bggUrl}
      />
    </>
  );
}
