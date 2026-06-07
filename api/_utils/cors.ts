import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Allow requests only from our frontend domain (FRONTEND_ORIGIN). Returns true
 * when this was an OPTIONS preflight and the response has already been sent —
 * the handler should then simply return.
 */
export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = process.env.FRONTEND_ORIGIN ?? '';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
