'use client';

import { useState } from 'react';
import { GlossaryEntry } from '@/lib/types';

interface QuickReferenceProps {
  entries: GlossaryEntry[];
}

export function QuickReference({ entries }: QuickReferenceProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const filtered = entries.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (e.term + ' ' + e.searchTerms).toLowerCase().includes(q);
  });

  function toggleEntry(i: number) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <>
      <button className="qref-toggle" onClick={() => setOpen(!open)} title="Quick Reference">
        📖
      </button>
      <div className={`qref-panel${open ? ' open' : ''}`}>
        <div className="qref-header">
          <h3>Quick Reference</h3>
          <input
            type="text"
            className="qref-search"
            placeholder="Search terms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="qref-body">
          {filtered.map((entry, i) => (
            <div
              key={i}
              className={`qref-item${expanded.has(i) ? ' expanded' : ''}`}
              onClick={() => toggleEntry(i)}
            >
              <span className="qref-term">{entry.term}</span>
              <span className="qref-step">{entry.step}</span>
              <div className="qref-def">{entry.definition}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
