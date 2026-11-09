import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-field font-medium whitespace-nowrap ' +
  'transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out-soft ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-45';

const VARIANTS = {
  primary: 'bg-brand-700 text-content-inverse shadow-raised hover:bg-brand-800',
  secondary: 'bg-surface-raised text-content border border-border shadow-raised hover:bg-ink-50',
  outline: 'border border-content/25 text-content hover:border-content/60 hover:bg-ink-50',
  ghost: 'text-content-muted hover:bg-ink-100 hover:text-content',
  accent: 'bg-accent-600 text-content-inverse shadow-raised hover:bg-accent-700',
  inverse: 'bg-surface-raised text-content hover:bg-ink-100',
};

const SIZES = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-13 px-7 text-base',
  icon: 'size-10 shrink-0',
  'icon-sm': 'size-9 shrink-0',
};

/**
 * The one button in the app. Renders as <button>, <Link>, or <a> depending on
 * what it does, so navigation stays navigable and actions stay buttons.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'accent'|'inverse'} [props.variant]
 * @param {'sm'|'md'|'lg'|'icon'|'icon-sm'} [props.size]
 * @param {string} [props.to] renders a react-router Link
 * @param {string} [props.href] renders a plain anchor
 * @param {boolean} [props.isLoading] swaps content for a spinner and disables
 * @param {boolean} [props.isFullWidth]
 */
export function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  isLoading = false,
  isFullWidth = false,
  className,
  children,
  disabled,
  type,
  ...rest
}) {
  const classes = cn(
    BASE,
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    isFullWidth && 'w-full',
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button type={type ?? 'button'} className={classes} disabled={disabled || isLoading} {...rest}>
      {isLoading ? <Spinner size="sm" /> : children}
    </button>
  );
}
