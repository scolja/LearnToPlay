import { ReactNode } from 'react';

interface RuleBoxProps {
  danger?: boolean;
  children: ReactNode;
}

export function RuleBox({ danger, children }: RuleBoxProps) {
  return (
    <div className={`rule-box${danger ? ' danger' : ''}`}>
      {children}
    </div>
  );
}
