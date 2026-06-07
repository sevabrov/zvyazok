export interface UserRow {
  id: string;
  google_sub: string;
  email: string;
  name: string | null;
  is_paid: boolean;
  game_status: string;
  used_cards: Record<string, number[]>;
  current_block: string | null;
  last_card_id: string | null;
}

/** Shape returned to the frontend. */
export interface UserState {
  email: string;
  name?: string;
  isPaid: boolean;
  gameStatus: string;
  usedCards: Record<string, number[]>;
  currentBlock: string | null;
  lastCardId: string | null;
}

export function toUserState(row: UserRow): UserState {
  return {
    email: row.email,
    name: row.name ?? undefined,
    isPaid: row.is_paid,
    gameStatus: row.game_status,
    usedCards: row.used_cards ?? {},
    currentBlock: row.current_block,
    lastCardId: row.last_card_id,
  };
}
