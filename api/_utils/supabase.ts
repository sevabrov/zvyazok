import { createClient } from '@supabase/supabase-js';

// Service role — full access, bypasses RLS. Backend only; never expose to the
// frontend. Keys come from Vercel environment variables.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
