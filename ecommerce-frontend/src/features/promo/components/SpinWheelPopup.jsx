import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCheck, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';
import { Input } from '@/components/ui/Input';
import { Overlay } from '@/components/ui/Overlay';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/cn';
import { EASE_IN_SOFT, EASE_OUT_SOFT } from '@/lib/motion';
import { PROMO_CODES, ROUTES, SPIN_WHEEL, STORAGE_KEYS } from '@/lib/constants';
import { email as validateEmail } from '@/lib/validators';
import { useCart } from '@/features/cart';
import { useT } from '@/features/i18n';
import { subscribeEmail } from '@/services/subscribeService';
import { ConfettiBurst } from './ConfettiBurst';
import { SpinWheel } from './SpinWheel';

const TITLE_ID = 'spin-wheel-title';
const PROMO = PROMO_CODES[SPIN_WHEEL.PROMO_CODE];
const LANDED_PAUSE_MS = 1100;
/** How long the party burst stays mounted after the wheel lands. */
const CONFETTI_MS = 2600;

/** Same entrance as Modal: rises on phones, scales in from centre above. */
const PANEL_MOTION = {
  initial: { opacity: 0, y: 28, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE_OUT_SOFT } },
  exit: { opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.24, ease: EASE_IN_SOFT } },
};

/**
 * First-visit welcome offer, in a two-panel layout: the gift still life on
 * the left, the offer on the right. Spin, land on 25%, leave an email, and
 * the code is applied to the bag. Shown once per browser, never on checkout,
 * and only after a short delay so it does not ambush someone on arrival.
 * Any link to `?offer=welcome` (the hero's sign-up button) opens it at once,
 * even for someone who has already seen it.
 *
 * Built on Overlay directly (like Modal and Drawer) because the image panel
 * needs the full height of the dialog, which Modal's header row would break.
 *
 * Step: 'spin' → 'spinning' → 'landed' (brief pause) → 'won' (email form) → 'claimed'.
 */
export function SpinWheelPopup() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { t } = useT();
  const { applyPromo } = useCart();
  const [hasSeen, setHasSeen] = useLocalStorage(STORAGE_KEYS.SPIN_WHEEL, false);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('spin');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [confettiOrigin, setConfettiOrigin] = useState(null);
  const wheelRef = useRef(null);

  const isCheckout = pathname.startsWith(ROUTES.CHECKOUT);
  const isWheelStep = step === 'spin' || step === 'spinning' || step === 'landed';

  // Hold on the stopped wheel for a beat so the 25% under the pointer lands.
  useEffect(() => {
    if (step !== 'landed') return undefined;
    const id = window.setTimeout(() => setStep('won'), LANDED_PAUSE_MS);
    return () => window.clearTimeout(id);
  }, [step]);

  // The wheel always lands on 25%: celebrate with a burst from the wheel.
  const handleSpinEnd = () => {
    setStep('landed');
    const box = wheelRef.current?.getBoundingClientRect();
    if (box) setConfettiOrigin({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
  };

  useEffect(() => {
    if (!confettiOrigin) return undefined;
    const id = window.setTimeout(() => setConfettiOrigin(null), CONFETTI_MS);
    return () => window.clearTimeout(id);
  }, [confettiOrigin]);

  useEffect(() => {
    if (hasSeen || isCheckout) return undefined;
    const id = window.setTimeout(() => setIsOpen(true), SPIN_WHEEL.OPEN_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [hasSeen, isCheckout]);

  // Any link to ?offer=welcome shows it straight away; closing drops the flag.
  const params = new URLSearchParams(search);
  const isRequested = params.get('offer') === 'welcome';

  const close = () => {
    setIsOpen(false);
    setHasSeen(true);
    if (!isRequested) return;
    params.delete('offer');
    const rest = params.toString();
    navigate({ pathname, search: rest ? `?${rest}` : '' }, { replace: true });
  };

  const handleClaim = (event) => {
    event.preventDefault();
    const message = validateEmail(email);
    if (message) {
      setError(message && t('quiz.unlock.emailError'));
      return;
    }
    applyPromo(PROMO.code);
    subscribeEmail({ email: email.trim(), source: 'Spin wheel' });
    setStep('claimed');
  };

  return (
    <>
      {confettiOrigin && <ConfettiBurst origin={confettiOrigin} />}
      <Overlay
        isOpen={isOpen || isRequested}
        onClose={close}
        titleId={TITLE_ID}
        containerClassName="items-end justify-center sm:items-center sm:p-4"
        panelClassName="max-h-[92dvh] w-full overflow-hidden rounded-t-panel sm:max-w-4xl sm:rounded-panel"
        panelMotion={PANEL_MOTION}
      >
        <button
          type="button"
          onClick={close}
          aria-label={t('welcome.close')}
          className="rounded-field text-content-muted hover:bg-ink-100 hover:text-content absolute top-3 right-3 z-10 grid size-9 place-items-center bg-white/80 backdrop-blur transition-colors md:bg-transparent md:backdrop-blur-none"
        >
          <FiX className="size-5" />
        </button>

        <div className="grid min-h-0 md:grid-cols-2">
          {/* Gift still life. A short banner on phones (offer steps only, so the
            wheel keeps the room it needs), the full left panel from md up. */}
          <div
            className={cn('relative md:block', isWheelStep ? 'hidden' : 'h-44 sm:h-56 md:h-auto')}
          >
            <div className="absolute inset-0">
              <Image
                name="welcome-gift"
                alt={t('welcome.imageAlt')}
                sizes="(min-width: 768px) 28rem, 100vw"
                className="size-full"
                imgClassName="object-[50%_62%] md:object-center"
              />
            </div>
          </div>

          <div
            data-lenis-prevent
            className="flex min-h-0 flex-col items-center overflow-y-auto overscroll-contain px-6 pt-8 pb-6 text-center sm:px-10 md:min-h-[34rem] md:justify-center md:py-12"
          >
            <Image
              name="brand-mark"
              alt="SK Envision"
              sizes="5rem"
              ratio="aspect-[400/319]"
              fit="contain"
              isTransparent
              className="w-16"
            />

            {isWheelStep && (
              <div className="mt-5 flex w-full flex-col items-center">
                <p className="text-gold-600 text-[0.6875rem] font-semibold tracking-[0.2em] uppercase">
                  {t('welcome.eyebrow')}
                </p>
                <h2 id={TITLE_ID} className="font-display mt-2 text-3xl tracking-tight uppercase">
                  {t('welcome.spinTitle')}
                </h2>
                <p className="text-content-muted mt-2 text-sm">
                  {t('welcome.spinBody', { percent: PROMO.value })}
                </p>
                {/* Tapping the wheel itself spins it too, same as the button below.
                  Disabled once spinning, so it still spins only once. */}
                <button
                  ref={wheelRef}
                  type="button"
                  onClick={() => setStep('spinning')}
                  disabled={step !== 'spin'}
                  aria-label={t('welcome.spin')}
                  tabIndex={-1}
                  className="mt-6 block w-full cursor-pointer rounded-full [-webkit-tap-highlight-color:transparent] disabled:cursor-default"
                >
                  <SpinWheel
                    isSpinning={step === 'spinning' || step === 'landed'}
                    onSpinEnd={handleSpinEnd}
                  />
                </button>
                <Button
                  size="lg"
                  isFullWidth
                  className="mt-7 max-w-xs"
                  onClick={() => setStep('spinning')}
                  disabled={step !== 'spin'}
                >
                  {step === 'spin' && t('welcome.spin')}
                  {step === 'spinning' && t('welcome.spinning')}
                  {step === 'landed' && t('welcome.landed', { percent: PROMO.value })}
                </Button>
              </div>
            )}

            {step === 'won' && (
              <form onSubmit={handleClaim} noValidate className="mt-6 w-full max-w-sm">
                <h2
                  id={TITLE_ID}
                  className="font-display text-4xl leading-none tracking-tight uppercase sm:text-5xl"
                >
                  {t('welcome.offerLine1', { percent: PROMO.value })}
                  <span className="block">{t('welcome.offerLine2')}</span>
                </h2>
                {/* TODO(owner): confirm these subscriber perks before launch. */}
                <p className="mt-4 text-sm font-semibold">{t('welcome.perks')}</p>
                <p className="text-content-muted mt-2 text-sm">{t('welcome.signUp')}</p>

                <label htmlFor="spin-email" className="sr-only">
                  {t('welcome.emailLabel')}
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
                  placeholder={t('welcome.emailPlaceholder')}
                  hasError={Boolean(error)}
                  aria-describedby="spin-email-feedback"
                  className="mt-6 h-12"
                />
                <p
                  id="spin-email-feedback"
                  aria-live="polite"
                  className="text-danger-600 mt-1 min-h-4 text-left text-xs"
                >
                  {error}
                </p>
                <Button type="submit" isFullWidth size="lg" className="mt-2">
                  {t('welcome.submit')}
                </Button>
              </form>
            )}

            {step === 'claimed' && (
              <div className="mt-6 w-full max-w-sm space-y-5">
                <h2 id={TITLE_ID} className="font-display text-3xl tracking-tight uppercase">
                  {t('welcome.claimedTitle')}
                </h2>
                <p className="bg-success-50 text-success-600 rounded-field flex items-center justify-center gap-2 px-4 py-3 text-sm">
                  <FiCheck aria-hidden="true" className="size-4" />
                  {t('welcome.applied', { percent: PROMO.value })}
                </p>
                <p className="text-content-muted text-sm">
                  {t('welcome.codeBefore')}{' '}
                  <span className="text-content font-semibold tracking-[0.12em]">{PROMO.code}</span>
                  . {t('welcome.codeAfter')}
                </p>
                <Button isFullWidth size="lg" onClick={close}>
                  {t('welcome.startShopping')}
                </Button>
              </div>
            )}

            {step !== 'claimed' && (
              <button
                type="button"
                onClick={close}
                className="text-content-subtle hover:text-content mt-4 text-xs underline underline-offset-4"
              >
                {t('welcome.noThanks')}
              </button>
            )}
          </div>
        </div>
      </Overlay>
    </>
  );
}
