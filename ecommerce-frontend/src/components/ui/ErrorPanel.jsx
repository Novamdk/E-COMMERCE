import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { Button } from './Button';
import { cn } from '@/lib/cn';

/**
 * The error half of every data-fetching surface. Always offers a retry so a
 * transient failure is not a dead end.
 *
 * @param {object} props
 * @param {string} [props.title]
 * @param {Error|null} props.error
 * @param {() => void} [props.onRetry]
 */
export function ErrorPanel({ title = 'We could not load this', error, onRetry, className }) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-panel border-danger-500/30 bg-danger-50/60 flex flex-col items-start gap-4 border px-6 py-10',
        className,
      )}
    >
      <span className="bg-danger-50 text-danger-600 grid size-11 place-items-center rounded-full">
        <FiAlertCircle aria-hidden="true" className="size-5" />
      </span>

      <div className="max-w-md space-y-1.5">
        <h2 className="font-display text-content text-xl">{title}</h2>
        <p className="text-content-muted text-sm leading-relaxed">
          {error?.message ?? 'Something went wrong while fetching data.'}
        </p>
      </div>

      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <FiRefreshCw aria-hidden="true" className="size-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
