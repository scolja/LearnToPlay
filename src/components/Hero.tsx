import Link from 'next/link';
import { GameFrontmatter } from '@/lib/types';
import { EditGuideButton } from './EditGuideButton';

export function Hero({ title, subtitle, players, time, age, heroImage, slug }: GameFrontmatter) {
  return (
    <>
      <div className="hero">
        {heroImage && (
          <div
            className="hero-bg"
            style={{ '--hero-bg-url': `url(${heroImage})` } as React.CSSProperties}
          />
        )}
        <Link href="/" className="hero-badge">Learn to Play</Link>
        <h1>Learn to Play <em>{title}</em></h1>
        <p className="hero-sub">{subtitle}</p>
        <div className="hero-meta">
          <span>{players} Players</span>
          <span>{time}</span>
          <span>Ages {age}</span>
        </div>
        {slug && <EditGuideButton slug={slug} />}
      </div>
      <div className="hero-fade" />
    </>
  );
}
