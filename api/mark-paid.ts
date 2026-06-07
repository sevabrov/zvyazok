import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_utils/cors.js';
import { getSessionUser } from './_utils/session.js';
import { supabase } from './_utils/supabase.js';
import { toUserState, type UserRow } from './_utils/types.js';

/**
 * Mark the authenticated user as paid. Called by the frontend on the WayForPay
 * return (?payment=success). NOTE: this trusts the client — it is not verified
 * against WayForPay. Replace with a signed server-to-server WayForPay webhook
 * (serviceUrl + merchantSecret) for a tamper-proof flow.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getSessionUser(req);
  if (!session) return res.status(401).json({ error: 'No valid session' });

  try {
    const { data: row, error } = await supabase
      .from('users')
      .update({ is_paid: true, updated_at: new Date().toISOString() })
      .eq('google_sub', session.sub)
      .select('*')
      .single<UserRow>();
    if (error) throw error;
    if (!row) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json({ user: toUserState(row) });
  } catch (e) {
    console.error('mark-paid error', e);
    return res.status(500).json({ error: 'Database error' });
  }
}
