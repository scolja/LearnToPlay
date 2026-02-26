'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { SettingsProvider } from '@/lib/settings-context';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <ThemeProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
