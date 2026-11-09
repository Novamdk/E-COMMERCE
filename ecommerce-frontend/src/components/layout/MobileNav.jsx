import { Link } from 'react-router-dom';
import { FiLogOut, FiPackage, FiUser } from 'react-icons/fi';
import { Drawer } from '@/components/ui/Drawer';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/features/auth';
import { LanguageSelect, useT } from '@/features/i18n';

const TITLE_ID = 'mobile-nav-title';
const LINK = 'block rounded-field px-3 py-3 text-base transition-colors hover:bg-surface-brand';
const SECTION_LABEL =
  'px-3 pt-5 pb-1.5 text-xs font-semibold tracking-[0.08em] text-content-subtle uppercase';

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {{to: string, label: string, isHoliday?: boolean}[]} props.primaryLinks label is a translation key
 */
export function MobileNav({ isOpen, onClose, primaryLinks }) {
  const { isAuthenticated, user, signOut } = useAuth();
  const { t } = useT();

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={t('mobileNav.title')}
      titleId={TITLE_ID}
      side="left"
    >
      <nav aria-label={t('mobileNav.nav')} className="px-2 py-3">
        <Link to={ROUTES.SHOP} onClick={onClose} className={`${LINK} font-medium`}>
          {t('header.shopAll')}
        </Link>
        {primaryLinks.map((link) => (
          <Link
            key={link.to + link.label}
            to={link.to}
            onClick={onClose}
            className={link.isHoliday ? `${LINK} text-holiday-600 font-medium` : LINK}
          >
            {t(link.label)}
          </Link>
        ))}

        <p className={SECTION_LABEL}>{t('mobileNav.account')}</p>
        {isAuthenticated ? (
          <>
            <p className="text-content-muted truncate px-3 pb-1 text-sm">{user.email}</p>
            <Link
              to={ROUTES.ORDERS}
              onClick={onClose}
              className={`${LINK} flex items-center gap-2.5`}
            >
              <FiPackage aria-hidden="true" className="size-4" />
              {t('account.orders')}
            </Link>
            <button
              type="button"
              onClick={() => {
                onClose();
                signOut();
              }}
              className={`${LINK} text-danger-600 hover:bg-danger-50 flex w-full items-center gap-2.5 text-left`}
            >
              <FiLogOut aria-hidden="true" className="size-4" />
              {t('account.signOut')}
            </button>
          </>
        ) : (
          <>
            <Link
              to={ROUTES.SIGN_IN}
              onClick={onClose}
              className={`${LINK} flex items-center gap-2.5`}
            >
              <FiUser aria-hidden="true" className="size-4" />
              {t('account.signIn')}
            </Link>
            <Link to={ROUTES.SIGN_UP} onClick={onClose} className={LINK}>
              {t('account.signUp')}
            </Link>
          </>
        )}

        <div className="border-border mx-3 mt-6 border-t pt-5">
          <LanguageSelect />
        </div>
      </nav>
    </Drawer>
  );
}
