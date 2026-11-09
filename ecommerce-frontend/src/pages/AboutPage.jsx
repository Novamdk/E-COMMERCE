import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { Image } from '@/components/ui/Image';
import { Skeleton } from '@/components/ui/Skeleton';
import { Container } from '@/components/layout/Container';
import { PageShell } from '@/components/layout/PageShell';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { quizPath, ROUTES } from '@/lib/constants';
import { getProducts, getSiteContent } from '@/services/productService';
import { useT } from '@/features/i18n';

const EYEBROW = 'text-[0.6875rem] font-semibold tracking-[0.2em] uppercase';

/** Key ingredients, each shown with the texture shot of a formula that carries it. */
const INGREDIENTS = [
  { id: 'argan', image: 'texture-shampoo' },
  { id: 'collagen', image: 'texture-cream' },
  { id: 'protein', image: 'texture-mask' },
  { id: 'botanicals', image: 'texture-serum' },
];

/**
 * Editorial split block: a tall image beside an eyebrow, heading and copy.
 * `isReversed` puts the image on the right from lg up.
 */
function Story({ image, alt, eyebrow, heading, body, isReversed = false }) {
  return (
    <section>
      <Container width="wide" className="py-16 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-24">
          <div className={isReversed ? 'lg:order-2' : undefined}>
            <Image
              name={image}
              alt={alt}
              sizes="(min-width: 1024px) 40rem, 100vw"
              ratio="aspect-[4/5]"
            />
          </div>
          <div className="max-w-lg">
            <p className={`${EYEBROW} text-gold-600`}>{eyebrow}</p>
            <h2 className="font-display text-display-sm sm:text-display mt-5">{heading}</h2>
            <p className="text-content-muted mt-6 text-lg leading-relaxed">{body}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * The brand story, laid out like a campaign page: a full-bleed still life,
 * one large mission line, two editorial splits, a band of numbers taken from
 * the catalog, the key ingredients and a closing call to action.
 */
export default function AboutPage() {
  const { t, language } = useT();
  usePageMeta({ title: t('nav.aboutUs'), description: t('seo.about'), path: '/about' });

  const fetchContent = useCallback(() => getSiteContent(language), [language]);
  const fetchProducts = useCallback(() => getProducts(language), [language]);
  const content = useAsync(fetchContent);
  const products = useAsync(fetchProducts);

  /** Review count and review-weighted average rating across the range. */
  const ratings = useMemo(() => {
    const list = products.data ?? [];
    const reviews = list.reduce((sum, product) => sum + product.reviewCount, 0);
    if (reviews === 0) return null;
    const weighted = list.reduce((sum, product) => sum + product.rating * product.reviewCount, 0);
    return { reviews, average: weighted / reviews };
  }, [products.data]);

  if (content.loading) {
    return (
      <PageShell>
        <Skeleton className="aspect-[4/3] w-full sm:aspect-[16/7]" radius="panel" />
        <Skeleton className="mx-auto mt-16 h-10 w-2/3 max-w-2xl" />
        <Skeleton className="mx-auto mt-4 h-10 w-1/2 max-w-xl" />
      </PageShell>
    );
  }

  if (content.error || !content.data) {
    return (
      <PageShell>
        <ErrorPanel
          title="This page could not load"
          error={content.error}
          onRetry={content.refetch}
        />
      </PageShell>
    );
  }

  const { about, benefits } = content.data;
  const numbers = new Intl.NumberFormat(language);

  const stats = [
    ratings && {
      value: ratings.average.toFixed(1),
      suffix: '★',
      label: t('aboutPage.stats.rating'),
    },
    ratings && {
      value: numbers.format(Math.floor(ratings.reviews / 1000) * 1000),
      suffix: '+',
      label: t('aboutPage.stats.reviews'),
    },
    { value: '100', suffix: '%', label: t('aboutPage.stats.crueltyFree') },
    { value: '30', suffix: '', label: t('aboutPage.stats.returns') },
  ].filter(Boolean);

  return (
    <>
      {/* Hero: full-bleed still life, copy over its empty left side from lg up. */}
      <section className="relative">
        <Image
          name="about-hero"
          alt={t('aboutPage.heroAlt')}
          sizes="100vw"
          priority
          ratio="aspect-[4/3] sm:aspect-[16/8] lg:aspect-[16/7]"
          imgClassName="object-[70%_50%]"
        />
        <Container width="wide" className="lg:absolute lg:inset-0 lg:flex lg:items-center">
          <div className="max-w-xl py-10 lg:py-0">
            <p className={`${EYEBROW} text-gold-700`}>{t('aboutPage.eyebrow')}</p>
            <h1 className="font-display text-display sm:text-display-lg mt-5">
              {t('aboutPage.title')}
            </h1>
            <p className="text-content-muted mt-6 max-w-md text-lg leading-relaxed">
              {t('aboutPage.intro')}
            </p>
          </div>
        </Container>
      </section>

      {/* Mission line */}
      <section className="border-border border-y">
        <Container width="wide" className="py-20 text-center lg:py-32">
          <Image
            name="brand-mark"
            alt=""
            sizes="5rem"
            ratio="aspect-[400/319]"
            fit="contain"
            isTransparent
            className="mx-auto w-16"
          />
          <p className="font-display mx-auto mt-10 max-w-4xl text-[1.75rem] leading-[1.2] tracking-[-0.015em] sm:text-[2.5rem] lg:text-[3.25rem]">
            {t('aboutPage.mission')}
          </p>
        </Container>
      </section>

      <Story
        image="category-skin"
        alt={t('aboutPage.whoAlt')}
        eyebrow={t('aboutPage.whoEyebrow')}
        heading={t('aboutPage.whoTitle')}
        body={about.paragraphs[0]}
      />

      {/* Numbers band */}
      <section className="bg-surface-inverse text-content-inverse">
        <Container width="wide" className="py-16 lg:py-20">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border-gold-500/40 flex flex-col-reverse border-l pl-5 lg:pl-8"
              >
                <dt className="text-content-inverse/70 mt-3 text-xs tracking-[0.14em] uppercase">
                  {stat.label}
                </dt>
                <dd className="font-display text-4xl sm:text-5xl lg:text-6xl">
                  {stat.value}
                  <span className="text-gold-400">{stat.suffix}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Story
        image="routine-hair"
        alt={t('aboutPage.promiseAlt')}
        eyebrow={t('aboutPage.promiseEyebrow')}
        heading={t('aboutPage.promiseTitle')}
        body={about.paragraphs[1]}
        isReversed
      />

      {/* Key ingredients */}
      <section className="bg-surface-brand">
        <Container width="wide" className="py-20 lg:py-28">
          <div className="max-w-2xl">
            <p className={`${EYEBROW} text-gold-700`}>{t('aboutPage.ingredientsEyebrow')}</p>
            <h2 className="font-display text-display-sm sm:text-display mt-5">
              {t('aboutPage.ingredientsTitle')}
            </h2>
          </div>
          <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-8">
            {INGREDIENTS.map((ingredient) => (
              <li key={ingredient.id}>
                <Image
                  name={ingredient.image}
                  alt=""
                  sizes="(min-width: 1024px) 20rem, 50vw"
                  ratio="aspect-square"
                />
                <h3 className="mt-5 text-sm font-semibold tracking-[0.14em] uppercase">
                  {t(`aboutPage.ingredients.${ingredient.id}.name`)}
                </h3>
                <p className="text-content-muted mt-2 text-sm leading-relaxed">
                  {t(`aboutPage.ingredients.${ingredient.id}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* What we stand by */}
      <section>
        <Container width="wide" className="py-20 lg:py-28">
          <h2 className="font-display text-display-sm sm:text-display max-w-xl">
            {t('aboutPage.valuesTitle')}
          </h2>
          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {benefits.map((benefit, index) => (
              <li key={benefit.title} className="border-content/15 border-t pt-6">
                <span className="text-gold-600 font-display text-sm tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-lg font-medium">{benefit.title}</h3>
                <p className="text-content-muted mt-2 text-sm leading-relaxed">{benefit.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Closing call to action */}
      <section className="bg-gold-sheen">
        <Container width="wide" className="py-20 text-center lg:py-24">
          <h2 className="font-display text-display-sm sm:text-display mx-auto max-w-2xl">
            {t('aboutPage.ctaTitle')}
          </h2>
          <p className="text-content-muted mx-auto mt-4 max-w-md">{t('aboutPage.ctaBody')}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to={quizPath('hair')} size="lg">
              {t('aboutPage.ctaQuiz')}
            </Button>
            <Button to={ROUTES.SHOP} variant="outline" size="lg">
              {t('nav.shopAll')}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
