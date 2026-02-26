'use client';

import { useState } from 'react';

interface QuizOption {
  text: string;
  correct: boolean;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
  correctFeedback: string;
  incorrectFeedback: string;
}

interface KnowledgeCheckProps {
  title?: string;
  questions: QuizQuestion[];
}

export function KnowledgeCheck({ title = 'Quick Check', questions }: KnowledgeCheckProps) {
  const [answered, setAnswered] = useState<Record<number, number>>({});

  if (!questions || questions.length === 0) return null;

  function handleAnswer(qIndex: number, oIndex: number) {
    if (answered[qIndex] !== undefined) return;
    setAnswered(prev => ({ ...prev, [qIndex]: oIndex }));
  }

  return (
    <div className="kcheck">
      <h4>{title}</h4>
      {questions.map((q, qi) => {
        const selectedIdx = answered[qi];
        const isAnswered = selectedIdx !== undefined;
        const wasCorrect = isAnswered && q.options[selectedIdx].correct;

        return (
          <div key={qi}>
            {qi > 0 && <div className="kc-divider" />}
            <div className="kc-q"><strong>Q{qi + 1}:</strong> {q.question}</div>
            <div className="kc-opts">
              {q.options.map((opt, oi) => {
                let cls = 'kc-opt';
                if (isAnswered) {
                  if (opt.correct) cls += ' correct';
                  else if (oi === selectedIdx) cls += ' wrong';
                  else cls += ' dim';
                }
                return (
                  <div
                    key={oi}
                    className={cls}
                    onClick={() => handleAnswer(qi, oi)}
                    style={isAnswered ? { pointerEvents: 'none' } : undefined}
                  >
                    {opt.text}
                  </div>
                );
              })}
            </div>
            {isAnswered && (
              <div className={`kc-fb show ${wasCorrect ? 'yes' : 'no'}`}>
                {wasCorrect ? `✓ ${q.correctFeedback}` : `✗ ${q.incorrectFeedback}`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
