import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ANNOUNCEMENT_INTERVAL_MS, ANNOUNCEMENTS } from '@/lib/constants';
import { EASE_IN_SOFT, EASE_OUT_SOFT } from '@/lib/motion';
import { LanguageSelect, useT } from '@/features/i18n';
import { Container } from './Container';

const MESSAGE_MOTION = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_SOFT } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: EASE_IN_SOFT } },
};

const ARROW_CLASS =
  'grid size-8 shrink-0 place-items-center text-content-inverse/70 transition-colors hover:text-content-inverse';

/**
 * Slim rotating promo bar above the header. Pauses while hovered or focused
 * so a shopper can read a message without it sliding away, and the arrows
 * give keyboard and touch users the same control.
 */
export function AnnouncementBar() {
  const { t } = useT();
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const count = ANNOUNCEMENTS.length;

  useEffect(() => {
    if (isPaused || count < 2) return undefined;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), ANNOUNCEMENT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isPaused, count]);

  const step = (delta) => setIndex((i) => (i + delta + count) % count);

  return (
    <section
      aria-label={t('announcements.label')}
      aria-roledescription="carousel"
      className="bg-surface-inverse text-content-inverse"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <Container width="wide" className="relative h-9">
        {/* Arrows hug the message; from lg up the language picker sits at the far right. */}
        <div className="mx-auto flex h-full max-w-2xl items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={t('announcements.previous')}
            className={ARROW_CLASS}
          >
            <FiChevronLeft aria-hidden="true" className="size-3.5" />
          </button>

          <div className="relative h-full flex-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <m.p
                key={index}
                {...MESSAGE_MOTION}
                className="absolute inset-0 grid place-items-center truncate text-center text-[0.6875rem] font-medium tracking-[0.1em] uppercase sm:tracking-[0.14em]"
              >
                {t(ANNOUNCEMENTS[index].key, ANNOUNCEMENTS[index].values)}
              </m.p>
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => step(1)}
            aria-label={t('announcements.next')}
            className={ARROW_CLASS}
          >
            <FiChevronRight aria-hidden="true" className="size-3.5" />
          </button>
        </div>

        <div className="absolute inset-y-0 right-8 hidden items-center lg:flex">
          <LanguageSelect tone="inverse" />
        </div>
      </Container>
    </section>
  );
}
