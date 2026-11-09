import { useCallback, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiHeart, FiMenu, FiSearch } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { categoryPath, ROUTES } from '@/lib/constants';
import { useAsync } from '@/hooks/useAsync';
import { getCategories } from '@/services/productService';
import { CartBadge } from '@/features/cart';
import { useWishlist } from '@/features/wishlist';
import { AccountMenu } from './AccountMenu';
import { BrandMark } from './BrandMark';
import { CategoryMenu } from './CategoryMenu';
import { Container } from './Container';
import { MobileNav } from './MobileNav';

/** Shortcuts into the three biggest ranges, then the brand pages. */
const PRIMARY_LINKS = [
  { to: categoryPath('color-shampoo-hair'), label: 'Hair care' },
  { to: categoryPath('dark-spot'), label: 'Skin care' },
  { to: categoryPath('packages'), label: 'Sets' },
  { to: ROUTES.ABOUT, label: 'About' },
];

const ICON_LINK =
  'text-content hover:bg-ink-100 relative grid size-10 place-items-center rounded-full transition-colors';

/**
 * NavLink matches on pathname only, so every `/shop?category=…` shortcut
 * would light up at once on the shop page. Only links without a query
 * string (real routes such as About) get the active underline.
 */
const navLinkClass =
  (to) =>
  ({ isActive }) =>
    cn(
      'py-2 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase transition-colors',
      isActive && !to.includes('?')
        ? 'text-content underline underline-offset-8'
        : 'text-content hover:text-content-muted',
    );

/**
 * Three-column header: navigation left, monogram centred, utilities right.
 * Below `lg` the navigation collapses into the drawer behind the menu button.
 */
export function Header() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { count: wishlistCount } = useWishlist();

  const fetchCategories = useCallback(() => getCategories(), []);
  const { data: categories } = useAsync(fetchCategories);

  return (
    <>
      <a
        href="#main"
        className="focus:rounded-field focus:bg-surface-inverse focus:text-content-inverse sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <header className="border-border bg-surface/90 sticky top-0 z-40 border-b backdrop-blur-lg">
        <Container width="wide">
          <div className="grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center gap-4 lg:h-24">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open navigation menu"
                className={cn(ICON_LINK, '-ml-2 lg:hidden')}
              >
                <FiMenu aria-hidden="true" className="size-5" />
              </button>

              <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
                {categories?.length > 0 && <CategoryMenu categories={categories} />}
                {PRIMARY_LINKS.map((link) => (
                  <NavLink key={link.label} to={link.to} className={navLinkClass(link.to)}>
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <BrandMark />

            <div className="-mr-2 flex items-center justify-end gap-0.5">
              <Link to={ROUTES.SHOP} aria-label="Search products" className={ICON_LINK}>
                <FiSearch aria-hidden="true" className="size-[1.1875rem]" />
              </Link>

              <span className="hidden sm:block">
                <AccountMenu />
              </span>

              <Link
                to={ROUTES.WISHLIST}
                aria-label={
                  wishlistCount > 0
                    ? `Wishlist, ${wishlistCount} saved items`
                    : 'Wishlist, no saved items'
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
        categories={categories ?? []}
        primaryLinks={[
          ...PRIMARY_LINKS,
          { to: ROUTES.WISHLIST, label: 'Wishlist' },
          { to: ROUTES.CONTACT, label: 'Contact' },
        ]}
      />
    </>
  );
}
