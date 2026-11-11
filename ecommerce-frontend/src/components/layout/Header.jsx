import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiHeart, FiMenu, FiSearch } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import {
  categoryPath,
  collectionPath,
  quizPath,
  ROUTES,
  SHOW_STORE_FINDER,
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
 * The Shop menu, by product type, by hair goal, and what is trending. Labels
 * are translation keys; collections are curated (see COLLECTIONS), hair goals
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
    heading: 'nav.byHairGoal',
    links: [
      { to: categoryPath('hair-mask'), label: 'nav.goalRepair' },
      { to: categoryPath('hair-serum'), label: 'nav.goalFuller' },
      { to: collectionPath('shampoo-conditioner'), label: 'nav.goalShine' },
      { to: categoryPath('color-shampoo-hair'), label: 'nav.goalColour' },
      { to: categoryPath('lash-brow-serum'), label: 'nav.goalLashes' },
    ],
  },
  {
    heading: 'nav.trending',
    links: [
      { to: collectionPath('bestsellers'), label: 'collections.bestsellers' },
      { to: ROUTES.GIFT_GUIDE, label: 'nav.giftGuide', badge: 'nav.new' },
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

/** The Learn menu: the brand story and the blog. */
const LEARN_LINKS = [
  { to: ROUTES.ABOUT, label: 'nav.aboutUs' },
  { to: ROUTES.JOURNAL, label: 'nav.blog' },
  ...(SHOW_STORE_FINDER ? [{ to: ROUTES.STORES, label: 'nav.findStore' }] : []),
];

/** Pill row under the header on phones, like Olaplex's. */
const QUICK_LINKS = [
  { to: ROUTES.GIFT_GUIDE, label: 'nav.giftGuide', isHoliday: true },
  { to: ROUTES.SHOP, label: 'nav.shopAll' },
  { to: collectionPath('bestsellers'), label: 'collections.bestsellers' },
  { to: collectionPath('holiday-sets'), label: 'collections.holidaySets' },
  { to: quizPath('hair'), label: 'nav.hairQuiz' },
];

const BESTSELLERS = { to: collectionPath('bestsellers'), label: 'collections.bestsellers' };

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
 * Monogram at the left with the navigation beside it and utilities at the
 * right, as on Olaplex. Below `lg` the navigation collapses into the drawer
 * behind the menu button, which sits before the monogram.
 */
export function Header() {
  const { t } = useT();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { count: wishlistCount } = useWishlist();

  const translateLinks = (links) =>
    links.map((link) => ({ ...link, label: t(link.label), badge: link.badge && t(link.badge) }));
  const translateColumns = (columns) =>
    columns.map((column) => ({ heading: t(column.heading), links: translateLinks(column.links) }));

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
          <div className="flex h-[4.5rem] items-center gap-3 lg:h-24 lg:gap-10 xl:gap-14">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label={t('header.openMenu')}
                className={cn(ICON_LINK, '-ml-2 lg:hidden')}
              >
                <FiMenu aria-hidden="true" className="size-5" />
              </button>
              <BrandMark />
            </div>

            <nav
              aria-label={t('header.mainNav')}
              className="hidden items-center gap-5 lg:flex xl:gap-7"
            >
              <Link to={ROUTES.GIFT_GUIDE} className={cn(NAV_TRIGGER, 'text-gold-shimmer')}>
                {t('nav.giftGuide')}
              </Link>
              <MegaMenu
                label={t('header.shop')}
                columns={translateColumns(SHOP_COLUMNS)}
                feature={{
                  image: 'category-hair',
                  title: t('nav.featureTitle'),
                  cta: t('nav.featureCta'),
                  to: ROUTES.GIFT_GUIDE,
                }}
                isWide
              />
              <NavLink to={BESTSELLERS.to} className={navLinkClass(BESTSELLERS.to)}>
                {t(BESTSELLERS.label)}
              </NavLink>
              <MegaMenu
                label={t('nav.quizzes')}
                columns={translateColumns([{ heading: 'nav.quizzes', links: QUIZ_LINKS }])}
              />
              <MegaMenu
                label={t('nav.learn')}
                columns={translateColumns([{ heading: 'nav.learn', links: LEARN_LINKS }])}
              />
            </nav>

            <div className="-mr-2 ml-auto flex items-center justify-end gap-0.5">
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

        {/* Phones and tablets: the main destinations as a sideways row of pills. */}
        <nav
          aria-label={t('header.quickLinks')}
          className="border-holiday-600/30 border-t lg:hidden"
        >
          <ul
            data-lenis-prevent
            className="flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-2.5 [&::-webkit-scrollbar]:hidden"
          >
            {QUICK_LINKS.map((link) => (
              <li key={link.to} className="shrink-0">
                <Link
                  to={link.to}
                  className={cn(
                    'flex h-8 items-center rounded-full border px-4 text-[0.8125rem] whitespace-nowrap',
                    link.isHoliday
                      ? 'border-holiday-600 text-holiday-600'
                      : 'border-content/25 text-content',
                  )}
                >
                  {t(link.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        items={[
          { to: ROUTES.SHOP, label: t('nav.shopAll') },
          { to: ROUTES.GIFT_GUIDE, label: t('nav.giftGuide'), isHoliday: true },
          { label: t('nav.shopByProduct'), links: translateLinks(SHOP_COLUMNS[0].links.slice(1)) },
          { label: t('nav.shopByHairGoal'), links: translateLinks(SHOP_COLUMNS[1].links) },
          { label: t('nav.trending'), links: translateLinks(SHOP_COLUMNS[2].links) },
          { to: BESTSELLERS.to, label: t(BESTSELLERS.label) },
          { label: t('nav.quizzes'), links: translateLinks(QUIZ_LINKS) },
          { to: WELCOME_OFFER_PATH, label: t('nav.offers') },
          {
            label: t('nav.learn'),
            links: translateLinks([
              ...LEARN_LINKS,
              { to: ROUTES.CONTACT, label: 'header.contact' },
            ]),
          },
        ]}
      />
    </>
  );
}
