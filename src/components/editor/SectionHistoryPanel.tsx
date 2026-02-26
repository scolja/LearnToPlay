'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';
import type { SectionHistoryEntry } from '@/lib/types';

interface SectionHistoryPanelProps {
  sectionId: string;
  guideSlug: string;
  onRevert: (historyId: string) => void;
  onClose?: () => void;
}

export function SectionHistoryPanel({
  sectionId,
  guideSlug,
  onRevert,
  onClose,
}: SectionHistoryPanelProps) {
  const [entries, setEntries] = useState<SectionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch(`/api/guides/${guideSlug}/sections/${sectionId}/history`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setEntries(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [sectionId, guideSlug]);

  const handleRevert = useCallback((historyId: string) => {
    if (window.confirm('Revert to this version? This will load the old content as a draft.')) {
      apiFetch(`/api/guides/${guideSlug}/sections/${sectionId}/revert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyId }),
      })
        .then(res => {
          if (res.ok) {
            onRevert(historyId);
          }
        })
        .catch(console.error);
    }
  }, [sectionId, guideSlug, onRevert]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="sh-panel">
      <div className="sh-header">
        <h3>Version History</h3>
        {onClose && (
          <button className="sh-close" onClick={onClose}>&times;</button>
        )}
      </div>
      {loading ? (
        <div className="sh-loading">Loading history...</div>
      ) : entries.length === 0 ? (
        <div className="sh-empty">No previous versions.</div>
      ) : (
        <div className="sh-list">
          {entries.map(entry => (
            <div key={entry.id} className="sh-entry">
              <div className="sh-entry-header" onClick={() => setExpandedId(
                expandedId === entry.id ? null : entry.id
              )}>
                <span className="sh-version">v{entry.versionNumber}</span>
                <span className="sh-date">{formatDate(entry.editedAt)}</span>
                {entry.editorName && (
                  <span className="sh-editor">{entry.editorName}</span>
                )}
                {entry.editSummary && (
                  <span className="sh-summary">{entry.editSummary}</span>
                )}
                <button
                  className="ed-btn ed-btn--ghost ed-btn--sm"
                  onClick={(e) => { e.stopPropagation(); handleRevert(entry.id); }}
                >
                  Revert
                </button>
              </div>
              {expandedId === entry.id && (
                <div className="sh-entry-content">
                  <pre className="sh-content-preview">{entry.content.substring(0, 500)}</pre>
                  {entry.content.length > 500 && (
                    <span className="sh-truncated">...truncated</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
