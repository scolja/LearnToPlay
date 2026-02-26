'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { GuideMeta, DbGlossaryEntry } from '@/lib/types';
import { MobileControls } from '@/components/MobileControls';

interface GlossaryViewerProps {
  guide: GuideMeta;
  entries: DbGlossaryEntry[];
  sectionMap: Record<string, { sortOrder: number; title: string | null; index: number }>;
}

export function GlossaryViewer({ guide, entries, sectionMap }: GlossaryViewerProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return entries;
    const q = search.toLowerCase();
    return entries.filter(e =>
      (e.term + ' ' + (e.searchTerms || '') + ' ' + (e.groupName || '')).toLowerCase().includes(q)
    );
  }, [entries, search]);

  // Group entries
  const grouped = useMemo(() => {
    const groups: { group: string; items: DbGlossaryEntry[] }[] = [];
    const groupMap = new Map<string, DbGlossaryEntry[]>();
    const groupOrder: string[] = [];

    for (const entry of filtered) {
      const g = entry.groupName || 'Other';
      if (!groupMap.has(g)) {
        groupMap.set(g, []);
        groupOrder.push(g);
      }
      groupMap.get(g)!.push(entry);
    }

    for (const g of groupOrder) {
      groups.push({ group: g, items: groupMap.get(g)! });
    }
    return groups;
  }, [filtered]);

  function getSectionLabel(sectionId: string | null): string | null {
    if (!sectionId || !sectionMap[sectionId]) return null;
    const s = sectionMap[sectionId];
    return s.title || `Section ${s.sortOrder / 10}`;
  }

  function getSectionIndex(sectionId: string | null): number | null {
    if (!sectionId || !sectionMap[sectionId]) return null;
    return sectionMap[sectionId].index;
  }

  return (
    <div className="gl-shell">
      {/* Top bar */}
      <header className="gl-topbar">
        <Link href={`/games/${guide.slug}/learn`} className="cv-back" aria-label="Back to guide">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="gl-topbar-title">Glossary</h1>
        <div className="gl-topbar-actions">
          <MobileControls />
        </div>
      </header>

      {/* Search */}
      <div className="gl-search-wrap">
        <input
          type="text"
          className="gl-search"
          placeholder="Search terms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {/* Content */}
      <div className="gl-content">
        {filtered.length === 0 ? (
          <div className="gl-empty">No matching terms found.</div>
        ) : (
          grouped.map(({ group, items }) => (
            <div key={group}>
              {!search && <div className="gl-group-header">{group}</div>}
              {items.map(entry => {
                const sectionLabel = getSectionLabel(entry.sectionId);
                const sectionIdx = getSectionIndex(entry.sectionId);
                return (
                  <div key={entry.id} className="gl-entry">
                    <div className="gl-term">{entry.term}</div>
                    <div className="gl-def">{entry.definition}</div>
                    {sectionLabel && (
                      <Link
                        href={`/games/${guide.slug}/learn${sectionIdx !== null ? `?section=${sectionIdx}` : ''}`}
                        className="gl-section-link"
                      >
                        {sectionLabel} →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Bottom tab bar */}
      <nav className="cv-bottombar">
        <Link href="/" className="cv-tab">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12l9-8 9 8" />
            <path d="M5 10v10h5v-6h4v6h5V10" />
          </svg>
          <span>Home</span>
        </Link>
        <Link href={`/games/${guide.slug}/learn`} className="cv-tab" prefetch={true}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M4 19.5V5a2 2 0 012-2h14v14H6.5A2.5 2.5 0 004 19.5z" />
          </svg>
          <span>Learn</span>
        </Link>
        <Link href={`/games/${guide.slug}/glossary`} className="cv-tab cv-tab-active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span>Glossary</span>
        </Link>
      </nav>
    </div>
  );
}
