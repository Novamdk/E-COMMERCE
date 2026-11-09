import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cn } from '@/lib/cn';

const GAP = 'gap';

/**
 * Builds a compact page list: always the first and last page, a window around
 * the current one, and gap markers for the rest.
 * @param {number} page @param {number} pageCount
 * @returns {(number|'gap')[]}
 */
function buildPageItems(page, pageCount) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const items = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  if (start > 2) items.push(GAP);
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < pageCount - 1) items.push(GAP);
  items.push(pageCount);

  return items;
}

const ITEM = 'grid h-10 min-w-10 place-items-center rounded-field px-3 text-sm transition-colors';

/**
 * @param {object} props
 * @param {number} props.page 1-based current page
 * @param {number} props.pageCount
 * @param {(page: number) => void} props.onPageChange
 */
export function Pagination({ page, pageCount, onPageChange, className }) {
  if (pageCount <= 1) return null;
  const items = buildPageItems(page, pageCount);

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={cn(ITEM, 'hover:bg-ink-100 disabled:pointer-events-none disabled:opacity-35')}
      >
        <FiChevronLeft className="size-4" />
      </button>

      {items.map((item, index) =>
        item === GAP ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="text-content-subtle grid h-10 w-6 place-items-center"
          >
            &hellip;
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              ITEM,
              'tabular-nums',
              item === page
                ? 'bg-surface-inverse text-content-inverse font-semibold'
                : 'text-content-muted hover:bg-ink-100 hover:text-content',
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
        className={cn(ITEM, 'hover:bg-ink-100 disabled:pointer-events-none disabled:opacity-35')}
      >
        <FiChevronRight className="size-4" />
      </button>
    </nav>
  );
}
