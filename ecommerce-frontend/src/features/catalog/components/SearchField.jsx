import { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { Input } from '@/components/ui/Input';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { QUERY_KEYS, SEARCH_DEBOUNCE_MS } from '@/lib/constants';

/**
 * Text search over the catalog.
 *
 * The input keeps its own state so typing stays instant, and the committed
 * URL value is pushed from a debounced callback rather than an effect. When
 * the URL changes from somewhere else — a filter chip being removed, the back
 * button, a shared link — the local value is realigned during render.
 *
 * @param {object} props
 * @param {string} props.value current value from the URL
 * @param {(patch: object) => void} props.onFiltersChange
 */
export function SearchField({ value, onFiltersChange }) {
  const [term, setTerm] = useState(value);
  const [lastCommitted, setLastCommitted] = useState(value);

  // React's documented way to reset state when a prop changes.
  if (value !== lastCommitted) {
    setLastCommitted(value);
    setTerm(value);
  }

  const commit = useDebouncedCallback((next) => {
    onFiltersChange({ [QUERY_KEYS.SEARCH]: next.trim() || null });
  }, SEARCH_DEBOUNCE_MS);

  /** @param {string} next */
  const handleChange = (next) => {
    setTerm(next);
    commit(next);
  };

  return (
    <div className="relative">
      <label htmlFor="catalog-search" className="sr-only">
        Search products
      </label>
      <Input
        id="catalog-search"
        type="search"
        value={term}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Search shampoo, serum, cream…"
        prefix={<FiSearch className="size-4" />}
        className="pr-10"
      />
      {term && (
        <button
          type="button"
          onClick={() => handleChange('')}
          aria-label="Clear search"
          className="text-content-subtle hover:bg-ink-100 hover:text-content absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full transition-colors"
        >
          <FiX className="size-4" />
        </button>
      )}
    </div>
  );
}
