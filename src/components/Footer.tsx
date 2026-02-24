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
  return (
    <footer>
      <p>
        <strong>{title}</strong> © {year} {publisher}. Designed by {designer}.
        {artist && ` Illustrated by ${artist}.`}
      </p>
      {publisherUrl && (
        <p>
          Published by <a href={publisherUrl} target="_blank" rel="noopener noreferrer">{publisher}</a>.
          {bggUrl && <>{' '}View on <a href={bggUrl} target="_blank" rel="noopener noreferrer">BoardGameGeek</a>.</>}
        </p>
      )}
      <p style={{ marginTop: '0.5rem' }}>
        This is an independent educational resource, not affiliated with or endorsed by the publisher.
      </p>
    </footer>
  );
}
