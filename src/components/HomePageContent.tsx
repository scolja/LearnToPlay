'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { GuideMeta } from '@/lib/types';

interface HomePageContentProps {
  games: GuideMeta[];
}

function isNewGame(createdAt: string): boolean {
  const created = new Date(createdAt);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  return created > twoWeeksAgo;
}

export function HomePageContent({ games }: HomePageContentProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return games;
    const q = search.toLowerCase();
    return games.filter(g =>
      g.title.toLowerCase().includes(q) ||
      (g.subtitle && g.subtitle.toLowerCase().includes(q)) ||
      g.designer.toLowerCase().includes(q) ||
      g.publisher.toLowerCase().includes(q)
    );
  }, [games, search]);

  const newGames = filtered.filter(g => isNewGame(g.createdAt));
  const otherGames = filtered.filter(g => !isNewGame(g.createdAt));

  return (
    <div className="hp-shell">
      {/* Mobile top bar */}
      <header className="hp-topbar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/logo.svg" alt="L2P" className="hp-topbar-logo" />
        <h1 className="hp-topbar-title">Learn to Play</h1>
      </header>

      {/* Desktop hero (hidden on mobile) */}
      <div className="hp-hero-desktop">
        <div className="hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/logo.svg" alt="L2P logo" className="hero-logo" />
          <h1>Learn to Play</h1>
          <p className="hero-sub">Interactive teaching guides for board games</p>
        </div>
        <div className="hero-fade" />
      </div>

      {/* Sticky search bar */}
      <div className="hp-search-wrap">
        <div className="hp-search-inner">
          <svg className="hp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            className="hp-search"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Scrollable game list */}
      <div className="hp-content">
        {filtered.length === 0 ? (
          <div className="hp-empty">No games match your search.</div>
        ) : (
          <>
            {newGames.length > 0 && (
              <section className="hp-section">
                <h2 className="hp-section-header">New</h2>
                {newGames.map(game => (
                  <GameItem key={game.slug} game={game} isNew />
                ))}
              </section>
            )}

            {otherGames.length > 0 && (
              <section className="hp-section">
                {newGames.length > 0 && (
                  <h2 className="hp-section-header">All Games</h2>
                )}
                {otherGames.map(game => (
                  <GameItem key={game.slug} game={game} />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function GameItem({ game, isNew }: { game: GuideMeta; isNew?: boolean }) {
  return (
    <>
      {/* Mobile: tapping row goes straight to /learn */}
      <Link
        href={`/games/${game.slug}/learn`}
        className="hp-row hp-row-mobile"
      >
        <MobileRow game={game} isNew={isNew} />
      </Link>

      {/* Desktop: card with both Full Guide and Learn buttons */}
      <div className="hp-card hp-card-desktop">
        {game.heroImage && (
          <div className="hp-card-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={game.heroImage} alt={`${game.title} box art`} />
          </div>
        )}
        <div className="hp-card-body">
          <h2>
            {game.title}
            {isNew && <span className="hp-badge-new">NEW</span>}
          </h2>
          {game.subtitle && <p className="hp-card-subtitle">{game.subtitle}</p>}
          <div className="hp-card-meta">
            <span>{game.players} Players</span>
            <span>{game.time}</span>
            <span>Ages {game.age}</span>
          </div>
          <div className="hp-card-actions">
            <Link href={`/games/${game.slug}`} className="hp-card-btn">Full Guide</Link>
            <Link href={`/games/${game.slug}/learn`} className="hp-card-btn hp-card-btn-learn">Learn</Link>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileRow({ game, isNew }: { game: GuideMeta; isNew?: boolean }) {
  return (
    <>
      {game.heroImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={game.heroImage}
          alt={`${game.title} art`}
          className="hp-row-thumb"
          loading="lazy"
        />
      ) : (
        <div className="hp-row-thumb hp-row-thumb-placeholder" />
      )}
      <div className="hp-row-info">
        <span className="hp-row-title">
          {game.title}
          {isNew && <span className="hp-badge-new">NEW</span>}
        </span>
        <span className="hp-row-meta">
          {game.players} Players &middot; {game.time} &middot; Ages {game.age}
        </span>
      </div>
      <svg className="hp-row-chevron" width="16" height="16" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </>
  );
}
