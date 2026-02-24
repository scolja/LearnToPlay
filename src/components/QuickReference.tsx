'use client';

import { useState } from 'react';
import { GlossaryEntry } from '@/lib/types';

interface QuickReferenceProps {
  entries: GlossaryEntry[];
}

function stepToId(step: string): string | null {
  const match = step.match(/step\s+(\d+)/i);
  return match ? `step-${match[1]}` : null;
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

  function toggleEntry(i: number, step: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      const wasExpanded = next.has(i);
      if (wasExpanded) {
        next.delete(i);
      } else {
        next.add(i);
        const id = stepToId(step);
        if (id) {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
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
              onClick={() => toggleEntry(i, entry.step)}
            >
              <div className="qref-term-row">
                <span className="qref-term">{entry.term}</span>
                <span className="qref-step">{entry.step}</span>
              </div>
              <div className="qref-def">{entry.definition}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
