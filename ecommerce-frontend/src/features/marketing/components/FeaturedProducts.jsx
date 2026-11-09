import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import { Container } from '@/components/layout/Container';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { ProductGrid } from '@/features/catalog';
import { ROUTES } from '@/lib/constants';

/**
 * @param {object} props
 * @param {object[]} props.products already narrowed by the page
 * @param {boolean} props.isLoading
 * @param {Error|null} props.error
 * @param {() => void} props.onRetry
 */
export function FeaturedProducts({ products, isLoading, error, onRetry }) {
  return (
    <Container as="section" aria-labelledby="bestsellers-heading" className="py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <h2 id="bestsellers-heading" className="font-display text-display-sm sm:text-display">
            Our best sellers
          </h2>
          <p className="text-content-muted mt-3">
            The formulas customers come back for, and the bundles that cost less than buying the
            pieces separately.
          </p>
        </div>
        <Link
          to={ROUTES.SHOP}
          className="text-brand-700 hover:text-brand-800 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          Shop everything
          <FiArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {error ? (
        <ErrorPanel title="Best sellers could not load" error={error} onRetry={onRetry} />
      ) : (
        <ProductGrid products={products} isLoading={isLoading} skeletonCount={4} columns={4} />
      )}
    </Container>
  );
}
