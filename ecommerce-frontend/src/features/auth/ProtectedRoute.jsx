import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from './useAuth';

/**
 * Gate for checkout and orders. Holds rendering while the stored session is
 * still being read, so a refresh on a protected URL does not flash the
 * sign-in page, and remembers where the visitor was headed.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isResolving } = useAuth();
  const location = useLocation();

  if (isResolving) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner size="lg" label="Checking your session" className="text-brand-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.SIGN_IN}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}
