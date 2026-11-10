import { bearerToken, HttpError, readJson, route, send } from '../_lib/http.js';
import { newOrderNumber, newViewToken } from '../_lib/orders.js';
import { createPayPalOrder } from '../_lib/paypal.js';
import { priceOrder } from '../_lib/pricing.js';
import { check, db, userFromToken } from '../_lib/supabase.js';
import { toStateCode } from '../_lib/usStates.js';

/**
 * POST /api/checkout/create
 * Body: { items: [{productId, qty, size, color}], promoCode, shippingMethodId,
 *         shipping: {firstName, lastName, email, phone, address1, address2, city, state, postalCode} }
 * Optional header: Authorization: Bearer <Supabase access token> to link the order to an account.
 *
 * Prices the bag on the server, saves a pending order, and opens a PayPal
 * order for exactly that total. Returns { paypalOrderId, orderNumber }.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ZIP = /^\d{5}(-\d{4})?$/;

const text = (value, max = 120) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

function cleanShipping(raw = {}) {
  const shipping = {
    firstName: text(raw.firstName, 60),
    lastName: text(raw.lastName, 60),
    email: text(raw.email, 200).toLowerCase(),
    phone: text(raw.phone, 30),
    address1: text(raw.address1),
    address2: text(raw.address2),
    city: text(raw.city, 80),
    state: toStateCode(text(raw.state, 40)),
    postalCode: text(raw.postalCode, 10),
  };
  if (!shipping.firstName || !shipping.lastName) throw new HttpError(422, 'Enter your full name.');
  if (!EMAIL.test(shipping.email)) throw new HttpError(422, 'Enter a valid email address.');
  if (!shipping.address1 || !shipping.city)
    throw new HttpError(422, 'Enter your street address and city.');
  if (!shipping.state) throw new HttpError(422, 'Enter your state, for example CA.');
  if (!ZIP.test(shipping.postalCode)) throw new HttpError(422, 'Enter a valid ZIP code.');
  return shipping;
}

export default route(['POST'], async (req, res) => {
  const body = await readJson(req).catch(() => {
    throw new HttpError(400, 'Invalid JSON');
  });

  const shipping = cleanShipping(body.shipping);
  const shippingMethodId = text(body.shippingMethodId, 40) || 'standard';
  const { totals, orderItems } = priceOrder(body.items, {
    promoCode: text(body.promoCode, 40) || null,
    shippingMethodId,
  });
  if (totals.total <= 0) throw new HttpError(422, 'Your bag is empty.');

  const user = await userFromToken(bearerToken(req.headers.authorization));

  // Insert the pending order, retrying on the rare order number collision.
  let order = null;
  for (let attempt = 0; attempt < 5 && !order; attempt += 1) {
    const { data, error } = await db()
      .from('orders')
      .insert({
        number: newOrderNumber(),
        view_token: newViewToken(),
        customer_id: user?.id ?? null,
        email: shipping.email,
        first_name: shipping.firstName,
        last_name: shipping.lastName,
        phone: shipping.phone || null,
        status: 'pending',
        currency: 'USD',
        subtotal_cents: totals.subtotal,
        discount_cents: totals.discount,
        shipping_cents: totals.shipping,
        tax_cents: totals.tax,
        total_cents: totals.total,
        promo_code: totals.promo?.code ?? null,
        shipping_method: shippingMethodId,
        shipping_address: {
          address1: shipping.address1,
          address2: shipping.address2,
          city: shipping.city,
          state: shipping.state,
          postalCode: shipping.postalCode,
          country: 'US',
        },
      })
      .select('*')
      .single();
    if (!error) order = data;
    else if (error.code !== '23505') throw new Error(`Supabase: ${error.message}`);
  }
  if (!order) throw new Error('Could not allocate an order number');

  check(
    await db()
      .from('order_items')
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id }))),
  );

  const paypalOrder = await createPayPalOrder(order, orderItems);
  check(await db().from('orders').update({ paypal_order_id: paypalOrder.id }).eq('id', order.id));

  return send(res, 201, { paypalOrderId: paypalOrder.id, orderNumber: order.number });
});
