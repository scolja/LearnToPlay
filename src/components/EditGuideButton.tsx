'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function EditGuideButton({ slug }: { slug: string }) {
  const { isEditor } = useAuth();

  if (!isEditor) return null;

  return (
    <Link href={`/games/${slug}/edit/`} className="hero-edit-btn">
      Edit Guide
    </Link>
  );
}
