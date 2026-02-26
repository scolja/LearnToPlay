'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { SettingsProvider } from '@/lib/settings-context';
import { isNativePlatform } from '@/lib/capacitor';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const inner = (
    <AuthProvider>
      <ThemeProvider>
        <SettingsProvider>
          {children}
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
