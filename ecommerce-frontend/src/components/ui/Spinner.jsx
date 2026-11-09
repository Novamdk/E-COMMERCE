import { cn } from '@/lib/cn';

const SIZES = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-9 border-[3px]',
};

/**
 * @param {{ size?: 'sm'|'md'|'lg', label?: string, className?: string }} props
 */
export function Spinner({ size = 'md', label = 'Loading', className }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-current/25 border-t-current',
        SIZES[size] ?? SIZES.md,
        className,
      )}
    />
  );
}
