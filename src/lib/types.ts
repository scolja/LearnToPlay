export interface GlossaryEntry {
  term: string;
  definition: string;
  step: string;
  searchTerms: string;
  group?: string;
}

export interface GameFrontmatter {
  title: string;
  slug: string;
  subtitle: string;
  designer: string;
  artist?: string;
  publisher: string;
  publisherUrl?: string;
  year: number;
  players: string;
  time: string;
  age: string;
  bggUrl?: string;
  heroGradient?: string;
  heroImage?: string;
  draft?: boolean;
  glossary?: GlossaryEntry[];
}

export interface GameGuide {
  slug: string;
  frontmatter: GameFrontmatter;
  content: string;
}
