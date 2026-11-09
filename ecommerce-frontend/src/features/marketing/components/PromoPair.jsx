import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/Image';
import { Skeleton } from '@/components/ui/Skeleton';
import { Container } from '@/components/layout/Container';
import { productPath } from '@/lib/constants';
import { discountPercent } from '@/lib/formatCurrency';
import { primaryImage } from '@/lib/productImage';

const TILE_SIZES = '(min-width: 768px) 50vw, 100vw';

/**
 * Two side-by-side editorial tiles, one per featured set. Copy is kept to a
 * title and one line so the image does the selling.
 *
 * @param {object} props
 * @param {object[]} props.products the sets to feature, at most two
 * @param {boolean} props.isLoading
 */
export function PromoPair({ products, isLoading }) {
  return (
    <Container as="section" width="wide" aria-label="Featured sets" className="py-4">
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton radius="card" className="aspect-[4/3] w-full" />
          <Skeleton radius="card" className="aspect-[4/3] w-full" />
        </div>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {products.slice(0, 2).map((product) => {
            const saving = discountPercent(product.price, product.compareAtPrice);
            return (
              <li key={product.id}>
                <Link
                  to={productPath(product.slug)}
                  className="group rounded-card relative block overflow-hidden"
                >
                  <Image
                    name={primaryImage(product)}
                    alt=""
                    sizes={TILE_SIZES}
                    ratio="aspect-[4/3]"
                    imgClassName="transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
                  />
                  <span
                    aria-hidden="true"
                    className="from-surface-inverse/90 via-surface-inverse/30 absolute inset-0 bg-gradient-to-t via-45% to-transparent"
                  />
                  <span className="text-content-inverse absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    {saving > 0 && (
                      <span className="block text-[0.6875rem] font-semibold tracking-[0.18em] uppercase opacity-80">
                        Save {saving}%
                      </span>
                    )}
                    <span className="font-display mt-2 block text-3xl sm:text-4xl">
                      {product.title}
                    </span>
                    <span className="mt-4 inline-block text-[0.6875rem] font-semibold tracking-[0.16em] uppercase underline underline-offset-[6px]">
                      Shop the set
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
