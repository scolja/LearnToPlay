'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  roles: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  isEditor: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  isEditor: false,
});

const SESSION_KEY = 'ltp_session';
const REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutes
const PROGRESS_KEY_PREFIX = 'ltp-section-';

/** Upload all localStorage progress keys to the server after login */
async function syncLocalProgressToServer(): Promise<void> {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PROGRESS_KEY_PREFIX)) {
        keys.push(key);
      }
    }
  } catch { return; }

  for (const key of keys) {
    const slug = key.slice(PROGRESS_KEY_PREFIX.length);
    const saved = localStorage.getItem(key);
    if (!saved) continue;
    const currentSectionIndex = parseInt(saved, 10);
    if (isNaN(currentSectionIndex) || currentSectionIndex <= 0) continue;

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, currentSectionIndex, totalSections: 0 }),
      });
    } catch { /* continue with next */ }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem(SESSION_KEY, '1');
      } else {
        setUser(null);
        localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
        localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // Silently fail refresh
    }
  }, []);

  // Initial load: check if we might have a session
  useEffect(() => {
    const hasSession = localStorage.getItem(SESSION_KEY);
    if (hasSession) {
      fetchMe().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  // Periodic refresh
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [user, refresh]);

  // Refresh on visibility change
  useEffect(() => {
    if (!user) return;
    const handler = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [user, refresh]);

  const login = useCallback(async (credential: string) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    }
    const data = await res.json();
    setUser(data.user);
    localStorage.setItem(SESSION_KEY, '1');

    // Sync localStorage progress to server (fire-and-forget)
    syncLocalProgressToServer().catch(() => { /* silent */ });
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const isEditor = !!user && (user.roles.includes('editor') || user.roles.includes('admin'));

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isEditor }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
