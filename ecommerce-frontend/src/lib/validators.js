/**
 * Field validators for the checkout and auth forms.
 * Each returns an error string, or null when the value is acceptable.
 * Pure and framework-free so the rules can be reasoned about in one place.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const ZIP_RE = /^\d{5}(-\d{4})?$/;
const PHONE_RE = /^[\d\s()+-]{7,20}$/;

/**
 * @param {string} label human-readable field name
 * @returns {(value: string) => string|null}
 */
export const required = (label) => (value) =>
  String(value ?? '').trim() === '' ? `${label} is required.` : null;

/** @param {string} value @returns {string|null} */
export const email = (value) => {
  const v = String(value ?? '').trim();
  if (!v) return 'Email address is required.';
  return EMAIL_RE.test(v) ? null : 'Enter a valid email address.';
};

/** @param {string} value @returns {string|null} */
export const password = (value) => {
  const v = String(value ?? '');
  if (!v) return 'Password is required.';
  if (v.length < 8) return 'Use at least 8 characters.';
  if (!/[a-z]/i.test(v) || !/\d/.test(v)) return 'Include at least one letter and one number.';
  return null;
};

/** @param {string} value @returns {string|null} */
export const postalCode = (value) => {
  const v = String(value ?? '').trim();
  if (!v) return 'ZIP code is required.';
  return ZIP_RE.test(v) ? null : 'Enter a 5-digit ZIP code.';
};

/** @param {string} value @returns {string|null} */
export const phone = (value) => {
  const v = String(value ?? '').trim();
  if (!v) return 'Phone number is required.';
  return PHONE_RE.test(v) ? null : 'Enter a valid phone number.';
};

/**
 * Luhn checksum — catches typos in a card number without any network call.
 * @param {string} value
 * @returns {string|null}
 */
export const cardNumber = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return 'Card number is required.';
  if (digits.length < 13 || digits.length > 19) return 'Card numbers are 13–19 digits.';

  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0 ? null : 'That card number looks incorrect.';
};

/**
 * Accepts MM/YY and rejects anything already past.
 * @param {string} value
 * @returns {string|null}
 */
export const cardExpiry = (value) => {
  const v = String(value ?? '').trim();
  if (!v) return 'Expiry date is required.';
  const match = v.match(/^(\d{2})\s*\/?\s*(\d{2})$/);
  if (!match) return 'Use MM/YY format.';

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return 'Month must be between 01 and 12.';

  const now = new Date();
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth < now ? 'That card has expired.' : null;
};

/** @param {string} value @returns {string|null} */
export const cardCvc = (value) => {
  const v = String(value ?? '').trim();
  if (!v) return 'Security code is required.';
  return /^\d{3,4}$/.test(v) ? null : 'Enter the 3- or 4-digit code.';
};

/**
 * Runs a schema of validators over a values object.
 * @param {Record<string, unknown>} values
 * @param {Record<string, (value: unknown, values: object) => string|null>} schema
 * @returns {Record<string, string>} field -> first error found
 */
export function validateAll(values, schema) {
  const errors = {};
  for (const [field, validate] of Object.entries(schema)) {
    const error = validate(values[field], values);
    if (error) errors[field] = error;
  }
  return errors;
}
