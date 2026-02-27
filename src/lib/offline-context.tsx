'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { offlineManager, type OfflineGuideInfo, type DownloadProgress } from './offline-manager';
import type { ReactNode } from 'react';

export type GuideOfflineState = 'available' | 'downloading' | 'downloaded' | 'error';

interface OfflineContextValue {
  guideStates: Record<string, GuideOfflineState>;
  downloadProgress: DownloadProgress | null;
  isOffline: boolean;
  downloadGuide: (slug: string, title: string, heroImage: string | null) => void;
  removeGuide: (slug: string) => Promise<void>;
  downloadedGuides: OfflineGuideInfo[];
}

const OfflineContext = createContext<OfflineContextValue>({
  guideStates: {},
  downloadProgress: null,
  isOffline: false,
  downloadGuide: () => {},
  removeGuide: async () => {},
  downloadedGuides: [],
});

export function useOffline() {
  return useContext(OfflineContext);
}

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [guideStates, setGuideStates] = useState<Record<string, GuideOfflineState>>({});
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [downloadedGuides, setDownloadedGuides] = useState<OfflineGuideInfo[]>([]);
  const initialized = useRef(false);

  // Initialize on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load manifest and build initial states
    if (offlineManager.isAvailable()) {
      const guides = offlineManager.getDownloadedGuides();
      setDownloadedGuides(guides);
      const states: Record<string, GuideOfflineState> = {};
      for (const g of guides) {
        states[g.slug] = 'downloaded';
      }
      setGuideStates(states);

      // Validate caches in background (remove stale entries)
      for (const g of guides) {
        offlineManager.validateGuide(g.slug).then((valid) => {
          if (!valid) {
            setGuideStates((prev) => {
              const next = { ...prev };
              delete next[g.slug];
              return next;
            });
            setDownloadedGuides((prev) => prev.filter((d) => d.slug !== g.slug));
          }
        });
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const downloadGuide = useCallback((slug: string, title: string, heroImage: string | null) => {
    setGuideStates((prev) => ({ ...prev, [slug]: 'downloading' }));
    setDownloadProgress({ slug, loaded: 0, total: 0 });

    offlineManager
      .downloadGuide(slug, title, heroImage, (progress) => {
        setDownloadProgress(progress);
      })
      .then((result) => {
        if (result.success) {
          setGuideStates((prev) => ({ ...prev, [slug]: 'downloaded' }));
          setDownloadedGuides(offlineManager.getDownloadedGuides());
        } else {
          setGuideStates((prev) => ({ ...prev, [slug]: 'error' }));
        }
        setDownloadProgress(null);
      });
  }, []);

  const removeGuide = useCallback(async (slug: string) => {
    await offlineManager.removeGuide(slug);
    setGuideStates((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
    setDownloadedGuides(offlineManager.getDownloadedGuides());
  }, []);

  return (
    <OfflineContext.Provider
      value={{ guideStates, downloadProgress, isOffline, downloadGuide, removeGuide, downloadedGuides }}
    >
      {children}
    </OfflineContext.Provider>
  );
}
