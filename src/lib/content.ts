import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { GameFrontmatter, GameGuide } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'games');

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
