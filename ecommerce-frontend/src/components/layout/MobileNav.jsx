import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiChevronDown, FiLogOut, FiPackage, FiUser } from 'react-icons/fi';
import { Drawer } from '@/components/ui/Drawer';
import { Image } from '@/components/ui/Image';
import { cn } from '@/lib/cn';
import { quizPath, ROUTES } from '@/lib/constants';
import { useAuth } from '@/features/auth';
import { LanguageSelect, useT } from '@/features/i18n';
import { BrandMark } from './BrandMark';

const TITLE_ID = 'mobile-nav-title';
const ROW =
  'border-holiday-600/35 flex w-full items-center justify-between border-b px-6 py-5 text-left text-[1.0625rem] font-medium tracking-[0.1em] uppercase';
const SUB_LINK = 'block py-2.5 text-base text-content-muted transition-colors hover:text-content';
const SMALL_LINK =
  'flex items-center gap-2 text-sm text-content-muted transition-colors hover:text-content';

/**
 * One collapsible row. The panel animates its height with a grid-rows
 * transition and is `inert` while closed, so hidden links are skipped by
 * keyboard and screen readers.
 */
function Section({ label, links, isOpen, onToggle, onNavigate }) {
  const panelId = useId();

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={ROW}
      >
        {label}
        <FiChevronDown
          aria-hidden="true"
          className={cn('size-5 transition-transform duration-300', isOpen && 'rotate-180')}
        />
      </button>
      <div
        id={panelId}
        inert={!isOpen}
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <ul className="bg-surface-brand overflow-hidden px-6">
          {links.map((link, index) => (
            <li
              key={link.to + link.label}
              className={cn(index === 0 && 'pt-3', index === links.length - 1 && 'pb-4')}
            >
              <Link to={link.to} onClick={onNavigate} className={SUB_LINK}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

/**
 * Full-height phone menu in the spirit of Olaplex's: the monogram at the top,
 * then large uppercase rows that are either links or sections that open in
 * place, a quiz card, and account and language at the foot.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {({to: string, label: string, isHoliday?: boolean} | {label: string, links: {to: string, label: string}[]})[]} props.items
 *   labels already translated; an item with `links` renders as a collapsible section
 */
export function MobileNav({ isOpen, onClose, items }) {
  const { isAuthenticated, user, signOut } = useAuth();
  const { t } = useT();
  const [openSection, setOpenSection] = useState(null);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={t('mobileNav.title')}
      titleId={TITLE_ID}
      side="left"
      heading={
        <>
          <BrandMark size="sm" onClick={onClose} />
          <LanguageSelect />
        </>
      }
      headerClassName="border-holiday-600/60 py-3"
      panelClassName="h-full w-full max-w-[30rem]"
    >
      <nav aria-label={t('mobileNav.nav')}>
        <ul>
          {items.map((item) =>
            item.links ? (
              <Section
                key={item.label}
                label={item.label}
                links={item.links}
                isOpen={openSection === item.label}
                onToggle={() =>
                  setOpenSection((current) => (current === item.label ? null : item.label))
                }
                onNavigate={onClose}
              />
            ) : (
              <li key={item.to + item.label}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  className={cn(ROW, item.isHoliday && 'text-gold-shimmer')}
                >
                  {item.label}
                </Link>
              </li>
            ),
          )}
        </ul>

        <Link
          to={quizPath('hair')}
          onClick={onClose}
          className="bg-surface-inverse text-content-inverse rounded-card mx-6 mt-8 flex items-stretch overflow-hidden"
        >
          <span className="flex flex-1 flex-col justify-center gap-2 p-5">
            <span className="font-display text-xl">{t('mobileNav.promoTitle')}</span>
            <span className="text-gold-300 flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] uppercase">
              {t('mobileNav.promoCta')}
              <FiArrowRight aria-hidden="true" className="size-3.5" />
            </span>
          </span>
          <Image
            name="routine-hair"
            alt=""
            sizes="8rem"
            ratio="aspect-square"
            className="w-28 shrink-0"
          />
        </Link>

        <div className="space-y-4 px-6 pt-8 pb-10">
          {isAuthenticated ? (
            <div className="space-y-3">
              <p className="text-content-subtle truncate text-xs">{user.email}</p>
              <Link to={ROUTES.ORDERS} onClick={onClose} className={SMALL_LINK}>
                <FiPackage aria-hidden="true" className="size-4" />
                {t('account.orders')}
              </Link>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  signOut();
                }}
                className={SMALL_LINK}
              >
                <FiLogOut aria-hidden="true" className="size-4" />
                {t('account.signOut')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Link to={ROUTES.SIGN_IN} onClick={onClose} className={SMALL_LINK}>
                <FiUser aria-hidden="true" className="size-4" />
                {t('account.signIn')}
              </Link>
              <Link to={ROUTES.SIGN_UP} onClick={onClose} className={SMALL_LINK}>
                {t('account.signUp')}
              </Link>
            </div>
          )}
        </div>
      </nav>
    </Drawer>
  );
}
