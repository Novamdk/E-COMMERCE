import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/Image';
import { Container } from '@/components/layout/Container';
import { productPath } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatCurrency';
import { useT } from '@/features/i18n';
import { SectionHeader } from './SectionHeader';

/**
 * Which product each vertical tile features, its poster still and where to
 * centre the 9:16 crop. A tile shows only once it has a real clip: add
 * `video: '/videos/<name>.mp4'` (a short 9:16 MP4 in public/videos). Until
 * then the whole row stays hidden rather than showing "coming soon".
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
 * Row of short vertical product videos, each paired with the product it shows.
 * Renders nothing until at least one look has a video.
 * Scrolls sideways on small screens, sits as a single row on desktop.
 *
 * @param {object} props
 * @param {object[]} props.products the full catalog, to look each slug up
 */
export function ShopTheLook({ products }) {
  const { t } = useT();
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const looks = LOOKS.map((look) => ({ ...look, product: bySlug.get(look.slug) })).filter(
    (look) => look.product && look.video,
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
        {looks.map(({ slug, image, video, focus, product }) => (
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
                <video
                  src={video}
                  aria-hidden="true"
                  className={`absolute inset-0 size-full object-cover ${focus}`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <span
                  aria-hidden="true"
                  className="from-surface-inverse/50 absolute inset-0 bg-gradient-to-t to-transparent to-40%"
                />
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
