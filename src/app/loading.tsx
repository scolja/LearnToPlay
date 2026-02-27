export default function HomeLoading() {
  return (
    <div className="hp-shell hp-loading">
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

      {/* Search bar placeholder */}
      <div className="hp-search-wrap">
        <div className="hp-search-inner">
          <svg className="hp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <div className="skel-line" style={{ height: 20, width: '60%', margin: '9px 0' }} />
        </div>
      </div>

      {/* Skeleton game rows */}
      <div className="hp-content">
        <section className="hp-section">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="hp-row hp-row-mobile" style={{ pointerEvents: 'none' }}>
              <div className="hp-row-thumb-wrap">
                <div className="hp-row-thumb hp-row-thumb-placeholder skel-line" />
              </div>
              <div className="hp-row-info">
                <div className="skel-line" style={{ height: 14, width: `${55 + (i % 3) * 15}%`, marginBottom: 6 }} />
                <div className="skel-line" style={{ height: 11, width: '45%' }} />
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
