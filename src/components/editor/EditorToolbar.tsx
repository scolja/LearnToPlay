'use client';

import type { SectionEditorStatus } from '@/hooks/useSectionEditor';

interface EditorToolbarProps {
  sectionTitle: string;
  hasDraft: boolean;
  isDirty: boolean;
  saving: boolean;
  editSummary: string;
  status: SectionEditorStatus | null;
  onEditSummaryChange: (value: string) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onDiscardDraft: () => void;
  compact?: boolean;
}

export function EditorToolbar({
  sectionTitle,
  hasDraft,
  isDirty,
  saving,
  editSummary,
  status,
  onEditSummaryChange,
  onSaveDraft,
  onPublish,
  onDiscardDraft,
  compact,
}: EditorToolbarProps) {
  return (
    <div className={`ed-toolbar ${compact ? 'ed-toolbar--compact' : ''}`}>
      <div className="ed-toolbar-left">
        <span className="ed-toolbar-section-title">
          {sectionTitle || '(untitled)'}
        </span>
        {hasDraft && <span className="ed-toolbar-draft-badge">Draft</span>}
        {isDirty && <span className="ed-toolbar-dirty-badge">Unsaved</span>}
      </div>

      {!compact && (
        <div className="ed-toolbar-center">
          <input
            type="text"
            className="ed-toolbar-summary"
            placeholder="Edit summary (optional)..."
            value={editSummary}
            onChange={(e) => onEditSummaryChange(e.target.value)}
          />
        </div>
      )}

      <div className="ed-toolbar-right">
        {status && (
          <span className={`ed-toolbar-status ed-toolbar-status--${status.type}`}>
            {status.message}
          </span>
        )}
        {hasDraft && (
          <button
            className="ed-btn ed-btn--ghost"
            onClick={onDiscardDraft}
            disabled={saving}
          >
            Discard Draft
          </button>
        )}
        <button
          className="ed-btn ed-btn--secondary"
          onClick={onSaveDraft}
          disabled={saving || !isDirty}
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          className="ed-btn ed-btn--primary"
          onClick={onPublish}
          disabled={saving}
        >
          Publish
        </button>
      </div>
    </div>
  );
}
