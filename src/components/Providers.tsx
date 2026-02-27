'use client';

import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { SettingsProvider } from '@/lib/settings-context';
import { OfflineProvider } from '@/lib/offline-context';
import { isNativePlatform } from '@/lib/capacitor';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  // Tag the document so CSS can force mobile layout in native app
  useEffect(() => {
    if (isNativePlatform()) {
      document.documentElement.setAttribute('data-native-app', '');
    }
  }, []);

  const inner = (
    <AuthProvider>
      <ThemeProvider>
        <SettingsProvider>
          <OfflineProvider>
            {children}
          </OfflineProvider>
        </SettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  );

  // Skip GoogleOAuthProvider on native — GIS doesn't work in WebView
  if (isNativePlatform()) {
    return inner;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {inner}
    </GoogleOAuthProvider>
  );
}
