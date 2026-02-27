'use client';

import { useOffline } from '@/lib/offline-context';
import { BottomNav } from './BottomNav';

export function DownloadsContent() {
  const { downloadedGuides, removeGuide, isOffline } = useOffline();

  return (
    <div className="hp-shell">
      <header className="hp-topbar">
        <h1 className="hp-topbar-title">Downloads</h1>
        <div className="hp-topbar-actions" />
      </header>

      <div className="hp-content">
        {isOffline && (
          <div className="dl-page-offline-banner">
            You&apos;re offline. Only downloaded guides are available.
          </div>
        )}

        {downloadedGuides.length === 0 ? (
          <div className="dl-page-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <p>No guides saved yet</p>
            <p className="dl-page-hint">
              Open any guide to automatically save it for offline use.
            </p>
          </div>
        ) : (
          <div className="dl-page-list">
            {downloadedGuides.map((guide) => (
              <div key={guide.slug} className="dl-page-row">
                <div className="dl-page-row-thumb">
                  {guide.heroImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={guide.heroImage} alt="" />
                  ) : (
                    <div className="dl-page-row-thumb-placeholder" />
                  )}
                </div>
                <div className="dl-page-row-info">
                  <span className="dl-page-row-title">{guide.title}</span>
                  <span className="dl-page-row-meta">
                    {guide.resourceCount} files saved
                    {guide.downloadedAt && (
                      <> &middot; {formatDate(guide.downloadedAt)}</>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  className="dl-page-remove-btn"
                  onClick={() => removeGuide(guide.slug)}
                  aria-label={`Remove ${guide.title}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav activeTab="downloads" />
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}
