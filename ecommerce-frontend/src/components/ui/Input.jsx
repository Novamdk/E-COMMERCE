import { cn } from '@/lib/cn';

const BASE =
  'h-11 w-full rounded-field border bg-surface-raised px-3.5 text-[0.9375rem] text-content ' +
  'placeholder:text-content-subtle transition-colors duration-150 ' +
  'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-content-subtle';

/**
 * @param {object} props
 * @param {boolean} [props.hasError] draws the invalid state and sets aria-invalid
 * @param {import('react').ReactNode} [props.prefix] e.g. a leading icon
 */
export function Input({ hasError = false, prefix, className, ...rest }) {
  const field = (
    <input
      aria-invalid={hasError || undefined}
      className={cn(
        BASE,
        hasError
          ? 'border-danger-500 focus:border-danger-500'
          : 'border-border hover:border-border-strong focus:border-brand-600',
        prefix && 'pl-10',
        className,
      )}
      {...rest}
    />
  );

  if (!prefix) return field;

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="text-content-subtle pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
      >
        {prefix}
      </span>
      {field}
    </div>
  );
}
