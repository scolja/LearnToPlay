'use client';

import { useState, useMemo } from 'react';

interface MatchPair {
  left: string;
  right: string;
}

interface MatchUpProps {
  title?: string;
  description?: string;
  pairs: MatchPair[];
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

export function MatchUp({ title = 'Match the Pairs', description, pairs, explanation }: MatchUpProps) {
  const shuffledRight = useMemo(() => shuffle(pairs.map(p => p.right)), [pairs]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Record<number, number>>({}); // leftIdx → rightIdx
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);

  const allMatched = Object.keys(matched).length === pairs.length;

  function handleLeftClick(leftIdx: number) {
    if (allMatched || matched[leftIdx] !== undefined) return;
    setSelectedLeft(leftIdx);
  }

  function handleRightClick(rightIdx: number) {
    if (allMatched || selectedLeft === null) return;
    // Check if this right item is already matched
    if (Object.values(matched).includes(rightIdx)) return;

    const leftItem = pairs[selectedLeft];
    const rightItem = shuffledRight[rightIdx];

    if (leftItem.right === rightItem) {
      // Correct match
      setMatched(prev => ({ ...prev, [selectedLeft]: rightIdx }));
      setSelectedLeft(null);
    } else {
      // Wrong match — flash and reset
      setWrongFlash(rightIdx);
      setTimeout(() => {
        setWrongFlash(null);
        setSelectedLeft(null);
      }, 600);
    }
  }

  function isRightMatched(rightIdx: number): boolean {
    return Object.values(matched).includes(rightIdx);
  }

  return (
    <div className="mini-game matchup">
      <div className="mini-game-type">Matching Challenge</div>
      <h4>{title}</h4>
      {description && <div className="mini-game-desc">{description}</div>}

      <div className="mu-instruction">
        {allMatched
          ? 'All pairs matched!'
          : 'Click an item on the left, then click its match on the right.'}
      </div>

      <div className="mu-columns">
        <div className="mu-col mu-left">
          {pairs.map((pair, i) => {
            let cls = 'mu-item';
            if (selectedLeft === i) cls += ' mu-selected';
            if (matched[i] !== undefined) cls += ' mu-matched';
            return (
              <div
                key={i}
                className={cls}
                onClick={() => handleLeftClick(i)}
              >
                {pair.left}
              </div>
            );
          })}
        </div>

        <div className="mu-connector">
          {pairs.map((_, i) => (
            <div
              key={i}
              className={`mu-line${matched[i] !== undefined ? ' mu-line-active' : ''}`}
            />
          ))}
        </div>

        <div className="mu-col mu-right">
          {shuffledRight.map((text, i) => {
            let cls = 'mu-item';
            if (isRightMatched(i)) cls += ' mu-matched';
            if (wrongFlash === i) cls += ' mu-wrong';
            return (
              <div
                key={i}
                className={cls}
                onClick={() => handleRightClick(i)}
              >
                {text}
              </div>
            );
          })}
        </div>
      </div>

      {allMatched && (
        <>
          <div className="mini-game-success">All pairs correctly matched!</div>
          {explanation && <div className="mini-game-explanation">{explanation}</div>}
        </>
      )}
    </div>
  );
}
