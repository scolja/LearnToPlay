'use client';

import { useState, useCallback } from 'react';
import { GlossaryEntry } from '@/lib/types';

interface QuickReferenceProps {
  entries: GlossaryEntry[];
}

function stepToId(step: string): string | null {
  const match = step.match(/step\s+(\d+)/i);
  return match ? `step-${match[1]}` : null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clearHighlights() {
  document.querySelectorAll('mark.qref-hl').forEach(mark => {
    const parent = mark.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
      parent.normalize();
    }
  });
}

function highlightInPage(term: string) {
  clearHighlights();
  if (!term) return;

  const root = document.querySelector('main') || document.body;
  const pattern = new RegExp(`(${escapeRegex(term)})`, 'gi');
  const hits: Text[] = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const el = node.parentElement;
      if (!el) return NodeFilter.FILTER_REJECT;
      if (el.closest('.qref-panel, .qref-toggle, script, style')) {
        return NodeFilter.FILTER_REJECT;
      }
      if (el.tagName === 'MARK' && el.classList.contains('qref-hl')) {
        return NodeFilter.FILTER_REJECT;
      }
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
        mark.className = 'qref-hl';
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

export function QuickReference({ entries }: QuickReferenceProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [activeHL, setActiveHL] = useState<number | null>(null);

  const filtered = entries.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (e.term + ' ' + e.searchTerms + ' ' + (e.group || '')).toLowerCase().includes(q);
  });

  const hasGroups = entries.some(e => e.group);

  // Build grouped structure preserving original indices for expand tracking
  const grouped: { group: string; items: { entry: GlossaryEntry; originalIndex: number }[] }[] = [];
  if (hasGroups && !search) {
    const groupMap = new Map<string, { entry: GlossaryEntry; originalIndex: number }[]>();
    const groupOrder: string[] = [];
    filtered.forEach((entry) => {
      const originalIndex = entries.indexOf(entry);
      const g = entry.group || 'Other';
      if (!groupMap.has(g)) {
        groupMap.set(g, []);
        groupOrder.push(g);
      }
      groupMap.get(g)!.push({ entry, originalIndex });
    });
    groupOrder.forEach(g => {
      grouped.push({ group: g, items: groupMap.get(g)! });
    });
  }

  const handleTogglePanel = useCallback(() => {
    setOpen(prev => {
      if (prev) {
        clearHighlights();
        setActiveHL(null);
        setExpanded(new Set());
      }
      return !prev;
    });
  }, []);

  function toggleEntry(i: number, entry: GlossaryEntry) {
    setExpanded(prev => {
      const next = new Set(prev);
      const wasExpanded = next.has(i);
      if (wasExpanded) {
        next.delete(i);
        if (activeHL === i) {
          clearHighlights();
          setActiveHL(null);
        }
      } else {
        next.add(i);
        highlightInPage(entry.term);
        setActiveHL(i);
        const id = stepToId(entry.step);
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

  function renderItem(entry: GlossaryEntry, originalIndex: number) {
    return (
      <div
        key={originalIndex}
        className={`qref-item${expanded.has(originalIndex) ? ' expanded' : ''}${activeHL === originalIndex ? ' hl-active' : ''}`}
        onClick={() => toggleEntry(originalIndex, entry)}
      >
        <div className="qref-term-row">
          <span className="qref-term">{entry.term}</span>
          <span className="qref-step">{entry.step}</span>
        </div>
        <div className="qref-def">{entry.definition}</div>
      </div>
    );
  }

  return (
    <>
      <button className="qref-toggle" onClick={handleTogglePanel} title="Quick Reference">
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
          {hasGroups && !search ? (
            grouped.map(({ group, items }) => (
              <div key={group} className="qref-group">
                <div className="qref-group-header">{group}</div>
                {items.map(({ entry, originalIndex }) => renderItem(entry, originalIndex))}
              </div>
            ))
          ) : (
            filtered.map((entry) => {
              const originalIndex = entries.indexOf(entry);
              return renderItem(entry, originalIndex);
            })
          )}
        </div>
      </div>
    </>
  );
}
