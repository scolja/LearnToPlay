import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllGames, getGameBySlug } from '@/lib/content';
import { mdxComponents } from '@/components';
import { Hero } from '@/components/Hero';
import { QuickReference } from '@/components/QuickReference';
import { Footer } from '@/components/Footer';

export function generateStaticParams() {
  return getAllGames().map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    try {
      const { frontmatter } = getGameBySlug(slug);
      return {
        title: `${frontmatter.title} — Learn to Play`,
        description: frontmatter.subtitle,
      };
    } catch {
      return { title: 'Game Not Found' };
    }
  });
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let guide;
  try {
    guide = getGameBySlug(slug);
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
