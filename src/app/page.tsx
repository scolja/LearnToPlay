import Link from 'next/link';
import { getAllGames } from '@/lib/content';

export default function Home() {
  const games = getAllGames();

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
            {games.map(({ slug, frontmatter }) => (
              <Link key={slug} href={`/games/${slug}`} className="game-card">
                {frontmatter.heroImage && (
                  <div className="game-card-image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={frontmatter.heroImage} alt={`${frontmatter.title} box art`} />
                  </div>
                )}
                <div className="game-card-body">
                  <h2>{frontmatter.title}</h2>
                  <p>{frontmatter.subtitle}</p>
                  <div className="game-meta">
                    <span>{frontmatter.players} Players</span>
                    <span>{frontmatter.time}</span>
                    <span>Ages {frontmatter.age}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No guides yet. Add MDX files to <code>content/games/</code> to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
