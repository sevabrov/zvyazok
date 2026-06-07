import type { UserState } from './types';

const API = import.meta.env.VITE_API_URL;

/** Send the Google ID Token to the backend; get back the user state. */
export async function fetchMe(idToken: string): Promise<UserState> {
  const res = await fetch(`${API}/api/me`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `me failed: ${res.status}`);
  }
  const data = (await res.json()) as { user: UserState };
  return data.user;
}
