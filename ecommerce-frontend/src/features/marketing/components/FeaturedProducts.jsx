import { Container } from '@/components/layout/Container';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { ProductCarousel } from '@/features/catalog';
import { collectionPath } from '@/lib/constants';
import { useT } from '@/features/i18n';
import { SectionHeader } from './SectionHeader';

/**
 * @param {object} props
 * @param {object[]} props.products already narrowed by the page
 * @param {boolean} props.isLoading
 * @param {Error|null} props.error
 * @param {() => void} props.onRetry
 */
export function FeaturedProducts({ products, isLoading, error, onRetry }) {
  const { t } = useT();

  return (
    <Container
      as="section"
      width="wide"
      aria-labelledby="bestsellers-heading"
      className="py-20 lg:py-24"
    >
      <SectionHeader
        id="bestsellers-heading"
        eyebrow={t('home.bestsellers.eyebrow')}
        title={t('home.bestsellers.title')}
        link={{ to: collectionPath('bestsellers'), label: t('home.bestsellers.link') }}
      />

      {error ? (
        <ErrorPanel title={t('home.bestsellers.error')} error={error} onRetry={onRetry} />
      ) : (
        <ProductCarousel
          products={products}
          isLoading={isLoading}
          label={t('home.bestsellers.title')}
        />
      )}
    </Container>
  );
}
