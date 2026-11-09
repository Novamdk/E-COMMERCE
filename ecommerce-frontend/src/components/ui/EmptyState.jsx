import { cn } from '@/lib/cn';

/**
 * The shape every "nothing here" surface takes: an icon, a plain statement of
 * what is empty, a sentence on what to do, and a way out.
 *
 * @param {object} props
 * @param {import('react-icons').IconType} props.icon
 * @param {string} props.title
 * @param {string} [props.body]
 * @param {import('react').ReactNode} [props.action]
 */
export function EmptyState({ icon: Icon, title, body, action, className }) {
  return (
    <div
      className={cn(
        'rounded-panel border-border flex flex-col items-start gap-4 border border-dashed',
        'bg-surface-raised px-6 py-12 sm:px-10 sm:py-16',
        className,
      )}
    >
      <span className="bg-surface-brand text-brand-700 grid size-12 place-items-center rounded-full">
        <Icon aria-hidden="true" className="size-5" />
      </span>

      <div className="max-w-md space-y-2">
        <h2 className="font-display text-content text-2xl">{title}</h2>
        {body && <p className="text-content-muted text-sm leading-relaxed">{body}</p>}
      </div>

      {action}
    </div>
  );
}
