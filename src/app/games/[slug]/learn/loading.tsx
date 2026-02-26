export default function LearnLoading() {
  return (
    <main>
      <div className="cv-shell">
        {/* Top bar */}
        <header className="cv-topbar">
          <div className="cv-back" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </div>
          <h1 className="cv-topbar-title">
            <div className="skel-line skel-title" />
          </h1>
          <div className="cv-toc-btn skel-counter" aria-hidden>
            <div className="skel-line skel-counter-text" />
          </div>
        </header>

        {/* Progress dots placeholder */}
        <div className="pd-bar" aria-hidden>
          <div className="skel-dots">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="skel-dot" />
            ))}
          </div>
        </div>

        {/* Card content skeleton */}
        <div className="cv-content">
          <div className="skel-card">
            <div className="skel-line skel-card-title" />
            <div className="skel-line skel-card-body" />
            <div className="skel-line skel-card-body" />
            <div className="skel-line skel-card-body-short" />
            <div className="skel-spacer" />
            <div className="skel-line skel-card-body" />
            <div className="skel-line skel-card-body" />
            <div className="skel-line skel-card-body-short" />
          </div>
        </div>

        {/* Section navigation */}
        <div className="cv-section-nav">
          <div className="cv-nav-btn skel-nav-btn" aria-hidden>
            <span>Prev</span>
          </div>
          <span className="cv-nav-label">
            <div className="skel-line skel-nav-label" />
          </span>
          <div className="cv-nav-btn skel-nav-btn" aria-hidden>
            <span>Next</span>
          </div>
        </div>

        {/* Bottom tab bar */}
        <nav className="cv-bottombar">
          <span className="cv-tab">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12l9-8 9 8" />
              <path d="M5 10v10h5v-6h4v6h5V10" />
            </svg>
            <span>Home</span>
          </span>
          <span className="cv-tab cv-tab-active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M4 19.5V5a2 2 0 012-2h14v14H6.5A2.5 2.5 0 004 19.5z" />
            </svg>
            <span>Learn</span>
          </span>
          <span className="cv-tab">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span>Glossary</span>
          </span>
        </nav>
      </div>
    </main>
  );
}
