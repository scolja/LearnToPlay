'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { RenderedSection, GuideMeta } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { SectionCard } from './SectionCard';
import { ProgressDots } from './ProgressDots';
import { TableOfContents } from './TableOfContents';
import { BottomNav } from './BottomNav';
import { DownloadBar } from './DownloadBar';


interface CardViewerProps {
  guide: GuideMeta;
  sections: RenderedSection[];
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clearHighlights(root: HTMLElement | null) {
  if (!root) return;
  root.querySelectorAll('mark.gl-hl').forEach(mark => {
    const parent = mark.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
      parent.normalize();
    }
  });
}

function applyHighlights(root: HTMLElement | null, term: string) {
  if (!root || !term) return;
  clearHighlights(root);

  const pattern = new RegExp(`(${escapeRegex(term)})`, 'gi');
  const hits: Text[] = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const el = node.parentElement;
      if (!el) return NodeFilter.FILTER_REJECT;
      if (el.closest('.cv-hl-banner, script, style')) return NodeFilter.FILTER_REJECT;
      if (el.tagName === 'MARK' && el.classList.contains('gl-hl')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  while (walker.nextNode()) {
    const t = walker.currentNode as Text;
    if (pattern.test(t.textContent || '')) hits.push(t);
    pattern.lastIndex = 0;
  }

  hits.forEach(node => {
    const text = node.textContent || '';
    const parts = text.split(pattern);
    if (parts.length <= 1) return;

    const frag = document.createDocumentFragment();
    parts.forEach(part => {
      if (pattern.test(part)) {
        const mark = document.createElement('mark');
        mark.className = 'gl-hl';
        mark.textContent = part;
        frag.appendChild(mark);
      } else if (part) {
        frag.appendChild(document.createTextNode(part));
      }
      pattern.lastIndex = 0;
    });

    node.parentNode?.replaceChild(frag, node);
  });
}

export function CardViewer({ guide, sections }: CardViewerProps) {
  const storageKey = `ltp-section-${guide.slug}`;
  const { user, isEditor } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [highlightTerm, setHighlightTerm] = useState<string | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const section = sections[currentIndex];
  const total = sections.length;

  // On mount: restore from ?section= param or localStorage, then reveal
  useEffect(() => {
    let idx = 0;

    // Deep link from glossary takes priority
    const params = new URLSearchParams(window.location.search);
    const hl = params.get('highlight');
    if (hl) setHighlightTerm(hl);

    const s = params.get('section');
    if (s !== null) {
      const parsed = parseInt(s, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < sections.length) {
        idx = parsed;
      }
    } else if (hl) {
      // No explicit section — search section content to find the first match
      const termLower = hl.toLowerCase();
      const found = sections.findIndex(sec => {
        // Search title
        if (sec.title && sec.title.toLowerCase().includes(termLower)) return true;
        // Search block content (HTML stripped to text)
        return sec.blocks.some(block => {
          if ('html' in block && block.html) {
            const text = block.html.replace(/<[^>]*>/g, '').toLowerCase();
            return text.includes(termLower);
          }
          return false;
        });
      });
      if (found >= 0) idx = found;
    } else {
      // Fall back to saved position
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed < sections.length) {
            idx = parsed;
          }
        }
      } catch { /* ignore */ }
    }

    // If logged in, fetch server progress and apply "furthest ahead wins"
    if (user && !s && !hl) {
      const localIdx = idx;
      fetch(`/api/progress?slug=${encodeURIComponent(guide.slug)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          const serverIdx = data?.progress?.currentSectionIndex ?? 0;
          const resolved = Math.max(0, Math.min(
            Math.max(localIdx, serverIdx),
            sections.length - 1
          ));
          setCurrentIndex(resolved);
          setIsReady(true);
        })
        .catch(() => {
          setCurrentIndex(localIdx);
          setIsReady(true);
        });
    } else {
      setCurrentIndex(idx);
      setIsReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist current section to localStorage and (if logged in) debounced server sync.
  // Guard with isReady so the initial render (currentIndex=0) doesn't overwrite
  // the saved value before the mount effect restores it.
  useEffect(() => {
    if (!isReady) return;

    // Always write localStorage (fast, offline-capable)
    try { localStorage.setItem(storageKey, String(currentIndex)); } catch { /* ignore */ }

    // Debounced server sync for logged-in users
    if (user) {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: guide.slug,
            currentSectionIndex: currentIndex,
            totalSections: total,
          }),
        }).catch(() => { /* silent — localStorage is the fallback */ });
      }, 1500);
    }

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [storageKey, currentIndex, isReady, user, guide.slug, total]);

  // Apply highlights after content renders
  useEffect(() => {
    if (highlightTerm && containerRef.current) {
      // Small delay to let SectionCard render its HTML
      const timer = setTimeout(() => {
        applyHighlights(containerRef.current, highlightTerm);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [highlightTerm, currentIndex]);

  function handleClearHighlight() {
    clearHighlights(containerRef.current);
    setHighlightTerm(null);
    // Clean highlight from URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.delete('highlight');
    window.history.replaceState({}, '', url.toString());
  }

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, total - 1));
    if (clamped === currentIndex) return;
    setSlideDirection(clamped > currentIndex ? 'left' : 'right');
    setCurrentIndex(clamped);
  }, [total, currentIndex]);

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Touch handling for swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const elapsed = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    // Only trigger swipe if horizontal movement > vertical and meets threshold
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && elapsed < 500) {
      if (deltaX < 0) goNext();
      else goPrev();
    }
  }, [goNext, goPrev]);

  return (
    <div className={`cv-shell${isReady ? '' : ' cv-loading'}`}>
      {/* Top bar */}
      <header className="cv-topbar">
        <h1 className="cv-topbar-title">{guide.title}</h1>
        <div className="cv-topbar-actions">
          {isEditor && (
            <Link href={`/games/${guide.slug}/learn/edit`} className="cv-edit-btn" aria-label="Edit guide">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Link>
          )}
        </div>
        <button
          className="cv-toc-btn"
          onClick={() => setTocOpen(true)}
          aria-label="Table of contents"
        >
          {currentIndex + 1}/{total}
        </button>
      </header>

      {/* Offline download status */}
      <DownloadBar slug={guide.slug} title={guide.title} heroImage={guide.heroImage} />

      {/* Highlight banner from glossary navigation */}
      {highlightTerm && (
        <div className="cv-hl-banner">
          <span>Highlighting: <strong>{highlightTerm}</strong></span>
          <button type="button" onClick={handleClearHighlight}>Clear</button>
        </div>
      )}

      {/* Table of Contents overlay */}
      {tocOpen && (
        <TableOfContents
          sections={sections}
          currentIndex={currentIndex}
          onSelect={goTo}
          onClose={() => setTocOpen(false)}
        />
      )}

      {/* Progress dots */}
      <ProgressDots total={total} current={currentIndex} onDotClick={goTo} />

      {/* Card content area */}
      <div
        ref={containerRef}
        className={`cv-content${slideDirection ? ` cv-slide-${slideDirection}` : ''}`}
        key={currentIndex}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onAnimationEnd={() => setSlideDirection(null)}
      >
        <SectionCard section={section} />
      </div>

      {/* Section navigation */}
      <div className="cv-section-nav">
        <button
          className="cv-nav-btn"
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label="Previous section"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Prev</span>
        </button>
        <span className="cv-nav-label">{section.title || `Section ${currentIndex + 1}`}</span>
        <button
          className="cv-nav-btn"
          onClick={goNext}
          disabled={currentIndex === total - 1}
          aria-label="Next section"
        >
          <span>Next</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {/* Bottom tab bar */}
      <BottomNav activeTab="learn" gameSlug={guide.slug} />
    </div>
  );
}
