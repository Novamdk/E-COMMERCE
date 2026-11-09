import { useCallback, useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';

/** Width of one tile at each breakpoint: ~1.4 visible on phones, 4 on desktop. */
const TILE_WIDTH = 'w-[70%] sm:w-[42%] md:w-[31%] xl:w-[calc((100%-4.5rem)/4)]';

const ARROW_CLASS =
  'grid size-11 place-items-center rounded-full border border-content/20 bg-surface-raised ' +
  'text-content transition-colors hover:border-content disabled:opacity-30';

/**
 * Horizontally scrolling product row with native scroll-snap. Touch and
 * trackpad scroll natively; the arrows page by one viewport width for mouse
 * and keyboard users and disable themselves at either end.
 *
 * @param {object} props
 * @param {object[]} props.products
 * @param {boolean} [props.isLoading]
 * @param {string} props.label accessible name for the region
 */
export function ProductCarousel({ products, isLoading = false, label }) {
  const trackRef = useRef(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setEdges({ atStart: track.scrollLeft <= 4, atEnd: track.scrollLeft >= max - 4 });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure, products.length, isLoading]);

  const page = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: 'smooth' });
  };

  return (
    <section aria-label={label} aria-roledescription="carousel" className="relative">
      <ul
        ref={trackRef}
        onScroll={measure}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-6 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => (
              <li key={i} className={cn('shrink-0 snap-start', TILE_WIDTH)}>
                <ProductCardSkeleton />
              </li>
            ))
          : products.map((product, index) => (
              <li
                key={product.id}
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${products.length}`}
                className={cn('shrink-0 snap-start', TILE_WIDTH)}
              >
                <ProductCard product={product} />
              </li>
            ))}
      </ul>

      <div className="mt-8 hidden justify-center gap-3 md:flex">
        <button
          type="button"
          onClick={() => page(-1)}
          disabled={edges.atStart}
          aria-label="Previous products"
          className={ARROW_CLASS}
        >
          <FiChevronLeft aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => page(1)}
          disabled={edges.atEnd}
          aria-label="Next products"
          className={ARROW_CLASS}
        >
          <FiChevronRight aria-hidden="true" className="size-4" />
        </button>
      </div>
    </section>
  );
}
