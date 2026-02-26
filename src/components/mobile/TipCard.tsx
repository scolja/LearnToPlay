interface TipCardProps {
  label: string;
  color: string;
  html: string;
}

export function TipCard({ label, color, html }: TipCardProps) {
  return (
    <div className={`tc-card tc-${color}`}>
      <div className="tc-header">
        <span className={`tc-label tc-label-${color}`}>{label}</span>
      </div>
      <div className="tc-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
