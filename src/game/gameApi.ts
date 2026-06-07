import { getSessionToken } from '../auth/tokenStore';

const API = import.meta.env.VITE_API_URL;

export interface SaveProgressInput {
  usedCards: Record<string, number[]>;
  currentBlock?: string;
  lastCardId?: string;
  gameStatus?: string;
}

/** Persist game progress for the authenticated, paid user. */
export async function saveProgress(input: SaveProgressInput): Promise<void> {
  const token = getSessionToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API}/api/save-progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `save-progress failed: ${res.status}`);
  }
}
