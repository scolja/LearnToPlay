import type { Metadata } from 'next';
import { DownloadsContent } from '@/components/mobile/DownloadsContent';

export const metadata: Metadata = {
  title: 'Downloads — Learn to Play',
  description: 'Manage offline guides',
};

export default function DownloadsPage() {
  return (
    <main>
      <DownloadsContent />
    </main>
  );
}
