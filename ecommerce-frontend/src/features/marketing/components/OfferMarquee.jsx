import { useState } from 'react';
import { FiPause, FiPlay } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { useT } from '@/features/i18n';

/** Copies of the message list laid end to end, so the loop has no visible seam. */
const REPEATS = 4;

/**
 * Holiday-red band of offers that scrolls sideways under the hero. The
 * animation is pure CSS (see .animate-marquee), pausable with the button, and
 * the stylesheet stops it entirely for reduced-motion users. Screen readers
 * get the messages once, as a plain list.
 *
 * @param {object} props
 * @param {string[]} props.messages already translated
 */
export function OfferMarquee({ messages }) {
  const { t } = useT();
  const [isPaused, setIsPaused] = useState(false);

  if (messages.length === 0) return null;

  return (
    <section aria-label={t('home.marquee.label')} className="bg-holiday-600 text-content-inverse">
      <ul className="sr-only">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>

      <div className="relative flex h-14 items-center overflow-hidden" aria-hidden="true">
        <div
          className={cn(
            'animate-marquee flex w-max shrink-0 items-center',
            isPaused && '[animation-play-state:paused]',
          )}
        >
          {Array.from({ length: REPEATS }, (_, copy) =>
            messages.map((message) => (
              <span
                key={`${copy}-${message}`}
                className="px-7 text-xs font-semibold tracking-[0.14em] whitespace-nowrap uppercase sm:text-sm"
              >
                {message}
              </span>
            )),
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsPaused((paused) => !paused)}
        aria-label={isPaused ? t('home.marquee.play') : t('home.marquee.pause')}
        className="bg-surface-raised text-content absolute right-4 -mt-11 grid size-8 place-items-center rounded-full shadow-sm"
      >
        {isPaused ? (
          <FiPlay aria-hidden="true" className="size-3.5" />
        ) : (
          <FiPause aria-hidden="true" className="size-3.5" />
        )}
      </button>
    </section>
  );
}
