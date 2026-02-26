'use client';

import { useState, useMemo } from 'react';

interface SequenceItem {
  text: string;
  position: number;
}

interface SequenceSortProps {
  title?: string;
  description?: string;
  items: SequenceItem[];
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

  const initialOrder = useMemo(() => {
    let shuffled = shuffle(items);
    // Ensure it's not already in correct order
    while (shuffled.every((item, i) => item.position === items.sort((a, b) => a.position - b.position)[i].position) && items.length > 1) {
      shuffled = shuffle(items);
    }
    return shuffled;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [order, setOrder] = useState<SequenceItem[]>(initialOrder);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);

  function handleClick(index: number) {
    if (checked && solved) return;

    if (selected === null) {
      setSelected(index);
      setChecked(false);
    } else if (selected === index) {
      setSelected(null);
    } else {
      // Swap
      const next = [...order];
      [next[selected], next[index]] = [next[index], next[selected]];
      setOrder(next);
      setSelected(null);
      setChecked(false);
    }
  }

  function handleCheck() {
    setChecked(true);
    setSelected(null);
    const correct = order.every((item, i) => {
      const sorted = [...items].sort((a, b) => a.position - b.position);
      return item.position === sorted[i].position;
    });
    if (correct) setSolved(true);
  }

  function isCorrectPosition(index: number): boolean {
    const sorted = [...items].sort((a, b) => a.position - b.position);
    return order[index].position === sorted[index].position;
  }

  return (
    <div className="mini-game seqsort">
      <div className="mini-game-type">Sequence Challenge</div>
      <h4>{title}</h4>
      {description && <div className="mini-game-desc">{description}</div>}

      <div className="ss-instruction">
        {solved ? 'Correct order!' : 'Click two items to swap their positions, then check your order.'}
      </div>

      <div className="ss-items">
        {order.map((item, i) => {
          let cls = 'ss-item';
          if (selected === i) cls += ' ss-selected';
          if (checked && !solved) {
            cls += isCorrectPosition(i) ? ' ss-correct' : ' ss-wrong';
          }
          if (solved) cls += ' ss-correct';
          return (
            <div
              key={item.position}
              className={cls}
              onClick={() => handleClick(i)}
              style={solved ? { pointerEvents: 'none' } : undefined}
            >
              <span className="ss-num">{i + 1}</span>
              <span className="ss-text">{item.text}</span>
            </div>
          );
        })}
      </div>

      <div className="ss-actions">
        {!solved && (
          <button className="mini-game-btn" onClick={handleCheck} disabled={selected !== null}>
            Check Order
          </button>
        )}
        {checked && !solved && (
          <span className="ss-hint">Items highlighted in red are in the wrong position. Swap them and try again.</span>
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
