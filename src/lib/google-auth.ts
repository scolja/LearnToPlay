import { OAuth2Client } from 'google-auth-library';

let client: OAuth2Client | null = null;

function getClient(): OAuth2Client {
  if (!client) {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error('GOOGLE_CLIENT_ID or NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured');
    client = new OAuth2Client(clientId);
  }
  return client;
}

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

export async function verifyGoogleCredential(credential: string): Promise<GoogleUserInfo> {
  const ticket = await getClient().verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.sub) {
    throw new Error('Invalid Google credential');
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email,
    picture: payload.picture,
  };
}
