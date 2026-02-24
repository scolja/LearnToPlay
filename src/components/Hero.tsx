import { GameFrontmatter } from '@/lib/types';

export function Hero({ title, subtitle, players, time, age }: GameFrontmatter) {
  return (
    <>
      <div className="hero">
        <div className="hero-badge">Interactive Lesson</div>
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
