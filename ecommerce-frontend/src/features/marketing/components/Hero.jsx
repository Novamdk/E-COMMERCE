import { FiArrowRight } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';
import { Container } from '@/components/layout/Container';
import { ROUTES } from '@/lib/constants';

/**
 * Landing hero. Asymmetric split rather than a centred stack, and the image
 * is the one eagerly-loaded asset on the page since it is the LCP element.
 *
 * @param {object} props
 * @param {{eyebrow: string, heading: string, body: string}} props.hero
 */
export function Hero({ hero }) {
  return (
    <section className="bg-surface-brand relative overflow-hidden">
      <Container className="relative py-14 sm:py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div className="max-w-xl">
            <p className="text-brand-700 text-xs font-semibold tracking-[0.12em] uppercase">
              {hero.eyebrow}
            </p>

            <h1 className="font-display text-display sm:text-display-lg mt-5">{hero.heading}</h1>

            <p className="text-content-muted mt-6 text-lg leading-relaxed">{hero.body}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button to={ROUTES.SHOP} size="lg">
                Shop the collection
                <FiArrowRight aria-hidden="true" className="size-4" />
              </Button>
              <Button to={ROUTES.ABOUT} variant="outline" size="lg">
                Our ingredients
              </Button>
            </div>

            <dl className="border-brand-200 mt-12 grid max-w-md grid-cols-3 gap-6 border-t pt-7">
              {[
                { value: '13', label: 'Formulas' },
                { value: '9k+', label: 'Reviews' },
                { value: '4.9', label: 'Avg. rating' },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="font-display text-brand-800 block text-3xl">{stat.value}</span>
                    <span className="text-content-muted mt-0.5 block text-xs">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <Image
              name="hero-portrait"
              alt="A person applying a cream mask at home"
              sizes="(min-width: 1024px) 38rem, 100vw"
              ratio="aspect-[4/5] sm:aspect-[3/2] lg:aspect-[4/5]"
              priority
              className="rounded-panel shadow-lifted"
            />

            <div className="rounded-card bg-surface-raised shadow-lifted absolute -bottom-5 -left-3 max-w-[13rem] p-4 sm:left-6 lg:-left-8">
              <p className="font-display text-brand-800 text-2xl">100%</p>
              <p className="text-content-muted mt-0.5 text-xs leading-snug">
                Naturally derived ingredients, cruelty-free, no harsh chemicals
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
