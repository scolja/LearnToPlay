import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAccessTokenFromRequest, verifyAccessToken } from '@/lib/auth';

const EDIT_PATTERN = /^\/games\/[^/]+\/edit/;
const HISTORY_PATTERN = /^\/games\/[^/]+\/history/;
const GUIDE_API_PATTERN = /^\/api\/guides\//;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect edit pages — redirect to login
  if (EDIT_PATTERN.test(pathname) || HISTORY_PATTERN.test(pathname)) {
    const token = getAccessTokenFromRequest(request);
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const payload = await verifyAccessToken(token);
      if (!payload.roles.includes('editor') && !payload.roles.includes('admin')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect guide write APIs — return 401
  if (GUIDE_API_PATTERN.test(pathname) && request.method !== 'GET') {
    const token = getAccessTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const payload = await verifyAccessToken(token);
      if (!payload.roles.includes('editor') && !payload.roles.includes('admin')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/games/:slug/edit/:path*',
    '/games/:slug/history/:path*',
    '/api/guides/:path*',
  ],
};
