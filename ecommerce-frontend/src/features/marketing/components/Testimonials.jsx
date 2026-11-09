import { Image } from '@/components/ui/Image';
import { Rating } from '@/components/ui/Rating';
import { Container } from '@/components/layout/Container';

/**
 * @param {object} props
 * @param {{id:string, quote:string, name:string, meta:string, avatar:string, rating:number}[]} props.testimonials
 */
export function Testimonials({ testimonials }) {
  return (
    <Container as="section" aria-labelledby="testimonials-heading" className="py-20">
      <div className="mb-10 max-w-xl">
        <h2 id="testimonials-heading" className="font-display text-display-sm sm:text-display">
          What our customers say
        </h2>
        <p className="text-content-muted mt-3">
          Nine thousand reviews across the range. Here are four of them.
        </p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((testimonial) => (
          <li key={testimonial.id}>
            <figure className="rounded-card border-border bg-surface-raised flex h-full flex-col gap-4 border p-6">
              <Rating value={testimonial.rating} size="sm" />

              <blockquote className="text-content-muted flex-1 text-sm leading-relaxed">
                {testimonial.quote}
              </blockquote>

              <figcaption className="border-border flex items-center gap-3 border-t pt-4">
                <Image
                  name={testimonial.avatar}
                  alt=""
                  sizes="2.5rem"
                  ratio="aspect-square"
                  className="w-10 shrink-0 rounded-full"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{testimonial.name}</p>
                  <p className="text-content-subtle truncate text-xs">{testimonial.meta}</p>
                </div>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Container>
  );
}
