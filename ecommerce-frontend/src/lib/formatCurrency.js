import { CURRENCY } from './constants';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: CURRENCY,
});

const wholeFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Renders integer minor units as a currency string.
 * @param {number} cents e.g. 3995
 * @param {{ compact?: boolean }} [options] compact drops .00 on round amounts
 * @returns {string} e.g. "$39.95"
 */
export function formatCurrency(cents, options = {}) {
  const amount = (Number(cents) || 0) / 100;
  if (options.compact && Number.isInteger(amount)) return wholeFormatter.format(amount);
  return formatter.format(amount);
}

/**
 * Percentage saved between a compare-at price and the current price.
 * @param {number} price current price in cents
 * @param {number|null} compareAtPrice original price in cents
 * @returns {number} whole percent, 0 when there is no saving
 */
export function discountPercent(price, compareAtPrice) {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
