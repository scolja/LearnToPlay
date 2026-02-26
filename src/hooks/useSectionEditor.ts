'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api-client';
import type { GuideSectionWithDraft } from '@/lib/types';

export interface SectionEditorStatus {
  type: 'saved' | 'draft' | 'error' | 'published' | 'discarded' | 'reverted';
  message: string;
}

export interface UseSectionEditorReturn {
  // Section list
  sections: GuideSectionWithDraft[];
  selectedSection: GuideSectionWithDraft | null;
  selectedIndex: number;
  selectSection: (index: number) => void;

  // Editing state
  editingTitle: string;
  editingContent: string;
  editingNotes: string;
  editingDisplayData: string;
  setEditingTitle: (value: string) => void;
  setEditingContent: (value: string) => void;
  setEditingNotes: (value: string) => void;
  setEditingDisplayData: (value: string) => void;

  // Edit summary
  editSummary: string;
  setEditSummary: (value: string) => void;

  // Status
  isDirty: boolean;
  saving: boolean;
  status: SectionEditorStatus | null;

  // Actions
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  discardDraft: () => Promise<void>;
  refreshSections: () => Promise<void>;
  addSection: (title?: string) => Promise<void>;
  removeSection: (sectionId: string) => Promise<void>;
  reorderSections: (orderedIds: string[]) => Promise<void>;
}

export function useSectionEditor(
  guideSlug: string,
  initialSections: GuideSectionWithDraft[]
): UseSectionEditorReturn {
  const [sections, setSections] = useState<GuideSectionWithDraft[]>(initialSections);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [editingNotes, setEditingNotes] = useState('');
  const [editingDisplayData, setEditingDisplayData] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SectionEditorStatus | null>(null);

  const selectedSection = sections[selectedIndex] ?? null;

  // Track which content we loaded so we can detect dirty state
  const loadedRef = useRef<{
    title: string;
    content: string;
    notes: string;
    displayData: string;
  } | null>(null);

  // Load section content into editing state
  const loadSection = useCallback((section: GuideSectionWithDraft) => {
    const title = section.hasDraft
      ? (section.draftTitle ?? section.title ?? '')
      : (section.title ?? '');
    const content = section.hasDraft
      ? (section.draftContent ?? section.content)
      : section.content;
    const notes = section.hasDraft
      ? (section.draftNotes ?? section.notes ?? '')
      : (section.notes ?? '');
    const dd = section.hasDraft
      ? (section.draftDisplayData ? JSON.stringify(section.draftDisplayData, null, 2) : '')
      : (section.displayData ? JSON.stringify(section.displayData, null, 2) : '');

    setEditingTitle(title);
    setEditingContent(content);
    setEditingNotes(notes);
    setEditingDisplayData(dd);
    setEditSummary('');
    setStatus(null);
    loadedRef.current = { title, content, notes, displayData: dd };
  }, []);

  // On mount or when selectedIndex changes, load that section
  useEffect(() => {
    if (selectedSection) {
      loadSection(selectedSection);
    }
  }, [selectedSection, loadSection]);

  const isDirty = (() => {
    if (!loadedRef.current) return false;
    return (
      editingTitle !== loadedRef.current.title ||
      editingContent !== loadedRef.current.content ||
      editingNotes !== loadedRef.current.notes ||
      editingDisplayData !== loadedRef.current.displayData
    );
  })();

  // beforeunload guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const selectSection = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const parseDisplayData = useCallback((): Record<string, unknown> | null => {
    if (!editingDisplayData.trim()) return null;
    try {
      return JSON.parse(editingDisplayData);
    } catch {
      return null;
    }
  }, [editingDisplayData]);

  const refreshSections = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/guides/${guideSlug}/sections`);
      if (res.ok) {
        const data = await res.json();
        // Re-fetch with drafts — use the sections endpoint which returns basic data
        // For draft info, we need to reload from the server page or a dedicated endpoint
        // For now, just update the section list
        setSections(data.map((s: GuideSectionWithDraft) => ({
          ...s,
          hasDraft: s.draftContent !== undefined && s.draftContent !== null,
        })));
      }
    } catch (err) {
      console.error('Error refreshing sections:', err);
    }
  }, [guideSlug]);

  const saveDraft = useCallback(async () => {
    if (!selectedSection) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await apiFetch(
        `/api/guides/${guideSlug}/sections/${selectedSection.id}/draft`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editingTitle || null,
            content: editingContent,
            notes: editingNotes || null,
            displayData: parseDisplayData(),
          }),
        }
      );
      if (!res.ok) throw new Error('Failed to save draft');

      // Update local state to reflect draft saved
      const updated = sections.map((s, i) =>
        i === selectedIndex
          ? {
              ...s,
              draftTitle: editingTitle || null,
              draftContent: editingContent,
              draftNotes: editingNotes || null,
              draftDisplayData: parseDisplayData(),
              hasDraft: true,
              draftEditedAt: new Date().toISOString(),
            }
          : s
      );
      setSections(updated);
      loadedRef.current = {
        title: editingTitle,
        content: editingContent,
        notes: editingNotes,
        displayData: editingDisplayData,
      };
      setStatus({ type: 'draft', message: 'Draft saved' });
    } catch (err) {
      console.error('Error saving draft:', err);
      setStatus({ type: 'error', message: 'Failed to save draft' });
    } finally {
      setSaving(false);
    }
  }, [selectedSection, selectedIndex, sections, guideSlug, editingTitle, editingContent, editingNotes, editingDisplayData, parseDisplayData]);

  const publish = useCallback(async () => {
    if (!selectedSection) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await apiFetch(
        `/api/guides/${guideSlug}/sections/${selectedSection.id}/publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editingTitle || null,
            content: editingContent,
            notes: editingNotes || null,
            displayData: parseDisplayData(),
            editSummary: editSummary || null,
          }),
        }
      );
      if (!res.ok) throw new Error('Failed to publish');

      const updatedSection = await res.json();
      // Update local state: published content now matches editing, draft cleared
      const updated = sections.map((s, i) =>
        i === selectedIndex
          ? {
              ...updatedSection,
              draftTitle: null,
              draftContent: null,
              draftNotes: null,
              draftDisplayData: null,
              draftEditedAt: null,
              hasDraft: false,
            }
          : s
      );
      setSections(updated);
      loadedRef.current = {
        title: editingTitle,
        content: editingContent,
        notes: editingNotes,
        displayData: editingDisplayData,
      };
      setEditSummary('');
      setStatus({ type: 'published', message: 'Published successfully' });
    } catch (err) {
      console.error('Error publishing:', err);
      setStatus({ type: 'error', message: 'Failed to publish' });
    } finally {
      setSaving(false);
    }
  }, [selectedSection, selectedIndex, sections, guideSlug, editingTitle, editingContent, editingNotes, editingDisplayData, editSummary, parseDisplayData]);

  const discardDraft = useCallback(async () => {
    if (!selectedSection) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await apiFetch(
        `/api/guides/${guideSlug}/sections/${selectedSection.id}/draft`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to discard draft');

      // Revert editing state to published content
      const updated = sections.map((s, i) =>
        i === selectedIndex
          ? {
              ...s,
              draftTitle: null,
              draftContent: null,
              draftNotes: null,
              draftDisplayData: null,
              draftEditedAt: null,
              hasDraft: false,
            }
          : s
      );
      setSections(updated);

      // Reload editing state from published content
      const section = updated[selectedIndex];
      const title = section.title ?? '';
      const content = section.content;
      const notes = section.notes ?? '';
      const dd = section.displayData ? JSON.stringify(section.displayData, null, 2) : '';
      setEditingTitle(title);
      setEditingContent(content);
      setEditingNotes(notes);
      setEditingDisplayData(dd);
      loadedRef.current = { title, content, notes, displayData: dd };
      setStatus({ type: 'discarded', message: 'Draft discarded' });
    } catch (err) {
      console.error('Error discarding draft:', err);
      setStatus({ type: 'error', message: 'Failed to discard draft' });
    } finally {
      setSaving(false);
    }
  }, [selectedSection, selectedIndex, sections, guideSlug]);

  const addSection = useCallback(async (title?: string) => {
    try {
      const res = await apiFetch(`/api/guides/${guideSlug}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || 'New Section', content: '' }),
      });
      if (!res.ok) throw new Error('Failed to create section');
      const newSection = await res.json();
      const withDraft: GuideSectionWithDraft = {
        ...newSection,
        draftTitle: null,
        draftContent: null,
        draftNotes: null,
        draftDisplayData: null,
        draftEditedAt: null,
        hasDraft: false,
      };
      setSections(prev => [...prev, withDraft]);
      setSelectedIndex(sections.length); // select the new section
    } catch (err) {
      console.error('Error adding section:', err);
      setStatus({ type: 'error', message: 'Failed to add section' });
    }
  }, [guideSlug, sections.length]);

  const removeSection = useCallback(async (sectionId: string) => {
    try {
      const res = await apiFetch(
        `/api/guides/${guideSlug}/sections/${sectionId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete section');
      setSections(prev => prev.filter(s => s.id !== sectionId));
      if (selectedIndex >= sections.length - 1) {
        setSelectedIndex(Math.max(0, sections.length - 2));
      }
    } catch (err) {
      console.error('Error deleting section:', err);
      setStatus({ type: 'error', message: 'Failed to delete section' });
    }
  }, [guideSlug, selectedIndex, sections.length]);

  const reorderSectionsAction = useCallback(async (orderedIds: string[]) => {
    try {
      const res = await apiFetch(`/api/guides/${guideSlug}/sections/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) throw new Error('Failed to reorder sections');

      // Reorder local state to match
      const idToSection = new Map(sections.map(s => [s.id, s]));
      const reordered = orderedIds
        .map(id => idToSection.get(id))
        .filter((s): s is GuideSectionWithDraft => !!s)
        .map((s, i) => ({ ...s, sortOrder: i + 1 }));
      setSections(reordered);
    } catch (err) {
      console.error('Error reordering sections:', err);
      setStatus({ type: 'error', message: 'Failed to reorder sections' });
    }
  }, [guideSlug, sections]);

  return {
    sections,
    selectedSection,
    selectedIndex,
    selectSection,
    editingTitle,
    editingContent,
    editingNotes,
    editingDisplayData,
    setEditingTitle,
    setEditingContent,
    setEditingNotes,
    setEditingDisplayData,
    editSummary,
    setEditSummary,
    isDirty,
    saving,
    status,
    saveDraft,
    publish,
    discardDraft,
    refreshSections,
    addSection,
    removeSection,
    reorderSections: reorderSectionsAction,
  };
}
