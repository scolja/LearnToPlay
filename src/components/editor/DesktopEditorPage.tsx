'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSectionEditor } from '@/hooks/useSectionEditor';
import { SectionListSidebar } from './SectionListSidebar';
import { EditorToolbar } from './EditorToolbar';
import { SectionEditorPane } from './SectionEditorPane';
import { SectionPreviewPane } from './SectionPreviewPane';
import { GuideMetadataEditor } from './GuideMetadataEditor';
import { GlossaryEditor } from './GlossaryEditor';
import { SectionHistoryPanel } from './SectionHistoryPanel';
import { CodeEditor } from './CodeEditor';
import type { GuideSectionWithDraft, GuideMetaEditable, DbGlossaryEntry } from '@/lib/types';

type DesktopTab = 'edit' | 'preview' | 'metadata' | 'glossary' | 'history';

interface DesktopEditorPageProps {
  guide: GuideMetaEditable;
  initialSections: GuideSectionWithDraft[];
  initialGlossary: DbGlossaryEntry[];
}

export function DesktopEditorPage({
  guide,
  initialSections,
  initialGlossary,
}: DesktopEditorPageProps) {
  const [activeTab, setActiveTab] = useState<DesktopTab>('edit');
  const [glossaryEntries, setGlossaryEntries] = useState(initialGlossary);

  const editor = useSectionEditor(guide.slug, initialSections);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (e.shiftKey) {
        editor.publish();
      } else {
        editor.saveDraft();
      }
    }
  }, [editor]);

  const handleHistoryRevert = useCallback(() => {
    // After reverting, refresh and switch to edit tab
    editor.refreshSections();
    setActiveTab('edit');
  }, [editor]);

  const parseDisplayData = useMemo((): Record<string, unknown> | null => {
    if (!editor.editingDisplayData.trim()) return null;
    try {
      return JSON.parse(editor.editingDisplayData);
    } catch {
      return null;
    }
  }, [editor.editingDisplayData]);

  const sectionsMeta = useMemo(() =>
    editor.sections.map(s => ({
      id: s.id,
      title: s.title,
      sortOrder: s.sortOrder,
    })),
    [editor.sections]
  );

  // Wrapper to pass CodeEditor as a component (without the ref/handle overhead)
  const CodeEditorWrapper = useCallback(
    ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
      <CodeEditor value={value} onChange={onChange} />
    ),
    []
  );

  return (
    <div className="de-layout" onKeyDown={handleKeyDown}>
      <EditorToolbar
        sectionTitle={editor.editingTitle || editor.selectedSection?.title || ''}
        hasDraft={editor.selectedSection?.hasDraft ?? false}
        isDirty={editor.isDirty}
        saving={editor.saving}
        editSummary={editor.editSummary}
        status={editor.status}
        onEditSummaryChange={editor.setEditSummary}
        onSaveDraft={editor.saveDraft}
        onPublish={editor.publish}
        onDiscardDraft={editor.discardDraft}
      />
      <div className="de-body">
        <SectionListSidebar
          sections={editor.sections}
          selectedId={editor.selectedSection?.id ?? null}
          onSelect={editor.selectSection}
          onAdd={() => editor.addSection()}
          onDelete={(id) => {
            if (window.confirm('Delete this section?')) {
              editor.removeSection(id);
            }
          }}
          onReorder={editor.reorderSections}
        />
        <div className="de-main">
          <div className="de-tabs">
            <Link href={`/games/${guide.slug}`} className="de-back">
              &larr; Back to guide
            </Link>
            {(['edit', 'preview', 'metadata', 'glossary', 'history'] as DesktopTab[]).map(tab => (
              <button
                key={tab}
                className={`de-tab ${activeTab === tab ? 'de-tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="de-tab-content">
            {!editor.selectedSection && activeTab !== 'metadata' && activeTab !== 'glossary' ? (
              <div className="de-empty">Select a section to start editing</div>
            ) : (
              <>
                {activeTab === 'edit' && editor.selectedSection && (
                  <div className="de-split">
                    <div className="de-split-editor">
                      <SectionEditorPane
                        section={editor.selectedSection}
                        editingTitle={editor.editingTitle}
                        editingContent={editor.editingContent}
                        editingNotes={editor.editingNotes}
                        editingDisplayData={editor.editingDisplayData}
                        onTitleChange={editor.setEditingTitle}
                        onContentChange={editor.setEditingContent}
                        onNotesChange={editor.setEditingNotes}
                        onDisplayDataChange={editor.setEditingDisplayData}
                        useCodeMirror
                        CodeEditorComponent={CodeEditorWrapper}
                      />
                    </div>
                    <div className="de-split-divider" />
                    <div className="de-split-preview">
                      <SectionPreviewPane
                        title={editor.editingTitle || null}
                        content={editor.editingContent}
                        notes={editor.editingNotes || null}
                        displayData={parseDisplayData}
                        customCss={guide.customCss}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'preview' && editor.selectedSection && (
                  <SectionPreviewPane
                    title={editor.editingTitle || null}
                    content={editor.editingContent}
                    notes={editor.editingNotes || null}
                    displayData={parseDisplayData}
                    customCss={guide.customCss}
                  />
                )}

                {activeTab === 'metadata' && (
                  <GuideMetadataEditor guide={guide} guideSlug={guide.slug} />
                )}

                {activeTab === 'glossary' && (
                  <GlossaryEditor
                    guideSlug={guide.slug}
                    sections={sectionsMeta}
                    entries={glossaryEntries}
                    onEntriesChange={setGlossaryEntries}
                  />
                )}

                {activeTab === 'history' && editor.selectedSection && (
                  <SectionHistoryPanel
                    sectionId={editor.selectedSection.id}
                    guideSlug={guide.slug}
                    onRevert={handleHistoryRevert}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
