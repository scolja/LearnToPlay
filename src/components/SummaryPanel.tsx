'use client';

import { ReactNode } from 'react';

interface SummaryItem {
  num: string;
  text: string;
}

interface SummaryPanelProps {
  items?: SummaryItem[];
  children?: ReactNode;
}

export function SummaryPanel({ items, children }: SummaryPanelProps) {
  if (children) {
    return <div className="summary-panel">{children}</div>;
  }
  return (
    <div className="summary-panel">
      {items?.map((item, i) => (
        <div className="sp-item" key={i}>
          <span className="sp-num">{item.num}</span>
          <span className="sp-text" dangerouslySetInnerHTML={{ __html: item.text }} />
        </div>
      ))}
    </div>
  );
}
