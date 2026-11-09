import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/cn';

const SIZES = {
  sm: 'text-lg tracking-[0.3em]',
  md: 'text-xl tracking-[0.32em] lg:text-2xl',
  lg: 'text-3xl tracking-[0.34em]',
};

/**
 * Typographic wordmark that doubles as the home link: the brand name in the
 * display serif, set in widely tracked capitals. Colour is inherited, so it
 * works on light and dark surfaces alike.
 *
 * The negative right margin cancels the trailing letter-space so the mark
 * centres optically, not just mathematically.
 *
 * @param {{ size?: 'sm'|'md'|'lg', className?: string }} props
 */
export function BrandMark({ size = 'md', className }) {
  return (
    <Link
      to={ROUTES.HOME}
      className={cn(
        'font-display -mr-[0.3em] inline-block leading-none whitespace-nowrap uppercase',
        SIZES[size] ?? SIZES.md,
        className,
      )}
      aria-label="SK Envision — home"
    >
      SK Envision
    </Link>
  );
}
