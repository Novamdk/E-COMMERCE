import { Link } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { cn } from '@/lib/cn';

const LABELS = { shipping: 'Shipping', payment: 'Payment', review: 'Review' };

/**
 * Step indicator. Completed steps are links so going back is one click;
 * steps ahead of the current one are inert until their prerequisites pass.
 *
 * @param {object} props
 * @param {string[]} props.steps
 * @param {string} props.currentStep
 * @param {(step: string) => boolean} props.canVisit
 */
export function CheckoutStepper({ steps, currentStep, canVisit }) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <nav aria-label="Checkout progress">
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = step === currentStep;
          const isReachable = isDone || canVisit(step);

          const marker = (
            <>
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors',
                  isCurrent && 'bg-brand-700 text-content-inverse',
                  isDone && 'bg-brand-100 text-brand-700',
                  !isCurrent && !isDone && 'bg-surface-sunken text-content-subtle',
                )}
              >
                {isDone ? <FiCheck className="size-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  'text-sm whitespace-nowrap',
                  isCurrent ? 'text-content font-medium' : 'text-content-muted',
                )}
              >
                {LABELS[step]}
              </span>
            </>
          );

          return (
            <li key={step} className="flex items-center gap-2 sm:gap-3">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={cn('h-px w-4 sm:w-10', isDone ? 'bg-brand-300' : 'bg-border')}
                />
              )}

              {isReachable && !isCurrent ? (
                <Link
                  to={`/checkout/${step}`}
                  className="rounded-field flex items-center gap-2 transition-opacity hover:opacity-70"
                >
                  {marker}
                </Link>
              ) : (
                <span
                  className="flex items-center gap-2"
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {marker}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
