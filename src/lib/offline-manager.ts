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
  private swReady: boolean | null = null; // null = unknown, true/false = resolved

  /** Check if the browser supports service workers */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator;
  }

  /**
   * Wait for the SW to be ready (registered + controlling). Returns false if
   * the SW cannot activate (e.g. insecure origin like http://10.0.2.2).
   * Caches the result so subsequent calls are instant.
   */
  async waitForController(timeoutMs = 4000): Promise<boolean> {
    if (this.swReady !== null) return this.swReady;
    if (!this.isAvailable()) { this.swReady = false; return false; }
    if (navigator.serviceWorker.controller) { this.swReady = true; return true; }

    try {
      await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
      ]);
      // ready resolved — wait one more tick for controller to populate
      await new Promise((r) => setTimeout(r, 100));
      this.swReady = !!navigator.serviceWorker.controller;
    } catch {
      this.swReady = false;
    }
    return this.swReady;
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
    const ready = await this.waitForController();
    if (!ready) return { success: false, error: 'Service worker unavailable' };

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
    const ready = await this.waitForController();
    if (!ready) return;
    return new Promise((resolve, reject) => {
      const requestId = this.postMessage({ type: 'REMOVE_GUIDE', slug });
      this.pending.set(requestId, { resolve: resolve as (v: unknown) => void, reject });
    });
  }

  async validateGuide(slug: string): Promise<boolean> {
    const ready = await this.waitForController();
    if (!ready) return false;
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
