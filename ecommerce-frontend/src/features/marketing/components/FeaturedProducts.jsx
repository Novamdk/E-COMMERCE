import { Container } from '@/components/layout/Container';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { ProductCarousel } from '@/features/catalog';
import { ROUTES } from '@/lib/constants';
import { SectionHeader } from './SectionHeader';

/**
 * @param {object} props
 * @param {object[]} props.products already narrowed by the page
 * @param {boolean} props.isLoading
 * @param {Error|null} props.error
 * @param {() => void} props.onRetry
 */
export function FeaturedProducts({ products, isLoading, error, onRetry }) {
  return (
    <Container
      as="section"
      width="wide"
      aria-labelledby="bestsellers-heading"
      className="py-20 lg:py-24"
    >
      <SectionHeader
        id="bestsellers-heading"
        eyebrow="Most loved"
        title="Bestsellers"
        link={{ to: ROUTES.SHOP, label: 'Shop all' }}
      />

      {error ? (
        <ErrorPanel title="Bestsellers could not load" error={error} onRetry={onRetry} />
      ) : (
        <ProductCarousel products={products} isLoading={isLoading} label="Bestsellers" />
      )}
    </Container>
  );
}
