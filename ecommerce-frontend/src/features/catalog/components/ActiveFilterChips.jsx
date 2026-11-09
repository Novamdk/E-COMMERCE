import { FiX } from 'react-icons/fi';
import { QUERY_KEYS } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatCurrency';

/**
 * Builds the removable chip list from the current filters.
 * @param {object} filters
 * @param {object[]} categories
 * @returns {{key: string, label: string, patch: object}[]}
 */
function buildChips(filters, categories) {
  const chips = [];

  if (filters.search) {
    chips.push({
      key: 'search',
      label: `“${filters.search}”`,
      patch: { [QUERY_KEYS.SEARCH]: null },
    });
  }

  if (filters.category) {
    const match = categories.find((category) => category.slug === filters.category);
    chips.push({
      key: 'category',
      label: match?.name ?? filters.category,
      patch: { [QUERY_KEYS.CATEGORY]: null },
    });
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    const from =
      filters.minPrice != null ? formatCurrency(filters.minPrice, { compact: true }) : 'Any';
    const to =
      filters.maxPrice != null ? formatCurrency(filters.maxPrice, { compact: true }) : 'Any';
    chips.push({
      key: 'price',
      label: `${from} – ${to}`,
      patch: { [QUERY_KEYS.MIN_PRICE]: null, [QUERY_KEYS.MAX_PRICE]: null },
    });
  }

  if (filters.rating != null) {
    chips.push({
      key: 'rating',
      label: `${filters.rating}+ stars`,
      patch: { [QUERY_KEYS.RATING]: null },
    });
  }

  return chips;
}

/**
 * @param {object} props
 * @param {object} props.filters
 * @param {object[]} props.categories
 * @param {(patch: object) => void} props.onFiltersChange
 */
export function ActiveFilterChips({ filters, categories, onFiltersChange }) {
  const chips = buildChips(filters, categories);
  if (chips.length === 0) return null;

  return (
    <ul aria-label="Active filters" className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={() => onFiltersChange(chip.patch)}
            className="bg-surface-sunken text-content-muted hover:bg-ink-200 hover:text-content inline-flex items-center gap-1.5 rounded-full py-1.5 pr-2 pl-3 text-sm transition-colors"
          >
            {chip.label}
            <FiX aria-hidden="true" className="size-3.5" />
            <span className="sr-only">Remove this filter</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
