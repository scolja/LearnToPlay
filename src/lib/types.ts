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

// ---------------------------------------------------------------------------
// Section-based content model
// ---------------------------------------------------------------------------

export interface GuideMeta {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  designer: string;
  artist: string | null;
  publisher: string;
  publisherUrl: string | null;
  year: number;
  players: string;
  time: string;
  age: string;
  bggUrl: string | null;
  heroGradient: string | null;
  heroImage: string | null;
  customCss: string | null;
  createdAt: string;
  sectionCount: number;
  readMinutes: number;
}

export interface GuideSection {
  id: string;
  guideId: string;
  sortOrder: number;
  title: string | null;
  content: string;
  notes: string | null;
  displayData: Record<string, unknown> | null;
  versionNumber: number;
}

export interface DbGlossaryEntry {
  id: string;
  guideId: string;
  sectionId: string | null;
  term: string;
  definition: string;
  searchTerms: string | null;
  groupName: string | null;
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// Rendered content blocks (for the mobile card viewer)
// ---------------------------------------------------------------------------

export type ContentBlock =
  | { type: 'html'; html: string }
  | { type: 'callout'; html: string; style: 'info' | 'danger' }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'quiz'; questions: QuizQuestion[] }
  | { type: 'flow'; items: string[] }
  | { type: 'diagram'; svg: string }
  | { type: 'strip'; items: { num: number; label: string }[] }
  | { type: 'styled-html'; html: string }
  | { type: 'dice-roller' }
  | { type: 'grid-visual'; html: string };

export interface QuizQuestion {
  question: string;
  options: { text: string; correct: boolean }[];
  correctFeedback: string;
  incorrectFeedback: string;
}

export interface NoteCard {
  label: string;
  color: string;
  html: string;
}

export interface RenderedSection {
  id: string;
  sortOrder: number;
  title: string | null;
  blocks: ContentBlock[];
  notes: NoteCard[];
}
