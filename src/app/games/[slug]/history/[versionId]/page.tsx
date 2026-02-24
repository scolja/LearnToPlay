import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components';
import { getVersionById } from '@/lib/repositories/guide-repository';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function VersionViewPage({
  params,
}: {
  params: Promise<{ slug: string; versionId: string }>;
}) {
  const { slug, versionId } = await params;

  const version = await getVersionById(versionId);
  if (!version || version.Slug !== slug) {
    notFound();
  }

  const frontmatter = JSON.parse(version.FrontmatterJson);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
        <Link href={`/games/${slug}/history/`} style={{ color: 'var(--gold)' }}>
          Back to history
        </Link>
        <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>|</span>
        <span style={{ color: 'var(--text-muted)' }}>
          Version {version.VersionNumber} &middot; {new Date(version.EditedAt).toLocaleString()}
          {version.EditSummary && ` &middot; ${version.EditSummary}`}
        </span>
      </div>
      <div className="page-wrap">
        <MDXRemote source={version.Content} components={mdxComponents} />
      </div>
    </div>
  );
}
