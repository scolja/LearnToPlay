'use client';

import { createPatch } from 'diff';

interface DiffViewProps {
  oldText: string;
  newText: string;
  oldLabel: string;
  newLabel: string;
}

export function DiffView({ oldText, newText, oldLabel, newLabel }: DiffViewProps) {
  const patch = createPatch('guide.mdx', oldText, newText, oldLabel, newLabel, { context: 3 });
  const lines = patch.split('\n');

  return (
    <div className="diff-view">
      {lines.map((line, i) => {
        let className = 'diff-line diff-context';
        if (line.startsWith('+') && !line.startsWith('+++')) {
          className = 'diff-line diff-add';
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          className = 'diff-line diff-remove';
        } else if (line.startsWith('@@')) {
          className = 'diff-line diff-header';
        }

        return (
          <div key={i} className={className}>
            {line}
          </div>
        );
      })}
    </div>
  );
}
