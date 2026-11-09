import { FaCcAmazonPay } from 'react-icons/fa6';
import { SiApplepay, SiGooglepay, SiPaypal, SiStripe, SiVisa } from 'react-icons/si';
import { cn } from '@/lib/cn';
import { useT } from '@/features/i18n';

/** Two overlapping discs: the Mastercard and Maestro marks share this shape. */
function InterlockingCircles({ left, right, overlap }) {
  return (
    <svg viewBox="0 0 38 24" className="h-6 w-9" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill={left} />
      <circle cx="26" cy="12" r="10" fill={right} />
      <path d="M19 4.8a10 10 0 0 1 0 14.4 10 10 0 0 1 0-14.4Z" fill={overlap} />
    </svg>
  );
}

/**
 * Accepted payment marks. Each is a vector (no raster logos), drawn in its
 * official brand colour (the one place hex values are allowed: they are the
 * card networks' colours, not ours), on a white chip of identical size, so
 * the row stays crisp at any resolution and reads as one tidy set.
 *
 * Wordmark logos (Visa, Apple Pay, Google Pay) sit small inside their square
 * icon box, so they get a larger box than symbol logos to read at the same
 * optical size.
 */
const METHODS = [
  { id: 'paypal', label: 'PayPal', mark: <SiPaypal className="size-5 text-[#003087]" /> },
  {
    id: 'mastercard',
    label: 'Mastercard',
    mark: <InterlockingCircles left="#EB001B" right="#F79E1B" overlap="#FF5F00" />,
  },
  { id: 'visa', label: 'Visa', mark: <SiVisa className="size-10 text-[#1A1F71]" /> },
  {
    id: 'maestro',
    label: 'Maestro',
    mark: <InterlockingCircles left="#EB001B" right="#00A2E5" overlap="#7375CF" />,
  },
  { id: 'applepay', label: 'Apple Pay', mark: <SiApplepay className="size-11 text-black" /> },
  {
    id: 'amazonpay',
    label: 'Amazon Pay',
    mark: <FaCcAmazonPay className="size-7 text-[#232F3E]" />,
  },
  {
    id: 'googlepay',
    label: 'Google Pay',
    mark: <SiGooglepay className="size-11 text-[#5F6368]" />,
  },
  { id: 'stripe', label: 'Stripe', mark: <SiStripe className="size-5 text-[#635BFF]" /> },
];

/**
 * @param {{ className?: string }} props
 */
export function PaymentMethods({ className }) {
  const { t } = useT();
  return (
    <ul aria-label={t('footer.payments')} className={cn('flex flex-wrap gap-2', className)}>
      {METHODS.map((method) => (
        <li
          key={method.id}
          title={method.label}
          className="rounded-field bg-surface-raised grid h-9 w-14 place-items-center overflow-hidden shadow-[0_1px_2px_rgb(0_0_0/0.25)]"
        >
          <span aria-hidden="true" className="grid place-items-center">
            {method.mark}
          </span>
          <span className="sr-only">{method.label}</span>
        </li>
      ))}
    </ul>
  );
}
