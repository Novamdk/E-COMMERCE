import { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { AuthShell } from '@/components/layout/AuthShell';
import { ROUTES } from '@/lib/constants';
import { SignInForm, useAuth } from '@/features/auth';

export default function SignInPage() {
  const { isAuthenticated, isResolving, clearError } = useAuth();
  const location = useLocation();

  // Where ProtectedRoute wanted to send them, if anywhere.
  const redirectTo = location.state?.from ?? ROUTES.HOME;

  // Drop a stale error from a previous attempt when arriving fresh.
  useEffect(() => clearError(), [clearError]);

  if (!isResolving && isAuthenticated) return <Navigate to={redirectTo} replace />;

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to check out faster and see your order history."
      footer={
        <>
          New here?{' '}
          <Link
            to={ROUTES.SIGN_UP}
            state={location.state}
            className="text-brand-700 font-medium hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
