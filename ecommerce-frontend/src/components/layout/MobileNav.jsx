import { Link } from 'react-router-dom';
import { FiLogOut, FiPackage, FiUser } from 'react-icons/fi';
import { Drawer } from '@/components/ui/Drawer';
import { categoryPath, ROUTES } from '@/lib/constants';
import { useAuth } from '@/features/auth';

const TITLE_ID = 'mobile-nav-title';
const LINK = 'block rounded-field px-3 py-3 text-base transition-colors hover:bg-surface-brand';
const SECTION_LABEL =
  'px-3 pt-5 pb-1.5 text-xs font-semibold tracking-[0.08em] text-content-subtle uppercase';

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {object[]} props.categories
 * @param {{to: string, label: string}[]} props.primaryLinks
 */
export function MobileNav({ isOpen, onClose, categories, primaryLinks }) {
  const { isAuthenticated, user, signOut } = useAuth();

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Menu" titleId={TITLE_ID} side="left">
      <nav aria-label="Mobile" className="px-2 py-3">
        <Link to={ROUTES.SHOP} onClick={onClose} className={`${LINK} font-medium`}>
          Shop all products
        </Link>
        {primaryLinks.map((link) => (
          <Link key={link.to} to={link.to} onClick={onClose} className={LINK}>
            {link.label}
          </Link>
        ))}

        {categories.length > 0 && (
          <>
            <p className={SECTION_LABEL}>Collections</p>
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={categoryPath(category.slug)}
                onClick={onClose}
                className={`${LINK} flex items-baseline justify-between gap-3`}
              >
                <span>{category.name}</span>
                <span className="text-content-subtle text-xs tabular-nums">{category.count}</span>
              </Link>
            ))}
          </>
        )}

        <p className={SECTION_LABEL}>Account</p>
        {isAuthenticated ? (
          <>
            <p className="text-content-muted truncate px-3 pb-1 text-sm">{user.email}</p>
            <Link
              to={ROUTES.ORDERS}
              onClick={onClose}
              className={`${LINK} flex items-center gap-2.5`}
            >
              <FiPackage aria-hidden="true" className="size-4" />
              Order history
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
              Sign out
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
              Sign in
            </Link>
            <Link to={ROUTES.SIGN_UP} onClick={onClose} className={LINK}>
              Create an account
            </Link>
          </>
        )}
      </nav>
    </Drawer>
  );
}
