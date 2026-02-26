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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  function buildLearnUrl(entry: DbGlossaryEntry): string {
    const params = new URLSearchParams();
    // If we have a known section, include it as a hint
    if (entry.sectionId && sectionMap[entry.sectionId]) {
      params.set('section', String(sectionMap[entry.sectionId].index));
    }
    params.set('highlight', entry.term);
    return `/games/${guide.slug}/learn?${params.toString()}`;
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
        <div className="gl-topbar-text">
          <h1 className="gl-topbar-title">Glossary</h1>
          <span className="gl-topbar-subtitle">{guide.title}</span>
        </div>
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
                const isExpanded = expandedId === entry.id;
                return (
                  <div
                    key={entry.id}
                    className={`gl-entry${isExpanded ? ' gl-entry-expanded' : ''}`}
                  >
                    <div
                      className="gl-entry-header"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    >
                      <span className="gl-chevron">{isExpanded ? '▾' : '▸'}</span>
                      <span className="gl-term">{entry.term}</span>
                      <Link
                        href={buildLearnUrl(entry)}
                        className="gl-goto"
                        onClick={e => e.stopPropagation()}
                        aria-label={`Jump to ${entry.term} in guide`}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </Link>
                    </div>
                    {isExpanded && (
                      <div className="gl-entry-body">
                        <div className="gl-def">{entry.definition}</div>
                        <Link
                          href={buildLearnUrl(entry)}
                          className="gl-jump-btn"
                          onClick={e => e.stopPropagation()}
                        >
                          Jump to Section →
                        </Link>
                      </div>
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
