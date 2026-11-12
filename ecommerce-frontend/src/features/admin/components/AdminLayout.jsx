import { Suspense, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BrandMark } from '@/components/layout/BrandMark';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/cn';

const TABS = [
  { to: ROUTES.ADMIN_ORDERS, label: 'Orders', end: false },
  { to: ROUTES.ADMIN_CUSTOMERS, label: 'Customers', end: true },
];

/**
 * The private admin area's own frame: no store header, footer, popups or ad
 * tags, and a robots tag so it never shows up in search.
 */
export function AdminLayout() {
  const { user, signOut } = useAuth();

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.append(meta);
    return () => meta.remove();
  }, []);

  return (
    <div className="bg-surface-sunken min-h-dvh">
      <header className="bg-surface-raised border-border border-b print:hidden">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <BrandMark size="sm" />
          <span className="text-content-muted text-xs font-semibold tracking-[0.14em] uppercase">
            Store admin
          </span>
          <nav aria-label="Admin" className="flex gap-1">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-field px-3 py-2 text-sm font-semibold',
                    isActive ? 'bg-ink-100 text-content' : 'text-content-muted hover:text-content',
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-content-muted hidden truncate sm:inline">{user?.email}</span>
            <button
              type="button"
              onClick={signOut}
              className="text-content-muted hover:text-content font-semibold underline-offset-4 hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <Suspense
          fallback={
            <div className="grid min-h-[40vh] place-items-center">
              <Spinner size="lg" label="Loading" className="text-brand-600" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
