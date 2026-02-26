'use client';

import { useAuth } from '@/lib/auth-context';
import { GoogleLogin } from '@react-oauth/google';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function LoginForm() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  const returnUrl = searchParams.get('returnUrl') || '/';

  useEffect(() => {
    if (user) {
      router.push(returnUrl);
    }
  }, [user, router, returnUrl]);

  if (loading) return null;
  if (user) return null;

  return (
    <div className="login-screen">
      <Link href={returnUrl} className="login-back-link" aria-label="Go back">
        &larr; Back
      </Link>
      <div className="login-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/logo.svg" alt="Learn to Play" className="login-logo" />
        <h1 className="login-title">Learn to Play</h1>
        <p className="login-tagline">Interactive teaching guides for board games</p>
      </div>

      <div className="login-action">
        {error && <p className="login-error">{error}</p>}

        <div className="login-google-btn">
          <GoogleLogin
            onSuccess={async (response) => {
              try {
                if (response.credential) {
                  await login(response.credential);
                }
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Login failed');
              }
            }}
            onError={() => setError('Google sign-in failed')}
            theme="filled_black"
            shape="rectangular"
            size="large"
          />
        </div>
        <p className="login-fine-print">Sign in with Google to access your guides</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
