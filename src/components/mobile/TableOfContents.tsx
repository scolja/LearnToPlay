'use client';

import type { RenderedSection } from '@/lib/types';

interface TableOfContentsProps {
  sections: RenderedSection[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export function TableOfContents({ sections, currentIndex, onSelect, onClose }: TableOfContentsProps) {
  return (
    <div className="toc-overlay">
      <nav className="toc-panel">
        <div className="toc-header">
          <span className="toc-heading">Sections</span>
          <button className="toc-close" onClick={onClose} aria-label="Close table of contents">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul className="toc-list">
          {sections.map((section, i) => (
            <li key={section.id}>
              <button
                className={`toc-item${i === currentIndex ? ' toc-item-active' : ''}`}
                onClick={() => { onSelect(i); onClose(); }}
              >
                <span className="toc-item-num">{i + 1}</span>
                <span className="toc-item-title">{section.title || `Section ${i + 1}`}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
