import { PAYPAL_CLIENT_ID } from '@/lib/backend';

let sdkPromise = null;

/** Loads PayPal's JS SDK once per page. */
export function loadPayPalSdk() {
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

/** Starts loading PayPal's script early; a failure here is retried when the buttons mount. */
export function preloadPayPalSdk() {
  loadPayPalSdk().catch(() => {});
}
