import { useCallback, useMemo } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { organizationLd, websiteLd } from '@/lib/seo';
import { getProducts, getSiteContent } from '@/services/productService';
import {
  BenefitsStrip,
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
import {
  CONTACT,
  FREE_SHIPPING_THRESHOLD,
  PROMO_CODES,
  SHOW_STORE_FINDER,
  SOCIAL_LINKS,
  SPIN_WHEEL,
} from '@/lib/constants';
import { discountPercent, formatCurrency } from '@/lib/formatCurrency';
import { useT } from '@/features/i18n';
import { StoresBand } from '@/features/stores';
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

  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  usePageMeta({
    path: '/',
    jsonLd: [
      organizationLd(origin, {
        phone: CONTACT.PHONE,
        email: CONTACT.EMAIL,
        sameAs: SOCIAL_LINKS.map((link) => link.href),
      }),
      websiteLd(origin),
    ],
  });

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
      {/* Sample quotes stay off the live site until real reviews are added. */}
      <Testimonials testimonials={site.testimonials.filter((item) => !item.isPlaceholder)} />
      {SHOW_STORE_FINDER && <StoresBand />}
      <BenefitsStrip benefits={site.benefits} />
    </>
  );
}
