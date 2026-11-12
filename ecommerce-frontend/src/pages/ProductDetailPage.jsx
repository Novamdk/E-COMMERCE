import { useCallback, useEffect } from 'react';
import { FiPackage } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { Skeleton } from '@/components/ui/Skeleton';
import { Container } from '@/components/layout/Container';
import { PageShell } from '@/components/layout/PageShell';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { FREE_SHIPPING_THRESHOLD, PROMO_CODES, ROUTES, SPIN_WHEEL } from '@/lib/constants';
import { discountPercent, formatCurrency } from '@/lib/formatCurrency';
import { primaryImage, textureImage } from '@/lib/productImage';
import { breadcrumbLd, productLd } from '@/lib/seo';
import { trackViewedProduct } from '@/lib/klaviyo';
import { adViewItem } from '@/lib/adTags';
import { getProductBySlug, getProducts } from '@/services/productService';
import { Gallery, ProductPurchasePanel, ProductReviews, RelatedProducts } from '@/features/catalog';
import { useT } from '@/features/i18n';
import { OfferMarquee, ShopTheLook } from '@/features/marketing';

const WELCOME = PROMO_CODES[SPIN_WHEEL.PROMO_CODE];

/** Two-column placeholder matching the loaded layout. */
function DetailSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-14">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-4/5" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

/**
 * Olaplex-style product page: the gallery stays put on the left while the
 * buying column scrolls on the right, then an offer ticker, shoppable video
 * placeholders and related products.
 */
export default function ProductDetailPage() {
  const { slug } = useParams();
  const { t, language } = useT();
  const fetchProduct = useCallback(() => getProductBySlug(slug, language), [slug, language]);
  const fetchCatalog = useCallback(() => getProducts(language), [language]);
  const { data: product, loading, error, refetch } = useAsync(fetchProduct);
  const catalog = useAsync(fetchCatalog);

  // Once per product shown, for browse-abandonment emails.
  const viewedId = product?.id;
  useEffect(() => {
    if (!viewedId) return;
    trackViewedProduct({ id: viewedId });
    adViewItem({ id: viewedId });
  }, [viewedId]);

  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  usePageMeta(
    product
      ? {
          title: product.title,
          description: product.description,
          path: `/shop/${product.slug}`,
          image: `/og/${product.slug}.jpg`,
          type: 'product',
          jsonLd: [
            productLd(product, origin, `/img/${primaryImage(product)}-800.avif`),
            breadcrumbLd(
              [
                { name: 'Home', path: '/' },
                { name: 'Shop', path: '/shop' },
                { name: product.title, path: `/shop/${product.slug}` },
              ],
              origin,
            ),
          ],
        }
      : { title: t('header.shop') },
  );

  if (loading) {
    return (
      <PageShell width="wide">
        <DetailSkeleton />
      </PageShell>
    );
  }

  if (error?.status === 404) {
    return (
      <PageShell width="narrow">
        <EmptyState
          icon={FiPackage}
          title={t('product.notFound')}
          body={t('product.notFoundBody')}
          action={<Button to={ROUTES.SHOP}>{t('header.shopAll')}</Button>}
        />
      </PageShell>
    );
  }

  if (error || !product) {
    return (
      <PageShell>
        <ErrorPanel title={t('product.loadError')} error={error} onRetry={refetch} />
      </PageShell>
    );
  }

  // The texture swatch from the collection hover becomes the last view.
  const texture = textureImage(product);
  const images = texture ? [...product.images, texture] : product.images;

  const saving = discountPercent(product.price, product.compareAtPrice);
  const ticker = [
    saving > 0 && t('product.savings', { percent: saving }),
    product.isBestSeller ? t('product.bestseller') : t('home.marquee.limited'),
    t('announcements.freeShipping', {
      amount: formatCurrency(FREE_SHIPPING_THRESHOLD, { compact: true }),
    }),
    t('home.marquee.welcome', { percent: WELCOME.value, code: WELCOME.code }),
  ].filter(Boolean);

  return (
    <>
      <Container width="wide" className="pt-6 pb-16 lg:pt-10 lg:pb-24">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-14">
          {/* Keyed by slug so navigating between products resets the selected
              image and the chosen variant, instead of carrying them over. */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Gallery key={product.slug} images={images} title={product.title} />
          </div>
          <ProductPurchasePanel key={product.slug} product={product} />
        </div>
      </Container>

      <OfferMarquee messages={ticker} />
      <ShopTheLook products={catalog.data ?? []} />

      <Container width="wide" className="pb-20">
        <ProductReviews productId={product.id} />
        <RelatedProducts slug={product.slug} />
      </Container>
    </>
  );
}
