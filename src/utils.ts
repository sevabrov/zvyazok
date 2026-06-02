export function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const PROGRESS_KEY = 'zvyazok_progress';

type Progress = Record<string, number[]>;

function readProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Progress) : {};
  } catch {
    return {};
  }
}

/**
 * Indices of cards already revealed for a game type, restored from localStorage.
 * Cards are tracked by index (not text) so progress is shared across languages —
 * the locale arrays are parallel, so index N is "the same card" in any language.
 */
export function loadSeenCards(gameType: string): number[] {
  const seen = readProgress()[gameType];
  return Array.isArray(seen) ? seen.filter((i) => typeof i === 'number') : [];
}

/** Persist the revealed card indices for a game type so progress survives reloads. */
export function saveSeenCards(gameType: string, seen: number[]): void {
  try {
    const progress = readProgress();
    progress[gameType] = seen;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage failures (private mode, quota); progress stays in memory.
  }
}
