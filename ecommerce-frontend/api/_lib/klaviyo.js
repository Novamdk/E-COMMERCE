import { productById } from './pricing.js';

/**
 * Server-side order events for SK Envision's Klaviyo account. These carry
 * real money, so they are only ever sent from here, after PayPal confirms
 * the payment, never from the browser.
 *
 * Needs KLAVIYO_PRIVATE_API_KEY (with Events write). Without it, events are
 * skipped and the order still goes through.
 */

const KLAVIYO_API = 'https://a.klaviyo.com/api';
const REVISION = '2025-01-15';

const dollars = (cents) => Math.round(Number(cents) || 0) / 100;

async function sendEvent({
  metric,
  email,
  firstName,
  lastName,
  properties,
  value,
  uniqueId,
  time,
}) {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (!apiKey || !email) return false;

  const response = await fetch(`${KLAVIYO_API}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      revision: REVISION,
      accept: 'application/vnd.api+json',
      'content-type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'event',
        attributes: {
          properties,
          ...(value != null ? { value } : {}),
          ...(uniqueId ? { unique_id: uniqueId } : {}),
          time: time ?? new Date().toISOString(),
          metric: { data: { type: 'metric', attributes: { name: metric } } },
          profile: {
            data: {
              type: 'profile',
              attributes: {
                email,
                ...(firstName ? { first_name: firstName } : {}),
                ...(lastName ? { last_name: lastName } : {}),
              },
            },
          },
        },
      },
    }),
  });
  if (!response.ok) {
    console.error(`Klaviyo ${metric} failed`, response.status, await response.text());
    return false;
  }
  return true;
}

/** Email events must never break checkout. */
async function safely(promises) {
  const results = await Promise.allSettled(promises);
  for (const result of results) {
    if (result.status === 'rejected') console.error('Klaviyo event error', result.reason);
  }
}

function itemProps(item, site) {
  const product = productById(item.product_id);
  return {
    ProductID: item.product_id,
    SKU: item.product_id,
    ProductName: item.title,
    Quantity: item.quantity,
    ItemPrice: dollars(item.unit_price_cents),
    RowTotal: dollars(item.line_total_cents),
    ProductURL: item.slug ? `${site}/shop/${item.slug}` : site,
    ImageURL: item.slug ? `${site}/og/${item.slug}.jpg` : `${site}/og/default.jpg`,
    ProductCategories: product?.categories ?? [],
    IsGift: item.is_gift,
    ...(item.size ? { Size: item.size } : {}),
    ...(item.color ? { Color: item.color } : {}),
  };
}

function orderProps(order, items, site) {
  const lines = items.map((item) => itemProps(item, site));
  const address = order.shipping_address ?? {};
  return {
    OrderId: order.number,
    Categories: [...new Set(lines.flatMap((line) => line.ProductCategories))],
    ItemNames: lines.map((line) => line.ProductName),
    Brands: ['SK Envision'],
    DiscountCode: order.promo_code ?? '',
    DiscountValue: dollars(order.discount_cents),
    Subtotal: dollars(order.subtotal_cents),
    Shipping: dollars(order.shipping_cents),
    Tax: dollars(order.tax_cents),
    ShippingMethod: order.shipping_method,
    Items: lines,
    ShippingAddress: {
      FirstName: order.first_name ?? '',
      LastName: order.last_name ?? '',
      Address1: address.address1 ?? '',
      Address2: address.address2 ?? '',
      City: address.city ?? '',
      RegionCode: address.state ?? '',
      Zip: address.postalCode ?? '',
      CountryCode: address.country ?? 'US',
    },
    OrderURL: `${site}/orders/${order.number}?t=${order.view_token}`,
  };
}

const who = (order) => ({
  email: order.email,
  firstName: order.first_name,
  lastName: order.last_name,
});

/** Placed Order once, plus one Ordered Product per line. */
export function sendPlacedOrder(order, items, site) {
  const time = order.paid_at ?? new Date().toISOString();
  return safely([
    sendEvent({
      ...who(order),
      metric: 'Placed Order',
      properties: orderProps(order, items, site),
      value: dollars(order.total_cents),
      uniqueId: order.number,
      time,
    }),
    ...items
      .filter((item) => !item.is_gift)
      .map((item, index) =>
        sendEvent({
          ...who(order),
          metric: 'Ordered Product',
          properties: { OrderId: order.number, ...itemProps(item, site) },
          value: dollars(item.line_total_cents),
          uniqueId: `${order.number}-${index}`,
          time,
        }),
      ),
  ]);
}

/** Fulfilled Order, Cancelled Order or Refunded Order. */
export function sendOrderStatus(metric, order, items, site, extra = {}) {
  return safely([
    sendEvent({
      ...who(order),
      metric,
      properties: { ...orderProps(order, items, site), ...extra },
      value: dollars(order.total_cents),
      uniqueId: `${order.number}-${metric}`,
    }),
  ]);
}
