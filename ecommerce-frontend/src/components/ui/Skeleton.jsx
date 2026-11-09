import { cn } from '@/lib/cn';

/**
 * A neutral shimmer block. Always given explicit dimensions by the caller so
 * the skeleton occupies the same box as the content it stands in for.
 *
 * @param {{ className?: string, radius?: 'field'|'card'|'panel'|'full' }} props
 */
export function Skeleton({ className, radius = 'field' }) {
  const radii = {
    field: 'rounded-field',
    card: 'rounded-card',
    panel: 'rounded-panel',
    full: 'rounded-full',
  };

  return (
    <div
      aria-hidden="true"
      className={cn('bg-ink-200/70 animate-pulse', radii[radius] ?? radii.field, className)}
    />
  );
}
