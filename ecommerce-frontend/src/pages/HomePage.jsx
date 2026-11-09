import { useCallback, useMemo } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { getProducts, getSiteContent } from '@/services/productService';
import {
  BenefitsStrip,
  FaqSection,
  FeaturedProducts,
  Hero,
  HolidayPair,
  OfferMarquee,
  ShopByCategory,
  ShopTheLook,
  Testimonials,
} from '@/features/marketing';
import { RouteFallback } from '@/components/layout/RouteFallback';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { Container } from '@/components/layout/Container';
import { FREE_SHIPPING_THRESHOLD, PROMO_CODES, SPIN_WHEEL } from '@/lib/constants';
import { discountPercent, formatCurrency } from '@/lib/formatCurrency';
import { useT } from '@/features/i18n';
import { JournalSection } from '@/features/journal';
import { QuizTeaser } from '@/features/quiz';

const FEATURED_COUNT = 8;
const WELCOME = PROMO_CODES[SPIN_WHEEL.PROMO_CODE];

/**
 * The holiday homepage: the gift-wrap hero, a red offer ticker, gifts, the
 * quiz, the limited-time sets, shoppable video, categories and the journal.
 */
export default function HomePage() {
  const { t, language } = useT();
  const fetchContent = useCallback(() => getSiteContent(language), [language]);
  const fetchProducts = useCallback(() => getProducts(language), [language]);

  const content = useAsync(fetchContent);
  const products = useAsync(fetchProducts);

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

  // The biggest saving across the sets, so the copy never overstates it.
  const maxSetSavings = Math.max(
    0,
    ...(products.data ?? [])
      .filter((product) => product.categories.includes('packages'))
      .map((product) => discountPercent(product.price, product.compareAtPrice)),
  );

  if (content.loading) return <RouteFallback />;

  if (content.error || !content.data) {
    return (
      <Container className="py-20">
        <ErrorPanel title={t('home.loadError')} error={content.error} onRetry={content.refetch} />
      </Container>
    );
  }

  const site = content.data;
  const marquee = [
    t('home.marquee.welcome', { percent: WELCOME.value, code: WELCOME.code }),
    t('announcements.freeShipping', {
      amount: formatCurrency(FREE_SHIPPING_THRESHOLD, { compact: true }),
    }),
    maxSetSavings > 0 && t('home.marquee.sets', { percent: maxSetSavings }),
    t('home.marquee.limited'),
  ].filter(Boolean);

  return (
    <>
      <Hero />
      <OfferMarquee messages={marquee} />

      <FeaturedProducts
        products={featured}
        isLoading={products.loading}
        error={products.error}
        onRetry={products.refetch}
      />

      <QuizTeaser />
      <HolidayPair maxSavings={maxSetSavings} />
      <ShopTheLook products={products.data ?? []} />
      <ShopByCategory />
      <JournalSection />
      <Testimonials testimonials={site.testimonials} />
      <FaqSection faq={site.faq} />
      <BenefitsStrip benefits={site.benefits} />
    </>
  );
}
