// Our first-party session token, persisted so the user stays logged in across
// page refreshes. Sent to the API as `Authorization: Bearer <token>`.
//
// Note: localStorage is readable by JS, so this token is exposed to XSS — the
// same trade-off every SPA that holds a bearer token makes. We accept it here
// because the frontend and API live on different sites, which makes secure
// HttpOnly cookies unreliable (Safari/Firefox block them as third-party).
const KEY = 'zvyazok.session';

export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setSessionToken(token: string): void {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    /* ignore storage failures (private mode, quota) */
  }
}

export function clearSessionToken(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
