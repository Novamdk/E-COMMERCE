import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import { Image } from '@/components/ui/Image';
import { Skeleton } from '@/components/ui/Skeleton';
import { Container } from '@/components/layout/Container';
import { categoryPath, ROUTES } from '@/lib/constants';

/**
 * Editorial imagery per collection. Keyed by slug so a new category falls back
 * to a neutral tile rather than breaking the grid.
 */
const TILE_IMAGES = {
  'hair-serum': 'hair-regrowth-serum-0',
  'hair-mask': 'repair-hair-mask-0',
  'shampoo-conditioner': 'argan-shampoo-conditioner-0',
  'color-shampoo-hair': 'color-dye-shampoo-0',
  'foot-peel-mask': 'foot-peel-mask-0',
  'dark-spot': 'dark-spot-collagen-cream-0',
  'face-lifting-collagen-cream': 'collagen-anti-aging-cream-0',
  'eye-cream-anti-aging-organic': 'retinal-eye-lift-0',
  'eye-lashes-growth-serum': 'lash-growth-serum-4',
  packages: 'dark-spot-beauty-package-0',
};

const TILE_SIZES = '(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw';

/**
 * @param {object} props
 * @param {object[]} props.categories
 * @param {boolean} props.isLoading
 */
export function CategoryTiles({ categories, isLoading }) {
  return (
    <Container as="section" aria-labelledby="collections-heading" className="py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <h2 id="collections-heading" className="font-display text-display-sm sm:text-display">
            Shop by concern
          </h2>
          <p className="text-content-muted mt-3">
            Ten collections, each built around one problem — thinning hair, uneven tone, cracked
            heels, tired eyes.
          </p>
        </div>
        <Link
          to={ROUTES.SHOP}
          className="text-brand-700 hover:text-brand-800 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          View all products
          <FiArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} radius="card" className="aspect-[4/3] w-full" />
          ))}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                to={categoryPath(category.slug)}
                className="group rounded-card relative block overflow-hidden"
              >
                <Image
                  name={TILE_IMAGES[category.slug]}
                  alt=""
                  sizes={TILE_SIZES}
                  ratio="aspect-[4/3]"
                  imgClassName="transition-transform duration-700 ease-out-soft group-hover:scale-105"
                />
                <span
                  aria-hidden="true"
                  className="from-surface-inverse/80 via-surface-inverse/10 absolute inset-0 bg-gradient-to-t to-transparent"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                  <span>
                    <span className="text-content-inverse block font-medium">{category.name}</span>
                    <span className="text-content-inverse/70 block text-xs">
                      {category.count} {category.count === 1 ? 'product' : 'products'}
                    </span>
                  </span>
                  <FiArrowUpRight
                    aria-hidden="true"
                    className="text-content-inverse size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
