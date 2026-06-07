import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_utils/cors.js';
import { verifyGoogleToken } from './_utils/google.js';
import { issueSession, getSessionUser } from './_utils/session.js';
import { supabase } from './_utils/supabase.js';
import { toUserState, type UserRow } from './_utils/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;

  // GET restores an existing session: the frontend sends its stored session
  // token as `Authorization: Bearer`, so no Google round-trip is needed. This
  // is what keeps the user logged in across page refreshes.
  if (req.method === 'GET') return restoreSession(req, res);
  // POST is the initial login: exchange a Google ID Token for our session.
  if (req.method === 'POST') return login(req, res);

  return res.status(405).json({ error: 'Method not allowed' });
}

async function login(req: VercelRequest, res: VercelResponse) {
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

    let row: UserRow;
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
      row = updated;
    } else {
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
      row = created;
    }

    const sessionToken = issueSession({ sub: row.google_sub, email: row.email });
    return res.status(200).json({ user: toUserState(row), sessionToken });
  } catch (e) {
    console.error('me login error', e);
    return res.status(500).json({ error: 'Database error' });
  }
}

async function restoreSession(req: VercelRequest, res: VercelResponse) {
  const session = getSessionUser(req);
  if (!session) return res.status(401).json({ error: 'No valid session' });

  try {
    const { data: row, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_sub', session.sub)
      .maybeSingle<UserRow>();
    if (error) throw error;
    if (!row) return res.status(401).json({ error: 'User not found' });

    // Slide the session forward so active users stay logged in indefinitely;
    // the frontend replaces its stored token with this fresh one.
    const sessionToken = issueSession({ sub: row.google_sub, email: row.email });
    return res.status(200).json({ user: toUserState(row), sessionToken });
  } catch (e) {
    console.error('me restore error', e);
    return res.status(500).json({ error: 'Database error' });
  }
}
