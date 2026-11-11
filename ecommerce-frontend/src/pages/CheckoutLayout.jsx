import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/layout/PageShell';
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
  ReviewStep,
  ShippingStep,
  useCheckoutForm,
} from '@/features/checkout';

const STEP_TITLES = {
  shipping: 'Where should we send it?',
  payment: isPayPalEnabled ? 'Check everything over and pay' : 'How would you like to pay?',
  review: 'Check everything over',
};

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
  const [hasPlacedOrder, setHasPlacedOrder] = useState(false);
  const hasTrackedCheckout = useRef(false);
  const hasSentBeginCheckout = useRef(false);

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
      setHasPlacedOrder(true);
      clearCart();
      form.resetAfterOrder();
      navigate(orderPath(order.id), { replace: true, state: { isJustPlaced: true } });
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

      setHasPlacedOrder(true);
      clearCart();
      form.resetAfterOrder();
      navigate(orderPath(order.id), { replace: true, state: { isJustPlaced: true } });
    } catch (err) {
      setSubmitError(err.message ?? 'We could not place your order. Please try again.');
      setIsPlacing(false);
    }
  };

  if (!isKnownStep) return <Navigate to={ROUTES.CHECKOUT_SHIPPING} replace />;

  // Skipping ahead by URL is not allowed if the earlier step is incomplete.
  if (step !== 'shipping' && !form.isStepValid('shipping')) {
    return <Navigate to={ROUTES.CHECKOUT_SHIPPING} replace />;
  }
  if (step === 'review' && !form.isStepValid('payment')) {
    return <Navigate to={ROUTES.CHECKOUT_PAYMENT} replace />;
  }

  // An empty cart has nothing to check out — unless we just emptied it ourselves.
  if (!loading && !error && lines.length === 0 && !hasPlacedOrder) {
    return <Navigate to={ROUTES.CART} replace />;
  }

  return (
    <PageShell>
      <PageHeader
        title={STEP_TITLES[step]}
        breadcrumbs={[
          { label: 'Home', to: ROUTES.HOME },
          { label: 'Cart', to: ROUTES.CART },
          { label: 'Checkout' },
        ]}
      />

      <div className="mt-8">
        <CheckoutStepper
          steps={CHECKOUT_STEPS}
          currentStep={step}
          canVisit={(target) =>
            target === 'shipping' ||
            (target === 'payment' && form.isStepValid('shipping')) ||
            (target === 'review' && !isPayPalEnabled && form.isReviewReady)
          }
        />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <div className="min-w-0">
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

        <OrderTotalsAside lines={lines} totals={totals} isLoading={loading} />
      </div>
    </PageShell>
  );
}
