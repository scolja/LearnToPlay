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

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragStartY = useRef(0);
  const dragCurrentY = useRef(0);
  const isDragging = useRef(false);

  // Click-to-swap fallback
  const [selected, setSelected] = useState<number | null>(null);

  const isCorrectPosition = useCallback((index: number): boolean => {
    return order[index].position === sorted[index].position;
  }, [order, sorted]);

  function handleCheck() {
    setChecked(true);
    setSelected(null);
    const correct = order.every((item, i) => item.position === sorted[i].position);
    if (correct) setSolved(true);
  }

  // --- Click-to-swap fallback ---
  function handleTap(index: number) {
    if (solved || isDragging.current) return;
    if (selected === null) {
      setSelected(index);
      setChecked(false);
    } else if (selected === index) {
      setSelected(null);
    } else {
      const next = [...order];
      [next[selected], next[index]] = [next[index], next[selected]];
      setOrder(next);
      setSelected(null);
      setChecked(false);
    }
  }

  // --- Touch drag-and-drop ---
  const getItemIndexAtY = useCallback((clientY: number): number | null => {
    for (let i = 0; i < itemRefs.current.length; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) {
        return i;
      }
    }
    return null;
  }, []);

  const handleDragStart = useCallback((index: number, clientY: number) => {
    if (solved) return;
    isDragging.current = false; // Will become true once threshold is exceeded
    dragStartY.current = clientY;
    dragCurrentY.current = clientY;
    setDragIndex(index);
    setOverIndex(index);
    setSelected(null);
    setChecked(false);
  }, [solved]);

  const handleDragMove = useCallback((clientY: number) => {
    if (dragIndex === null) return;

    const delta = Math.abs(clientY - dragStartY.current);
    if (delta > 5) {
      isDragging.current = true;
    }

    dragCurrentY.current = clientY;
    const target = getItemIndexAtY(clientY);
    if (target !== null && target !== overIndex) {
      setOverIndex(target);
    }

    // Apply transform to the dragged element
    const el = itemRefs.current[dragIndex];
    if (el && isDragging.current) {
      const offset = clientY - dragStartY.current;
      el.style.transform = `translateY(${offset}px) scale(1.03)`;
      el.style.zIndex = '10';
    }
  }, [dragIndex, overIndex, getItemIndexAtY]);

  const handleDragEnd = useCallback(() => {
    if (dragIndex === null) return;

    // Reset transform on dragged element
    const el = itemRefs.current[dragIndex];
    if (el) {
      el.style.transform = '';
      el.style.zIndex = '';
    }

    if (isDragging.current && overIndex !== null && overIndex !== dragIndex) {
      // Reorder: move dragIndex item to overIndex position
      const next = [...order];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(overIndex, 0, moved);
      setOrder(next);
    }

    setDragIndex(null);
    setOverIndex(null);
    isDragging.current = false;
  }, [dragIndex, overIndex, order]);

  // Touch event handlers
  const onTouchStart = useCallback((index: number) => (e: React.TouchEvent) => {
    handleDragStart(index, e.touches[0].clientY);
  }, [handleDragStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragIndex === null) return;
    e.preventDefault();
    handleDragMove(e.touches[0].clientY);
  }, [dragIndex, handleDragMove]);

  const onTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Mouse event handlers (for desktop testing)
  const onMouseDown = useCallback((index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(index, e.clientY);
  }, [handleDragStart]);

  useEffect(() => {
    if (dragIndex === null) return;

    const onMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };
    const onUp = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragIndex, handleDragMove, handleDragEnd]);

  return (
    <div className="mini-game seqsort">
      <div className="mini-game-type">Sequence Challenge</div>
      <h4>{title}</h4>
      {description && <div className="mini-game-desc">{description}</div>}

      <div className="ss-instruction">
        {solved ? 'Correct order!' : 'Drag items to reorder, or tap two to swap.'}
      </div>

      <div className="ss-items" ref={containerRef}>
        {order.map((item, i) => {
          let cls = 'ss-item';
          if (selected === i) cls += ' ss-selected';
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
              onClick={() => handleTap(i)}
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
          <button className="mini-game-btn" onClick={handleCheck} disabled={selected !== null || dragIndex !== null}>
            Check Order
          </button>
        )}
        {checked && !solved && (
          <span className="ss-hint">Items in red are in the wrong position. Drag or swap them and try again.</span>
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
