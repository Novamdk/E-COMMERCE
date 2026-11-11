import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/Image';
import { collectionPath, ROUTES } from '@/lib/constants';
import { useT } from '@/features/i18n';

/** Four tiles, each a staged shot in the holiday palette, each a curated collection. */
const TILES = [
  { slug: 'holiday-sets', label: 'collections.holidaySets', image: 'category-sets' },
  { slug: 'shampoo-conditioner', label: 'collections.hair', image: 'category-hair' },
  { slug: 'skin-care', label: 'collections.skinCare', image: 'category-skin' },
  { slug: 'eyes-lashes', label: 'collections.eyesLashes', image: 'category-lashes' },
];

const TILE_SIZES = '(min-width: 1024px) 25vw, 50vw';

/** Edge-to-edge row of tall tiles with a pill label, like a shop window. */
export function ShopByCategory() {
  const { t } = useT();

  return (
    <section aria-labelledby="category-heading" className="py-16 lg:py-20">
      <div className="mb-8 flex items-end justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <h2 id="category-heading" className="font-display text-display-sm sm:text-display">
          {t('home.categories.title')}
        </h2>
        <Link
          to={ROUTES.SHOP}
          className="border-content hover:bg-content hover:text-content-inverse rounded-full border px-4 py-2 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase transition-colors"
        >
          {t('home.categories.all')}
        </Link>
      </div>

      <ul className="grid grid-cols-2 gap-1 lg:grid-cols-4">
        {TILES.map((tile) => (
          <li key={tile.slug}>
            <Link to={collectionPath(tile.slug)} className="group relative block overflow-hidden">
              <Image
                name={tile.image}
                alt=""
                sizes={TILE_SIZES}
                ratio="aspect-[4/5]"
                imgClassName="transition-transform duration-1000 ease-out-soft group-hover:scale-[1.04]"
              />
              <span className="bg-surface-raised text-content group-hover:bg-content group-hover:text-content-inverse absolute bottom-4 left-4 rounded-full px-4 py-2 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase shadow-sm transition-colors sm:bottom-6 sm:left-6">
                {t(tile.label)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
