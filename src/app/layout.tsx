import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Fraunces, Crimson_Pro, DM_Sans } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { UserMenu } from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson-pro',
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Learn to Play',
  description: 'Interactive teaching guides for board games.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'L2P',
  },
};

export const viewport: Viewport = {
  themeColor: '#1a1612',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="classic" suppressHydrationWarning
          className={`${fraunces.variable} ${crimsonPro.variable} ${dmSans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){try{var t=localStorage.getItem('ltp_theme');
          if(t&&['classic','light','dark'].indexOf(t)!==-1){
          document.documentElement.setAttribute('data-theme',t)}
          var f=localStorage.getItem('ltp_font_size');
          if(f&&['small','large','x-large'].indexOf(f)!==-1){
          document.documentElement.setAttribute('data-font-size',f)}
          if(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform()){
          document.documentElement.setAttribute('data-native-app','')}
          }catch(e){}})();
        `}} />
      </head>
      <body>
        <Providers>
          <div className="site-user-menu">
            <div className="site-controls">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
          {children}
        </Providers>
        <Script id="sw-register" strategy="lazyOnload">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
          }
        `}</Script>
      </body>
    </html>
  );
}
