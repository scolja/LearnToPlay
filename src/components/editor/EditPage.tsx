'use client';

import { useState, useCallback, useRef } from 'react';
import { CodeEditor, CodeEditorHandle } from './CodeEditor';
import { LivePreview } from './LivePreview';
import { FrontmatterEditor } from './FrontmatterEditor';
import { EditToolbar } from './EditToolbar';
import { useScrollSync } from './useScrollSync';
import { apiFetch } from '@/lib/api-client';
import { GameFrontmatter } from '@/lib/types';

interface EditPageProps {
  slug: string;
  initialContent: string;
  initialFrontmatter: GameFrontmatter;
}

export function EditPage({ slug, initialContent, initialFrontmatter }: EditPageProps) {
  const [content, setContent] = useState(initialContent);
  const [frontmatter, setFrontmatter] = useState<GameFrontmatter>(initialFrontmatter);
  const [editSummary, setEditSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [syncScroll, setSyncScroll] = useState(true);

  const editorRef = useRef<CodeEditorHandle>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useScrollSync(editorRef, previewRef, syncScroll);

  const handleSave = useCallback(async (publish: boolean) => {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/guides/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          frontmatter,
          editSummary: editSummary || undefined,
          publish,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Save failed');
        return;
      }

      setEditSummary('');
      if (publish) {
        alert('Published successfully!');
      } else {
        alert('Draft saved.');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [slug, content, frontmatter, editSummary]);

  return (
    <div className="edit-page">
      <EditToolbar
        slug={slug}
        title={frontmatter.title || slug}
        editSummary={editSummary}
        onEditSummaryChange={setEditSummary}
        onSaveDraft={() => handleSave(false)}
        onPublish={() => handleSave(true)}
        saving={saving}
      />
      <FrontmatterEditor frontmatter={frontmatter} onChange={setFrontmatter} />
      <div className="edit-split">
        <div className="edit-editor-pane">
          <CodeEditor ref={editorRef} value={content} onChange={setContent} />
        </div>
        <div className="edit-preview-pane" ref={previewRef}>
          <LivePreview content={content} />
        </div>
        <button
          className={`edit-sync-toggle ${syncScroll ? 'active' : ''}`}
          onClick={() => setSyncScroll(s => !s)}
          title={syncScroll ? 'Scroll sync on' : 'Scroll sync off'}
        >
          {syncScroll ? 'Sync On' : 'Sync Off'}
        </button>
      </div>
    </div>
  );
}
