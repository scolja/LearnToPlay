import { NextResponse } from 'next/server';
import { getRefreshTokenFromCookies, clearAuthCookies } from '@/lib/auth';
import { revokeRefreshToken } from '@/lib/repositories/token-repository';

export async function POST() {
  try {
    const token = await getRefreshTokenFromCookies();
    if (token) {
      await revokeRefreshToken(token);
    }
    await clearAuthCookies();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Logout error:', err);
    await clearAuthCookies();
    return NextResponse.json({ ok: true });
  }
}
