'use client';

import { useMemo } from 'react';
import { renderSection } from '@/lib/section-renderer';
import { ContentBlockRenderer } from '@/components/mobile/ContentBlockRenderer';
import { TipCard } from '@/components/mobile/TipCard';
import type { GuideSection } from '@/lib/types';

interface SectionPreviewPaneProps {
  title: string | null;
  content: string;
  notes: string | null;
  displayData: Record<string, unknown> | null;
  customCss?: string | null;
}

export function SectionPreviewPane({
  title,
  content,
  notes,
  displayData,
  customCss,
}: SectionPreviewPaneProps) {
  const rendered = useMemo(() => {
    const syntheticSection: GuideSection = {
      id: 'preview',
      guideId: 'preview',
      sortOrder: 0,
      title,
      content: content || '',
      notes,
      displayData,
      versionNumber: 0,
    };
    try {
      return renderSection(syntheticSection);
    } catch {
      return null;
    }
  }, [title, content, notes, displayData]);

  if (!rendered) {
    return (
      <div className="ed-preview ed-preview--error">
        <p>Preview error — check your content or display data.</p>
      </div>
    );
  }

  return (
    <div className="ed-preview">
      {customCss && <style>{customCss}</style>}
      {rendered.title && (
        <h2 className="ed-preview-title">{rendered.title}</h2>
      )}
      <div className="ed-preview-blocks">
        {rendered.blocks.map((block, i) => (
          <ContentBlockRenderer key={i} block={block} />
        ))}
      </div>
      {rendered.notes.length > 0 && (
        <div className="ed-preview-notes">
          {rendered.notes.map((note, i) => (
            <TipCard key={i} label={note.label} color={note.color} html={note.html} />
          ))}
        </div>
      )}
    </div>
  );
}
