import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_utils/cors.js';
import { verifyGoogleToken } from './_utils/google.js';
import { supabase } from './_utils/supabase.js';
import { toUserState, type UserRow } from './_utils/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const idToken = req.body?.idToken as string | undefined;
  if (!idToken) return res.status(400).json({ error: 'Missing idToken' });

  let google;
  try {
    google = await verifyGoogleToken(idToken);
  } catch {
    return res.status(401).json({ error: 'Invalid Google token' });
  }

  const now = new Date().toISOString();

  try {
    const { data: existing, error: selErr } = await supabase
      .from('users')
      .select('*')
      .eq('google_sub', google.sub)
      .maybeSingle<UserRow>();
    if (selErr) throw selErr;

    if (existing) {
      const { data: updated, error: updErr } = await supabase
        .from('users')
        .update({
          email: google.email,
          name: google.name ?? null,
          last_login_at: now,
          updated_at: now,
        })
        .eq('google_sub', google.sub)
        .select('*')
        .single<UserRow>();
      if (updErr) throw updErr;
      return res.status(200).json({ user: toUserState(updated) });
    }

    const { data: created, error: insErr } = await supabase
      .from('users')
      .insert({
        google_sub: google.sub,
        email: google.email,
        name: google.name ?? null,
        is_paid: false,
        game_status: 'not_started',
        used_cards: {},
        last_login_at: now,
      })
      .select('*')
      .single<UserRow>();
    if (insErr) throw insErr;

    return res.status(200).json({ user: toUserState(created) });
  } catch (e) {
    console.error('me error', e);
    return res.status(500).json({ error: 'Database error' });
  }
}
