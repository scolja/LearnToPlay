import { NextResponse } from 'next/server';
import { getCurrentUser, type TokenPayload } from './auth';

/**
 * Require the current request to be from an admin user.
 * Returns the token payload if admin, or a 401/403 NextResponse.
 */
export async function requireAdmin(): Promise<TokenPayload | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (!user.roles.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return user;
}
