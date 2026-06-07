import type { VercelRequest } from '@vercel/node';
import jwt from 'jsonwebtoken';

/**
 * First-party session token. We verify the Google ID Token only once at login,
 * then issue our own short-lived JWT that the frontend stores and sends back as
 * `Authorization: Bearer <token>`. This is Google's recommended pattern — the
 * Google ID Token proves identity once; the session is ours to control.
 */

// Sessions last this long. Active users get a fresh token on every restore
// (see issueSession callers), so the window slides and they stay logged in.
const SESSION_TTL = '14d';

export interface SessionPayload {
  sub: string;
  email: string;
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not configured');
  return s;
}

/** Sign a new session token for the given identity. */
export function issueSession(payload: SessionPayload): string {
  return jwt.sign(payload, secret(), { expiresIn: SESSION_TTL });
}

/**
 * Read and verify the session token from the Authorization header. Returns the
 * payload, or null if the header is missing/malformed or the token is invalid
 * or expired.
 */
export function getSessionUser(req: VercelRequest): SessionPayload | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, secret()) as jwt.JwtPayload;
    if (typeof decoded.sub !== 'string' || typeof decoded.email !== 'string') {
      return null;
    }
    return { sub: decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}
