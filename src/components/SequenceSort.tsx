'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { SequenceSortItem } from '@/lib/types';

interface SequenceSortProps {
  title?: string;
  description?: string;
  items: SequenceSortItem[];
  explanation?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SequenceSort({ title = 'Put These in Order', description, items, explanation }: SequenceSortProps) {
  if (!items || items.length === 0) return null;

  const sorted = useMemo(() => [...items].sort((a, b) => a.position - b.position), [items]);

  const initialOrder = useMemo(() => {
    let shuffled = shuffle(items);
    while (shuffled.every((item, i) => item.position === sorted[i].position) && items.length > 1) {
      shuffled = shuffle(items);
    }
    return shuffled;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [order, setOrder] = useState<SequenceSortItem[]>(initialOrder);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);

  // Render state (drives re-renders & CSS classes)
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // Refs for synchronous access in event handlers (avoids stale closures)
  const dragIndexRef = useRef<number | null>(null);
  const overIndexRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragStartY = useRef(0);
  const isDragging = useRef(false);

  const isCorrectPosition = useCallback((index: number): boolean => {
    return order[index].position === sorted[index].position;
  }, [order, sorted]);

  function handleCheck() {
    setChecked(true);
    const correct = order.every((item, i) => item.position === sorted[i].position);
    if (correct) setSolved(true);
  }

  // --- Item index from Y coordinate (skip the dragged item whose rect is shifted) ---
  const getItemIndexAtY = useCallback((clientY: number, skipIndex: number): number | null => {
    for (let i = 0; i < itemRefs.current.length; i++) {
      if (i === skipIndex) continue;
      const el = itemRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) {
        return i;
      }
    }
    return null;
  }, []);

  // --- Drag start (shared by touch & mouse) ---
  const startDrag = useCallback((index: number, clientY: number) => {
    if (solved) return;
    isDragging.current = false;
    dragStartY.current = clientY;
    dragIndexRef.current = index;
    overIndexRef.current = index;
    setDragIndex(index);
    setOverIndex(index);
    setChecked(false);
  }, [solved]);

  // --- Drag move (shared by touch & mouse) ---
  const moveDrag = useCallback((clientY: number) => {
    const di = dragIndexRef.current;
    if (di === null) return;

    const delta = Math.abs(clientY - dragStartY.current);
    if (delta > 5) isDragging.current = true;

    const target = getItemIndexAtY(clientY, di);
    if (target !== null && target !== overIndexRef.current) {
      overIndexRef.current = target;
      setOverIndex(target);
    }

    const el = itemRefs.current[di];
    if (el && isDragging.current) {
      const offset = clientY - dragStartY.current;
      el.style.transform = `translateY(${offset}px) scale(1.03)`;
      el.style.zIndex = '10';
    }
  }, [getItemIndexAtY]);

  // --- Drag end (shared by touch & mouse) ---
  const endDrag = useCallback(() => {
    const di = dragIndexRef.current;
    if (di === null) return;

    // Reset transform
    const el = itemRefs.current[di];
    if (el) {
      el.style.transform = '';
      el.style.zIndex = '';
    }

    if (isDragging.current) {
      const oi = overIndexRef.current;
      if (oi !== null && oi !== di) {
        setOrder(prev => {
          const next = [...prev];
          const [moved] = next.splice(di, 1);
          next.splice(oi, 0, moved);
          return next;
        });
      }
    }

    dragIndexRef.current = null;
    overIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
    isDragging.current = false;
  }, []);

  // --- Touch handlers ---
  const onTouchStart = useCallback((index: number) => (e: React.TouchEvent) => {
    startDrag(index, e.touches[0].clientY);
  }, [startDrag]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragIndexRef.current === null) return;
    e.preventDefault();
    moveDrag(e.touches[0].clientY);
  }, [moveDrag]);

  const onTouchEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  // --- Mouse handlers (desktop) ---
  const onMouseDown = useCallback((index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    startDrag(index, e.clientY);
  }, [startDrag]);

  useEffect(() => {
    if (dragIndex === null) return;

    const onMove = (e: MouseEvent) => moveDrag(e.clientY);
    const onUp = () => endDrag();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragIndex, moveDrag, endDrag]);

  return (
    <div className="mini-game seqsort">
      <div className="mini-game-type">Sequence Challenge</div>
      <h4>{title}</h4>
      {description && <div className="mini-game-desc">{description}</div>}

      <div className="ss-instruction">
        {solved ? 'Correct order!' : 'Drag items into the correct order.'}
      </div>

      <div className="ss-items" ref={containerRef}>
        {order.map((item, i) => {
          let cls = 'ss-item';
          if (dragIndex === i && isDragging.current) cls += ' ss-dragging';
          if (dragIndex !== null && overIndex === i && i !== dragIndex && isDragging.current) cls += ' ss-drop-target';
          if (checked && !solved) {
            cls += isCorrectPosition(i) ? ' ss-correct' : ' ss-wrong';
          }
          if (solved) cls += ' ss-correct';
          return (
            <div
              key={item.position}
              ref={el => { itemRefs.current[i] = el; }}
              className={cls}
              onTouchStart={onTouchStart(i)}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown(i)}
              style={solved ? { pointerEvents: 'none' } : undefined}
            >
              <span className="ss-grip" aria-hidden="true">⠿</span>
              <span className="ss-num">{i + 1}</span>
              <span className="ss-text">{item.text}</span>
            </div>
          );
        })}
      </div>

      <div className="ss-actions">
        {!solved && (
          <button className="mini-game-btn" onClick={handleCheck} disabled={dragIndex !== null}>
            Check Order
          </button>
        )}
        {checked && !solved && (
          <span className="ss-hint">Items in red are in the wrong position. Drag them and try again.</span>
        )}
      </div>

      {solved && (
        <>
          <div className="mini-game-success">All steps in the correct order!</div>
          {explanation && <div className="mini-game-explanation">{explanation}</div>}
        </>
      )}
    </div>
  );
}
