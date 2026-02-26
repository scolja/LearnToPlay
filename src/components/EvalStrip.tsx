interface EvalStripProps {
  steps: { label: string; num: string }[];
}

export function EvalStrip({ steps }: EvalStripProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="eval-strip" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
      {steps.map((step, i) => (
        <div className="es" key={i}>
          <span className="es-letter">{step.num}</span>
          {step.label}
        </div>
      ))}
    </div>
  );
}
