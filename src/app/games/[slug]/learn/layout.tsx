import type { Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#1a1612',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
