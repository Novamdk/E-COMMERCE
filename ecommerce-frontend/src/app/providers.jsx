import { domAnimation, LazyMotion, MotionConfig } from 'framer-motion';
import { ReactLenis } from 'lenis/react';
import { AuthProvider } from '@/features/auth';
import { CartProvider } from '@/features/cart';
import { I18nProvider } from '@/features/i18n';
import { WishlistProvider } from '@/features/wishlist';

/** Lenis tuning: short, low-inertia easing — smooth without feeling laggy. */
const LENIS_OPTIONS = {
  duration: 0.9,
  lerp: 0.12,
  smoothWheel: true,
  // Native momentum on touch devices beats a JS approximation of it.
  syncTouch: false,
  autoRaf: true,
};

/**
 * One provider per concern, composed in one place. Order matters only in that
 * auth sits outermost — the cart and wishlist never read it, but a future
 * server-synced cart would.
 */
export function Providers({ children }) {
  return (
    // reducedMotion="user" makes every Framer Motion animation respect the
    // OS setting, matching what the stylesheet already does for CSS.
    <MotionConfig reducedMotion="user">
      {/*
        LazyMotion + the `m` component ship only the animation features this
        app actually uses (variants, exit, gestures) instead of the full
        `motion` bundle — roughly half the JavaScript.

        Importing `motion` instead of `m` would quietly pull the full bundle
        back in, so ESLint bans that import rather than relying on
        LazyMotion's `strict` flag, which only fails at render time.

        Layout animations are NOT in domAnimation; if one is ever needed,
        swap it for domMax here.
      */}
      <LazyMotion features={domAnimation}>
        <ReactLenis root options={LENIS_OPTIONS}>
          <I18nProvider>
            <AuthProvider>
              <WishlistProvider>
                <CartProvider>{children}</CartProvider>
              </WishlistProvider>
            </AuthProvider>
          </I18nProvider>
        </ReactLenis>
      </LazyMotion>
    </MotionConfig>
  );
}
