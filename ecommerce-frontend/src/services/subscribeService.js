import { identify } from '@/lib/klaviyo';

/**
 * Adds an email to SK Envision's Klaviyo email list through /api/subscribe
 * (a Vercel serverless function holding the private key). The thank-you state
 * in each form does not wait on this: a signup that fails to send should never
 * block the shopper or take back a code we already showed them.
 *
 * @param {{email: string, firstName?: string, source: string}} input
 *   source: where the signup happened, e.g. "Footer", "Spin wheel", "Hair quiz"
 * @returns {Promise<boolean>} whether the list accepted it
 */
export async function subscribeEmail({ email, firstName, source }) {
  identify({ email, firstName });
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName, source }),
      keepalive: true,
    });
    return response.ok;
  } catch {
    return false;
  }
}
