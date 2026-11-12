import { useCallback, useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { useT } from '@/features/i18n';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';

/** Width of one tile at each breakpoint: ~1.3 visible on phones, 4 on desktop, 4px gutters. */
const TILE_WIDTH = 'w-[78%] sm:w-[45%] md:w-[32%] xl:w-[calc((100%-0.75rem)/4)]';

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
  const { t } = useT();
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
        className="flex snap-x snap-mandatory [scrollbar-width:none] gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden"
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
                aria-label={t('product.slide', { index: index + 1, total: products.length })}
                className={cn('shrink-0 snap-start', TILE_WIDTH)}
              >
                <ProductCard product={product} isFlush />
              </li>
            ))}
      </ul>

      <div className="mt-8 hidden justify-center gap-3 px-6 md:flex">
        <button
          type="button"
          onClick={() => page(-1)}
          disabled={edges.atStart}
          aria-label={t('product.previous')}
          className={ARROW_CLASS}
        >
          <FiChevronLeft aria-hidden="true" className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => page(1)}
          disabled={edges.atEnd}
          aria-label={t('product.next')}
          className={ARROW_CLASS}
        >
          <FiChevronRight aria-hidden="true" className="size-4" />
        </button>
      </div>
    </section>
  );
}
