'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { GuideMeta } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

import { BottomNav } from '@/components/mobile/BottomNav';

interface HomePageContentProps {
  games: GuideMeta[];
}

function isNewGame(createdAt: string): boolean {
  const created = new Date(createdAt);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  return created > twoWeeksAgo;
}

/** Read all ltp-section-* keys from localStorage to get per-game progress */
function getProgressMap(games: GuideMeta[]): Record<string, { current: number; total: number }> {
  const map: Record<string, { current: number; total: number }> = {};
  try {
    for (const g of games) {
      const saved = localStorage.getItem(`ltp-section-${g.slug}`);
      if (saved !== null) {
        const idx = parseInt(saved, 10);
        if (!isNaN(idx) && idx > 0 && g.sectionCount > 0) {
          map[g.slug] = { current: idx, total: g.sectionCount };
        }
      }
    }
  } catch { /* localStorage unavailable */ }
  return map;
}

export function HomePageContent({ games }: HomePageContentProps) {
  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState<Record<string, { current: number; total: number }>>({});
  const { user } = useAuth();

  // Read progress from localStorage (always) and server (when logged in)
  useEffect(() => {
    const localMap = getProgressMap(games);

    if (user) {
      // Logged in: merge server + localStorage with "furthest ahead wins"
      fetch('/api/progress')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (!data?.progress) {
            setProgress(localMap);
            return;
          }
          const serverMap: Record<string, { current: number; total: number }> = {};
          for (const p of data.progress as { slug: string; currentSectionIndex: number; totalSections: number }[]) {
            if (p.currentSectionIndex > 0 && p.totalSections > 0) {
              serverMap[p.slug] = { current: p.currentSectionIndex, total: p.totalSections };
            }
          }
          const merged: Record<string, { current: number; total: number }> = {};
          const allSlugs = new Set([...Object.keys(serverMap), ...Object.keys(localMap)]);
          for (const slug of allSlugs) {
            const server = serverMap[slug];
            const local = localMap[slug];
            if (server && local) {
              merged[slug] = server.current >= local.current ? server : local;
            } else {
              merged[slug] = (server ?? local)!;
            }
          }
          setProgress(merged);
        })
        .catch(() => setProgress(localMap));
    } else {
      setProgress(localMap);
    }
  }, [games, user]);

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
        <div className="hp-topbar-actions" />
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
                  <GameItem key={game.slug} game={game} progress={progress[game.slug]} />
                ))}
              </section>
            )}

            {otherGames.length > 0 && (
              <section className="hp-section">
                {newGames.length > 0 && (
                  <h2 className="hp-section-header">All Games</h2>
                )}
                {otherGames.map(game => (
                  <GameItem key={game.slug} game={game} progress={progress[game.slug]} />
                ))}
              </section>
            )}
          </>
        )}
      </div>

      {/* Mobile bottom nav */}
      <BottomNav activeTab="home" />
    </div>
  );
}

interface GameItemProps {
  game: GuideMeta;
  isNew?: boolean;
  progress?: { current: number; total: number };
}

function GameItem({ game, isNew, progress }: GameItemProps) {
  return (
    <>
      {/* Mobile: tapping row goes straight to /learn */}
      <Link
        href={`/games/${game.slug}/learn`}
        className="hp-row hp-row-mobile"
      >
        <MobileRow game={game} isNew={isNew} progress={progress} />
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
          {game.readMinutes > 0 && (
            <div className="hp-card-readtime">{game.readMinutes} min read</div>
          )}
          <div className="hp-card-meta">
            <span>{game.players} Players</span>
            <span>{game.time}</span>
            <span>Ages {game.age}</span>
          </div>
          {progress && (
            <div className="hp-card-progress">
              <div className="hp-progress-bar">
                <div
                  className="hp-progress-fill"
                  style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
                />
              </div>
              <span className="hp-progress-label">
                {progress.current} / {progress.total} sections
              </span>
            </div>
          )}
          <div className="hp-card-actions">
            <Link href={`/games/${game.slug}`} className="hp-card-btn">Full Guide</Link>
            <Link href={`/games/${game.slug}/learn`} className="hp-card-btn hp-card-btn-learn">
              {progress ? 'Resume' : 'Learn'}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileRow({ game, isNew, progress }: { game: GuideMeta; isNew?: boolean; progress?: { current: number; total: number } }) {
  return (
    <>
      <div className="hp-row-thumb-wrap">
        {game.heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.heroImage}
            alt={`${game.title} art`}
            className="hp-row-thumb"
            loading="lazy"
          />
        ) : (
          <div // eslint-disable-line react/forbid-dom-props
            className="hp-row-thumb hp-row-thumb-placeholder"
            style={{ '--thumb-bg': game.heroGradient || undefined } as React.CSSProperties}
          />
        )}
      </div>
      <div className="hp-row-info">
        <span className="hp-row-title">
          {game.title}
          {isNew && <span className="hp-badge-new">NEW</span>}
        </span>
        {progress ? (
          <span className="hp-row-resume">
            Resume &middot; {progress.current}/{progress.total} sections
          </span>
        ) : (
          <span className="hp-row-meta">
            {game.players} Players &middot; {game.time}
          </span>
        )}
      </div>
      {game.readMinutes > 0 && (
        <div className={`hp-row-time-wrap${progress ? ' has-progress' : ''}`}>
          {progress && (
            <svg className="hp-row-time-ring" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="21" fill="none" stroke="var(--gold)" strokeWidth="2.5" opacity="0.25" />
              <circle
                cx="24" cy="24" r="21" fill="none"
                stroke="var(--green)" strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${Math.round((progress.current / progress.total) * 131.9)} 131.9`}
                transform="rotate(-90 24 24)"
              />
            </svg>
          )}
          <span className="hp-row-time">{game.readMinutes} min</span>
        </div>
      )}
      <svg className="hp-row-chevron" width="16" height="16" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </>
  );
}
