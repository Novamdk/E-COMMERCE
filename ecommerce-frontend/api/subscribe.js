/**
 * POST /api/subscribe — adds one email to SK Envision's Klaviyo email list.
 *
 * Runs as a Vercel serverless function. Needs two environment variables in
 * the Vercel project (never in code):
 *   KLAVIYO_PRIVATE_API_KEY  private key with Lists, Profiles and
 *                            Subscriptions write scopes
 *   KLAVIYO_LIST_ID          the "Email List" id
 *
 * Body: { email: string, firstName?: string, source?: string }
 */

const KLAVIYO_API = 'https://a.klaviyo.com/api';
const KLAVIYO_REVISION = '2025-01-15';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_FIELD = 200;

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

const clean = (value) => (typeof value === 'string' ? value.trim().slice(0, MAX_FIELD) : undefined);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;
  if (!apiKey || !listId) {
    return send(res, 503, { error: 'Email signups are not configured yet.' });
  }

  let body;
  try {
    body = await readJson(req);
  } catch {
    return send(res, 400, { error: 'Invalid JSON' });
  }

  const email = clean(body.email)?.toLowerCase();
  if (!email || !EMAIL_PATTERN.test(email)) {
    return send(res, 422, { error: 'Enter a valid email address.' });
  }
  const firstName = clean(body.firstName);
  const source = clean(body.source) || 'Website';

  const headers = {
    Authorization: `Klaviyo-API-Key ${apiKey}`,
    revision: KLAVIYO_REVISION,
    accept: 'application/vnd.api+json',
    'content-type': 'application/vnd.api+json',
  };

  try {
    // Subscribe with explicit email marketing consent and add to the list.
    const subscribe = await fetch(`${KLAVIYO_API}/profile-subscription-bulk-create-jobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            custom_source: `SK Envision site: ${source}`,
            profiles: {
              data: [
                {
                  type: 'profile',
                  attributes: {
                    email,
                    subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } },
                  },
                },
              ],
            },
          },
          relationships: { list: { data: { type: 'list', id: listId } } },
        },
      }),
    });

    if (!subscribe.ok) {
      console.error('Klaviyo subscribe failed', subscribe.status, await subscribe.text());
      return send(res, 502, { error: 'Could not sign you up right now.' });
    }

    // The subscribe job only takes email and consent; set the name separately.
    if (firstName) {
      const profile = await fetch(`${KLAVIYO_API}/profile-import`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          data: {
            type: 'profile',
            attributes: { email, first_name: firstName, properties: { signup_source: source } },
          },
        }),
      });
      if (!profile.ok) console.error('Klaviyo profile update failed', profile.status);
    }

    return send(res, 202, { ok: true });
  } catch (error) {
    console.error('Klaviyo request error', error);
    return send(res, 502, { error: 'Could not sign you up right now.' });
  }
}
