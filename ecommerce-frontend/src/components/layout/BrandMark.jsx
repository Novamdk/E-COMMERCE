import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/cn';

/**
 * Wordmark that doubles as the home link.
 * @param {{ size?: 'sm'|'md', className?: string }} props
 */
export function BrandMark({ size = 'md', className }) {
  return (
    <Link
      to={ROUTES.HOME}
      className={cn('group inline-flex items-baseline gap-1.5', className)}
      aria-label="SK Envision — home"
    >
      <span
        className={cn(
          'font-display leading-none tracking-tight',
          size === 'sm' ? 'text-xl' : 'text-[1.625rem]',
        )}
      >
        SK Envision
      </span>
      <span
        aria-hidden="true"
        className="bg-brand-500 group-hover:bg-accent-500 mb-0.5 size-1.5 rounded-full transition-colors"
      />
    </Link>
  );
}
