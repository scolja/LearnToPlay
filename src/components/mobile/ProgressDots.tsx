'use client';

interface ProgressDotsProps {
  total: number;
  current: number;
  onDotClick: (index: number) => void;
}

export function ProgressDots({ total, current, onDotClick }: ProgressDotsProps) {
  // For many sections, show a subset of dots around the current one
  const maxVisible = 11;
  let start = 0;
  let end = total;

  if (total > maxVisible) {
    start = Math.max(0, current - Math.floor(maxVisible / 2));
    end = Math.min(total, start + maxVisible);
    if (end === total) start = total - maxVisible;
  }

  const dots = [];
  for (let i = start; i < end; i++) {
    dots.push(
      <button
        key={i}
        className={`pd-dot${i === current ? ' pd-active' : ''}${Math.abs(i - current) > 3 ? ' pd-far' : ''}`}
        onClick={() => onDotClick(i)}
        aria-label={`Go to section ${i + 1}`}
        aria-current={i === current ? 'step' : undefined}
      />
    );
  }

  return (
    <div className="pd-bar" role="tablist" aria-label="Section progress">
      {start > 0 && <span className="pd-ellipsis">...</span>}
      {dots}
      {end < total && <span className="pd-ellipsis">...</span>}
    </div>
  );
}
