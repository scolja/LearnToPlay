import { NextResponse } from 'next/server';
import { signAccessToken, getRefreshTokenFromCookies, setAuthCookies } from '@/lib/auth';
import { findValidRefreshToken, revokeRefreshToken, createRefreshToken } from '@/lib/repositories/token-repository';
import { findUserById, parseRoles } from '@/lib/repositories/user-repository';

export async function POST() {
  try {
    const oldToken = await getRefreshTokenFromCookies();
    if (!oldToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    const tokenRecord = await findValidRefreshToken(oldToken);
    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    // Revoke old token (rotation)
    await revokeRefreshToken(oldToken);

    const user = await findUserById(tokenRecord.UserId);
    if (!user || !user.IsActive) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
    }

    const roles = parseRoles(user.Roles);
    const accessToken = await signAccessToken({
      sub: user.Id,
      email: user.Email,
      name: user.DisplayName,
      roles,
      picture: user.ProfilePictureUrl ?? undefined,
    });
    const newRefreshToken = await createRefreshToken(user.Id);

    await setAuthCookies(accessToken, newRefreshToken);

    return NextResponse.json({
      user: {
        id: user.Id,
        email: user.Email,
        name: user.DisplayName,
        picture: user.ProfilePictureUrl,
        roles,
      },
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
  }
}
