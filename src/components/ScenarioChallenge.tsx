'use client';

import { useState } from 'react';
import type { ScenarioChoice } from '@/lib/types';

interface ScenarioChallengeProps {
  title?: string;
  scenario: string;
  choices: ScenarioChoice[];
}

const qualityConfig = {
  best: { label: 'Best Choice', cls: 'sc-best', icon: '★' },
  good: { label: 'Good Choice', cls: 'sc-good', icon: '✓' },
  suboptimal: { label: 'Suboptimal', cls: 'sc-suboptimal', icon: '⚠' },
};

export function ScenarioChallenge({ title = 'What Would You Do?', scenario, choices }: ScenarioChallengeProps) {
  if (!choices || choices.length === 0) return null;

  const [selected, setSelected] = useState<number | null>(null);

  const answered = selected !== null;

  function handleChoice(index: number) {
    if (answered) return;
    setSelected(index);
  }

  return (
    <div className="mini-game scenario">
      <div className="mini-game-type">Scenario Challenge</div>
      <h4>{title}</h4>

      <div className="sc-scenario">{scenario}</div>

      <div className="sc-choices">
        {choices.map((choice, i) => {
          const config = qualityConfig[choice.quality];
          let cls = 'sc-choice';
          if (answered) {
            cls += ` ${config.cls}`;
            if (i === selected) cls += ' sc-picked';
          }
          return (
            <div
              key={i}
              className={cls}
              onClick={() => handleChoice(i)}
              style={answered ? { pointerEvents: 'none' } : undefined}
            >
              <div className="sc-choice-text">{choice.text}</div>
              {answered && (
                <div className="sc-result">
                  <span className={`sc-badge ${config.cls}`}>
                    {config.icon} {config.label}
                  </span>
                  <div className="sc-result-text">{choice.result}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
