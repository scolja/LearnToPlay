'use client';

import { useState, useCallback } from 'react';
import { marked } from 'marked';
import type { GuideSection, GuideMeta } from '@/lib/types';
import { preprocessTokens } from '@/lib/section-renderer';

interface SectionEditorProps {
  guide: GuideMeta;
  sections: GuideSection[];
}

export function SectionEditor({ guide, sections }: SectionEditorProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [editedNotes, setEditedNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'saved' | 'error'; message: string } | null>(null);

  const section = sections[selectedIdx];
  const sectionId = section.id;

  // Get current values (edited or original)
  const currentContent = editedContent[sectionId] ?? section.content;
  const currentNotes = editedNotes[sectionId] ?? (section.notes || '');
  const isDirty = editedContent[sectionId] !== undefined || editedNotes[sectionId] !== undefined;

  const handleContentChange = useCallback((value: string) => {
    setEditedContent(prev => ({ ...prev, [sectionId]: value }));
    setStatus(null);
  }, [sectionId]);

  const handleNotesChange = useCallback((value: string) => {
    setEditedNotes(prev => ({ ...prev, [sectionId]: value }));
    setStatus(null);
  }, [sectionId]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/guides/${guide.slug}/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: section.title,
          content: currentContent,
          notes: currentNotes || null,
          displayData: section.displayData,
          editSummary: 'Updated via section editor',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      // Clear dirty state for this section
      setEditedContent(prev => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
      setEditedNotes(prev => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
      setStatus({ type: 'saved', message: 'Saved successfully' });
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  }, [guide.slug, sectionId, section.title, section.displayData, currentContent, currentNotes]);

  // Simple markdown preview (with custom token preprocessing)
  const previewHtml = marked.parse(preprocessTokens(currentContent)) as string;

  return (
    <div className="se-layout">
      {/* Sidebar: section list */}
      <aside className="se-sidebar">
        <div className="se-sidebar-header">
          <div className="se-sidebar-title">{guide.title}</div>
          <div className="se-sidebar-subtitle">{sections.length} sections</div>
        </div>
        <ul className="se-section-list">
          {sections.map((s, i) => {
            const hasEdits = editedContent[s.id] !== undefined || editedNotes[s.id] !== undefined;
            return (
              <li
                key={s.id}
                className={`se-section-item${i === selectedIdx ? ' se-section-item-active' : ''}`}
                onClick={() => { setSelectedIdx(i); setStatus(null); }}
              >
                <span>{s.title || `Section ${i + 1}`}</span>
                {hasEdits && <span className="se-unsaved" title="Unsaved changes" />}
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main editing area */}
      <div className="se-main">
        <div className="se-toolbar">
          <span className="se-toolbar-title">
            {section.title || `Section ${selectedIdx + 1}`}
            {isDirty && <span className="se-unsaved" />}
          </span>
          {status && (
            <span className={`se-status se-status-${status.type}`}>
              {status.message}
            </span>
          )}
          <button
            className="se-save-btn"
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="se-panes">
          {/* Editor pane */}
          <div className="se-pane">
            <div className="se-pane-header">Edit</div>
            <div className="se-editor-area">
              <label className="se-textarea-label">Content (Markdown)</label>
              <textarea
                className="se-textarea"
                value={currentContent}
                onChange={e => handleContentChange(e.target.value)}
                style={{ minHeight: '350px' }}
              />
              <label className="se-textarea-label">Notes / Tips (Markdown)</label>
              <textarea
                className="se-textarea"
                value={currentNotes}
                onChange={e => handleNotesChange(e.target.value)}
                style={{ minHeight: '150px' }}
                placeholder="**[color] Label**&#10;&#10;Tip content here..."
              />
              {section.displayData && (
                <>
                  <label className="se-textarea-label">Display Data (JSON — read only)</label>
                  <textarea
                    className="se-textarea"
                    value={JSON.stringify(section.displayData, null, 2)}
                    readOnly
                    style={{ minHeight: '100px', opacity: 0.6 }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Preview pane */}
          <div className="se-pane">
            <div className="se-pane-header">Preview</div>
            <div className="se-preview">
              <div className="sc-card">
                {section.title && (
                  <header className="sc-header">
                    <h2 className="sc-title">{section.title}</h2>
                  </header>
                )}
                <div className="sc-body" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
