import { FaCcAmex, FaCcDiscover } from 'react-icons/fa6';
import { SiPaypal, SiVisa } from 'react-icons/si';
import { cn } from '@/lib/cn';
import { useT } from '@/features/i18n';

/** Two overlapping discs: the Mastercard mark. */
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
 * Accepted payment marks: only what checkout really takes. Payment goes
 * through PayPal, which accepts a PayPal account or, without one, the four
 * major US cards. Each is a vector (no raster logos), drawn in its official
 * brand colour (the one place hex values are allowed: they are the card
 * networks' colours, not ours), on a white chip of identical size, so the row
 * stays crisp at any resolution and reads as one tidy set.
 *
 * Add a mark here only once checkout accepts it (Apple Pay or Google Pay need
 * extra PayPal setup first).
 */
const METHODS = [
  { id: 'paypal', label: 'PayPal', mark: <SiPaypal className="size-5 text-[#003087]" /> },
  { id: 'visa', label: 'Visa', mark: <SiVisa className="size-10 text-[#1A1F71]" /> },
  {
    id: 'mastercard',
    label: 'Mastercard',
    mark: <InterlockingCircles left="#EB001B" right="#F79E1B" overlap="#FF5F00" />,
  },
  { id: 'amex', label: 'American Express', mark: <FaCcAmex className="size-7 text-[#006FCF]" /> },
  { id: 'discover', label: 'Discover', mark: <FaCcDiscover className="size-7 text-[#FF6000]" /> },
];

/**
 * @param {{ className?: string }} props
 */
export function PaymentMethods({ className }) {
  const { t } = useT();
  return (
    <ul
      aria-label={t('footer.payments')}
      className={cn('grid grid-cols-5 gap-2.5 lg:flex lg:flex-wrap lg:gap-2', className)}
    >
      {METHODS.map((method) => (
        <li
          key={method.id}
          title={method.label}
          className="rounded-field bg-surface-raised grid h-14 place-items-center overflow-hidden shadow-[0_1px_2px_rgb(0_0_0/0.25)] sm:h-16 lg:h-9 lg:w-14"
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
