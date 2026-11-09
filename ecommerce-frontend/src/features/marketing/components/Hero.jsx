import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';
import { Container } from '@/components/layout/Container';
import { categoryPath, ROUTES } from '@/lib/constants';

/**
 * Full-bleed landing hero: one image, one line of copy, two calls to action.
 * The image is the one eagerly-loaded asset on the page since it is the LCP
 * element, and a left-weighted scrim keeps the copy legible over it.
 *
 * @param {object} props
 * @param {{eyebrow: string, heading: string, body: string}} props.hero
 */
export function Hero({ hero }) {
  return (
    <section className="bg-surface-inverse relative isolate overflow-hidden">
      {/* Wrapped, because Image's own box is `relative` and cannot also be absolute. */}
      <div className="absolute inset-0 -z-10">
        <Image
          name="hero-portrait"
          alt="A person applying a cream mask at home"
          sizes="100vw"
          ratio="size-full"
          priority
          imgClassName="object-[70%_center]"
        />
      </div>
      <span
        aria-hidden="true"
        className="from-surface-inverse/80 via-surface-inverse/40 absolute inset-0 -z-10 bg-gradient-to-r to-transparent"
      />

      <Container width="wide" className="flex h-[34rem] items-center sm:h-[38rem] lg:h-[44rem]">
        <div className="text-content-inverse max-w-lg">
          <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase opacity-80">
            {hero.eyebrow}
          </p>
          <h1 className="font-display text-display sm:text-display-lg mt-5">{hero.heading}</h1>
          <p className="mt-5 max-w-sm text-base leading-relaxed opacity-85">
            Natural hair and skin care that nourishes, without harsh chemicals.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button to={ROUTES.SHOP} variant="inverse" size="lg">
              Shop bestsellers
            </Button>
            <Button to={categoryPath('packages')} variant="outline-inverse" size="lg">
              Shop sets
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
