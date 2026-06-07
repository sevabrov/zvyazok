import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_utils/cors';
import { verifyGoogleToken } from './_utils/google';
import { supabase } from './_utils/supabase';
import type { UserRow } from './_utils/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { idToken, usedCards, currentBlock, lastCardId, gameStatus } =
    req.body ?? {};
  if (!idToken) return res.status(400).json({ error: 'Missing idToken' });

  let google;
  try {
    google = await verifyGoogleToken(idToken);
  } catch {
    return res.status(401).json({ error: 'Invalid Google token' });
  }

  try {
    const { data: user, error: selErr } = await supabase
      .from('users')
      .select('is_paid')
      .eq('google_sub', google.sub)
      .maybeSingle<Pick<UserRow, 'is_paid'>>();
    if (selErr) throw selErr;

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.is_paid) return res.status(403).json({ error: 'Not paid' });

    // is_paid is never taken from the request body — only read above to gate.
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (usedCards !== undefined) patch.used_cards = usedCards;
    if (currentBlock !== undefined) patch.current_block = currentBlock;
    if (lastCardId !== undefined) patch.last_card_id = lastCardId;
    if (gameStatus !== undefined) patch.game_status = gameStatus;

    const { error: updErr } = await supabase
      .from('users')
      .update(patch)
      .eq('google_sub', google.sub);
    if (updErr) throw updErr;

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('save-progress error', e);
    return res.status(500).json({ error: 'Database error' });
  }
}
