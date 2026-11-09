import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';
import { Container } from '@/components/layout/Container';
import { ROUTES } from '@/lib/constants';

const CLAIMS = ['Botanical extracts', 'No parabens or sulphates', 'Cruelty-free'];

/**
 * Split editorial block. Copy is held to the short second paragraph and three
 * claims; the long-form version lives on the About page.
 *
 * @param {object} props
 * @param {{heading: string, body: string, body2: string}} props.ingredients
 */
export function IngredientsSection({ ingredients }) {
  return (
    <section className="bg-surface-brand">
      <Container width="wide" className="py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Image
            name="ingredients-botanical"
            alt="Botanical ingredients used across the range"
            sizes="(min-width: 1024px) 40rem, 100vw"
            ratio="aspect-[5/4]"
            fit="contain"
            className="rounded-card bg-surface-raised p-8"
          />

          <div className="max-w-md">
            <p className="text-content-muted text-[0.6875rem] font-semibold tracking-[0.18em] uppercase">
              Our philosophy
            </p>
            <h2 className="font-display text-display-sm sm:text-display mt-4">
              {ingredients.heading}
            </h2>
            <p className="text-content-muted mt-5 leading-relaxed">{ingredients.body2}</p>

            <ul className="mt-8 flex flex-wrap gap-2">
              {CLAIMS.map((claim) => (
                <li
                  key={claim}
                  className="border-content/20 rounded-field border px-3 py-1.5 text-[0.6875rem] font-semibold tracking-[0.12em] uppercase"
                >
                  {claim}
                </li>
              ))}
            </ul>

            <Button to={ROUTES.ABOUT} variant="outline" className="mt-10">
              Our story
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
