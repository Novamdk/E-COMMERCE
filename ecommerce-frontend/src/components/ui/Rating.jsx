import { FiStar } from 'react-icons/fi';
import { cn } from '@/lib/cn';

const SIZES = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
};

const STAR_COUNT = 5;

/**
 * Star rating with partial fill, exposed to assistive tech as a single
 * readable string rather than five decorative icons.
 *
 * @param {object} props
 * @param {number} props.value 0–5
 * @param {number} [props.reviewCount] shown beside the stars when provided
 * @param {'sm'|'md'|'lg'} [props.size]
 */
export function Rating({ value, reviewCount, size = 'sm', className }) {
  const clamped = Math.max(0, Math.min(STAR_COUNT, Number(value) || 0));
  const starClass = SIZES[size] ?? SIZES.sm;

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span aria-hidden="true" className="inline-flex gap-0.5">
        {Array.from({ length: STAR_COUNT }, (_, index) => {
          const fill = Math.max(0, Math.min(1, clamped - index));
          return (
            <span key={index} className="relative inline-block">
              <FiStar className={cn(starClass, 'text-ink-300')} />
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <FiStar className={cn(starClass, 'fill-accent-400 text-accent-400')} />
                </span>
              )}
            </span>
          );
        })}
      </span>

      <span className="sr-only">
        Rated {clamped.toFixed(1)} out of {STAR_COUNT}
        {reviewCount != null && ` from ${reviewCount} reviews`}
      </span>

      {reviewCount != null && (
        <span aria-hidden="true" className="text-content-subtle text-xs tabular-nums">
          {clamped.toFixed(1)} ({reviewCount.toLocaleString()})
        </span>
      )}
    </span>
  );
}
