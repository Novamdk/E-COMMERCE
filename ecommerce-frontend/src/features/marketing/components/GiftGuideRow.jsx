import { Image } from '@/components/ui/Image';
import { cn } from '@/lib/cn';
import { ProductCard } from '@/features/catalog';

/**
 * One chapter of the gift guide: a tall photo that stays pinned while the
 * products beside it scroll past, Olaplex-style. Chapters alternate sides
 * with `side`. On phones the photo sits above its products.
 *
 * @param {object} props
 * @param {string} props.id anchor for the chip links
 * @param {string} props.image manifest name
 * @param {string} props.title set on the photo
 * @param {object[]} props.products
 * @param {'left'|'right'} [props.side] which side the photo sits on from lg up
 */
export function GiftGuideRow({ id, image, title, products, side = 'left' }) {
  if (products.length === 0) return null;

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="grid scroll-mt-28 gap-1 lg:grid-cols-2"
    >
      <div
        className={cn(
          'relative lg:sticky lg:top-24 lg:h-[calc(100dvh-6rem)] lg:self-start',
          side === 'right' && 'lg:order-2',
        )}
      >
        <Image
          name={image}
          alt=""
          sizes="(min-width: 1024px) 50vw, 100vw"
          ratio="aspect-[4/5] lg:aspect-auto"
          className="lg:h-full"
        />
        <span
          aria-hidden="true"
          className="from-surface-inverse/70 absolute inset-0 bg-gradient-to-t to-transparent to-45%"
        />
        <h2
          id={`${id}-heading`}
          className="font-display text-content-inverse absolute bottom-6 left-6 max-w-sm text-3xl leading-tight sm:bottom-10 sm:left-10 sm:text-5xl"
        >
          {title}
        </h2>
      </div>

      <ul className="grid list-none grid-cols-2 content-start gap-1">
        {products.map((product) => (
          <li key={product.id} className="h-full">
            <ProductCard product={product} isFlush />
          </li>
        ))}
      </ul>
    </section>
  );
}
