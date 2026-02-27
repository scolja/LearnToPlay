'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { useOffline } from '@/lib/offline-context';

interface BottomNavProps {
  activeTab: 'home' | 'learn' | 'glossary' | 'downloads';
  gameSlug?: string;
}

export function BottomNav({ activeTab, gameSlug }: BottomNavProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isOffline, downloadedGuides } = useOffline();
  const downloadCount = downloadedGuides.length;

  // When offline, force full page loads so the SW can serve cached HTML
  const handleOfflineNav = (e: React.MouseEvent, href: string) => {
    if (isOffline) {
      e.preventDefault();
      window.location.href = href;
    }
  };

  return (
    <>
      <nav className="cv-bottombar">
        <Link
          href="/"
          className={`cv-tab${activeTab === 'home' ? ' cv-tab-active' : ''}`}
          onClick={(e) => handleOfflineNav(e, '/')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12l9-8 9 8" />
            <path d="M5 10v10h5v-6h4v6h5V10" />
          </svg>
          <span>Home</span>
        </Link>

        {gameSlug ? (
          <>
            <Link
              href={`/games/${gameSlug}/learn`}
              className={`cv-tab${activeTab === 'learn' ? ' cv-tab-active' : ''}`}
              prefetch={true}
              onClick={(e) => handleOfflineNav(e, `/games/${gameSlug}/learn/`)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M4 19.5V5a2 2 0 012-2h14v14H6.5A2.5 2.5 0 004 19.5z" />
              </svg>
              <span>Learn</span>
            </Link>
            <Link
              href={`/games/${gameSlug}/glossary`}
              className={`cv-tab${activeTab === 'glossary' ? ' cv-tab-active' : ''}`}
              prefetch={true}
              onClick={(e) => handleOfflineNav(e, `/games/${gameSlug}/glossary/`)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span>Glossary</span>
            </Link>
          </>
        ) : (
          /* Homepage: show Downloads tab instead of Learn/Glossary */
          <Link
            href="/downloads"
            className={`cv-tab${activeTab === 'downloads' ? ' cv-tab-active' : ''}`}
            onClick={(e) => handleOfflineNav(e, '/downloads/')}
          >
            <span className="cv-tab-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {downloadCount > 0 && (
                <span className="cv-tab-badge">{downloadCount}</span>
              )}
            </span>
            <span>Downloads</span>
          </Link>
        )}

        <button
          type="button"
          className="cv-tab"
          onClick={() => setSettingsOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Settings</span>
        </button>
      </nav>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
