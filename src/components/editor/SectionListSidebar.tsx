'use client';

import { useCallback, useRef, useState } from 'react';
import type { GuideSectionWithDraft } from '@/lib/types';

interface SectionListSidebarProps {
  sections: GuideSectionWithDraft[];
  selectedId: string | null;
  onSelect: (index: number) => void;
  onAdd?: () => void;
  onDelete?: (sectionId: string) => void;
  onReorder?: (orderedIds: string[]) => void;
  compact?: boolean;
}

export function SectionListSidebar({
  sections,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
  compact,
}: SectionListSidebarProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dragRef = useRef<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    dragRef.current = index;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIndex(index);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = dragRef.current;
    if (fromIndex === null || fromIndex === toIndex || !onReorder) return;

    const ids = sections.map(s => s.id);
    const [moved] = ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, moved);
    onReorder(ids);
    setDragIndex(null);
    setDropIndex(null);
    dragRef.current = null;
  }, [sections, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDropIndex(null);
    dragRef.current = null;
  }, []);

  return (
    <div className={`se-sidebar ${compact ? 'se-sidebar--compact' : ''}`}>
      <div className="se-sidebar-header">
        <span className="se-sidebar-title">Sections</span>
        {onAdd && (
          <button className="se-sidebar-add" onClick={onAdd} title="Add section">
            +
          </button>
        )}
      </div>
      <div className="se-section-list">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={[
              'se-section-item',
              section.id === selectedId ? 'se-section-item--active' : '',
              dragIndex === index ? 'se-section-item--dragging' : '',
              dropIndex === index ? 'se-section-item--drop-target' : '',
            ].join(' ')}
            onClick={() => onSelect(index)}
            draggable={!!onReorder}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            {onReorder && <span className="se-drag-handle" title="Drag to reorder">&#x2630;</span>}
            <span className="se-section-num">{index + 1}</span>
            <span className="se-section-title">
              {section.title || '(untitled)'}
            </span>
            {section.hasDraft && (
              <span className="se-draft-badge" title="Has unpublished draft">&#x270E;</span>
            )}
            {onDelete && (
              <button
                className="se-section-delete"
                onClick={(e) => { e.stopPropagation(); onDelete(section.id); }}
                title="Delete section"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
