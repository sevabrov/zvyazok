import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Origins allowed to call the API. FRONTEND_ORIGIN may be a comma-separated
 * list (e.g. "https://zvyazok-game.com,http://localhost:5173"). Localhost dev
 * origins are always allowed so local development works without extra config.
 */
function allowedOrigins(): string[] {
  const fromEnv = (process.env.FRONTEND_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return [...fromEnv, 'http://localhost:5173'];
}

/**
 * Allow requests only from our known frontend origins. A CORS response can only
 * carry a single Access-Control-Allow-Origin value, so we echo back the
 * request's Origin header when it is in the allowlist. Returns true when this
 * was an OPTIONS preflight and the response has already been sent — the handler
 * should then simply return.
 */
export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin ?? '';
  if (allowedOrigins().includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
