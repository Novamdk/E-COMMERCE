import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { Image } from '@/components/ui/Image';
import { cn } from '@/lib/cn';
import { EASE_IN_SOFT, EASE_OUT_SOFT } from '@/lib/motion';

/** Grace period so the panel survives the pointer crossing the gap below the trigger. */
const CLOSE_DELAY_MS = 140;

const PANEL_MOTION = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.24, ease: EASE_OUT_SOFT } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.16, ease: EASE_IN_SOFT } },
};

export const NAV_TRIGGER =
  'inline-flex items-center gap-1 py-2 text-[0.6875rem] font-semibold tracking-[0.14em] whitespace-nowrap uppercase transition-colors';

/**
 * Header menu that opens on hover (and on click or Enter for keyboard and
 * touch). `columns` lay out as a full-width panel under the header, the way
 * the reference site's Shop menu does; leave `isWide` off for a small list
 * anchored to the trigger.
 *
 * @param {object} props
 * @param {string} props.label trigger text
 * @param {{heading: string, links: {to: string, label: string, badge?: string}[]}[]} props.columns
 * @param {{image: string, title: string, cta: string, to: string}} [props.feature] image card on the right
 * @param {boolean} [props.isWide] full-width panel
 */
export function MegaMenu({ label, columns, feature, isWide = false }) {
  const { pathname, search } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef(0);
  const triggerRef = useRef(null);

  const open = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    setIsOpen(false);
  }, []);
  const closeSoon = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setIsOpen(false), CLOSE_DELAY_MS);
  }, []);

  // Any navigation (including from a link inside the panel) closes it.
  useEffect(() => close, [pathname, search, close]);
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const handleKeyDown = (event) => {
    if (event.key !== 'Escape' || !isOpen) return;
    close();
    triggerRef.current?.focus();
  };

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) closeSoon();
  };

  return (
    <div
      onMouseEnter={open}
      onMouseLeave={closeSoon}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={cn(!isWide && 'relative')}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close() : open())}
        aria-expanded={isOpen}
        className={cn(NAV_TRIGGER, 'text-content hover:text-content-muted')}
      >
        {label}
        <m.span
          aria-hidden="true"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.26, ease: EASE_OUT_SOFT }}
        >
          <FiChevronDown className="size-3.5" />
        </m.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            {...PANEL_MOTION}
            className={cn(
              'border-border bg-surface-raised absolute z-40 border',
              isWide
                ? 'shadow-lifted inset-x-0 top-full border-x-0'
                : 'rounded-panel shadow-lifted top-full left-0 mt-3 w-64 p-3',
            )}
          >
            <div
              className={cn(
                isWide &&
                  'mx-auto grid max-w-[90rem] grid-cols-[repeat(3,1fr)_1.3fr] gap-10 px-8 py-10',
              )}
            >
              {columns.map((column) => (
                <div key={column.heading}>
                  {isWide && (
                    <p className="text-content-subtle mb-4 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase">
                      {column.heading}
                    </p>
                  )}
                  <ul className={cn(isWide ? 'space-y-2.5' : 'space-y-0.5')}>
                    {column.links.map((link) => (
                      <li key={link.to + link.label}>
                        <Link
                          to={link.to}
                          onClick={close}
                          className={cn(
                            'hover:text-content-muted inline-flex items-center gap-2 text-sm transition-colors',
                            !isWide &&
                              'rounded-field hover:bg-surface-brand w-full px-3 py-2.5 font-medium hover:text-inherit',
                          )}
                        >
                          {link.label}
                          {link.badge && (
                            <span className="bg-holiday-600 text-content-inverse rounded-full px-2 py-0.5 text-[0.625rem] font-semibold tracking-[0.06em] uppercase">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {isWide && feature && (
                <Link
                  to={feature.to}
                  onClick={close}
                  className="group rounded-card relative block overflow-hidden"
                >
                  <Image
                    name={feature.image}
                    alt=""
                    sizes="24rem"
                    ratio="aspect-[4/3]"
                    imgClassName="object-[50%_30%] transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
                  />
                  <span
                    aria-hidden="true"
                    className="from-surface-inverse/75 absolute inset-0 bg-gradient-to-t to-transparent to-60%"
                  />
                  <span className="text-content-inverse absolute inset-x-0 bottom-0 p-5">
                    <span className="font-display block text-2xl">{feature.title}</span>
                    <span className="mt-1 block text-[0.6875rem] font-semibold tracking-[0.14em] uppercase underline underline-offset-4">
                      {feature.cta}
                    </span>
                  </span>
                </Link>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
