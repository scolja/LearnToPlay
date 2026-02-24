import Link from 'next/link';
import { GameFrontmatter } from '@/lib/types';

export function Hero({ title, subtitle, players, time, age }: GameFrontmatter) {
  return (
    <>
      <div className="hero">
        <Link href="/" className="hero-badge">Learn to Play</Link>
        <h1>Learn to Play <em>{title}</em></h1>
        <p className="hero-sub">{subtitle}</p>
        <div className="hero-meta">
          <span>{players} Players</span>
          <span>{time}</span>
          <span>Ages {age}</span>
        </div>
      </div>
      <div className="hero-fade" />
    </>
  );
}
