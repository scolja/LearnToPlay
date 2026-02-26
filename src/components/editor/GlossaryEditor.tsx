'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';
import type { DbGlossaryEntry } from '@/lib/types';

interface GlossaryEditorProps {
  guideSlug: string;
  sections: { id: string; title: string | null; sortOrder: number }[];
  entries: DbGlossaryEntry[];
  onEntriesChange: (entries: DbGlossaryEntry[]) => void;
}

interface EditingEntry {
  id?: string;
  term: string;
  definition: string;
  searchTerms: string;
  groupName: string;
  sectionId: string;
  sortOrder: number;
}

const emptyEntry: EditingEntry = {
  term: '', definition: '', searchTerms: '', groupName: '', sectionId: '', sortOrder: 0,
};

export function GlossaryEditor({
  guideSlug,
  sections,
  entries,
  onEntriesChange,
}: GlossaryEditorProps) {
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null);
  const [saving, setSaving] = useState(false);

  const startAdd = useCallback(() => {
    setEditingEntry({ ...emptyEntry, sortOrder: entries.length });
  }, [entries.length]);

  const startEdit = useCallback((entry: DbGlossaryEntry) => {
    setEditingEntry({
      id: entry.id,
      term: entry.term,
      definition: entry.definition,
      searchTerms: entry.searchTerms ?? '',
      groupName: entry.groupName ?? '',
      sectionId: entry.sectionId ?? '',
      sortOrder: entry.sortOrder,
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!editingEntry) return;
    setSaving(true);
    try {
      if (editingEntry.id) {
        // Update
        await apiFetch(`/api/guides/${guideSlug}/glossary`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingEntry.id,
            term: editingEntry.term,
            definition: editingEntry.definition,
            searchTerms: editingEntry.searchTerms || null,
            groupName: editingEntry.groupName || null,
            sectionId: editingEntry.sectionId || null,
            sortOrder: editingEntry.sortOrder,
          }),
        });
        onEntriesChange(entries.map(e =>
          e.id === editingEntry.id
            ? {
                ...e,
                term: editingEntry.term,
                definition: editingEntry.definition,
                searchTerms: editingEntry.searchTerms || null,
                groupName: editingEntry.groupName || null,
                sectionId: editingEntry.sectionId || null,
                sortOrder: editingEntry.sortOrder,
              }
            : e
        ));
      } else {
        // Create
        const res = await apiFetch(`/api/guides/${guideSlug}/glossary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            term: editingEntry.term,
            definition: editingEntry.definition,
            searchTerms: editingEntry.searchTerms || null,
            groupName: editingEntry.groupName || null,
            sectionId: editingEntry.sectionId || null,
            sortOrder: editingEntry.sortOrder,
          }),
        });
        if (res.ok) {
          const newEntry = await res.json();
          onEntriesChange([...entries, newEntry]);
        }
      }
      setEditingEntry(null);
    } catch (err) {
      console.error('Error saving glossary entry:', err);
    } finally {
      setSaving(false);
    }
  }, [editingEntry, guideSlug, entries, onEntriesChange]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Delete this glossary entry?')) return;
    try {
      await apiFetch(`/api/guides/${guideSlug}/glossary?id=${id}`, { method: 'DELETE' });
      onEntriesChange(entries.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting glossary entry:', err);
    }
  }, [guideSlug, entries, onEntriesChange]);

  return (
    <div className="ge-editor">
      <div className="ge-header">
        <h3>Glossary ({entries.length} entries)</h3>
        <button className="ed-btn ed-btn--secondary" onClick={startAdd}>
          Add Term
        </button>
      </div>

      {editingEntry && (
        <div className="ge-form">
          <div className="ge-form-row">
            <input
              className="gm-input"
              placeholder="Term"
              value={editingEntry.term}
              onChange={(e) => setEditingEntry({ ...editingEntry, term: e.target.value })}
            />
            <input
              className="gm-input"
              placeholder="Group"
              value={editingEntry.groupName}
              onChange={(e) => setEditingEntry({ ...editingEntry, groupName: e.target.value })}
            />
          </div>
          <textarea
            className="gm-textarea"
            placeholder="Definition"
            value={editingEntry.definition}
            onChange={(e) => setEditingEntry({ ...editingEntry, definition: e.target.value })}
            rows={2}
          />
          <div className="ge-form-row">
            <input
              className="gm-input"
              placeholder="Search terms (comma-separated)"
              value={editingEntry.searchTerms}
              onChange={(e) => setEditingEntry({ ...editingEntry, searchTerms: e.target.value })}
            />
            <select
              className="gm-input"
              value={editingEntry.sectionId}
              onChange={(e) => setEditingEntry({ ...editingEntry, sectionId: e.target.value })}
            >
              <option value="">-- Section --</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>
                  {s.sortOrder}. {s.title || '(untitled)'}
                </option>
              ))}
            </select>
          </div>
          <div className="ge-form-actions">
            <button className="ed-btn ed-btn--ghost" onClick={() => setEditingEntry(null)}>
              Cancel
            </button>
            <button
              className="ed-btn ed-btn--primary"
              onClick={handleSave}
              disabled={saving || !editingEntry.term || !editingEntry.definition}
            >
              {saving ? 'Saving...' : (editingEntry.id ? 'Update' : 'Add')}
            </button>
          </div>
        </div>
      )}

      <div className="ge-list">
        {entries.map(entry => (
          <div key={entry.id} className="ge-entry">
            <div className="ge-entry-main">
              <strong>{entry.term}</strong>
              {entry.groupName && <span className="ge-group">{entry.groupName}</span>}
              <p className="ge-definition">{entry.definition}</p>
            </div>
            <div className="ge-entry-actions">
              <button className="ed-btn ed-btn--ghost ed-btn--sm" onClick={() => startEdit(entry)}>
                Edit
              </button>
              <button className="ed-btn ed-btn--ghost ed-btn--sm" onClick={() => handleDelete(entry.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
