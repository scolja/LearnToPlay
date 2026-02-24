'use client';

let refreshPromise: Promise<Response> | null = null;

async function refreshToken(): Promise<boolean> {
  // Deduplicate concurrent refresh calls
  if (!refreshPromise) {
    refreshPromise = fetch('/api/auth/refresh', { method: 'POST' });
  }
  try {
    const res = await refreshPromise;
    return res.ok;
  } finally {
    refreshPromise = null;
  }
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, { ...options, credentials: 'same-origin' });

  if (res.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return fetch(url, { ...options, credentials: 'same-origin' });
    }
  }

  return res;
}
