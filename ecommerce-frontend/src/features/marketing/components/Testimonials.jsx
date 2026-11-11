import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { Container } from '@/components/layout/Container';
import { useT } from '@/features/i18n';

/**
 * Three-up review row under one large "Reviews" heading: stars, a short serif quote, and who said it. Reviews
 * flagged `isPlaceholder` carry a visible tag so sample copy cannot pass as a
 * real customer's words once the site is live.
 *
 * @param {object} props
 * @param {{id:string, quote:string, name:string, meta:string, rating:number,
 *          isPlaceholder?: boolean}[]} props.testimonials
 */
export function Testimonials({ testimonials }) {
  const { t } = useT();
  return (
    <section aria-labelledby="testimonials-heading" className="bg-surface-sunken">
      <Container width="wide" className="py-20 lg:py-24">
        <h2
          id="testimonials-heading"
          className="font-display text-gold-shimmer mb-12 text-center text-[2.75rem] leading-none tracking-[-0.02em] sm:mb-14 sm:text-[4rem] lg:text-[5rem]"
        >
          {t('home.reviews.eyebrow')}
        </h2>

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
                      {t('home.reviews.sample')}
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
