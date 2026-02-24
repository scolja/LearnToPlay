interface FooterProps {
  title: string;
  year: number;
  designer: string;
  artist?: string;
  publisher: string;
  publisherUrl?: string;
  bggUrl?: string;
}

export function Footer({ title, year, designer, artist, publisher, publisherUrl, bggUrl }: FooterProps) {
  const publisherName = publisherUrl
    ? <a href={publisherUrl} target="_blank" rel="noopener noreferrer">{publisher}</a>
    : publisher;

  return (
    <footer>
      <p>
        <strong>{title}</strong> ({year}) is designed by {designer}
        {artist && <>, illustrated by {artist}</>}
        , and published by {publisherName}.
        {bggUrl && <>{' '}<a href={bggUrl} target="_blank" rel="noopener noreferrer">View on BoardGameGeek</a>.</>}
      </p>
      <p style={{ marginTop: '0.5rem' }}>
        This guide is an independent fan-made resource. It is not affiliated with or endorsed by {publisher}.
      </p>
      <div className="footer-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/logo.svg" alt="L2P" className="footer-logo" />
        <span>Learn to Play</span>
      </div>
    </footer>
  );
}
