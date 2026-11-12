/**
 * Small helpers shared by the /api functions. Files under api/_lib are not
 * deployed as endpoints (Vercel skips paths that start with an underscore).
 */

export class HttpError extends Error {
  /** @param {number} status @param {string} message */
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

/** Reads a JSON body whether or not the runtime already parsed it. */
export async function readJson(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8') || '{}');
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

/** The raw body as text, for webhook signature checks. */
export async function readText(req) {
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

/**
 * Wraps a handler: method check, JSON errors, and no stack traces to clients.
 * @param {string[]} methods
 * @param {(req: any, res: any) => Promise<void>} fn
 */
export function route(methods, fn) {
  return async function handler(req, res) {
    if (!methods.includes(req.method)) {
      res.setHeader('Allow', methods.join(', '));
      return send(res, 405, { error: 'Method not allowed' });
    }
    try {
      await fn(req, res);
    } catch (error) {
      if (error instanceof HttpError) return send(res, error.status, { error: error.message });
      console.error(error);
      return send(res, 500, { error: 'Something went wrong. Please try again.' });
    }
  };
}

/** @param {string} name @returns {string} */
export function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new HttpError(503, 'Checkout is not configured yet.');
  return value;
}

/** Public site address for links in emails: SITE_URL, else the request's host. */
export function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '');
  const host = req.headers?.['x-forwarded-host'] ?? req.headers?.host;
  return host ? `https://${host}` : '';
}

/** @param {string|undefined} header */
export function bearerToken(header) {
  const match = /^Bearer\s+(.+)$/i.exec(header ?? '');
  return match ? match[1].trim() : null;
}
