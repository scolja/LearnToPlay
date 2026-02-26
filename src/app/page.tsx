import { getAllGuides } from '@/lib/repositories/section-repository';
import type { GuideMeta } from '@/lib/types';
import { HomePageContent } from '@/components/HomePageContent';

export const revalidate = 3600; // ISR: revalidate every hour

export default async function Home() {
  let games: GuideMeta[] = [];
  try {
    games = await getAllGuides();
  } catch (err) {
    console.error('[home] Failed to load guides from DB:', err);
  }

  return <HomePageContent games={games} />;
}
