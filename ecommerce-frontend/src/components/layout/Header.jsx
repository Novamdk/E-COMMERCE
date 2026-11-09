import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiHeart, FiMenu, FiSearch } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import {
  categoryPath,
  collectionPath,
  quizPath,
  ROUTES,
  WELCOME_OFFER_PATH,
} from '@/lib/constants';
import { CartBadge } from '@/features/cart';
import { useT } from '@/features/i18n';
import { useWishlist } from '@/features/wishlist';
import { AccountMenu } from './AccountMenu';
import { BrandMark } from './BrandMark';
import { Container } from './Container';
import { MegaMenu, NAV_TRIGGER } from './MegaMenu';
import { MobileNav } from './MobileNav';

const ICON_LINK =
  'text-content hover:bg-ink-100 relative grid size-10 place-items-center rounded-full transition-colors';

/**
 * The Shop menu, by product type, by concern, and what is trending. Labels
 * are translation keys; collections are curated (see COLLECTIONS), concerns
 * reuse the catalog's own categories.
 */
const SHOP_COLUMNS = [
  {
    heading: 'nav.byProduct',
    links: [
      { to: ROUTES.SHOP, label: 'nav.shopAll' },
      { to: collectionPath('shampoo-conditioner'), label: 'collections.shampooConditioner' },
      { to: collectionPath('treatments'), label: 'collections.treatments' },
      { to: collectionPath('skin-care'), label: 'collections.skinCare' },
      { to: collectionPath('eyes-lashes'), label: 'collections.eyesLashes' },
      { to: collectionPath('body'), label: 'collections.body' },
      { to: collectionPath('holiday-sets'), label: 'collections.holidaySets' },
    ],
  },
  {
    heading: 'nav.byConcern',
    links: [
      { to: categoryPath('hair-mask'), label: 'nav.concernDry' },
      { to: categoryPath('hair-serum'), label: 'nav.concernThinning' },
      { to: categoryPath('color-shampoo-hair'), label: 'nav.concernColour' },
      { to: categoryPath('dark-spot'), label: 'nav.concernSpots' },
      { to: categoryPath('face-lifting-collagen-cream'), label: 'nav.concernLines' },
      { to: categoryPath('eye-lashes-growth-serum'), label: 'nav.concernLashes' },
    ],
  },
  {
    heading: 'nav.trending',
    links: [
      { to: collectionPath('bestsellers'), label: 'collections.bestsellers' },
      { to: collectionPath('holiday-sets'), label: 'nav.giftGuide', badge: 'nav.new' },
      { to: quizPath('hair'), label: 'nav.hairQuiz' },
      { to: quizPath('gift'), label: 'nav.giftFinder' },
      { to: WELCOME_OFFER_PATH, label: 'nav.offer' },
    ],
  },
];

const QUIZ_LINKS = [
  { to: quizPath('hair'), label: 'nav.hairQuiz' },
  { to: quizPath('gift'), label: 'nav.giftFinder' },
];

/** Plain links in the bar. `wideOnly` links hide below xl, where the bar runs out of room. */
const BAR_LINKS = [
  { to: collectionPath('bestsellers'), label: 'collections.bestsellers' },
  { to: ROUTES.JOURNAL, label: 'nav.journal', wideOnly: true },
  { to: ROUTES.ABOUT, label: 'header.about', wideOnly: true },
];

/**
 * NavLink matches on pathname only, so links that differ just by query string
 * would all light up at once. Only real routes get the active underline.
 */
const navLinkClass =
  (to) =>
  ({ isActive }) =>
    cn(
      NAV_TRIGGER,
      isActive && !to.includes('?')
        ? 'text-content underline underline-offset-8'
        : 'text-content hover:text-content-muted',
    );

/**
 * Three-column header: navigation left, monogram centred, utilities right.
 * Below `lg` the navigation collapses into the drawer behind the menu button.
 */
export function Header() {
  const { t } = useT();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { count: wishlistCount } = useWishlist();

  const translateColumns = (columns) =>
    columns.map((column) => ({
      heading: t(column.heading),
      links: column.links.map((link) => ({
        ...link,
        label: t(link.label),
        badge: link.badge && t(link.badge),
      })),
    }));

  return (
    <>
      <a
        href="#main"
        className="focus:rounded-field focus:bg-surface-inverse focus:text-content-inverse sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:px-4 focus:py-2 focus:text-sm"
      >
        {t('header.skip')}
      </a>

      <header className="border-holiday-600/60 bg-surface/95 sticky top-0 z-40 border-b backdrop-blur-lg">
        <Container width="wide">
          <div className="grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center gap-4 lg:h-24">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label={t('header.openMenu')}
                className={cn(ICON_LINK, '-ml-2 lg:hidden')}
              >
                <FiMenu aria-hidden="true" className="size-5" />
              </button>

              <nav
                aria-label={t('header.mainNav')}
                className="hidden items-center gap-5 lg:flex xl:gap-7"
              >
                <Link
                  to={collectionPath('holiday-sets')}
                  className={cn(NAV_TRIGGER, 'text-gold-shimmer')}
                >
                  {t('nav.giftGuide')}
                </Link>
                <MegaMenu
                  label={t('header.shop')}
                  columns={translateColumns(SHOP_COLUMNS)}
                  feature={{
                    image: 'category-hair',
                    title: t('nav.featureTitle'),
                    cta: t('nav.featureCta'),
                    to: collectionPath('holiday-sets'),
                  }}
                  isWide
                />
                <NavLink to={BAR_LINKS[0].to} className={navLinkClass(BAR_LINKS[0].to)}>
                  {t(BAR_LINKS[0].label)}
                </NavLink>
                <MegaMenu
                  label={t('nav.quizzes')}
                  columns={translateColumns([{ heading: 'nav.quizzes', links: QUIZ_LINKS }])}
                />
                {BAR_LINKS.slice(1).map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={(state) =>
                      cn(navLinkClass(link.to)(state), link.wideOnly && 'hidden xl:inline-flex')
                    }
                  >
                    {t(link.label)}
                  </NavLink>
                ))}
              </nav>
            </div>

            <BrandMark />

            <div className="-mr-2 flex items-center justify-end gap-0.5">
              <Link to={ROUTES.SHOP} aria-label={t('header.search')} className={ICON_LINK}>
                <FiSearch aria-hidden="true" className="size-[1.1875rem]" />
              </Link>

              <span className="hidden sm:block">
                <AccountMenu />
              </span>

              <Link
                to={ROUTES.WISHLIST}
                aria-label={
                  wishlistCount > 0
                    ? t('header.wishlistCount', { count: wishlistCount })
                    : t('header.wishlistEmpty')
                }
                className={cn(ICON_LINK, 'hidden sm:grid')}
              >
                <FiHeart aria-hidden="true" className="size-[1.1875rem]" />
                {wishlistCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="bg-brand-700 text-content-inverse absolute -top-0.5 -right-0.5 grid size-[1.125rem] place-items-center rounded-full text-[0.625rem] font-bold tabular-nums"
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <CartBadge />
            </div>
          </div>
        </Container>
      </header>

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        primaryLinks={[
          { to: collectionPath('holiday-sets'), label: 'nav.giftGuide', isHoliday: true },
          { to: collectionPath('bestsellers'), label: 'collections.bestsellers' },
          ...SHOP_COLUMNS[0].links.slice(1, 6),
          { to: quizPath('hair'), label: 'nav.hairQuiz' },
          { to: quizPath('gift'), label: 'nav.giftFinder' },
          { to: ROUTES.JOURNAL, label: 'nav.journal' },
          { to: ROUTES.ABOUT, label: 'header.about' },
          { to: ROUTES.CONTACT, label: 'header.contact' },
        ]}
      />
    </>
  );
}
