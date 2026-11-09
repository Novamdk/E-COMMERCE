import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/Image';
import { Skeleton } from '@/components/ui/Skeleton';
import { Container } from '@/components/layout/Container';
import { categoryPath, ROUTES } from '@/lib/constants';
import { SectionHeader } from './SectionHeader';

/**
 * Four concerns, not every collection: a short, scannable row reads as more
 * considered than ten tiles. Each maps to the collection that covers it.
 * Concerns whose collection is missing from the catalog are skipped.
 */
const CONCERNS = [
  { slug: 'color-shampoo-hair', label: 'Hair care', image: 'hair-care-package-3' },
  { slug: 'dark-spot', label: 'Skin care', image: 'dark-spot-collagen-cream-6' },
  { slug: 'eye-lashes-growth-serum', label: 'Lashes & eyes', image: 'lash-growth-serum-4' },
  { slug: 'foot-peel-mask', label: 'Body & feet', image: 'foot-peel-mask-0' },
];

const TILE_SIZES = '(min-width: 1024px) 24vw, 50vw';

/**
 * @param {object} props
 * @param {object[]} props.categories
 * @param {boolean} props.isLoading
 */
export function CategoryTiles({ categories, isLoading }) {
  const available = new Set(categories.map((category) => category.slug));
  const tiles = CONCERNS.filter((concern) => available.has(concern.slug));

  return (
    <Container
      as="section"
      width="wide"
      aria-labelledby="collections-heading"
      className="py-20 lg:py-24"
    >
      <SectionHeader
        id="collections-heading"
        eyebrow="Find your routine"
        title="Shop by concern"
        link={{ to: ROUTES.SHOP, label: 'View all' }}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} radius="card" className="aspect-[4/5] w-full" />
          ))}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {tiles.map((tile) => (
            <li key={tile.slug}>
              <Link to={categoryPath(tile.slug)} className="group block">
                <span className="rounded-card block overflow-hidden">
                  {/* Same inset, multiplied packshot treatment as the product cards. */}
                  <Image
                    name={tile.image}
                    alt=""
                    sizes={TILE_SIZES}
                    ratio="aspect-[4/5]"
                    fit="contain"
                    imgClassName="p-[10%] mix-blend-multiply transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
                  />
                </span>
                <span className="mt-4 block text-center text-xs font-semibold tracking-[0.16em] uppercase underline-offset-[6px] group-hover:underline">
                  {tile.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
