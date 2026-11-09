import { FiCheck } from 'react-icons/fi';
import { Image } from '@/components/ui/Image';
import { Container } from '@/components/layout/Container';

const CLAIMS = [
  'Botanical extracts, vitamins and essential nutrients',
  'No parabens, sulphates or harsh detergents',
  'Cruelty-free, never tested on animals',
  'Responsible packaging wherever available',
];

/**
 * @param {object} props
 * @param {{heading: string, body: string, body2: string}} props.ingredients
 */
export function IngredientsSection({ ingredients }) {
  return (
    <section className="bg-surface-inverse text-content-inverse">
      <Container className="py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <Image
              name="ingredients-botanical"
              alt="Botanical ingredients used across the range"
              sizes="(min-width: 1024px) 34rem, 100vw"
              ratio="aspect-[5/4]"
              fit="contain"
              className="rounded-panel bg-brand-900/40 p-6"
            />
          </div>

          <div className="order-1 max-w-xl lg:order-2">
            <p className="text-brand-300 text-xs font-semibold tracking-[0.12em] uppercase">
              Our philosophy
            </p>
            <h2 className="font-display text-display-sm sm:text-display mt-5">
              {ingredients.heading}
            </h2>
            <p className="text-content-inverse/70 mt-6 leading-relaxed">{ingredients.body}</p>
            <p className="text-content-inverse/70 mt-4 leading-relaxed">{ingredients.body2}</p>

            <ul className="mt-9 grid gap-3 sm:grid-cols-2">
              {CLAIMS.map((claim) => (
                <li key={claim} className="text-content-inverse/85 flex gap-2.5 text-sm">
                  <FiCheck aria-hidden="true" className="text-brand-300 mt-0.5 size-4 shrink-0" />
                  {claim}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
