import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { useAsync } from '@/hooks/useAsync';
import { categoryPath, ROUTES } from '@/lib/constants';
import { getProductBySlug } from '@/services/productService';
import {
  Gallery,
  ProductBreadcrumbs,
  ProductPurchasePanel,
  RelatedProducts,
} from '@/features/catalog';
import { useT } from '@/features/i18n';

/** Two-column placeholder matching the loaded layout. */
function DetailSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="space-y-3">
        <Skeleton radius="panel" className="aspect-square w-full" />
        <div className="grid grid-cols-5 gap-2.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </div>
      <div className="space-y-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-11 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-13 w-full" />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();

  const { language } = useT();
  const fetchProduct = useCallback(() => getProductBySlug(slug, language), [slug, language]);
  const { data: product, loading, error, refetch } = useAsync(fetchProduct);

  if (loading) {
    return (
      <PageShell>
        <DetailSkeleton />
      </PageShell>
    );
  }

  if (error?.status === 404) {
    return (
      <PageShell width="narrow">
        <EmptyState
          icon={FiPackage}
          title="That product does not exist"
          body="The link may be out of date, or the product may have been renamed."
          action={<Button to={ROUTES.SHOP}>Browse all products</Button>}
        />
      </PageShell>
    );
  }

  if (error || !product) {
    return (
      <PageShell>
        <ErrorPanel title="This product could not load" error={error} onRetry={refetch} />
      </PageShell>
    );
  }

  const descriptionParagraphs = product.description.split('\n\n').filter(Boolean);

  return (
    <PageShell>
      <ProductBreadcrumbs product={product} />

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Keyed by slug so navigating between products resets the selected
            image and the chosen variant, instead of carrying them over. */}
        <Gallery key={product.slug} images={product.images} title={product.title} />
        <ProductPurchasePanel key={product.slug} product={product} />
      </div>

      {descriptionParagraphs.length > 0 && (
        <section
          aria-labelledby="description-heading"
          className="border-border mt-20 max-w-3xl border-t pt-12"
        >
          <h2 id="description-heading" className="font-display text-display-sm">
            About this product
          </h2>
          <div className="mt-6 space-y-4">
            {descriptionParagraphs.map((paragraph, index) => (
              <p key={index} className="text-content-muted leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {product.categories.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-content-subtle text-xs tracking-wide uppercase">
                Collections
              </span>
              {product.categories.map((slugValue) => (
                <Button key={slugValue} to={categoryPath(slugValue)} variant="ghost" size="sm">
                  {slugValue.replace(/-/g, ' ')}
                </Button>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="mt-20">
        <RelatedProducts slug={product.slug} />
      </div>
    </PageShell>
  );
}
