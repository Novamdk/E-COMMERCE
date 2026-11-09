/**
 * Joins class names, dropping falsy entries.
 * @param {...(string|false|null|undefined)} parts
 * @returns {string}
 */
export function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}
