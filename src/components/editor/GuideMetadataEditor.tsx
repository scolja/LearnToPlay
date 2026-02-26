'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';
import type { GuideMetaEditable } from '@/lib/types';

interface GuideMetadataEditorProps {
  guide: GuideMetaEditable;
  guideSlug: string;
}

const FIELDS: { key: keyof GuideMetaEditable; label: string; type?: string; wide?: boolean }[] = [
  { key: 'title', label: 'Title' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'designer', label: 'Designer' },
  { key: 'artist', label: 'Artist' },
  { key: 'publisher', label: 'Publisher' },
  { key: 'publisherUrl', label: 'Publisher URL' },
  { key: 'year', label: 'Year', type: 'number' },
  { key: 'players', label: 'Players' },
  { key: 'time', label: 'Time' },
  { key: 'age', label: 'Age' },
  { key: 'bggUrl', label: 'BGG URL' },
  { key: 'heroImage', label: 'Hero Image' },
  { key: 'heroGradient', label: 'Hero Gradient', wide: true },
  { key: 'customCss', label: 'Custom CSS', wide: true },
];

export function GuideMetadataEditor({ guide, guideSlug }: GuideMetadataEditorProps) {
  const [values, setValues] = useState<Record<string, string | number | boolean | null>>(() => {
    const v: Record<string, string | number | boolean | null> = {};
    for (const f of FIELDS) {
      v[f.key] = guide[f.key] ?? '';
    }
    v.isDraft = guide.isDraft;
    return v;
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = useCallback((key: string, value: string | number | boolean) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setStatus(null);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of FIELDS) {
        const v = values[f.key];
        if (f.type === 'number') {
          payload[f.key] = v ? Number(v) : null;
        } else {
          payload[f.key] = v || null;
        }
      }
      payload.isDraft = values.isDraft;

      const res = await apiFetch(`/api/guides/${guideSlug}/metadata`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      setStatus('Saved');
    } catch {
      setStatus('Error saving metadata');
    } finally {
      setSaving(false);
    }
  }, [guideSlug, values]);

  return (
    <div className="gm-editor">
      <div className="gm-editor-header">
        <h3>Guide Metadata</h3>
        <div className="gm-editor-actions">
          {status && <span className="gm-status">{status}</span>}
          <button
            className="ed-btn ed-btn--primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Metadata'}
          </button>
        </div>
      </div>
      <div className="gm-fields">
        {FIELDS.map(f => (
          <div key={f.key} className={`gm-field ${f.wide ? 'gm-field--wide' : ''}`}>
            <label className="gm-label">{f.label}</label>
            {f.wide ? (
              <textarea
                className="gm-textarea"
                value={String(values[f.key] ?? '')}
                onChange={(e) => handleChange(f.key, e.target.value)}
                rows={3}
              />
            ) : (
              <input
                className="gm-input"
                type={f.type ?? 'text'}
                value={String(values[f.key] ?? '')}
                onChange={(e) => handleChange(f.key, e.target.value)}
              />
            )}
          </div>
        ))}
        <div className="gm-field">
          <label className="gm-label">
            <input
              type="checkbox"
              checked={!!values.isDraft}
              onChange={(e) => handleChange('isDraft', e.target.checked)}
            />{' '}
            Draft (hidden from public)
          </label>
        </div>
      </div>
    </div>
  );
}
