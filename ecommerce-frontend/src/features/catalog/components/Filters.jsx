import { FiStar } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import { PRICE_BOUNDS, QUERY_KEYS, RATING_FILTERS, SHOW_RATINGS } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatCurrency';

/** Price inputs are shown in dollars but stored in cents. */
const toDollars = (cents) => (cents == null ? '' : String(cents / 100));
const toCents = (dollars) => {
  const value = Number.parseFloat(dollars);
  return Number.isFinite(value) ? Math.round(value * 100) : null;
};

const SECTION = 'border-t border-border py-6 first:border-t-0 first:pt-0';
const LEGEND = 'mb-3 text-xs font-semibold tracking-[0.08em] text-content uppercase';

/**
 * Category, price-range and rating filters. Writes straight to the URL via the
 * supplied setter — it holds no state of its own.
 *
 * @param {object} props
 * @param {object} props.filters parsed filter state
 * @param {object[]} props.categories
 * @param {(patch: object) => void} props.onFiltersChange
 * @param {() => void} props.onClear
 * @param {number} props.activeCount
 */
export function Filters({ filters, categories, onFiltersChange, onClear, activeCount }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 pb-5">
        <h2 className="font-display text-xl">Filters</h2>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear all ({activeCount})
          </Button>
        )}
      </div>

      <fieldset className={SECTION}>
        <legend className={LEGEND}>Category</legend>
        <ul className="flex flex-col gap-0.5">
          {[{ slug: null, name: 'All products' }, ...categories].map((category) => {
            const isActive = (filters.category ?? null) === category.slug;
            return (
              <li key={category.slug ?? 'all'}>
                <button
                  type="button"
                  onClick={() => onFiltersChange({ [QUERY_KEYS.CATEGORY]: category.slug })}
                  aria-pressed={isActive}
                  className={cn(
                    'rounded-field flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-surface-brand text-brand-700 font-medium'
                      : 'text-content-muted hover:bg-ink-100 hover:text-content',
                  )}
                >
                  <span>{category.name}</span>
                  {category.count != null && (
                    <span className="text-content-subtle text-xs tabular-nums">
                      {category.count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset className={SECTION}>
        <legend className={LEGEND}>Price</legend>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label htmlFor="filter-min-price" className="sr-only">
              Minimum price in dollars
            </label>
            <Input
              id="filter-min-price"
              type="number"
              inputMode="decimal"
              min={PRICE_BOUNDS.min / 100}
              max={PRICE_BOUNDS.max / 100}
              placeholder="Min"
              value={toDollars(filters.minPrice)}
              onChange={(event) =>
                onFiltersChange({ [QUERY_KEYS.MIN_PRICE]: toCents(event.target.value) })
              }
            />
          </div>
          <span aria-hidden="true" className="text-content-subtle">
            –
          </span>
          <div className="flex-1">
            <label htmlFor="filter-max-price" className="sr-only">
              Maximum price in dollars
            </label>
            <Input
              id="filter-max-price"
              type="number"
              inputMode="decimal"
              min={PRICE_BOUNDS.min / 100}
              max={PRICE_BOUNDS.max / 100}
              placeholder="Max"
              value={toDollars(filters.maxPrice)}
              onChange={(event) =>
                onFiltersChange({ [QUERY_KEYS.MAX_PRICE]: toCents(event.target.value) })
              }
            />
          </div>
        </div>
        <p className="text-content-subtle mt-2 text-xs">
          Catalog spans {formatCurrency(1995)} – {formatCurrency(14900)}
        </p>
      </fieldset>

      {SHOW_RATINGS && (
        <fieldset className={SECTION}>
          <legend className={LEGEND}>Customer rating</legend>
          <ul className="flex flex-col gap-0.5">
            {RATING_FILTERS.map((threshold) => {
              const isActive = filters.rating === threshold;
              return (
                <li key={threshold}>
                  <button
                    type="button"
                    onClick={() =>
                      onFiltersChange({ [QUERY_KEYS.RATING]: isActive ? null : threshold })
                    }
                    aria-pressed={isActive}
                    className={cn(
                      'rounded-field flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm transition-colors',
                      isActive
                        ? 'bg-surface-brand text-brand-700 font-medium'
                        : 'text-content-muted hover:bg-ink-100 hover:text-content',
                    )}
                  >
                    <FiStar
                      aria-hidden="true"
                      className={cn('size-4', isActive && 'fill-accent-400 text-accent-400')}
                    />
                    {threshold} stars &amp; up
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
      )}
    </div>
  );
}
