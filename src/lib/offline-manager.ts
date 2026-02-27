// ---------------------------------------------------------------------------
// Offline Manager — communicates with the service worker to cache guides
// ---------------------------------------------------------------------------

export interface OfflineGuideInfo {
  slug: string;
  title: string;
  heroImage: string | null;
  downloadedAt: string;
  resourceCount: number;
}

export interface DownloadProgress {
  slug: string;
  loaded: number;
  total: number;
}

type ProgressCallback = (progress: DownloadProgress) => void;

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  progressCb?: ProgressCallback;
}

const MANIFEST_KEY = 'ltp-offline-guides';
let requestIdCounter = 0;

class OfflineManager {
  private pending = new Map<string, PendingRequest>();
  private listening = false;

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator;
  }

  private ensureListener() {
    if (this.listening || !this.isAvailable()) return;
    this.listening = true;
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, requestId } = event.data;
      const req = this.pending.get(requestId);
      if (!req) return;

      switch (type) {
        case 'DOWNLOAD_PROGRESS':
          req.progressCb?.({
            slug: event.data.slug,
            loaded: event.data.loaded,
            total: event.data.total,
          });
          break;
        case 'CACHE_GUIDE_COMPLETE':
          this.pending.delete(requestId);
          if (event.data.success) {
            this.addToManifest(event.data.slug, event.data.resourceCount);
            req.resolve({ success: true });
          } else {
            req.resolve({ success: false, error: event.data.error });
          }
          break;
        case 'REMOVE_GUIDE_COMPLETE':
          this.pending.delete(requestId);
          this.removeFromManifest(event.data.slug);
          req.resolve(undefined);
          break;
        case 'CHECK_GUIDE_RESULT':
          this.pending.delete(requestId);
          req.resolve({
            cached: event.data.cached,
            resourceCount: event.data.resourceCount,
          });
          break;
      }
    });
  }

  private postMessage(msg: Record<string, unknown>): string {
    this.ensureListener();
    const requestId = `req-${++requestIdCounter}-${Date.now()}`;
    const sw = navigator.serviceWorker.controller;
    if (!sw) throw new Error('No active service worker');
    sw.postMessage({ ...msg, requestId });
    return requestId;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  async downloadGuide(
    slug: string,
    title: string,
    heroImage: string | null,
    progressCb?: ProgressCallback
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isAvailable()) return { success: false, error: 'Service worker unavailable' };

    // Request persistent storage on first download
    if (this.getDownloadedGuides().length === 0 && navigator.storage?.persist) {
      navigator.storage.persist().catch(() => {});
    }

    // Store title + heroImage so we can show them in the downloads list
    this.setGuideMetadata(slug, title, heroImage);

    return new Promise((resolve, reject) => {
      const requestId = this.postMessage({
        type: 'CACHE_GUIDE',
        slug,
        heroImage,
      });
      this.pending.set(requestId, { resolve: resolve as (v: unknown) => void, reject, progressCb });
    });
  }

  async removeGuide(slug: string): Promise<void> {
    if (!this.isAvailable()) return;
    return new Promise((resolve, reject) => {
      const requestId = this.postMessage({ type: 'REMOVE_GUIDE', slug });
      this.pending.set(requestId, { resolve: resolve as (v: unknown) => void, reject });
    });
  }

  async validateGuide(slug: string): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const result: { cached: boolean } = await new Promise((resolve, reject) => {
      const requestId = this.postMessage({ type: 'CHECK_GUIDE', slug });
      this.pending.set(requestId, { resolve: resolve as (v: unknown) => void, reject });
    });
    if (!result.cached) {
      this.removeFromManifest(slug);
    }
    return result.cached;
  }

  isGuideDownloaded(slug: string): boolean {
    return this.getManifest().some((g) => g.slug === slug);
  }

  getDownloadedGuides(): OfflineGuideInfo[] {
    return this.getManifest();
  }

  // -------------------------------------------------------------------------
  // localStorage manifest helpers
  // -------------------------------------------------------------------------

  private getManifest(): OfflineGuideInfo[] {
    try {
      const raw = localStorage.getItem(MANIFEST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveManifest(manifest: OfflineGuideInfo[]) {
    try {
      localStorage.setItem(MANIFEST_KEY, JSON.stringify(manifest));
    } catch { /* storage full */ }
  }

  private setGuideMetadata(slug: string, title: string, heroImage: string | null) {
    const manifest = this.getManifest();
    const existing = manifest.find((g) => g.slug === slug);
    if (existing) {
      existing.title = title;
      existing.heroImage = heroImage;
    } else {
      manifest.push({ slug, title, heroImage, downloadedAt: '', resourceCount: 0 });
    }
    this.saveManifest(manifest);
  }

  private addToManifest(slug: string, resourceCount: number) {
    const manifest = this.getManifest();
    const existing = manifest.find((g) => g.slug === slug);
    if (existing) {
      existing.downloadedAt = new Date().toISOString();
      existing.resourceCount = resourceCount;
    } else {
      manifest.push({
        slug,
        title: slug,
        heroImage: null,
        downloadedAt: new Date().toISOString(),
        resourceCount,
      });
    }
    this.saveManifest(manifest);
  }

  private removeFromManifest(slug: string) {
    const manifest = this.getManifest().filter((g) => g.slug !== slug);
    this.saveManifest(manifest);
  }
}

export const offlineManager = new OfflineManager();
