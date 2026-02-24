'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { CodeEditorHandle } from './CodeEditor';

interface Anchor {
  editorPos: number; // pixel offset in editor scroller
  previewPos: number; // pixel offset in preview scroller
}

/**
 * Finds <StepRow line offsets in the editor (pixel positions),
 * and matches them to .row elements in the preview by order.
 * Returns anchor pairs for piecewise-linear interpolation.
 */
function buildAnchors(
  editorScroll: Element,
  previewScroll: Element,
  editorView: { lineBlockAt: (pos: number) => { top: number }; state: { doc: { toString: () => string } } } | null,
): Anchor[] {
  if (!editorView) return [];

  const source = editorView.state.doc.toString();
  const previewRows = previewScroll.querySelectorAll('.row');

  // Find all <StepRow occurrences and their character offsets
  const stepRowPattern = /<StepRow[\s>]/g;
  const sourceOffsets: number[] = [];
  let match;
  while ((match = stepRowPattern.exec(source)) !== null) {
    sourceOffsets.push(match.index);
  }

  // Match by index: sourceOffsets[i] ↔ previewRows[i]
  const count = Math.min(sourceOffsets.length, previewRows.length);
  if (count === 0) return [];

  const anchors: Anchor[] = [];

  for (let i = 0; i < count; i++) {
    const lineBlock = editorView.lineBlockAt(sourceOffsets[i]);
    const previewEl = previewRows[i] as HTMLElement;

    anchors.push({
      editorPos: lineBlock.top,
      previewPos: previewEl.offsetTop - previewScroll.getBoundingClientRect().top + previewScroll.scrollTop,
    });
  }

  return anchors;
}

/**
 * Given a scroll position in the source pane, interpolate to the target pane
 * using piecewise-linear mapping between anchors.
 */
function interpolate(
  pos: number,
  anchors: Anchor[],
  sourceMax: number,
  targetMax: number,
  direction: 'editorToPreview' | 'previewToEditor',
): number {
  const srcKey = direction === 'editorToPreview' ? 'editorPos' : 'previewPos';
  const tgtKey = direction === 'editorToPreview' ? 'previewPos' : 'editorPos';
  const sMax = direction === 'editorToPreview' ? sourceMax : targetMax;
  const tMax = direction === 'editorToPreview' ? targetMax : sourceMax;

  // Build full anchor list with start and end
  const pts = [
    { src: 0, tgt: 0 },
    ...anchors.map(a => ({ src: a[srcKey], tgt: a[tgtKey] })),
    { src: sMax, tgt: tMax },
  ];

  // Find the segment
  for (let i = 0; i < pts.length - 1; i++) {
    if (pos <= pts[i + 1].src || i === pts.length - 2) {
      const segLen = pts[i + 1].src - pts[i].src;
      if (segLen === 0) return pts[i].tgt;
      const t = (pos - pts[i].src) / segLen;
      return pts[i].tgt + t * (pts[i + 1].tgt - pts[i].tgt);
    }
  }

  return 0;
}

export function useScrollSync(
  editorRef: React.RefObject<CodeEditorHandle | null>,
  previewRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  const anchorsRef = useRef<Anchor[]>([]);
  const syncSourceRef = useRef<'editor' | 'preview' | null>(null);
  const rafRef = useRef<number>(0);

  const rebuildAnchors = useCallback(() => {
    const editorScroll = editorRef.current?.getScrollDOM();
    const editorView = editorRef.current?.getView();
    const previewScroll = previewRef.current;
    if (!editorScroll || !previewScroll || !editorView) return;

    anchorsRef.current = buildAnchors(editorScroll, previewScroll, editorView);
  }, [editorRef, previewRef]);

  useEffect(() => {
    if (!enabled) return;

    // Store cleanup so the outer return can call it
    let teardown: (() => void) | null = null;

    // Wait for CodeMirror + preview to mount
    const initTimer = setTimeout(() => {
      const editorScroll = editorRef.current?.getScrollDOM();
      const previewScroll = previewRef.current;
      if (!editorScroll || !previewScroll) return;

      rebuildAnchors();

      // Rebuild anchors when preview content changes (mutation observer on preview)
      let rebuildTimer: ReturnType<typeof setTimeout>;
      const observer = new MutationObserver(() => {
        clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(rebuildAnchors, 300);
      });
      observer.observe(previewScroll, { childList: true, subtree: true });

      const handleEditorScroll = () => {
        if (syncSourceRef.current === 'preview') return;
        syncSourceRef.current = 'editor';
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          const editorMax = editorScroll.scrollHeight - editorScroll.clientHeight;
          const previewMax = previewScroll.scrollHeight - previewScroll.clientHeight;
          if (editorMax <= 0 || previewMax <= 0) { syncSourceRef.current = null; return; }

          const targetPos = interpolate(
            editorScroll.scrollTop, anchorsRef.current,
            editorMax, previewMax, 'editorToPreview',
          );
          previewScroll.scrollTop = targetPos;

          requestAnimationFrame(() => { syncSourceRef.current = null; });
        });
      };

      const handlePreviewScroll = () => {
        if (syncSourceRef.current === 'editor') return;
        syncSourceRef.current = 'preview';
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          const editorMax = editorScroll.scrollHeight - editorScroll.clientHeight;
          const previewMax = previewScroll.scrollHeight - previewScroll.clientHeight;
          if (editorMax <= 0 || previewMax <= 0) { syncSourceRef.current = null; return; }

          const targetPos = interpolate(
            previewScroll.scrollTop, anchorsRef.current,
            editorMax, previewMax, 'previewToEditor',
          );
          editorScroll.scrollTop = targetPos;

          requestAnimationFrame(() => { syncSourceRef.current = null; });
        });
      };

      editorScroll.addEventListener('scroll', handleEditorScroll, { passive: true });
      previewScroll.addEventListener('scroll', handlePreviewScroll, { passive: true });

      teardown = () => {
        editorScroll.removeEventListener('scroll', handleEditorScroll);
        previewScroll.removeEventListener('scroll', handlePreviewScroll);
        observer.disconnect();
        clearTimeout(rebuildTimer);
        cancelAnimationFrame(rafRef.current);
      };
    }, 500);

    return () => {
      clearTimeout(initTimer);
      teardown?.();
    };
  }, [editorRef, previewRef, rebuildAnchors, enabled]);
}
