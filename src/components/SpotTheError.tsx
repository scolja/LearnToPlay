'use client';

import { useState } from 'react';
import type { ErrorStatement } from '@/lib/types';

interface SpotTheErrorProps {
  title?: string;
  scenario: string;
  statements: ErrorStatement[];
}

export function SpotTheError({ title = 'Spot the Error', scenario, statements }: SpotTheErrorProps) {
  if (!statements || statements.length === 0) return null;

  const [solved, setSolved] = useState(false);
  const [cleared, setCleared] = useState<Set<number>>(new Set());

  const checkedCount = cleared.size + (solved ? 1 : 0);

  function handleClick(index: number) {
    if (solved || cleared.has(index)) return;

    const stmt = statements[index];
    if (stmt.isError) {
      setSolved(true);
    } else {
      setCleared(prev => new Set(prev).add(index));
    }
  }

  return (
    <div className="mini-game spoterr">
      <div className="mini-game-type">Error Detection</div>
      <h4>{title}</h4>

      <div className="se-scenario">{scenario}</div>

      <div className="se-instruction">
        {solved
          ? 'Error found!'
          : `Tap the statement that breaks a rule. ${checkedCount > 0 ? `${checkedCount} of ${statements.length} checked.` : ''}`}
      </div>

      <div className="se-statements">
        {statements.map((stmt, i) => {
          let cls = 'se-stmt';
          const isCleared = cleared.has(i);
          if (solved) {
            if (stmt.isError) cls += ' se-error-found';
            else cls += ' se-valid';
          } else if (isCleared) {
            cls += ' se-valid';
          }
          return (
            <div
              key={i}
              className={cls}
              onClick={() => handleClick(i)}
              style={solved || isCleared ? { pointerEvents: 'none' } : undefined}
            >
              <div className="se-stmt-text">{stmt.text}</div>
              {solved && (
                <div className={`se-feedback ${stmt.isError ? 'se-fb-error' : 'se-fb-ok'}`}>
                  {stmt.isError ? '✗ Rule violation: ' : '✓ Correct — '}
                  {stmt.explanation}
                </div>
              )}
              {isCleared && !solved && (
                <div className="se-feedback se-fb-ok">
                  ✓ This is correct — {stmt.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {solved && <div className="mini-game-success">Nice catch! You spotted the rule violation.</div>}
    </div>
  );
}
