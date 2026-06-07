import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleUser {
  sub: string;
  email: string;
  name?: string;
}

/**
 * Verify a Google ID Token and return the verified identity. Throws if the
 * token is invalid or missing required claims.
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleUser> {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new Error('Invalid Google token payload');
  }

  return { sub: payload.sub, email: payload.email, name: payload.name };
}
