import { useCallback } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { getRelatedProducts } from '@/services/productService';
import { ProductGrid } from './ProductGrid';
import { useT } from '@/features/i18n';

/**
 * @param {object} props
 * @param {string} props.slug the product to find neighbours for
 */
export function RelatedProducts({ slug }) {
  const { language } = useT();
  const fetchRelated = useCallback(() => getRelatedProducts(slug, language), [slug, language]);
  const { data, loading, error } = useAsync(fetchRelated);

  // A failed sidebar recommendation is not worth an error panel on a page that
  // is otherwise fine — drop the section instead.
  if (error) return null;
  if (!loading && (!data || data.length === 0)) return null;

  return (
    <section aria-labelledby="related-heading" className="border-border border-t pt-12">
      <h2 id="related-heading" className="font-display text-display-sm mb-8">
        You may also like
      </h2>
      <ProductGrid products={data ?? []} isLoading={loading} skeletonCount={4} columns={4} />
    </section>
  );
}
