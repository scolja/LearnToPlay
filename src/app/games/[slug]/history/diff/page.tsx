'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { DiffView } from '@/components/editor/DiffView';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

interface VersionData {
  Content: string;
  VersionNumber: number;
  EditedAt: string;
  EditSummary: string | null;
}

function DiffContent() {
  const searchParams = useSearchParams();
  const fromId = searchParams.get('from');
  const toId = searchParams.get('to');
  const slug = typeof window !== 'undefined' ? window.location.pathname.split('/')[2] : '';

  const [fromVersion, setFromVersion] = useState<VersionData | null>(null);
  const [toVersion, setToVersion] = useState<VersionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fromId || !toId) return;

    async function fetchVersions() {
      try {
        const [fromRes, toRes] = await Promise.all([
          apiFetch(`/api/guides/${slug}/versions/${fromId}`),
          apiFetch(`/api/guides/${slug}/versions/${toId}`),
        ]);

        if (fromRes.ok && toRes.ok) {
          setFromVersion(await fromRes.json());
          setToVersion(await toRes.json());
        } else {
          setError('Failed to load versions');
        }
      } catch {
        setError('Failed to load versions');
      }
    }

    fetchVersions();
  }, [fromId, toId, slug]);

  if (!fromId || !toId) {
    return <p>Missing version parameters</p>;
  }

  if (error) {
    return <p style={{ color: '#e87070' }}>{error}</p>;
  }

  if (!fromVersion || !toVersion) {
    return <p>Loading diff...</p>;
  }

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Comparing version {fromVersion.VersionNumber} to version {toVersion.VersionNumber}
      </div>
      <DiffView
        oldText={fromVersion.Content}
        newText={toVersion.Content}
        oldLabel={`v${fromVersion.VersionNumber}`}
        newLabel={`v${toVersion.VersionNumber}`}
      />
    </div>
  );
}

export default function DiffPage() {
  const slug = typeof window !== 'undefined' ? window.location.pathname.split('/')[2] : '';

  return (
    <div className="history-page">
      <h1>Version Diff</h1>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <Link href={`/games/${slug}/history/`} style={{ color: 'var(--gold)' }}>Back to history</Link>
      </p>
      <Suspense fallback={<p>Loading...</p>}>
        <DiffContent />
      </Suspense>
    </div>
  );
}
