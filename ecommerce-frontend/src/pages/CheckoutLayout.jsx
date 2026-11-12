import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { PageShell } from '@/components/layout/PageShell';
import { usePageMeta } from '@/hooks/usePageMeta';
import { orderPath, ROUTES } from '@/lib/constants';
import { isPayPalEnabled } from '@/lib/backend';
import { identify, trackStartedCheckout } from '@/lib/klaviyo';
import { adBeginCheckout, adPurchase } from '@/lib/adTags';
import {
  completePayPalCheckout,
  createOrder,
  getGuestId,
  startPayPalCheckout,
} from '@/services/orderService';
import { useAuth } from '@/features/auth';
import { useCart, useCartLines } from '@/features/cart';
import {
  CHECKOUT_STEPS,
  CheckoutStepper,
  OrderTotalsAside,
  PayPalButtons,
  PaymentStep,
  preloadPayPalSdk,
  ReviewStep,
  ShippingStep,
  useCheckoutForm,
} from '@/features/checkout';

/**
 * Owns the checkout form for all three steps and renders the step named in the
 * URL. Because this component stays mounted across step changes, moving back
 * and forth never loses what has been typed.
 */
export default function CheckoutLayout() {
  const { step } = useParams();
  const navigate = useNavigate();
  const form = useCheckoutForm();
  const { user } = useAuth();
  const { clearCart, items } = useCart();
  const { lines, totals, loading, error } = useCartLines({
    shippingMethodId: form.shippingMethodId,
  });

  const [isPlacing, setIsPlacing] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  // Set once an order goes through. The render below then sends the shopper to
  // the order's thank-you page before any other check runs: emptying the cart
  // and clearing the form would otherwise trip the "empty cart" and "missing
  // address" guards and bounce them to the cart instead.
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const hasTrackedCheckout = useRef(false);
  const hasSentBeginCheckout = useRef(false);

  usePageMeta({ title: 'Checkout' });

  // Start fetching PayPal's script while the shopper types their address, so
  // the pay buttons are ready the moment they reach the pay step.
  useEffect(() => {
    if (isPayPalEnabled) preloadPayPalSdk();
  }, []);

  // Ad platforms count a checkout as soon as the shopper opens it, once per
  // visit, after the bag's total is known.
  const checkoutTotal = loading ? null : totals.total;
  useEffect(() => {
    if (hasSentBeginCheckout.current || checkoutTotal == null || !items.length) return;
    hasSentBeginCheckout.current = true;
    adBeginCheckout({ items, total: checkoutTotal });
  }, [checkoutTotal, items]);

  const isKnownStep = CHECKOUT_STEPS.includes(step);

  const goToStep = (next) => navigate(`${ROUTES.CHECKOUT}/${next}`);

  const handleContinue = () => {
    if (!form.attemptStep(step)) return;
    // The shipping step is where we first learn the shopper's email, so this
    // is when Klaviyo can tie the checkout to a person (once per visit).
    if (step === 'shipping' && !hasTrackedCheckout.current) {
      hasTrackedCheckout.current = true;
      identify({
        email: form.shipping.email,
        firstName: form.shipping.firstName,
        lastName: form.shipping.lastName,
      });
      trackStartedCheckout({ items, total: totals.total });
    }
    goToStep(step === 'shipping' ? 'payment' : 'review');
  };

  // Real checkout: the server prices the bag and opens the PayPal order, so
  // the browser only sends what is in the bag, never a price.
  const handlePayPalCreate = async () => {
    setSubmitError(null);
    const { paypalOrderId } = await startPayPalCheckout({
      items: items.map(({ productId, qty, size, color }) => ({ productId, qty, size, color })),
      promoCode: totals.promo?.code ?? null,
      shippingMethodId: form.shippingMethodId,
      shipping: form.shipping,
    }).catch((err) => {
      setSubmitError(err.message);
      throw err;
    });
    return paypalOrderId;
  };

  const handlePayPalApprove = async (paypalOrderId) => {
    setIsPlacing(true);
    setSubmitError(null);
    try {
      const order = await completePayPalCheckout(paypalOrderId);
      adPurchase(order);
      setPlacedOrderId(order.id);
      clearCart();
      form.resetAfterOrder();
    } catch (err) {
      setSubmitError(
        err.message ?? 'We could not confirm your payment. You have not been charged.',
      );
      setIsPlacing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!form.attemptStep('shipping')) {
      goToStep('shipping');
      return;
    }
    if (!form.attemptStep('payment')) {
      goToStep('payment');
      return;
    }

    setIsPlacing(true);
    setSubmitError(null);
    try {
      const order = await createOrder({
        // Guests get a stable per-browser id so their orders still group.
        userId: user?.id ?? getGuestId(),
        lines,
        totals,
        shipping: form.shipping,
        payment: form.payment,
        shippingMethodId: form.shippingMethodId,
        promoCode: totals.promo?.code ?? null,
      });

      setPlacedOrderId(order.id);
      clearCart();
      form.resetAfterOrder();
    } catch (err) {
      setSubmitError(err.message ?? 'We could not place your order. Please try again.');
      setIsPlacing(false);
    }
  };

  if (placedOrderId) {
    return <Navigate to={orderPath(placedOrderId)} replace state={{ isJustPlaced: true }} />;
  }

  if (!isKnownStep) return <Navigate to={ROUTES.CHECKOUT_SHIPPING} replace />;

  // Skipping ahead by URL is not allowed if the earlier step is incomplete.
  if (step !== 'shipping' && !form.isStepValid('shipping')) {
    return <Navigate to={ROUTES.CHECKOUT_SHIPPING} replace />;
  }
  if (step === 'review' && !form.isStepValid('payment')) {
    return <Navigate to={ROUTES.CHECKOUT_PAYMENT} replace />;
  }

  // An empty cart has nothing to check out.
  if (!loading && !error && lines.length === 0) {
    return <Navigate to={ROUTES.CART} replace />;
  }

  return (
    <PageShell className="py-6 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <h1 className="font-display text-2xl sm:text-3xl">Checkout</h1>
        <CheckoutStepper
          steps={CHECKOUT_STEPS}
          currentStep={step}
          canVisit={(target) =>
            target === 'shipping' ||
            (target === 'payment' && form.isStepValid('shipping')) ||
            (target === 'review' && !isPayPalEnabled && form.isReviewReady)
          }
        />
      </header>

      {/* The summary comes first so it sits on top on a phone; on a wide
          screen it moves to the right-hand column. */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-12">
        <OrderTotalsAside
          key={step === 'shipping' ? 'closed' : 'open'}
          lines={lines}
          totals={totals}
          isLoading={loading}
          isOpenOnPhone={step !== 'shipping'}
          className="lg:order-2"
        />

        <div className="min-w-0 lg:order-1">
          {error ? (
            <ErrorPanel title="Your cart could not load" error={error} />
          ) : (
            <>
              {step === 'shipping' && <ShippingStep form={form} onContinue={handleContinue} />}
              {step === 'payment' && isPayPalEnabled && (
                <ReviewStep
                  form={form}
                  lines={lines}
                  totals={totals}
                  isPlacing={isPlacing}
                  submitError={submitError}
                  onPlaceOrder={() => {}}
                  onEditStep={goToStep}
                  paySlot={
                    <PayPalButtons
                      disabled={isPlacing || lines.length === 0}
                      createOrder={handlePayPalCreate}
                      onApprove={handlePayPalApprove}
                      onError={setSubmitError}
                    />
                  }
                />
              )}
              {step === 'payment' && !isPayPalEnabled && (
                <PaymentStep
                  form={form}
                  onContinue={handleContinue}
                  onBack={() => goToStep('shipping')}
                />
              )}
              {step === 'review' && (
                <ReviewStep
                  form={form}
                  lines={lines}
                  totals={totals}
                  isPlacing={isPlacing}
                  submitError={submitError}
                  onPlaceOrder={handlePlaceOrder}
                  onEditStep={goToStep}
                />
              )}
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
