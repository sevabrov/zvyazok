export function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const PROGRESS_KEY = 'zvyazok_progress';

type Progress = Record<string, string[]>;

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

/** Cards already revealed for a game type, restored from localStorage. */
export function loadSeenCards(gameType: string): string[] {
  const seen = readProgress()[gameType];
  return Array.isArray(seen) ? seen : [];
}

/** Persist the revealed cards for a game type so progress survives reloads. */
export function saveSeenCards(gameType: string, seen: string[]): void {
  try {
    const progress = readProgress();
    progress[gameType] = seen;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage failures (private mode, quota); progress stays in memory.
  }
}
