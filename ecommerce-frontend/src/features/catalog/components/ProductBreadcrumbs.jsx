import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { categoryPath, ROUTES } from '@/lib/constants';

/** Turns a category slug into a readable label. @param {string} slug */
const labelOf = (slug) =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());

/**
 * Home › Shop › Collection › Product.
 * @param {{ product: object }} props
 */
export function ProductBreadcrumbs({ product }) {
  const primaryCategory = product.categories[0];

  const crumbs = [
    { label: 'Home', to: ROUTES.HOME },
    { label: 'Shop', to: ROUTES.SHOP },
    primaryCategory && { label: labelOf(primaryCategory), to: categoryPath(primaryCategory) },
    { label: product.title },
  ].filter(Boolean);

  return (
    <nav aria-label="Breadcrumb">
      <ol className="text-content-subtle flex flex-wrap items-center gap-1.5 text-sm">
        {crumbs.map((crumb, index) => (
          <li key={crumb.label} className="flex items-center gap-1.5">
            {index > 0 && <FiChevronRight aria-hidden="true" className="size-3.5" />}
            {crumb.to ? (
              <Link to={crumb.to} className="hover:text-content transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-content-muted line-clamp-1">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
