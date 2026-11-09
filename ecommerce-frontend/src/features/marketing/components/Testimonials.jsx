import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { Container } from '@/components/layout/Container';
import { SectionHeader } from './SectionHeader';

/**
 * Three-up review row: stars, a short serif quote, and who said it. Reviews
 * flagged `isPlaceholder` carry a visible tag so sample copy cannot pass as a
 * real customer's words once the site is live.
 *
 * @param {object} props
 * @param {{id:string, quote:string, name:string, meta:string, rating:number,
 *          isPlaceholder?: boolean}[]} props.testimonials
 */
export function Testimonials({ testimonials }) {
  return (
    <section aria-labelledby="testimonials-heading" className="bg-surface-sunken">
      <Container width="wide" className="py-20 lg:py-24">
        <SectionHeader id="testimonials-heading" eyebrow="Reviews" title="In their words" />

        <ul className="grid gap-12 md:grid-cols-3 md:gap-10">
          {testimonials.slice(0, 3).map((testimonial) => (
            <li key={testimonial.id}>
              <figure className="flex h-full flex-col items-center text-center">
                <Rating value={testimonial.rating} size="sm" />

                <blockquote className="font-display mt-5 max-w-sm flex-1 text-xl leading-snug font-medium sm:text-2xl">
                  “{testimonial.quote}”
                </blockquote>

                <figcaption className="mt-6 space-y-1">
                  <p className="text-[0.6875rem] font-semibold tracking-[0.16em] uppercase">
                    {testimonial.name}
                  </p>
                  <p className="text-content-muted text-xs">{testimonial.meta}</p>
                  {testimonial.isPlaceholder && (
                    <Badge variant="neutral" className="mt-2">
                      Sample review
                    </Badge>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
