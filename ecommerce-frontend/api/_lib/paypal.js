import { HttpError, requireEnv } from './http.js';

/**
 * PayPal REST (Orders v2) for SK Envision's own PayPal business account.
 * PAYPAL_ENV=sandbox (default) talks to the test system; set it to "live"
 * only with the live app's client id and secret.
 */

const BASES = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  live: 'https://api-m.paypal.com',
};

const base = () => BASES[process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox'];

let cachedToken = null;

async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const id = requireEnv('PAYPAL_CLIENT_ID');
  const secret = requireEnv('PAYPAL_CLIENT_SECRET');
  const response = await fetch(`${base()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!response.ok) throw new Error(`PayPal auth failed: ${response.status}`);
  const json = await response.json();
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cachedToken.value;
}

async function call(path, { method = 'GET', body, requestId } = {}) {
  const response = await fetch(`${base()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(requestId ? { 'PayPal-Request-Id': requestId } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const issue = json?.details?.[0]?.issue ?? json?.name ?? response.status;
    const error = new Error(`PayPal ${method} ${path} failed: ${issue}`);
    error.paypal = json;
    error.status = response.status;
    error.issue = issue;
    throw error;
  }
  return json;
}

const money = (cents) => (Math.round(cents) / 100).toFixed(2);

/**
 * @param {object} order the order row as inserted
 * @param {{title: string, unit_price_cents: number, quantity: number, product_id: string, is_gift: boolean}[]} items
 * @param {string} brandName
 */
export function createPayPalOrder(order, items, brandName = 'SK Envision') {
  const paid = items.filter((item) => !item.is_gift);
  const address = order.shipping_address;

  return call('/v2/checkout/orders', {
    method: 'POST',
    requestId: `create-${order.id}`,
    body: {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: order.number,
          invoice_id: order.number,
          custom_id: order.id,
          description: `${brandName} order ${order.number}`,
          amount: {
            currency_code: order.currency,
            value: money(order.total_cents),
            breakdown: {
              item_total: { currency_code: order.currency, value: money(order.subtotal_cents) },
              shipping: { currency_code: order.currency, value: money(order.shipping_cents) },
              tax_total: { currency_code: order.currency, value: money(order.tax_cents) },
              discount: { currency_code: order.currency, value: money(order.discount_cents) },
            },
          },
          items: paid.map((item) => ({
            name: item.title.slice(0, 127),
            sku: item.product_id,
            quantity: String(item.quantity),
            category: 'PHYSICAL_GOODS',
            unit_amount: { currency_code: order.currency, value: money(item.unit_price_cents) },
          })),
          shipping: {
            name: { full_name: `${order.first_name ?? ''} ${order.last_name ?? ''}`.trim() },
            address: {
              address_line_1: address.address1,
              ...(address.address2 ? { address_line_2: address.address2 } : {}),
              admin_area_2: address.city,
              admin_area_1: address.state,
              postal_code: address.postalCode,
              country_code: address.country ?? 'US',
            },
          },
        },
      ],
      application_context: {
        brand_name: brandName,
        shipping_preference: 'SET_PROVIDED_ADDRESS',
        user_action: 'PAY_NOW',
      },
    },
  });
}

/** @param {string} paypalOrderId */
export function getPayPalOrder(paypalOrderId) {
  return call(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`);
}

/**
 * Captures an approved order. Safe to call twice: PayPal answers
 * ORDER_ALREADY_CAPTURED, and we then read the order instead.
 * @param {string} paypalOrderId
 */
export async function capturePayPalOrder(paypalOrderId) {
  try {
    return await call(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
      method: 'POST',
      requestId: `capture-${paypalOrderId}`,
    });
  } catch (error) {
    if (error.issue === 'ORDER_ALREADY_CAPTURED') return getPayPalOrder(paypalOrderId);
    if (error.issue === 'INSTRUMENT_DECLINED') {
      throw new HttpError(402, 'Your payment was declined. Please try another way to pay.');
    }
    throw error;
  }
}

/** The completed capture inside an order response, if any. */
export function completedCapture(paypalOrder) {
  const captures = paypalOrder?.purchase_units?.flatMap((unit) => unit.payments?.captures ?? []);
  return captures?.find((capture) => capture.status === 'COMPLETED') ?? null;
}

/**
 * Asks PayPal whether a webhook delivery is genuine.
 * @param {Record<string, string>} headers request headers (lower-case keys)
 * @param {object} event the parsed body
 */
export async function verifyWebhook(headers, event) {
  const result = await call('/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: requireEnv('PAYPAL_WEBHOOK_ID'),
      webhook_event: event,
    },
  });
  return result.verification_status === 'SUCCESS';
}

export { money };
