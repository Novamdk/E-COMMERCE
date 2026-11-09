import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PROMO_CODES, ROUTES, SPIN_WHEEL, STORAGE_KEYS } from '@/lib/constants';
import { email as validateEmail } from '@/lib/validators';
import { useCart } from '@/features/cart';
import { SpinWheel } from './SpinWheel';

const TITLE_ID = 'spin-wheel-title';
const PROMO = PROMO_CODES[SPIN_WHEEL.PROMO_CODE];

/**
 * First-visit welcome offer: spin, land on 25%, leave an email, and the code
 * is applied to the bag. Shown once per browser, never on checkout, and only
 * after a short delay so it does not ambush someone the moment they land.
 *
 * Step: 'spin' → 'spinning' → 'won' (email form) → 'claimed'.
 */
export function SpinWheelPopup() {
  const { pathname } = useLocation();
  const { applyPromo } = useCart();
  const [hasSeen, setHasSeen] = useLocalStorage(STORAGE_KEYS.SPIN_WHEEL, false);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('spin');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const isCheckout = pathname.startsWith(ROUTES.CHECKOUT);

  useEffect(() => {
    if (hasSeen || isCheckout) return undefined;
    const id = window.setTimeout(() => setIsOpen(true), SPIN_WHEEL.OPEN_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [hasSeen, isCheckout]);

  const close = () => {
    setIsOpen(false);
    setHasSeen(true);
  };

  const handleClaim = (event) => {
    event.preventDefault();
    const message = validateEmail(email);
    if (message) {
      setError(message);
      return;
    }
    applyPromo(PROMO.code);
    setStep('claimed');
  };

  const title =
    step === 'won' || step === 'claimed'
      ? `You won ${PROMO.value}% off`
      : 'Spin to unlock your gift';

  return (
    <Modal isOpen={isOpen} onClose={close} title={title} titleId={TITLE_ID} size="sm">
      <div className="space-y-6 text-center">
        {(step === 'spin' || step === 'spinning') && (
          <>
            <p className="text-content-muted text-sm">
              Spin for a welcome gift on your first order.
            </p>
            <SpinWheel isSpinning={step === 'spinning'} onSpinEnd={() => setStep('won')} />
            <Button
              isFullWidth
              size="lg"
              onClick={() => setStep('spinning')}
              disabled={step === 'spinning'}
            >
              {step === 'spinning' ? 'Spinning…' : 'Spin the wheel'}
            </Button>
          </>
        )}

        {step === 'won' && (
          <form onSubmit={handleClaim} noValidate className="space-y-4">
            <p className="font-display text-display">{PROMO.value}% off</p>
            <p className="text-content-muted text-sm">
              Claim your {PROMO.value}% off. Enter your email and we will apply it to your bag.
            </p>
            <label htmlFor="spin-email" className="sr-only">
              Email address
            </label>
            <Input
              id="spin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
              }}
              placeholder="Insert email here"
              hasError={Boolean(error)}
              aria-describedby="spin-email-feedback"
            />
            <p id="spin-email-feedback" aria-live="polite" className="text-danger-600 text-xs">
              {error}
            </p>
            <Button type="submit" isFullWidth size="lg">
              Claim {PROMO.value}% off
            </Button>
          </form>
        )}

        {step === 'claimed' && (
          <div className="space-y-5">
            <p className="bg-success-50 text-success-600 rounded-field flex items-center justify-center gap-2 px-4 py-3 text-sm">
              <FiCheck aria-hidden="true" className="size-4" />
              Code applied to your bag
            </p>
            <p className="text-content-muted text-sm">
              Your code is{' '}
              <span className="text-content font-semibold tracking-[0.12em]">{PROMO.code}</span>. It
              comes off at checkout automatically.
            </p>
            <Button isFullWidth size="lg" onClick={close}>
              Start shopping
            </Button>
          </div>
        )}

        {step !== 'claimed' && (
          <button
            type="button"
            onClick={close}
            className="text-content-subtle hover:text-content text-xs underline underline-offset-4"
          >
            No thanks
          </button>
        )}
      </div>
    </Modal>
  );
}
