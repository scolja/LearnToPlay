'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSectionEditor } from '@/hooks/useSectionEditor';
import { SectionEditorPane } from '@/components/editor/SectionEditorPane';
import { SectionPreviewPane } from '@/components/editor/SectionPreviewPane';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { GuideMetadataEditor } from '@/components/editor/GuideMetadataEditor';
import { GlossaryEditor } from '@/components/editor/GlossaryEditor';
import { SectionHistoryPanel } from '@/components/editor/SectionHistoryPanel';
import { BottomNav } from '@/components/mobile/BottomNav';
import type { GuideSectionWithDraft, GuideMetaEditable, DbGlossaryEntry } from '@/lib/types';

type MobileTab = 'edit' | 'preview';
type DrawerMode = null | 'history' | 'metadata' | 'glossary' | 'sections';

interface MobileEditorPageProps {
  guide: GuideMetaEditable;
  initialSections: GuideSectionWithDraft[];
  initialGlossary: DbGlossaryEntry[];
}

export function MobileEditorPage({
  guide,
  initialSections,
  initialGlossary,
}: MobileEditorPageProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>('edit');
  const [drawer, setDrawer] = useState<DrawerMode>(null);
  const [glossaryEntries, setGlossaryEntries] = useState(initialGlossary);
  const [menuOpen, setMenuOpen] = useState(false);

  const editor = useSectionEditor(guide.slug, initialSections);

  const handleHistoryRevert = useCallback(() => {
    editor.refreshSections();
    setDrawer(null);
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

  return (
    <div className="me-layout">
      {/* Top bar — matches cv-topbar / gl-topbar pattern */}
      <header className="me-topbar">
        <Link href={`/games/${guide.slug}/learn`} className="me-back" aria-label="Back to learn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div className="me-topbar-text">
          <span className="me-topbar-title">{guide.title}</span>
          <span className="me-topbar-subtitle">Section Editor</span>
        </div>
        <div className="me-topbar-actions">
          <button
            type="button"
            className="me-topbar-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="More actions"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className="me-menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="me-menu">
                <button type="button" onClick={() => { setDrawer('history'); setMenuOpen(false); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  Version History
                </button>
                <button type="button" onClick={() => { setDrawer('metadata'); setMenuOpen(false); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                  Guide Metadata
                </button>
                <button type="button" onClick={() => { setDrawer('glossary'); setMenuOpen(false); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                  Glossary
                </button>
                <button type="button" onClick={() => { editor.addSection(); setMenuOpen(false); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                  Add Section
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Section picker + tab bar combined strip */}
      <div className="me-nav-strip">
        <select
          className="me-section-select"
          aria-label="Select section"
          value={editor.selectedIndex}
          onChange={(e) => editor.selectSection(Number(e.target.value))}
        >
          {editor.sections.map((section, i) => (
            <option key={section.id} value={i}>
              {i + 1}. {section.title || '(untitled)'}
              {section.hasDraft ? ' \u2022 draft' : ''}
            </option>
          ))}
        </select>
        <div className="me-tabs">
          <button
            className={`me-tab ${activeTab === 'edit' ? 'me-tab--active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            Edit
          </button>
          <button
            className={`me-tab ${activeTab === 'preview' ? 'me-tab--active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Main editing area */}
      <div className="me-content">
        {activeTab === 'edit' && editor.selectedSection && (
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
          />
        )}
        {activeTab === 'preview' && (
          <SectionPreviewPane
            title={editor.editingTitle || null}
            content={editor.editingContent}
            notes={editor.editingNotes || null}
            displayData={parseDisplayData}
            customCss={guide.customCss}
          />
        )}
      </div>

      {/* Action bar */}
      <div className="me-actions">
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
          compact
        />
      </div>

      {/* Bottom nav */}
      <BottomNav activeTab="learn" gameSlug={guide.slug} />

      {/* Drawers */}
      {drawer && (
        <div className="me-drawer-overlay" onClick={() => setDrawer(null)}>
          <div className="me-drawer" onClick={(e) => e.stopPropagation()}>
            {drawer === 'history' && editor.selectedSection && (
              <SectionHistoryPanel
                sectionId={editor.selectedSection.id}
                guideSlug={guide.slug}
                onRevert={handleHistoryRevert}
                onClose={() => setDrawer(null)}
              />
            )}
            {drawer === 'metadata' && (
              <>
                <div className="me-drawer-header">
                  <button className="sh-close" onClick={() => setDrawer(null)}>&times;</button>
                </div>
                <GuideMetadataEditor guide={guide} guideSlug={guide.slug} />
              </>
            )}
            {drawer === 'glossary' && (
              <>
                <div className="me-drawer-header">
                  <button className="sh-close" onClick={() => setDrawer(null)}>&times;</button>
                </div>
                <GlossaryEditor
                  guideSlug={guide.slug}
                  sections={sectionsMeta}
                  entries={glossaryEntries}
                  onEntriesChange={setGlossaryEntries}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
