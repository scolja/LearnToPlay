'use client';

import { useState } from 'react';

interface ErrorStatement {
  text: string;
  isError: boolean;
  explanation: string;
}

interface SpotTheErrorProps {
  title?: string;
  scenario: string;
  statements: ErrorStatement[];
}

export function SpotTheError({ title = 'Spot the Error', scenario, statements }: SpotTheErrorProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [cleared, setCleared] = useState<Set<number>>(new Set());

  function handleClick(index: number) {
    if (solved || cleared.has(index)) return;

    const stmt = statements[index];
    if (stmt.isError) {
      setSelected(index);
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
          : 'One of these statements describes something that breaks a rule. Click it.'}
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
                  {stmt.isError ? '✗ Rule violation: ' : '✓ This is fine — '}
                  {stmt.explanation}
                </div>
              )}
              {isCleared && !solved && (
                <div className="se-feedback se-fb-ok">
                  ✓ This is actually correct — {stmt.explanation}
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
