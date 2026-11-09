import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageShell } from '@/components/layout/PageShell';
import { ROUTES } from '@/lib/constants';

/**
 * Router-level error element. Keeps the header and footer in place so a broken
 * route still leaves the visitor somewhere they can navigate from.
 */
export function RouteError() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : (error?.message ?? 'An unexpected error occurred.');

  return (
    <PageShell width="narrow">
      <EmptyState
        icon={FiAlertTriangle}
        title="This route failed to load"
        body={message}
        action={
          <div className="flex flex-wrap gap-2">
            <Button to={ROUTES.HOME}>Back to home</Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        }
      />
    </PageShell>
  );
}
