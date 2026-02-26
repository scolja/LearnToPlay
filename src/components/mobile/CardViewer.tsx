'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { RenderedSection, GuideMeta } from '@/lib/types';
import { SectionCard } from './SectionCard';
import { ProgressDots } from './ProgressDots';
import { TableOfContents } from './TableOfContents';

interface CardViewerProps {
  guide: GuideMeta;
  sections: RenderedSection[];
  glossaryCount: number;
}

export function CardViewer({ guide, sections, glossaryCount }: CardViewerProps) {
  const storageKey = `ltp-section-${guide.slug}`;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const section = sections[currentIndex];
  const total = sections.length;

  // On mount: restore from ?section= param or sessionStorage, then reveal
  useEffect(() => {
    let idx = 0;

    // Deep link from glossary takes priority
    const params = new URLSearchParams(window.location.search);
    const s = params.get('section');
    if (s !== null) {
      const parsed = parseInt(s, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < sections.length) {
        idx = parsed;
      }
    } else {
      // Fall back to saved position
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed < sections.length) {
            idx = parsed;
          }
        }
      } catch { /* ignore */ }
    }

    setCurrentIndex(idx);
    setIsReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist current section so navigating to glossary and back restores position
  useEffect(() => {
    try { sessionStorage.setItem(storageKey, String(currentIndex)); } catch { /* ignore */ }
  }, [storageKey, currentIndex]);

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
        <a href="/" className="cv-back" aria-label="Back to home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </a>
        <h1 className="cv-topbar-title">{guide.title}</h1>
        <button
          className="cv-toc-btn"
          onClick={() => setTocOpen(true)}
          aria-label="Table of contents"
        >
          {currentIndex + 1}/{total}
        </button>
      </header>

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
      <nav className="cv-bottombar">
        <a href={`/games/${guide.slug}/learn`} className="cv-tab cv-tab-active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M4 19.5V5a2 2 0 012-2h14v14H6.5A2.5 2.5 0 004 19.5z" />
          </svg>
          <span>Learn</span>
        </a>
        <a href={`/games/${guide.slug}/glossary`} className="cv-tab">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span>Glossary{glossaryCount > 0 ? ` (${glossaryCount})` : ''}</span>
        </a>
      </nav>
    </div>
  );
}
