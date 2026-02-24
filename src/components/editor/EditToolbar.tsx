'use client';

import Link from 'next/link';

interface EditToolbarProps {
  slug: string;
  title: string;
  editSummary: string;
  onEditSummaryChange: (value: string) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  saving: boolean;
}

export function EditToolbar({
  slug,
  title,
  editSummary,
  onEditSummaryChange,
  onSaveDraft,
  onPublish,
  saving,
}: EditToolbarProps) {
  return (
    <div className="edit-toolbar">
      <span className="edit-toolbar-title">Editing: {title}</span>
      <input
        type="text"
        className="edit-toolbar-summary"
        placeholder="Edit summary (optional)"
        value={editSummary}
        onChange={e => onEditSummaryChange(e.target.value)}
      />
      <button className="edit-btn edit-btn-secondary" onClick={onSaveDraft} disabled={saving}>
        {saving ? 'Saving...' : 'Save Draft'}
      </button>
      <button className="edit-btn edit-btn-publish" onClick={onPublish} disabled={saving}>
        {saving ? 'Publishing...' : 'Publish'}
      </button>
      <Link href={`/games/${slug}/`} className="edit-btn edit-btn-secondary" style={{ textDecoration: 'none' }}>
        Back to Guide
      </Link>
    </div>
  );
}
