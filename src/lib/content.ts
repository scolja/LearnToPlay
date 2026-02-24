import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { GameFrontmatter, GameGuide } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'games');

// --- Filesystem-only reads (used for static generation & fallback) ---

export function getAllGames(): { slug: string; frontmatter: GameFrontmatter }[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));
  return files
    .map(filename => {
      const slug = filename.replace(/\.mdx$/, '');
      const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf-8');
      const { data } = matter(raw);
      return { slug, frontmatter: data as GameFrontmatter };
    })
    .filter(({ frontmatter }) => !frontmatter.draft)
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
}

export function getGameBySlug(slug: string): GameGuide {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, `${slug}.mdx`), 'utf-8');
  const { data, content } = matter(raw);
  return { slug, frontmatter: data as GameFrontmatter, content };
}

// --- DB-first reads (for hybrid rendering) ---

export async function getGameContent(slug: string): Promise<GameGuide> {
  // Try DB first (lazy import to avoid loading mssql when DB isn't configured)
  try {
    const { getCurrentVersion } = await import('./repositories/guide-repository');
    const version = await getCurrentVersion(slug);
    if (version) {
      const frontmatter = JSON.parse(version.FrontmatterJson) as GameFrontmatter;
      return { slug, frontmatter, content: version.Content };
    }
  } catch {
    // DB not available or not configured, fall through to filesystem
  }

  // Fallback to filesystem
  return getGameBySlug(slug);
}

export async function getAllGameSlugs(): Promise<string[]> {
  // Get filesystem slugs
  const fsSlugs = fs.existsSync(CONTENT_DIR)
    ? fs.readdirSync(CONTENT_DIR)
        .filter(f => f.endsWith('.mdx'))
        .map(f => f.replace(/\.mdx$/, ''))
    : [];

  // Try DB slugs
  let dbSlugs: string[] = [];
  try {
    const { getAllDbSlugs } = await import('./repositories/guide-repository');
    dbSlugs = await getAllDbSlugs();
  } catch {
    // DB not available
  }

  // Union of both
  return [...new Set([...fsSlugs, ...dbSlugs])];
}
