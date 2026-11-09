import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { ProtectedRoute } from '@/features/auth';
import { ROUTES, SHOW_STORE_FINDER } from '@/lib/constants';
import { RouteError } from './RouteError';

/**
 * Route-level code splitting. Each page is its own chunk, so the landing route
 * never ships the checkout flow. Pages use default exports purely so they can
 * be lazy-loaded like this.
 */
const HomePage = lazy(() => import('@/pages/HomePage'));
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const StoresPage = lazy(() => import('@/pages/StoresPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const SignInPage = lazy(() => import('@/pages/SignInPage'));
const SignUpPage = lazy(() => import('@/pages/SignUpPage'));
const CheckoutLayout = lazy(() => import('@/pages/CheckoutLayout'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'));
const CollectionPage = lazy(() => import('@/pages/CollectionPage'));
const GiftGuidePage = lazy(() => import('@/pages/GiftGuidePage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const JournalPage = lazy(() => import('@/pages/JournalPage'));
const JournalPostPage = lazy(() => import('@/pages/JournalPostPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'shop/:slug', element: <ProductDetailPage /> },
      { path: 'collections/:slug', element: <CollectionPage /> },
      { path: 'gift-guide', element: <GiftGuidePage /> },
      { path: 'quiz/:quizId', element: <QuizPage /> },
      { path: 'journal', element: <JournalPage /> },
      { path: 'journal/:slug', element: <JournalPostPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'about', element: <AboutPage /> },
      ...(SHOW_STORE_FINDER ? [{ path: 'stores', element: <StoresPage /> }] : []),
      { path: 'contact', element: <ContactPage /> },
      { path: 'sign-in', element: <SignInPage /> },
      { path: 'sign-up', element: <SignUpPage /> },

      // Guest checkout: hitting Checkout goes straight to the shipping address
      // rather than bouncing through sign-in. Signing in is an optional
      // convenience, not a gate on buying something.
      {
        path: 'checkout',
        children: [
          { index: true, element: <Navigate to="shipping" replace /> },
          // One element for all three steps: the layout owns the form state
          // and renders the step named in the URL, which keeps the whole flow
          // in a single chunk and the data in one place.
          { path: ':step', element: <CheckoutLayout /> },
        ],
      },
      // A guest must be able to see the confirmation for the order they just
      // placed, so only the history *list* is behind auth.
      { path: 'orders/:orderId', element: <OrderConfirmationPage /> },

      {
        element: <ProtectedRoute />,
        children: [{ path: 'orders', element: <OrdersPage /> }],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
