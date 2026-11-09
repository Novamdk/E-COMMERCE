import { cn } from '@/lib/cn';

/**
 * Wires a real <label>, an optional hint and an inline error to a control via
 * ids, and announces the error politely. Every form control in the app is
 * wrapped in one of these, so no field can ship without a label.
 *
 * @param {object} props
 * @param {string} props.id must match the control's id
 * @param {string} props.label
 * @param {string} [props.hint]
 * @param {string|null} [props.error]
 * @param {boolean} [props.isOptional]
 * @param {import('react').ReactNode} props.children the control
 */
export function FormField({ id, label, hint, error, isOptional = false, className, children }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-medium">
        <span>{label}</span>
        {isOptional && <span className="text-content-subtle text-xs font-normal">Optional</span>}
      </label>

      {hint && (
        <p id={hintId} className="text-content-subtle text-xs">
          {hint}
        </p>
      )}

      {children}

      {error && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-danger-600 text-xs font-medium"
        >
          {error}
        </p>
      )}
    </div>
  );
}
