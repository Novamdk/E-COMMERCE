import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { itemListLd } from '@/lib/seo';
import { Dropdown } from '@/components/ui/Dropdown';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { Container } from '@/components/layout/Container';
import {
  COLLECTIONS,
  DEFAULT_SORT,
  ROUTES,
  SORT_OPTIONS,
  WELCOME_OFFER_PATH,
} from '@/lib/constants';
import { collectionProducts, sortProducts } from '@/lib/filterProducts';
import { getProducts } from '@/services/productService';
import { ProductCard, ProductCardSkeleton } from '@/features/catalog';
import { useT } from '@/features/i18n';
import NotFoundPage from './NotFoundPage';

/** The offer tile drops in after this many products: the first row on desktop. */
const PROMO_AFTER = 4;

const GRID = 'grid grid-cols-2 gap-1 md:grid-cols-3 xl:grid-cols-4';

/**
 * A curated collection, edge to edge: a short header, then a flush grid with
 * the bestsellers first and the welcome offer as a tile after the first row.
 */
export default function CollectionPage() {
  const { slug } = useParams();
  const { t, language } = useT();
  const [sort, setSort] = useState(DEFAULT_SORT);
  const fetchProducts = useCallback(() => getProducts(language), [language]);
  const { data, loading, error, refetch } = useAsync(fetchProducts);

  const products = useMemo(() => {
    const matched = data ? collectionProducts(data, slug) : [];
    return matched ? sortProducts(matched, sort) : null;
  }, [data, slug, sort]);

  const collection = COLLECTIONS[slug];
  usePageMeta({
    title: collection ? t(collection.title) : undefined,
    description: collection ? t('seo.collection', { name: t(collection.title) }) : undefined,
    path: `/collections/${slug}`,
    jsonLd: products?.length
      ? itemListLd(products, typeof window === 'undefined' ? '' : window.location.origin)
      : undefined,
  });
  if (!collection || products === null) return <NotFoundPage />;

  const sortOptions = SORT_OPTIONS.map((option) => ({
    value: option.value,
    label: t(`collection.sort.${option.value}`),
  }));

  return (
    <>
      <Container width="wide" className="pt-8 pb-8 lg:pt-12">
        <nav aria-label={t('collection.breadcrumb')}>
          <ol className="text-content-muted flex gap-2 text-xs">
            <li>
              <Link to={ROUTES.HOME} className="hover:text-content">
                {t('collection.home')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-content">
              {t(collection.title)}
            </li>
          </ol>
        </nav>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-display sm:text-display-lg">{t(collection.title)}</h1>
            {!loading && (
              <p className="text-content-muted mt-2 text-sm">
                {products.length === 1
                  ? t('collection.countOne')
                  : t('collection.count', { count: products.length })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-content-muted text-sm">
              {t('collection.sortLabel')}
            </span>
            <Dropdown
              label={t('collection.sortBy')}
              options={sortOptions}
              value={sort}
              onChange={setSort}
              triggerClassName="min-w-44"
            />
          </div>
        </div>
      </Container>

      {error ? (
        <Container className="pb-20">
          <ErrorPanel title={t('collection.error')} error={error} onRetry={refetch} />
        </Container>
      ) : loading ? (
        <div className={GRID} aria-busy="true">
          <span className="sr-only">{t('collection.loading')}</span>
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <ul className={`${GRID} list-none pb-1`}>
          {products.map((product, index) => (
            <CollectionTile
              key={product.id}
              product={product}
              index={index}
              showPromo={index === PROMO_AFTER - 1 && products.length > PROMO_AFTER}
            />
          ))}
        </ul>
      )}
    </>
  );
}

function CollectionTile({ product, index, showPromo }) {
  return (
    <>
      <li className="h-full">
        <ProductCard product={product} isPriority={index < PROMO_AFTER} isFlush />
      </li>
      {showPromo && <PromoTile />}
    </>
  );
}

/** Two columns wide, holiday red, the welcome offer. */
function PromoTile() {
  const { t } = useT();
  return (
    <li className="col-span-2">
      <Link
        to={WELCOME_OFFER_PATH}
        className="bg-holiday-600 text-content-inverse flex h-full min-h-64 flex-col justify-center p-8 sm:p-12"
      >
        <span className="text-[0.6875rem] font-semibold tracking-[0.18em] uppercase opacity-80">
          {t('home.hero.eyebrow')}
        </span>
        <span className="font-display text-gold-shimmer mt-3 text-4xl sm:text-5xl">
          {t('home.hero.heading')}
        </span>
        <span className="mt-3 max-w-sm text-sm opacity-90">{t('home.hero.body')}</span>
        <span className="text-holiday-700 mt-6 self-start rounded-full bg-white px-5 py-2.5 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase">
          {t('home.hero.cta')}
        </span>
      </Link>
    </li>
  );
}
