import { SHIPPING_METHODS } from '@/lib/constants';

export const CARRIERS = ['USPS', 'UPS', 'FedEx', 'DHL', 'Other'];

const DATE = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });
const DAY = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export const formatDateTime = (iso) => (iso ? DATE.format(new Date(iso)) : '');
export const formatDay = (iso) => (iso ? DAY.format(new Date(iso)) : '');

export const fullName = (order) => [order.firstName, order.lastName].filter(Boolean).join(' ');

export const shippingLabel = (id) =>
  SHIPPING_METHODS.find((method) => method.id === id)?.label ?? id ?? '';

/** Address lines as they go on a label. */
export function addressLines(order) {
  const a = order.address ?? {};
  return [
    fullName(order),
    a.address1,
    a.address2,
    [a.city, [a.state, a.postalCode].filter(Boolean).join(' ')].filter(Boolean).join(', '),
  ].filter(Boolean);
}

/** The carrier's own tracking page, or null for an unknown carrier. */
export function trackingUrl(carrier, number) {
  if (!number) return null;
  const n = encodeURIComponent(number);
  switch (String(carrier ?? '').toLowerCase()) {
    case 'usps':
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`;
    case 'ups':
      return `https://www.ups.com/track?tracknum=${n}`;
    case 'fedex':
      return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
    case 'dhl':
      return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${n}`;
    default:
      return null;
  }
}

/** Words and badge colour for an order's status. */
export const STATUS = {
  paid: { label: 'To ship', variant: 'gold' },
  fulfilled: { label: 'Shipped', variant: 'success' },
  pending: { label: 'Unpaid', variant: 'neutral' },
  refunded: { label: 'Refunded', variant: 'danger' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
};
