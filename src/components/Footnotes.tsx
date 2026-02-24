'use client';

import { useState } from 'react';

interface FootnoteEntry {
  num: number;
  text: string;
  url?: string;
}

interface FootnotesProps {
  entries: FootnoteEntry[];
}

export function Footnotes({ entries }: FootnotesProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="fn-toggle" onClick={() => setOpen(!open)}>
        Sources {open ? '▾' : '▸'}
      </button>
      <div className={`fn-section${open ? ' open' : ''}`}>
        {entries.map((entry) => (
          <div className="fn-item" key={entry.num}>
            <span className="fn-num">{entry.num}.</span>{' '}
            {entry.url ? (
              <a href={entry.url} target="_blank" rel="noopener noreferrer">{entry.text}</a>
            ) : (
              entry.text
            )}
          </div>
        ))}
      </div>
    </>
  );
}
