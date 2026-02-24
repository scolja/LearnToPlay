'use client';

import { GameFrontmatter } from '@/lib/types';

interface FrontmatterEditorProps {
  frontmatter: GameFrontmatter;
  onChange: (fm: GameFrontmatter) => void;
}

const FIELDS: { key: keyof GameFrontmatter; label: string; type?: string }[] = [
  { key: 'title', label: 'Title' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'designer', label: 'Designer' },
  { key: 'artist', label: 'Artist' },
  { key: 'publisher', label: 'Publisher' },
  { key: 'publisherUrl', label: 'Publisher URL' },
  { key: 'year', label: 'Year', type: 'number' },
  { key: 'players', label: 'Players' },
  { key: 'time', label: 'Time' },
  { key: 'age', label: 'Age' },
  { key: 'bggUrl', label: 'BGG URL' },
  { key: 'heroImage', label: 'Hero Image' },
];

export function FrontmatterEditor({ frontmatter, onChange }: FrontmatterEditorProps) {
  const handleChange = (key: keyof GameFrontmatter, value: string) => {
    onChange({
      ...frontmatter,
      [key]: key === 'year' ? (parseInt(value) || 0) : value,
    });
  };

  return (
    <div className="fm-editor">
      {FIELDS.map(({ key, label, type }) => (
        <div key={key} className="fm-field">
          <label>{label}</label>
          <input
            type={type || 'text'}
            value={String(frontmatter[key] ?? '')}
            onChange={e => handleChange(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
