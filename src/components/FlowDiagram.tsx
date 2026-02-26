import { Fragment } from 'react';

interface FlowStep {
  label: string;
  variant: 'dark' | 'gold' | 'red' | 'green' | 'blue' | 'teal';
}

interface FlowDiagramProps {
  steps: FlowStep[];
}

export function FlowDiagram({ steps }: FlowDiagramProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="flow">
      {steps.map((step, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="fa">→</span>}
          <span className={`fb fb-${step.variant}`}>{step.label}</span>
        </Fragment>
      ))}
    </div>
  );
}
