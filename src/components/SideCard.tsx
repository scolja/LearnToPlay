import { ReactNode } from 'react';

interface SideCardProps {
  label: string;
  color: 'gold' | 'red' | 'green' | 'blue' | 'purple';
  children: ReactNode;
}

export function SideCard({ label, color, children }: SideCardProps) {
  return (
    <div className="side-card">
      <span className={`side-card-label ${color}`}>{label}</span>
      <div>{children}</div>
    </div>
  );
}
