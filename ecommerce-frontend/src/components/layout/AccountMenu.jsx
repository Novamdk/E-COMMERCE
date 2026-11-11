import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { FiLogOut, FiPackage, FiUser } from 'react-icons/fi';
import { ROUTES } from '@/lib/constants';
import { MENU_ITEM_MOTION, MENU_MOTION } from '@/lib/motion';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { useAuth } from '@/features/auth';
import { useT } from '@/features/i18n';

const ITEM =
  'flex items-center gap-2.5 rounded-field px-3 py-2.5 text-sm transition-colors hover:bg-surface-brand';

/** Account dropdown when signed in, a plain sign-in link when not. */
export function AccountMenu() {
  const { isAuthenticated, user, signOut } = useAuth();
  const { t } = useT();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const close = useCallback(() => setIsOpen(false), []);
  useOnClickOutside(wrapperRef, close, isOpen);

  if (!isAuthenticated) {
    return (
      <Link
        to={ROUTES.SIGN_IN}
        aria-label={t('account.signInLabel')}
        className="text-content hover:bg-ink-100 grid size-10 place-items-center rounded-full transition-colors"
      >
        <FiUser aria-hidden="true" className="size-[1.1875rem]" />
      </Link>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('account.menuFor', { name: user.name })}
        className="bg-surface-brand text-brand-700 hover:bg-brand-100 grid size-10 place-items-center rounded-full text-sm font-semibold transition-colors"
      >
        <span aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            variants={MENU_MOTION}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ transformOrigin: 'top right' }}
            className="rounded-panel border-border bg-surface-raised shadow-lifted absolute top-full right-0 z-40 mt-2 w-56 border p-2"
          >
            <m.p
              variants={MENU_ITEM_MOTION}
              className="text-content-subtle truncate px-3 py-2 text-xs"
            >
              {user.email}
            </m.p>

            <m.div variants={MENU_ITEM_MOTION}>
              <Link to={ROUTES.ORDERS} onClick={close} className={ITEM}>
                <FiPackage aria-hidden="true" className="size-4" />
                {t('account.orders')}
              </Link>
            </m.div>

            <m.div variants={MENU_ITEM_MOTION}>
              <button
                type="button"
                onClick={() => {
                  close();
                  signOut();
                }}
                className={`${ITEM} text-danger-600 hover:bg-danger-50 w-full text-left`}
              >
                <FiLogOut aria-hidden="true" className="size-4" />
                {t('account.signOut')}
              </button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
