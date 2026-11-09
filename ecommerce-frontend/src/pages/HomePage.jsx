import { useCallback, useMemo } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { getCategories, getProducts, getSiteContent } from '@/services/productService';
import {
  BenefitsStrip,
  CategoryTiles,
  FaqSection,
  FeaturedProducts,
  Hero,
  IngredientsSection,
  Testimonials,
} from '@/features/marketing';
import { RouteFallback } from '@/components/layout/RouteFallback';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { Container } from '@/components/layout/Container';

const FEATURED_COUNT = 4;

export default function HomePage() {
  const fetchContent = useCallback(() => getSiteContent(), []);
  const fetchProducts = useCallback(() => getProducts(), []);
  const fetchCategories = useCallback(() => getCategories(), []);

  const content = useAsync(fetchContent);
  const products = useAsync(fetchProducts);
  const categories = useAsync(fetchCategories);

  // Best sellers first, then the biggest absolute savings.
  const featured = useMemo(() => {
    if (!products.data) return [];
    return [...products.data]
      .sort(
        (a, b) =>
          Number(b.isBestSeller) - Number(a.isBestSeller) ||
          (b.compareAtPrice ?? b.price) - b.price - ((a.compareAtPrice ?? a.price) - a.price),
      )
      .slice(0, FEATURED_COUNT);
  }, [products.data]);

  if (content.loading) return <RouteFallback />;

  if (content.error || !content.data) {
    return (
      <Container className="py-20">
        <ErrorPanel
          title="The homepage could not load"
          error={content.error}
          onRetry={content.refetch}
        />
      </Container>
    );
  }

  const site = content.data;

  return (
    <>
      <Hero hero={site.hero} />
      <BenefitsStrip benefits={site.benefits} />

      <FeaturedProducts
        products={featured}
        isLoading={products.loading}
        error={products.error}
        onRetry={products.refetch}
      />

      <CategoryTiles categories={categories.data ?? []} isLoading={categories.loading} />

      <IngredientsSection ingredients={site.ingredients} />
      <Testimonials testimonials={site.testimonials} />
      <FaqSection faq={site.faq} />
    </>
  );
}
