'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { isNativePlatform } from './capacitor';

interface UseNativeGoogleLoginReturn {
  isNative: boolean;
  nativeLogin: () => Promise<string>;
  initializing: boolean;
  error: string | null;
}

export function useNativeGoogleLogin(): UseNativeGoogleLoginReturn {
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isNative = isNativePlatform();
  const initRef = useRef(false);

  useEffect(() => {
    if (!isNative) {
      setInitializing(false);
      return;
    }

    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      try {
        const { SocialLogin } = await import('@capgo/capacitor-social-login');
        await SocialLogin.initialize({
          google: {
            webClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          },
        });
      } catch (err) {
        console.error('SocialLogin init failed:', err);
        setError('Failed to initialize Google Sign-In');
      } finally {
        setInitializing(false);
      }
    })();
  }, [isNative]);

  const nativeLogin = useCallback(async (): Promise<string> => {
    const { SocialLogin } = await import('@capgo/capacitor-social-login');
    const res = await SocialLogin.login({
      provider: 'google',
      options: {},
    });
    const result = res.result;
    if (result.responseType === 'offline' || !result.idToken) {
      throw new Error('Google Sign-In did not return an ID token');
    }
    return result.idToken;
  }, []);

  return { isNative, nativeLogin, initializing, error };
}
