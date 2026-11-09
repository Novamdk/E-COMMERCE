import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { categoryPath, ROUTES } from '@/lib/constants';
import { EASE_OUT_SOFT, MENU_ITEM_MOTION, MENU_MOTION } from '@/lib/motion';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

/**
 * Desktop category dropdown. Closes on outside click and on Escape, and
 * returns focus to its trigger.
 *
 * @param {object} props
 * @param {object[]} props.categories
 */
export function CategoryMenu({ categories }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);

  const close = useCallback(() => setIsOpen(false), []);
  useOnClickOutside(wrapperRef, close, isOpen);

  const handleKeyDown = (event) => {
    if (event.key !== 'Escape' || !isOpen) return;
    close();
    triggerRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} onKeyDown={handleKeyDown} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="text-content-muted hover:text-content inline-flex items-center gap-1 py-2 text-sm transition-colors"
      >
        Collections
        <m.span
          aria-hidden="true"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.26, ease: EASE_OUT_SOFT }}
        >
          <FiChevronDown className="size-4" />
        </m.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.ul
            variants={MENU_MOTION}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ transformOrigin: 'top left' }}
            className="rounded-panel border-border bg-surface-raised shadow-lifted absolute top-full left-0 z-40 mt-3 grid w-[22rem] gap-0.5 border p-2"
          >
            {categories.map((category) => (
              <m.li key={category.slug} variants={MENU_ITEM_MOTION}>
                <Link
                  to={categoryPath(category.slug)}
                  onClick={close}
                  className="rounded-field hover:bg-surface-brand flex items-baseline justify-between gap-3 px-3 py-2.5 transition-colors"
                >
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-content-subtle text-xs tabular-nums">{category.count}</span>
                </Link>
              </m.li>
            ))}

            <m.li variants={MENU_ITEM_MOTION} className="border-border mt-1 border-t pt-1">
              <Link
                to={ROUTES.SHOP}
                onClick={close}
                className={cn(
                  'rounded-field text-brand-700 block px-3 py-2.5 text-sm font-medium',
                  'hover:bg-surface-brand transition-colors',
                )}
              >
                Shop all products →
              </Link>
            </m.li>
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
