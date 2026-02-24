import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="homepage">
      <div className="hero">
        <div className="hero-badge">Board Game Teacher</div>
        <h1>Page Not Found</h1>
        <p className="hero-sub">The guide you&apos;re looking for doesn&apos;t exist.</p>
      </div>
      <div className="hero-fade" />
      <div className="page-wrap">
        <div className="empty-state">
          <p><Link href="/">Back to all guides</Link></p>
        </div>
      </div>
    </div>
  );
}
