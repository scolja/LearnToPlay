'use client';

import { useEffect, useRef, useState } from 'react';
import { useOffline } from '@/lib/offline-context';

interface DownloadBarProps {
  slug: string;
  title: string;
  heroImage: string | null;
}

export function DownloadBar({ slug, title, heroImage }: DownloadBarProps) {
  const { guideStates, downloadProgress, downloadGuide } = useOffline();
  const triggered = useRef(false);
  const [showComplete, setShowComplete] = useState(false);

  const state = guideStates[slug];
  const isDownloading = state === 'downloading';
  const isDownloaded = state === 'downloaded';
  const progress = downloadProgress?.slug === slug ? downloadProgress : null;
  const pct = progress && progress.total > 0
    ? Math.round((progress.loaded / progress.total) * 100)
    : 0;

  // Auto-download when the learn page is opened (if not already cached)
  useEffect(() => {
    if (triggered.current) return;
    if (isDownloaded || isDownloading) return;
    // Wait for SW controller to be ready
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const tryDownload = () => {
      if (navigator.serviceWorker.controller) {
        triggered.current = true;
        downloadGuide(slug, title, heroImage);
      }
    };

    if (navigator.serviceWorker.controller) {
      tryDownload();
    } else {
      // SW might not be active yet on first load — wait for it
      navigator.serviceWorker.ready.then(() => {
        // controller may still be null after ready, wait a tick
        setTimeout(tryDownload, 100);
      });
    }
  }, [slug, title, heroImage, isDownloaded, isDownloading, downloadGuide]);

  // Show "Saved" briefly when download completes
  useEffect(() => {
    if (isDownloaded && !showComplete && triggered.current) {
      setShowComplete(true);
      const timer = setTimeout(() => setShowComplete(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isDownloaded, showComplete]);

  // Show nothing if already downloaded (and not showing completion)
  if (isDownloaded && !showComplete) return null;
  // Show nothing if not downloading and not in error
  if (!isDownloading && state !== 'error' && !showComplete) return null;

  return (
    <div className={`dl-bar${showComplete ? ' dl-bar-complete' : ''}${state === 'error' ? ' dl-bar-error' : ''}`}>
      {isDownloading && (
        <>
          <div className="dl-bar-track">
            <div className="dl-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="dl-bar-text">
            Saving for offline{progress && progress.total > 0 ? `\u2026 ${progress.loaded}/${progress.total}` : '\u2026'}
          </span>
        </>
      )}
      {showComplete && (
        <span className="dl-bar-text dl-bar-text-done">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Saved for offline
        </span>
      )}
      {state === 'error' && (
        <span className="dl-bar-text dl-bar-text-error">
          Save failed
          <button className="dl-bar-retry" onClick={() => downloadGuide(slug, title, heroImage)}>Retry</button>
        </span>
      )}
    </div>
  );
}
