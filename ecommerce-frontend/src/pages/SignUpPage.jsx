import { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { AuthShell } from '@/components/layout/AuthShell';
import { ROUTES } from '@/lib/constants';
import { SignUpForm, useAuth } from '@/features/auth';

export default function SignUpPage() {
  const { isAuthenticated, isResolving, clearError } = useAuth();
  const location = useLocation();
  const redirectTo = location.state?.from ?? ROUTES.HOME;

  useEffect(() => clearError(), [clearError]);

  if (!isResolving && isAuthenticated) return <Navigate to={redirectTo} replace />;

  return (
    <AuthShell
      title="Create your account"
      description="Save your details for next time and keep a record of what you have ordered."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to={ROUTES.SIGN_IN}
            state={location.state}
            className="text-brand-700 font-medium hover:underline"
          >
            Sign in instead
          </Link>
        </>
      }
    >
      <SignUpForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
