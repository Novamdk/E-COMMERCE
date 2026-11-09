import { m } from 'framer-motion';
import { cn } from '@/lib/cn';
import { EASE_OUT_SOFT } from '@/lib/motion';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';

const COLUMNS = {
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
};

/** How many tiles load eagerly — roughly the first visible row. */
const PRIORITY_COUNT = 3;

/** Tiles fade up in sequence. Re-runs on filter changes, which reads as responsive. */
const GRID_MOTION = {
  animate: { transition: { staggerChildren: 0.045 } },
};

const TILE_MOTION = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE_OUT_SOFT } },
};

/**
 * @param {object} props
 * @param {object[]} props.products
 * @param {boolean} [props.isLoading] renders skeletons instead
 * @param {number} [props.skeletonCount]
 * @param {3|4} [props.columns]
 * @param {boolean} [props.hasPriorityImages] eager-load the first row
 */
export function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 9,
  columns = 3,
  hasPriorityImages = false,
}) {
  const className = cn('grid gap-x-5 gap-y-10 sm:gap-x-6', COLUMNS[columns] ?? COLUMNS[3]);

  if (isLoading) {
    return (
      <div className={className} aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading products</span>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <m.ul
      variants={GRID_MOTION}
      initial="initial"
      animate="animate"
      className={cn(className, 'list-none')}
    >
      {products.map((product, index) => (
        <m.li key={product.id} variants={TILE_MOTION}>
          <ProductCard product={product} isPriority={hasPriorityImages && index < PRIORITY_COUNT} />
        </m.li>
      ))}
    </m.ul>
  );
}
