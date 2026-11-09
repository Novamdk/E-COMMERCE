import { FiMinus, FiPlus } from 'react-icons/fi';
import { cn } from '@/lib/cn';

const SIZES = {
  sm: { wrap: 'h-9', button: 'size-9', text: 'text-sm min-w-8' },
  md: { wrap: 'h-11', button: 'size-11', text: 'text-[0.9375rem] min-w-10' },
};

/**
 * @param {object} props
 * @param {number} props.value
 * @param {(next: number) => void} props.onChange
 * @param {number} [props.min]
 * @param {number} [props.max]
 * @param {'sm'|'md'} [props.size]
 * @param {string} props.label what is being counted, for screen readers
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  label,
  className,
}) {
  const s = SIZES[size] ?? SIZES.md;
  const clamp = (n) => Math.max(min, Math.min(max, n));

  return (
    <div
      className={cn(
        'rounded-field border-border bg-surface-raised inline-flex items-center border',
        s.wrap,
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label={`Decrease quantity of ${label}`}
        className={cn(
          'rounded-l-field text-content-muted grid place-items-center transition-colors',
          'hover:bg-ink-100 hover:text-content disabled:pointer-events-none disabled:opacity-35',
          s.button,
        )}
      >
        <FiMinus className="size-4" />
      </button>

      <span
        aria-live="polite"
        className={cn('grid place-items-center text-center font-medium tabular-nums', s.text)}
      >
        {value}
        <span className="sr-only"> of {label}</span>
      </span>

      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
        className={cn(
          'rounded-r-field text-content-muted grid place-items-center transition-colors',
          'hover:bg-ink-100 hover:text-content disabled:pointer-events-none disabled:opacity-35',
          s.button,
        )}
      >
        <FiPlus className="size-4" />
      </button>
    </div>
  );
}
