import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap ' +
  'transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out-soft ' +
  'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold-500 ' +
  'disabled:pointer-events-none disabled:opacity-45';

const VARIANTS = {
  primary:
    'bg-brand-700 text-content-inverse shadow-raised hover:bg-brand-800 hover:shadow-lifted',
  secondary:
    'bg-surface-raised text-content border border-border shadow-raised hover:border-border-strong hover:shadow-card',
  outline:
    'border-[1.5px] border-brand-700 text-brand-700 hover:bg-brand-700 hover:text-content-inverse',
  ghost: 'text-content-muted hover:translate-y-0 hover:bg-ink-100 hover:text-content',
  accent: 'bg-accent-600 text-content-inverse shadow-raised hover:bg-accent-700 hover:shadow-lifted',
  inverse: 'bg-surface-raised text-content hover:bg-gold-100 hover:shadow-lifted',
  'outline-inverse':
    'border-[1.5px] border-content-inverse text-content-inverse hover:bg-content-inverse hover:text-content',
};

const SIZES = {
  sm: 'h-10 px-5 text-[0.8125rem]',
  md: 'h-12 px-7 text-sm',
  lg: 'h-14 px-10 text-[0.9375rem]',
  icon: 'size-11 shrink-0 hover:translate-y-0',
  'icon-sm': 'size-10 shrink-0 hover:translate-y-0',
};

/**
 * The one button in the app. Renders as <button>, <Link>, or <a> depending on
 * what it does, so navigation stays navigable and actions stay buttons.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'accent'|'inverse'|'outline-inverse'} [props.variant]
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
