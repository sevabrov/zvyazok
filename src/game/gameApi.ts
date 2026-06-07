const API = import.meta.env.VITE_API_URL;

export interface SaveProgressInput {
  idToken: string;
  usedCards: Record<string, number[]>;
  currentBlock?: string;
  lastCardId?: string;
  gameStatus?: string;
}

/** Persist game progress for the authenticated, paid user. */
export async function saveProgress(input: SaveProgressInput): Promise<void> {
  const res = await fetch(`${API}/api/save-progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `save-progress failed: ${res.status}`);
  }
}
