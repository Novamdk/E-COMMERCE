import { FiCheck } from 'react-icons/fi';
import { cn } from '@/lib/cn';

/**
 * A real checkbox input with a styled box layered over it, so keyboard and
 * assistive-tech behaviour stays native.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {import('react').ReactNode} [props.meta] trailing text, e.g. a count
 */
export function Checkbox({ id, label, meta, className, ...rest }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="relative inline-grid size-[1.125rem] shrink-0 place-items-center">
        <input
          id={id}
          type="checkbox"
          className="peer border-border-strong bg-surface-raised checked:border-brand-700 checked:bg-brand-700 size-full cursor-pointer appearance-none rounded-[0.3rem] border transition-colors"
          {...rest}
        />
        <FiCheck
          aria-hidden="true"
          className="text-content-inverse pointer-events-none absolute size-3 stroke-[3] opacity-0 peer-checked:opacity-100"
        />
      </span>
      <label htmlFor={id} className="text-content-muted flex-1 cursor-pointer text-sm">
        {label}
      </label>
      {meta && <span className="text-content-subtle text-xs tabular-nums">{meta}</span>}
    </div>
  );
}
