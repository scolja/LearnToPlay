'use client';

import type { RenderedSection } from '@/lib/types';
import { ContentBlockRenderer } from './ContentBlockRenderer';
import { TipCard } from './TipCard';

interface SectionCardProps {
  section: RenderedSection;
}

export function SectionCard({ section }: SectionCardProps) {
  return (
    <article className="sc-card">
      {/* Section header */}
      {section.title && (
        <header className="sc-header">
          <h2 className="sc-title">{section.title}</h2>
        </header>
      )}

      {/* Content blocks */}
      <div className="sc-body">
        {section.blocks.map((block, i) => (
          <ContentBlockRenderer key={i} block={block} />
        ))}
      </div>

      {/* Notes (expandable tip cards) */}
      {section.notes.length > 0 && (
        <div className="sc-notes">
          <div className="sc-notes-label">Tips & Strategy</div>
          {section.notes.map((note, i) => (
            <TipCard key={i} label={note.label} color={note.color} html={note.html} />
          ))}
        </div>
      )}
    </article>
  );
}
