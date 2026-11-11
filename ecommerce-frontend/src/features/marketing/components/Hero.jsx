import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';
import { Container } from '@/components/layout/Container';
import { WELCOME_OFFER_PATH } from '@/lib/constants';
import { useT } from '@/features/i18n';

/**
 * Seasonal campaign hero: the Argan Oil Shampoo bursting out of torn gold
 * gift wrap, with the welcome offer over it. The sign-up button opens the
 * welcome pop-up, so the offer and the code it promises are always the same.
 *
 * Phones get one full-screen photo with white copy over a dark wash at the
 * top, as on Olaplex; from md up dark copy sits on the untouched foil. The
 * image is the LCP element, so it is the one eager asset.
 */
export function Hero() {
  const { t } = useT();

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          name="holiday-hero"
          alt={t('home.hero.imageAlt')}
          sizes="100vw"
          ratio="size-full"
          priority
          imgClassName="object-[74%_center] md:object-center"
        />
      </div>
      {/* Phones: a dark wash behind the white copy. md up: a soft gold lift behind dark copy. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black/75 via-black/35 via-45% to-transparent to-70% md:hidden"
      />
      <span
        aria-hidden="true"
        className="from-gold-50/70 absolute inset-0 -z-10 hidden bg-gradient-to-r via-transparent via-45% to-transparent md:block"
      />

      <Container
        width="wide"
        className="flex h-[min(calc(100svh-10rem),44rem)] min-h-[30rem] items-start pt-9 md:h-[34rem] md:min-h-0 md:items-center md:pt-0 lg:h-[40rem] xl:h-[44rem]"
      >
        <div className="text-content-inverse md:text-brand-900 max-w-xl">
          <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase">
            {t('home.hero.eyebrow')}
          </p>
          <h1 className="font-display text-display sm:text-display-lg mt-3 tracking-tight md:mt-4">
            {t('home.hero.heading')}
          </h1>
          <p className="mt-3 max-w-md text-base leading-relaxed font-medium sm:text-lg md:mt-5">
            {t('home.hero.body')}
          </p>
          <p className="mt-1.5 text-xs italic opacity-80 md:mt-2">{t('home.hero.finePrint')}</p>

          <div className="mt-6 md:hidden">
            <Button to={WELCOME_OFFER_PATH} variant="outline-inverse">
              {t('home.hero.cta')}
            </Button>
          </div>
          <div className="mt-8 hidden md:block">
            <Button to={WELCOME_OFFER_PATH} size="lg">
              {t('home.hero.cta')}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
