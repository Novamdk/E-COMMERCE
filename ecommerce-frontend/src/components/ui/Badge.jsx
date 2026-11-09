import { cn } from '@/lib/cn';

const VARIANTS = {
  neutral: 'bg-ink-100 text-content-muted',
  brand: 'bg-brand-50 text-brand-700',
  sale: 'bg-accent-600 text-content-inverse',
  success: 'bg-success-50 text-success-600',
  danger: 'bg-danger-50 text-danger-600',
  inverse: 'bg-surface-inverse text-content-inverse',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-[0.6875rem]',
  md: 'px-2.5 py-1 text-xs',
};

/**
 * @param {object} props
 * @param {'neutral'|'brand'|'sale'|'success'|'danger'|'inverse'} [props.variant]
 * @param {'sm'|'md'} [props.size]
 */
export function Badge({ variant = 'neutral', size = 'sm', className, children, ...rest }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold tracking-wide uppercase',
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
