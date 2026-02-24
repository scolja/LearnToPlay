'use client';

import { useAuth } from '@/lib/auth-context';
import { GoogleLogin } from '@react-oauth/google';
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
    <div className="login-page">
      <div className="login-card">
        <h1>Sign In</h1>
        <p>Sign in with your Google account to access the guide editor.</p>

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
