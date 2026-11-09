import { Link } from 'react-router-dom';
import { FiPlay } from 'react-icons/fi';
import { Image } from '@/components/ui/Image';
import { Container } from '@/components/layout/Container';
import { productPath } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatCurrency';
import { useT } from '@/features/i18n';
import { SectionHeader } from './SectionHeader';

/**
 * Which product each vertical tile features, the still to show for now, and
 * where to centre the 9:16 crop. Every tile is already shaped like a phone
 * video, so short-form clips drop into the same slot later without changing
 * the layout.
 */
const LOOKS = [
  {
    slug: 'argan-shampoo-conditioner',
    image: 'argan-shampoo-conditioner-3',
    focus: 'object-[62%_center]',
  },
  { slug: 'lash-growth-serum', image: 'lash-growth-serum-2', focus: 'object-[45%_center]' },
  {
    slug: 'dark-spot-collagen-cream',
    image: 'dark-spot-collagen-cream-5',
    focus: 'object-[30%_center]',
  },
  { slug: 'color-dye-shampoo', image: 'color-dye-shampoo-4', focus: 'object-[72%_center]' },
  {
    slug: 'collagen-anti-aging-cream',
    image: 'collagen-anti-aging-cream-1',
    focus: 'object-[55%_center]',
  },
];

const TILE_SIZES = '(min-width: 1024px) 20vw, (min-width: 640px) 32vw, 62vw';

/**
 * Row of vertical video placeholders, each paired with the product it shows.
 * Scrolls sideways on small screens, sits as a single row on desktop.
 *
 * @param {object} props
 * @param {object[]} props.products the full catalog, to look each slug up
 */
export function ShopTheLook({ products }) {
  const { t } = useT();
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const looks = LOOKS.map((look) => ({ ...look, product: bySlug.get(look.slug) })).filter(
    (look) => look.product,
  );

  if (looks.length === 0) return null;

  return (
    <Container as="section" width="wide" aria-labelledby="looks-heading" className="py-20 lg:py-24">
      <SectionHeader
        id="looks-heading"
        eyebrow={t('home.looks.eyebrow')}
        title={t('home.looks.title')}
      />

      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-1 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
        {looks.map(({ slug, image, focus, product }) => (
          <li key={slug} className="w-[62%] shrink-0 snap-start sm:w-[32%] lg:w-auto">
            <Link to={productPath(slug)} className="group block">
              <span className="relative block overflow-hidden">
                <Image
                  name={image}
                  alt=""
                  sizes={TILE_SIZES}
                  ratio="aspect-[9/16]"
                  imgClassName={`${focus} transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]`}
                />
                <span
                  aria-hidden="true"
                  className="from-surface-inverse/50 absolute inset-0 bg-gradient-to-t to-transparent to-40%"
                />
                <span className="bg-surface-raised/90 text-content absolute top-3 left-3 rounded-full px-2.5 py-1 text-[0.5625rem] font-semibold tracking-[0.12em] uppercase">
                  {t('home.looks.soon')}
                </span>
                <span
                  aria-hidden="true"
                  className="bg-surface-raised/85 text-content absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full backdrop-blur transition-transform group-hover:scale-110"
                >
                  <FiPlay className="ml-0.5 size-5" />
                </span>
                <span className="bg-surface-raised text-content group-hover:bg-content group-hover:text-content-inverse absolute bottom-3 left-3 rounded-full px-3 py-1.5 text-[0.625rem] font-semibold tracking-[0.12em] uppercase transition-colors">
                  {t('home.looks.shop')}
                </span>
              </span>
              <span className="mt-3 block text-[0.6875rem] font-semibold tracking-[0.14em] uppercase group-hover:underline group-hover:underline-offset-4">
                {product.title}
              </span>
              <span className="text-content-muted mt-1 block text-sm">
                {formatCurrency(product.price)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
