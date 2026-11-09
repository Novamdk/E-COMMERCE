import { cn } from '@/lib/cn';

const VARIANTS = {
  neutral: 'bg-ink-100 text-content-muted',
  brand: 'bg-brand-50 text-brand-700',
  sale: 'bg-accent-600 text-content-inverse',
  success: 'bg-success-50 text-success-600',
  danger: 'bg-danger-50 text-danger-600',
  inverse: 'bg-surface-inverse text-content-inverse',
  light: 'bg-surface-raised text-content',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-[0.6875rem]',
  md: 'px-2.5 py-1 text-xs',
};

/**
 * @param {object} props
 * @param {'neutral'|'brand'|'sale'|'success'|'danger'|'inverse'|'light'} [props.variant]
 * @param {'sm'|'md'} [props.size]
 */
export function Badge({ variant = 'neutral', size = 'sm', className, children, ...rest }) {
  return (
    <span
      className={cn(
        'rounded-field inline-flex items-center gap-1 font-semibold tracking-[0.1em] uppercase',
        VARIANTS[variant] ?? VARIANTS.neutral,
        SIZES[size] ?? SIZES.sm,
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
