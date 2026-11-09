import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';
import { Container } from '@/components/layout/Container';
import { WELCOME_OFFER_PATH } from '@/lib/constants';
import { useT } from '@/features/i18n';

/**
 * Seasonal campaign hero: the Argan Oil Shampoo bursting out of torn gold
 * gift wrap, with the welcome offer set on the untouched foil to its left.
 * The sign-up button opens the welcome pop-up, so the offer and the code it
 * promises are always the same one.
 *
 * Phones stack the copy under a cropped image; from md up the copy sits on
 * the foil. The image is the LCP element, so it is the one eager asset.
 */
export function Hero() {
  const { t } = useT();

  return (
    <section className="bg-surface-sunken relative isolate overflow-hidden md:bg-transparent">
      <div className="relative aspect-[4/3] md:absolute md:inset-0 md:-z-10 md:aspect-auto">
        <Image
          name="holiday-hero"
          alt={t('home.hero.imageAlt')}
          sizes="100vw"
          ratio="size-full"
          priority
          imgClassName="object-[80%_center] md:object-center"
        />
      </div>
      {/* A soft lift on the foil behind the copy keeps dark text crisp over the highlights. */}
      <span
        aria-hidden="true"
        className="from-gold-50/70 absolute inset-0 -z-10 hidden bg-gradient-to-r via-transparent via-45% to-transparent md:block"
      />

      <Container
        width="wide"
        className="py-10 md:flex md:h-[34rem] md:items-center md:py-0 lg:h-[40rem] xl:h-[44rem]"
      >
        <div className="text-brand-900 max-w-xl">
          <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase">
            {t('home.hero.eyebrow')}
          </p>
          <h1 className="font-display text-display sm:text-display-lg mt-4 tracking-tight">
            {t('home.hero.heading')}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed font-medium sm:text-lg">
            {t('home.hero.body')}
          </p>
          <p className="mt-2 text-xs italic opacity-80">{t('home.hero.finePrint')}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button to={WELCOME_OFFER_PATH} size="lg">
              {t('home.hero.cta')}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
