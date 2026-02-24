import Link from 'next/link';
import { listVersions } from '@/lib/repositories/guide-repository';
import { RevertButton } from './RevertButton';

export const dynamic = 'force-dynamic';

export default async function HistoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const versions = await listVersions(slug);

  return (
    <div className="history-page">
      <h1>Version History</h1>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <Link href={`/games/${slug}/`} style={{ color: 'var(--gold)' }}>Back to guide</Link>
        {' | '}
        <Link href={`/games/${slug}/edit/`} style={{ color: 'var(--gold)' }}>Edit guide</Link>
      </p>

      <ul className="version-list">
        {versions.map((v, i) => (
          <li key={v.Id} className="version-item">
            <span className="version-num">v{v.VersionNumber}</span>
            <div className="version-meta">
              <div className="version-summary">
                {v.EditSummary || 'No summary'}
              </div>
              <div className="version-details">
                {v.EditorName} &middot; {new Date(v.EditedAt).toLocaleString()}
              </div>
            </div>
            {v.IsCurrent && <span className="version-badge current">Current</span>}
            {!v.IsPublished && <span className="version-badge draft">Draft</span>}
            <div className="version-actions">
              <Link href={`/games/${slug}/history/${v.Id}`}>View</Link>
              {i < versions.length - 1 && (
                <Link href={`/games/${slug}/history/diff/?from=${versions[i + 1].Id}&to=${v.Id}`}>
                  Diff
                </Link>
              )}
              {!v.IsCurrent && <RevertButton slug={slug} versionId={v.Id} />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
