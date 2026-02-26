'use client';

import { useState } from 'react';
import type { GuideSectionWithDraft } from '@/lib/types';

interface SectionEditorPaneProps {
  section: GuideSectionWithDraft;
  editingTitle: string;
  editingContent: string;
  editingNotes: string;
  editingDisplayData: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onDisplayDataChange: (value: string) => void;
  useCodeMirror?: boolean;
  CodeEditorComponent?: React.ComponentType<{ value: string; onChange: (v: string) => void }>;
}

type EditorTab = 'content' | 'notes' | 'displayData';

export function SectionEditorPane({
  editingTitle,
  editingContent,
  editingNotes,
  editingDisplayData,
  onTitleChange,
  onContentChange,
  onNotesChange,
  onDisplayDataChange,
  useCodeMirror,
  CodeEditorComponent,
}: SectionEditorPaneProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('content');

  const Editor = useCodeMirror && CodeEditorComponent ? CodeEditorComponent : null;

  return (
    <div className="se-editor-pane">
      <div className="se-title-row">
        <input
          type="text"
          className="se-title-input"
          placeholder="Section title..."
          value={editingTitle}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>
      <div className="se-editor-tabs">
        <button
          className={`se-tab ${activeTab === 'content' ? 'se-tab--active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button
          className={`se-tab ${activeTab === 'notes' ? 'se-tab--active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
        <button
          className={`se-tab ${activeTab === 'displayData' ? 'se-tab--active' : ''}`}
          onClick={() => setActiveTab('displayData')}
        >
          Display Data
        </button>
      </div>
      <div className="se-editor-body">
        {activeTab === 'content' && (
          Editor ? (
            <Editor value={editingContent} onChange={onContentChange} />
          ) : (
            <textarea
              className="se-textarea"
              value={editingContent}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Section markdown content..."
              spellCheck={false}
            />
          )
        )}
        {activeTab === 'notes' && (
          Editor ? (
            <Editor value={editingNotes} onChange={onNotesChange} />
          ) : (
            <textarea
              className="se-textarea"
              value={editingNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Sidebar notes (markdown)..."
              spellCheck={false}
            />
          )
        )}
        {activeTab === 'displayData' && (
          Editor ? (
            <Editor value={editingDisplayData} onChange={onDisplayDataChange} />
          ) : (
            <textarea
              className="se-textarea se-textarea--json"
              value={editingDisplayData}
              onChange={(e) => onDisplayDataChange(e.target.value)}
              placeholder='{"table": {...}, "quiz": [...], "flows": [...] }'
              spellCheck={false}
            />
          )
        )}
      </div>
    </div>
  );
}
