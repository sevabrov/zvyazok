import type { UserState } from './types';

const API = import.meta.env.VITE_API_URL;

export interface AuthResult {
  user: UserState;
  /** First-party session token to persist and send on subsequent requests. */
  sessionToken: string;
}

/**
 * Initial login: send the Google ID Token to the backend, which verifies it
 * once and returns the user plus a long-lived session token of our own.
 */
export async function fetchMe(idToken: string): Promise<AuthResult> {
  const res = await fetch(`${API}/api/me`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `me failed: ${res.status}`);
  }
  return (await res.json()) as AuthResult;
}

/**
 * Restore a session on page load using a previously stored session token. The
 * backend returns the current user and a refreshed token (sliding expiry).
 */
export async function restoreSession(token: string): Promise<AuthResult> {
  const res = await fetch(`${API}/api/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `session restore failed: ${res.status}`);
  }
  return (await res.json()) as AuthResult;
}
