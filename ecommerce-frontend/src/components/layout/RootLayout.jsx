import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { EASE_OUT_SOFT } from '@/lib/motion';
import { adPageView } from '@/lib/adTags';
import { useScrollToTopOnNavigate } from '@/hooks/useScrollToTopOnNavigate';
import { CartDrawer } from '@/features/cart';
import { SpinWheelPopup } from '@/features/promo';
import { AnnouncementBar } from './AnnouncementBar';
import { Footer } from './Footer';
import { Header } from './Header';
import { RouteFallback } from './RouteFallback';

/**
 * Chrome that persists across every route.
 *
 * Suspense sits outside AnimatePresence so the loading skeleton is not itself
 * animated in and out, and the transition is keyed on pathname only — changing
 * a filter rewrites the query string and should not re-animate the page.
 */
export function RootLayout() {
  const { pathname, search } = useLocation();
  useScrollToTopOnNavigate();

  // Ad platforms count page views by route, since the app never reloads.
  useEffect(() => {
    adPageView();
  }, [pathname, search]);

  return (
    // The SK look (style guide draft) shows on the home page only for review.
    // Remove data-look here and the [data-look='sk'] block in index.css to drop it.
    <div className="flex min-h-dvh flex-col" data-look={pathname === '/' ? 'sk' : undefined}>
      <AnnouncementBar />
      <Header />

      <main id="main" className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.34, ease: EASE_OUT_SOFT } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.16 } }}
            >
              <Outlet />
            </m.div>
          </AnimatePresence>
        </Suspense>
      </main>

      <Footer />
      <CartDrawer />
      <SpinWheelPopup />
    </div>
  );
}
