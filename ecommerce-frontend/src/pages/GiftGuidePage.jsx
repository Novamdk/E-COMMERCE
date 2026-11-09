import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';
import { RouteFallback } from '@/components/layout/RouteFallback';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { FREE_SHIPPING_THRESHOLD, quizPath } from '@/lib/constants';
import { collectionProducts } from '@/lib/filterProducts';
import { formatCurrency } from '@/lib/formatCurrency';
import { getProducts } from '@/services/productService';
import { useT } from '@/features/i18n';
import { GiftGuideRow, OfferMarquee } from '@/features/marketing';

const UNDER_50 = 5000;

/**
 * The holiday gift guide, after Olaplex's holiday shop: a hero with chips
 * that jump to each chapter, then chapters that alternate a pinned photo
 * left and right while the products scroll, split by red ticker bands, and
 * a gift-finder call to action at the end.
 */
export default function GiftGuidePage() {
  const { t, language } = useT();
  const fetchProducts = useCallback(() => getProducts(language), [language]);
  const { data } = useAsync(fetchProducts);
  usePageMeta({
    title: t('nav.giftGuide'),
    description: `${t('giftGuide.title')}. ${t('giftGuide.body')}`,
    path: '/gift-guide',
    image: '/og/gift-guide.jpg',
  });

  const chapters = useMemo(() => {
    if (!data) return [];
    const bySaving = (a, b) =>
      (b.compareAtPrice ?? b.price) - b.price - ((a.compareAtPrice ?? a.price) - a.price);
    const sets = collectionProducts(data, 'holiday-sets');
    const setIds = new Set(sets.map((product) => product.id));
    return [
      {
        id: 'sets',
        image: 'gift-flatlay',
        title: t('giftGuide.sets'),
        products: [...sets, ...data.filter((p) => ['2547', '2394'].includes(p.id))],
      },
      {
        id: 'under-50',
        image: 'category-lashes',
        title: t('giftGuide.under50'),
        products: data.filter((p) => p.price < UNDER_50).sort(bySaving),
      },
      {
        id: 'bestsellers',
        image: 'gift-bestsellers',
        title: t('giftGuide.bestsellers'),
        products: collectionProducts(data, 'bestsellers').filter((p) => !setIds.has(p.id)),
      },
      {
        id: 'skin',
        image: 'category-skin',
        title: t('giftGuide.skin'),
        products: collectionProducts(data, 'skin-care').filter((p) => !setIds.has(p.id)),
      },
    ].filter((chapter) => chapter.products.length > 0);
  }, [data, t]);

  if (!data) return <RouteFallback />;

  const ticker = [
    t('giftGuide.tickerWrapped'),
    t('giftGuide.tickerQuiz'),
    t('announcements.freeShipping', {
      amount: formatCurrency(FREE_SHIPPING_THRESHOLD, { compact: true }),
    }),
    t('home.marquee.limited'),
  ];

  return (
    <>
      <section
        aria-labelledby="gift-guide-heading"
        className="bg-surface-sunken grid md:grid-cols-2"
      >
        <div className="flex flex-col justify-center px-4 py-12 sm:px-10 lg:px-16">
          <p className="text-gold-shimmer text-[0.6875rem] font-bold tracking-[0.2em] uppercase">
            {t('nav.giftGuide')}
          </p>
          <h1
            id="gift-guide-heading"
            className="font-display text-display sm:text-display-lg mt-3 max-w-lg"
          >
            {t('giftGuide.title')}
          </h1>
          <p className="text-content-muted mt-4 max-w-md">{t('giftGuide.body')}</p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  className="border-content hover:bg-content hover:text-content-inverse inline-block rounded-full border px-4 py-2 text-[0.6875rem] font-semibold tracking-[0.12em] uppercase transition-colors"
                >
                  {chapter.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative min-h-80">
          <div className="absolute inset-0">
            <Image
              name="category-sets"
              alt=""
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
              className="size-full"
            />
          </div>
        </div>
      </section>

      {chapters.map((chapter, index) => (
        <div key={chapter.id}>
          {index > 0 && <OfferMarquee messages={ticker} />}
          <div className="mt-1">
            <GiftGuideRow {...chapter} side={index % 2 === 0 ? 'left' : 'right'} />
          </div>
        </div>
      ))}

      <section className="bg-holiday-600 text-content-inverse mt-1 px-4 py-16 text-center sm:py-20">
        <h2 className="font-display text-display-sm sm:text-display mx-auto max-w-xl">
          {t('giftGuide.quizTitle')}
        </h2>
        <p className="mx-auto mt-3 max-w-md opacity-90">{t('giftGuide.quizBody')}</p>
        <Button to={quizPath('gift')} variant="inverse" size="lg" className="mt-8">
          {t('nav.giftFinder')}
        </Button>
      </section>
    </>
  );
}
