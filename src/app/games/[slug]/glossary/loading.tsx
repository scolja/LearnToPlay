export default function GlossaryLoading() {
  return (
    <main>
      <div className="gl-shell">
        {/* Top bar */}
        <header className="gl-topbar">
          <div className="cv-back" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </div>
          <h1 className="gl-topbar-title">Glossary</h1>
        </header>

        {/* Search */}
        <div className="gl-search-wrap">
          <div className="gl-search skel-input" />
        </div>

        {/* Skeleton entries */}
        <div className="gl-content">
          <div className="skel-group-header" />
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="gl-entry" style={{ pointerEvents: 'none' }}>
              <div className="skel-line skel-term" />
              <div className="skel-line skel-def" />
              <div className="skel-line skel-def-short" />
            </div>
          ))}
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
          <span className="cv-tab">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M4 19.5V5a2 2 0 012-2h14v14H6.5A2.5 2.5 0 004 19.5z" />
            </svg>
            <span>Learn</span>
          </span>
          <span className="cv-tab cv-tab-active">
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
