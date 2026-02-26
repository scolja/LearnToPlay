export default function GameLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="hero">
        <div className="skel-line" style={{ height: 20, width: 100, marginBottom: 12 }} />
        <div className="skel-line" style={{ height: 32, width: '70%', marginBottom: 8 }} />
        <div className="skel-line" style={{ height: 14, width: '45%', marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <div className="skel-line" style={{ height: 12, width: 70 }} />
          <div className="skel-line" style={{ height: 12, width: 50 }} />
          <div className="skel-line" style={{ height: 12, width: 60 }} />
        </div>
      </div>
      <div className="hero-fade" />

      {/* Content skeleton */}
      <div className="page-wrap">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="row" style={{ pointerEvents: 'none' }}>
            <div className="main">
              <div className="skel-line" style={{ height: 12, width: 60, marginBottom: 8 }} />
              <div className="skel-line" style={{ height: 22, width: '50%', marginBottom: 16 }} />
              <div className="skel-line" style={{ height: 13, width: '95%', marginBottom: 8 }} />
              <div className="skel-line" style={{ height: 13, width: '90%', marginBottom: 8 }} />
              <div className="skel-line" style={{ height: 13, width: '70%', marginBottom: 8 }} />
              <div className="skel-line" style={{ height: 13, width: '85%', marginBottom: 8 }} />
              <div className="skel-line" style={{ height: 13, width: '60%' }} />
            </div>
            <div className="side">
              <div className="skel-card" style={{ minHeight: 100 }}>
                <div className="skel-line" style={{ height: 10, width: 50, marginBottom: 12 }} />
                <div className="skel-line" style={{ height: 12, width: '90%', marginBottom: 6 }} />
                <div className="skel-line" style={{ height: 12, width: '75%' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
