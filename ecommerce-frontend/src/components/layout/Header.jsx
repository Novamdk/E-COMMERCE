import { useCallback, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiHeart, FiMenu } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { ROUTES } from '@/lib/constants';
import { useAsync } from '@/hooks/useAsync';
import { getCategories } from '@/services/productService';
import { CartBadge } from '@/features/cart';
import { useWishlist } from '@/features/wishlist';
import { AccountMenu } from './AccountMenu';
import { BrandMark } from './BrandMark';
import { CategoryMenu } from './CategoryMenu';
import { Container } from './Container';
import { MobileNav } from './MobileNav';

const PRIMARY_LINKS = [
  { to: ROUTES.SHOP, label: 'Shop' },
  { to: ROUTES.ABOUT, label: 'About' },
  { to: ROUTES.CONTACT, label: 'Contact' },
];

const navLinkClass = ({ isActive }) =>
  cn(
    'py-2 text-sm transition-colors',
    isActive ? 'font-medium text-content' : 'text-content-muted hover:text-content',
  );

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

      <header className="border-border bg-surface/85 sticky top-0 z-40 border-b backdrop-blur-lg">
        <Container>
          <div className="flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
            <div className="flex items-center gap-8">
              <BrandMark />

              <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
                {categories?.length > 0 && <CategoryMenu categories={categories} />}
                {PRIMARY_LINKS.map((link) => (
                  <NavLink key={link.to} to={link.to} className={navLinkClass}>
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-0.5">
              <Link
                to={ROUTES.WISHLIST}
                aria-label={
                  wishlistCount > 0
                    ? `Wishlist, ${wishlistCount} saved items`
                    : 'Wishlist, no saved items'
                }
                className="text-content hover:bg-ink-100 relative grid size-10 place-items-center rounded-full transition-colors"
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

              <span className="hidden sm:block">
                <AccountMenu />
              </span>

              <CartBadge />

              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open navigation menu"
                className="text-content hover:bg-ink-100 grid size-10 place-items-center rounded-full transition-colors lg:hidden"
              >
                <FiMenu aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        categories={categories ?? []}
        primaryLinks={PRIMARY_LINKS}
      />
    </>
  );
}
