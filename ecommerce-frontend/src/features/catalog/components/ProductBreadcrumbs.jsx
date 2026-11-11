import { Link } from 'react-router-dom';
import { collectionPath, COLLECTIONS, ROUTES } from '@/lib/constants';
import { collectionOf } from '@/lib/filterProducts';
import { useT } from '@/features/i18n';

/**
 * Home / Collection, small and quiet above the product title.
 * @param {{ product: object }} props
 */
export function ProductBreadcrumbs({ product }) {
  const { t } = useT();
  const slug = collectionOf(product);

  return (
    <nav aria-label={t('collection.breadcrumb')}>
      <ol className="text-content-muted flex flex-wrap items-center gap-1.5 text-xs">
        <li>
          <Link to={ROUTES.HOME} className="hover:text-content transition-colors">
            {t('collection.home')}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link to={collectionPath(slug)} className="hover:text-content transition-colors">
            {t(COLLECTIONS[slug].title)}
          </Link>
        </li>
      </ol>
    </nav>
  );
}
