import Link from 'next/link';
import { getAllGuides } from '@/lib/repositories/section-repository';
import type { GuideMeta } from '@/lib/types';

export const revalidate = 3600; // ISR: revalidate every hour

export default async function Home() {
  let games: GuideMeta[] = [];
  try {
    games = await getAllGuides();
  } catch (err) {
    console.error('[home] Failed to load guides from DB:', err);
  }

  return (
    <div className="homepage">
      <div className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/logo.svg" alt="L2P logo" className="hero-logo" />
        <h1>Learn to Play</h1>
        <p className="hero-sub">Interactive teaching guides for board games</p>
      </div>
      <div className="hero-fade" />
      <div className="page-wrap">
        {games.length > 0 ? (
          <div className="game-grid">
            {games.map((guide) => (
              <div key={guide.slug} className="game-card">
                {guide.heroImage && (
                  <div className="game-card-image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={guide.heroImage} alt={`${guide.title} box art`} />
                  </div>
                )}
                <div className="game-card-body">
                  <h2>{guide.title}</h2>
                  <p>{guide.subtitle}</p>
                  <div className="game-meta">
                    <span>{guide.players} Players</span>
                    <span>{guide.time}</span>
                    <span>Ages {guide.age}</span>
                  </div>
                  <div className="game-card-actions">
                    <Link href={`/games/${guide.slug}`} className="game-card-btn">Full Guide</Link>
                    <Link href={`/games/${guide.slug}/learn`} className="game-card-btn game-card-btn-learn">Learn</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No guides available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
