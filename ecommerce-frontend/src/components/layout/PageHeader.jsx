import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { cn } from '@/lib/cn';

/**
 * The single <h1> for an interior page, with optional breadcrumbs and a
 * trailing slot for actions or counts.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {{label: string, to?: string}[]} [props.breadcrumbs]
 * @param {import('react').ReactNode} [props.actions]
 */
export function PageHeader({ title, description, breadcrumbs, actions, className }) {
  return (
    <header className={cn('flex flex-col gap-5', className)}>
      {breadcrumbs?.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="text-content-subtle flex flex-wrap items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                {index > 0 && <FiChevronRight aria-hidden="true" className="size-3.5" />}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-content transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-content-muted">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-2xl space-y-3">
          <h1 className="font-display text-display-sm sm:text-display">{title}</h1>
          {description && <p className="text-content-muted">{description}</p>}
        </div>
        {actions}
      </div>
    </header>
  );
}
