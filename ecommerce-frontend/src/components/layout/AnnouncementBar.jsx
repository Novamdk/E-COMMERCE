import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ANNOUNCEMENT_INTERVAL_MS, ANNOUNCEMENTS } from '@/lib/constants';
import { EASE_IN_SOFT, EASE_OUT_SOFT } from '@/lib/motion';
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
      aria-label="Announcements"
      aria-roledescription="carousel"
      className="bg-surface-inverse text-content-inverse"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <Container className="flex h-9 items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous announcement"
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
              {ANNOUNCEMENTS[index]}
            </m.p>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next announcement"
          className={ARROW_CLASS}
        >
          <FiChevronRight aria-hidden="true" className="size-3.5" />
        </button>
      </Container>
    </section>
  );
}
