import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { PAYPAL_CLIENT_ID } from '@/lib/backend';

let sdkPromise = null;

/** Loads PayPal's JS SDK once per page. */
function loadPayPalSdk() {
  if (window.paypal?.Buttons) return Promise.resolve(window.paypal);
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const params = new URLSearchParams({
        'client-id': PAYPAL_CLIENT_ID,
        currency: 'USD',
        intent: 'capture',
        components: 'buttons',
      });
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?${params}`;
      script.async = true;
      script.onload = () => (window.paypal?.Buttons ? resolve(window.paypal) : reject(new Error()));
      script.onerror = () => {
        sdkPromise = null;
        reject(new Error('PayPal did not load'));
      };
      document.head.appendChild(script);
    });
  }
  return sdkPromise;
}

/**
 * PayPal's own buttons (PayPal, and debit or credit card through PayPal).
 * The card details are typed into PayPal's secure fields, never into this site.
 *
 * @param {object} props
 * @param {() => Promise<string>} props.createOrder returns the PayPal order id
 * @param {(paypalOrderId: string) => Promise<void>} props.onApprove
 * @param {(message: string) => void} props.onError
 * @param {boolean} [props.disabled]
 */
export function PayPalButtons({ createOrder, onApprove, onError, disabled = false }) {
  const containerRef = useRef(null);
  const handlersRef = useRef({ createOrder, onApprove, onError });
  const [status, setStatus] = useState('loading');

  // The buttons render once; they call whatever handlers are current.
  useEffect(() => {
    handlersRef.current = { createOrder, onApprove, onError };
  });

  useEffect(() => {
    let buttons = null;
    let isActive = true;

    loadPayPalSdk()
      .then((paypal) => {
        if (!isActive || !containerRef.current) return;
        buttons = paypal.Buttons({
          style: { layout: 'vertical', shape: 'rect', color: 'black', label: 'pay', height: 48 },
          createOrder: () => handlersRef.current.createOrder(),
          onApprove: (data) => handlersRef.current.onApprove(data.orderID),
          onCancel: () => {},
          onError: () =>
            handlersRef.current.onError(
              'PayPal could not complete the payment. You have not been charged.',
            ),
        });
        return buttons.render(containerRef.current).then(() => {
          if (isActive) setStatus('ready');
        });
      })
      .catch(() => {
        if (isActive) setStatus('failed');
      });

    return () => {
      isActive = false;
      buttons?.close?.().catch?.(() => {});
    };
  }, []);

  return (
    <div className={disabled ? 'pointer-events-none opacity-50' : undefined} aria-busy={disabled}>
      {status === 'loading' && (
        <div className="flex h-24 items-center justify-center">
          <Spinner />
        </div>
      )}
      {status === 'failed' && (
        <p role="alert" className="rounded-field bg-danger-50 text-danger-600 px-3.5 py-3 text-sm">
          The payment options did not load. Check your connection and refresh the page.
        </p>
      )}
      <div ref={containerRef} className="min-h-0" />
    </div>
  );
}
