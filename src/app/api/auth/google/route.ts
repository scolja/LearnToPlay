import { NextResponse } from 'next/server';
import { verifyGoogleCredential } from '@/lib/google-auth';
import { signAccessToken, setAuthCookies } from '@/lib/auth';
import { findUserByGoogleId, findUserByEmail, createUser, updateUserLogin, parseRoles } from '@/lib/repositories/user-repository';
import { createRefreshToken } from '@/lib/repositories/token-repository';

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();
    if (!credential) {
      return NextResponse.json({ error: 'Missing credential' }, { status: 400 });
    }

    const googleUser = await verifyGoogleCredential(credential);

    // Find existing user by Google ID or email
    let user = await findUserByGoogleId(googleUser.googleId)
      ?? await findUserByEmail(googleUser.email);

    if (user) {
      // Update login info
      await updateUserLogin(user.Id, {
        displayName: googleUser.name,
        profilePictureUrl: googleUser.picture,
        googleId: googleUser.googleId,
      });
    } else {
      // Create new user (no roles by default)
      user = await createUser({
        email: googleUser.email,
        displayName: googleUser.name,
        googleId: googleUser.googleId,
        profilePictureUrl: googleUser.picture,
      });
    }

    if (!user.IsActive) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });
    }

    const roles = parseRoles(user.Roles);
    const accessToken = await signAccessToken({
      sub: user.Id,
      email: user.Email,
      name: user.DisplayName,
      roles,
      picture: user.ProfilePictureUrl ?? undefined,
    });
    const refreshToken = await createRefreshToken(user.Id);

    await setAuthCookies(accessToken, refreshToken);

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
    const message = err instanceof Error ? err.message : String(err);
    console.error('Google auth error:', message);
    console.error('Full error:', err);
    console.error('GOOGLE_CLIENT_ID set:', !!process.env.GOOGLE_CLIENT_ID);
    console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID set:', !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
