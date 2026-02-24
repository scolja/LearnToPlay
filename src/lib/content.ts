import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { GameFrontmatter, GameGuide } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'games');

// --- Filesystem-only reads (fallback) ---

function getAllGamesFromFs(): { slug: string; frontmatter: GameFrontmatter }[] {
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

// --- DB-first reads (for homepage & static generation) ---

export async function getAllGames(): Promise<{ slug: string; frontmatter: GameFrontmatter }[]> {
  // Try DB first
  try {
    const { getAllCurrentGuides } = await import('./repositories/guide-repository');
    console.log('[content] Querying DB for all current guides...');
    const guides = await getAllCurrentGuides();
    console.log(`[content] DB returned ${guides.length} guides`);
    if (guides.length > 0) {
      const dbGames = guides.map(g => ({
        slug: g.Slug,
        frontmatter: JSON.parse(g.FrontmatterJson) as GameFrontmatter,
      }));
      // Merge with any filesystem-only games not in DB
      const fsGames = getAllGamesFromFs();
      const dbSlugs = new Set(dbGames.map(g => g.slug));
      const merged = [...dbGames, ...fsGames.filter(g => !dbSlugs.has(g.slug))];
      return merged
        .filter(({ frontmatter }) => !frontmatter.draft)
        .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
    }
  } catch (err) {
    console.error('[content] DB failed for getAllGames, falling back to filesystem:', err);
  }

  const fsGames = getAllGamesFromFs();
  console.log(`[content] Filesystem returned ${fsGames.length} games`);
  return fsGames;
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
    console.log(`[content] Querying DB for guide "${slug}"...`);
    const version = await getCurrentVersion(slug);
    if (version) {
      console.log(`[content] Loaded "${slug}" from DB (version ${version.VersionNumber})`);
      const frontmatter = JSON.parse(version.FrontmatterJson) as GameFrontmatter;
      return { slug, frontmatter, content: version.Content };
    }
    console.log(`[content] Guide "${slug}" not found in DB`);
  } catch (err) {
    console.error(`[content] DB failed for "${slug}", falling back to filesystem:`, err);
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
    console.log('[content] Querying DB for all slugs...');
    dbSlugs = await getAllDbSlugs();
    console.log(`[content] DB slugs: [${dbSlugs.join(', ')}]`);
  } catch (err) {
    console.error('[content] DB failed for getAllGameSlugs:', err);
  }

  // Union of both
  return [...new Set([...fsSlugs, ...dbSlugs])];
}
