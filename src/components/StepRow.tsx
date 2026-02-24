import { ReactNode } from 'react';

interface StepRowProps {
  step?: number;
  title?: string;
  sidebar?: ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
}

export function StepRow({ step, title, sidebar, children, fullWidth }: StepRowProps) {
  if (fullWidth) {
    return (
      <div className="row full-width">
        <div className="main">
          {step && <div className="step-tag">Step {step}</div>}
          {title && <h2>{title}</h2>}
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="row">
      <div className="main">
        {step && <div className="step-tag">Step {step}</div>}
        {title && <h2>{title}</h2>}
        {children}
      </div>
      {sidebar && <div className="side">{sidebar}</div>}
    </div>
  );
}
