'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme, type Theme } from '@/lib/theme-context';
import { useSettings, type FontSize } from '@/lib/settings-context';
import { useAuth } from '@/lib/auth-context';
import { useNativeGoogleLogin } from '@/lib/useNativeGoogleLogin';
import { GoogleLogin } from '@react-oauth/google';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
  {
    value: 'classic',
    label: 'Classic',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
];

const fontSizes: { value: FontSize; label: string; sampleSize: string }[] = [
  { value: 'small',   label: 'S',  sampleSize: '13px' },
  { value: 'normal',  label: 'A',  sampleSize: '16px' },
  { value: 'large',   label: 'A',  sampleSize: '20px' },
  { value: 'x-large', label: 'A',  sampleSize: '24px' },
];

const DISMISS_THRESHOLD = 0.3; // 30% of panel height

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useSettings();
  const router = useRouter();
  const { user, loading: authLoading, login, logout } = useAuth();
  const { isNative, nativeLogin } = useNativeGoogleLogin();
  const isAdmin = !!user && user.roles.includes('admin');
  const [loginError, setLoginError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [closing, setClosing] = useState(false);
  const touchStartY = useRef(0);
  const panelHeight = useRef(0);

  // Animated close — slide down then unmount
  const animateClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setDragY(0);
      onClose();
    }, 200);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') animateClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, animateClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Touch handlers for swipe-to-dismiss
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    if (panelRef.current) {
      panelHeight.current = panelRef.current.offsetHeight;
    }
    setIsDragging(true);
    setDragY(0);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    // Only allow dragging downward (positive = down)
    setDragY(Math.max(0, dy));
  }, [isDragging]);

  const onTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (panelHeight.current > 0 && dragY / panelHeight.current > DISMISS_THRESHOLD) {
      // Past threshold — dismiss
      animateClose();
    } else {
      // Snap back
      setDragY(0);
    }
  }, [isDragging, dragY, animateClose]);

  if (!open && !closing) return null;

  const panelStyle: React.CSSProperties = {};
  if (isDragging) {
    panelStyle.transform = `translateY(${dragY}px)`;
    panelStyle.transition = 'none';
  } else if (closing) {
    panelStyle.transform = 'translateY(100%)';
    panelStyle.transition = 'transform 0.2s ease-in';
  } else if (dragY > 0) {
    // Snapping back
    panelStyle.transform = 'translateY(0)';
    panelStyle.transition = 'transform 0.2s ease-out';
  }

  return (
    <div
      className={`sd-overlay${closing ? ' sd-closing' : ''}`}
      onClick={animateClose}
    >
      <div
        ref={panelRef}
        className="sd-panel"
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle */}
        <div className="sd-drag-handle">
          <div className="sd-drag-bar" />
        </div>

        {/* Header */}
        <div className="sd-header">
          <h2 className="sd-title">Settings</h2>
          <button className="sd-close" onClick={animateClose} aria-label="Close settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Account */}
        <div className="sd-section">
          <div className="sd-label">Account</div>
          {authLoading ? (
            <div className="sd-account-loading" />
          ) : user ? (
            <div className="sd-account-signed-in">
              <div className="sd-account-identity">
                {user.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.picture}
                    alt=""
                    className="sd-account-avatar"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="sd-account-avatar-placeholder" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
                <div className="sd-account-info">
                  <span className="sd-account-name">{user.name}</span>
                  <span className="sd-account-email">{user.email}</span>
                </div>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  className="sd-account-signout"
                  onClick={() => { animateClose(); router.push('/admin/users'); }}
                >
                  <svg className="sd-btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Manage Users
                </button>
              )}
              <button
                type="button"
                className="sd-account-signout"
                onClick={() => logout()}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="sd-account-signed-out">
              {loginError && (
                <p className="sd-account-error">{loginError}</p>
              )}
              <div className="sd-google-btn-wrap">
                {isNative ? (
                  <button
                    type="button"
                    className="login-native-google-btn"
                    disabled={signingIn}
                    onClick={async () => {
                      setLoginError('');
                      setSigningIn(true);
                      try {
                        const idToken = await nativeLogin();
                        await login(idToken);
                      } catch (err) {
                        setLoginError(err instanceof Error ? err.message : 'Sign-in failed');
                      } finally {
                        setSigningIn(false);
                      }
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    <span>{signingIn ? 'Signing in\u2026' : 'Sign in with Google'}</span>
                  </button>
                ) : (
                  <GoogleLogin
                    onSuccess={async (response) => {
                      setLoginError('');
                      try {
                        if (response.credential) {
                          await login(response.credential);
                        }
                      } catch (err) {
                        setLoginError(err instanceof Error ? err.message : 'Sign-in failed');
                      }
                    }}
                    onError={() => setLoginError('Google sign-in failed')}
                    theme="filled_black"
                    shape="rectangular"
                    size="large"
                  />
                )}
              </div>
              <p className="sd-account-fine-print">
                Sign in to sync your reading progress across devices.
              </p>
            </div>
          )}
        </div>

        {/* Theme */}
        <div className="sd-section">
          <div className="sd-label">Theme</div>
          <div className="sd-segmented">
            {themes.map(t => (
              <button
                key={t.value}
                className={`sd-seg-btn${t.value === theme ? ' sd-seg-active' : ''}`}
                onClick={() => setTheme(t.value)}
              >
                <span className="sd-seg-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="sd-section">
          <div className="sd-label">Font Size</div>
          <div className="sd-segmented">
            {fontSizes.map(s => (
              <button
                key={s.value}
                className={`sd-seg-btn sd-font-btn${s.value === fontSize ? ' sd-seg-active' : ''}`}
                onClick={() => setFontSize(s.value)}
              >
                <span style={{ fontSize: s.sampleSize, lineHeight: 1 }}>{s.label}</span>
              </button>
            ))}
          </div>
          <p className="sd-preview">
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>

        {/* Version */}
        <div className="sd-version">
          v{process.env.NEXT_PUBLIC_APP_VERSION} · {process.env.NEXT_PUBLIC_APP_ENV}
        </div>
      </div>
    </div>
  );
}
