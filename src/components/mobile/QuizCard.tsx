'use client';

import { useState } from 'react';
import type { QuizQuestion } from '@/lib/types';

interface QuizCardProps {
  questions: QuizQuestion[];
}

export function QuizCard({ questions }: QuizCardProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);

  const q = questions[currentQ];
  const isAnswered = selected[currentQ] !== undefined;
  const wasCorrect = isAnswered && q.options[selected[currentQ]].correct;

  function handleSelect(optionIndex: number) {
    if (isAnswered) return;
    setSelected(prev => ({ ...prev, [currentQ]: optionIndex }));
    if (q.options[optionIndex].correct) {
      setScore(s => s + 1);
    }
  }

  const allAnswered = Object.keys(selected).length === questions.length;

  return (
    <div className="qc-card">
      <div className="qc-header">
        <span className="qc-badge">Quick Check</span>
        <span className="qc-progress">{currentQ + 1} / {questions.length}</span>
      </div>

      <div className="qc-question">{q.question}</div>

      <div className="qc-options">
        {q.options.map((opt, i) => {
          let cls = 'qc-option';
          if (isAnswered) {
            if (opt.correct) cls += ' qc-correct';
            else if (i === selected[currentQ]) cls += ' qc-wrong';
            else cls += ' qc-dim';
          }
          return (
            <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={isAnswered}>
              {opt.text}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className={`qc-feedback ${wasCorrect ? 'qc-fb-correct' : 'qc-fb-wrong'}`}>
          {wasCorrect ? q.correctFeedback : q.incorrectFeedback}
        </div>
      )}

      {isAnswered && (
        <div className="qc-nav">
          {currentQ < questions.length - 1 ? (
            <button className="qc-next" onClick={() => setCurrentQ(currentQ + 1)}>
              Next Question
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          ) : (
            <div className="qc-score">
              {score}/{questions.length} correct
            </div>
          )}
        </div>
      )}
    </div>
  );
}
