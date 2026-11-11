import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/Image';
import { collectionPath } from '@/lib/constants';
import { useT } from '@/features/i18n';

const TILE_SIZES = '(min-width: 768px) 50vw, 100vw';

/**
 * Two edge-to-edge holiday tiles: the limited-time sets on red, and the
 * bestsellers pitched as gifts. Copy stays to an eyebrow, a headline and a
 * link so the art does the selling.
 *
 * @param {object} props
 * @param {number} props.maxSavings biggest saving across the holiday sets, in percent
 */
export function HolidayPair({ maxSavings }) {
  const { t } = useT();

  const tiles = [
    {
      key: 'sets',
      image: 'gift-flatlay',
      to: collectionPath('holiday-sets'),
      eyebrow: t('home.holiday.setsEyebrow'),
      title:
        maxSavings > 0
          ? t('home.holiday.setsTitle', { percent: maxSavings })
          : t('home.holiday.setsTitlePlain'),
      cta: t('home.holiday.setsCta'),
    },
    {
      key: 'bestsellers',
      image: 'gift-bestsellers',
      to: collectionPath('bestsellers'),
      eyebrow: t('home.holiday.bestEyebrow'),
      title: t('home.holiday.bestTitle'),
      cta: t('home.holiday.bestCta'),
    },
  ];

  return (
    <section aria-label={t('home.holiday.label')} className="grid gap-1 md:grid-cols-2">
      {tiles.map((tile) => (
        <Link key={tile.key} to={tile.to} className="group relative block overflow-hidden">
          <Image
            name={tile.image}
            alt=""
            sizes={TILE_SIZES}
            ratio="aspect-[4/5] md:aspect-[5/6] lg:aspect-[4/5]"
            imgClassName="transition-transform duration-1000 ease-out-soft group-hover:scale-[1.03]"
          />
          <span
            aria-hidden="true"
            className="from-surface-inverse/80 absolute inset-0 bg-gradient-to-t via-transparent via-50% to-transparent"
          />
          <span className="text-content-inverse absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <span className="bg-gold-sheen text-brand-900 inline-block rounded-full px-3 py-1 text-[0.625rem] font-bold tracking-[0.16em] uppercase">
              {tile.eyebrow}
            </span>
            <span className="font-display mt-4 block max-w-md text-3xl leading-tight sm:text-5xl">
              {tile.title}
            </span>
            <span className="mt-5 inline-block text-[0.6875rem] font-semibold tracking-[0.16em] uppercase underline underline-offset-[6px]">
              {tile.cta}
            </span>
          </span>
        </Link>
      ))}
    </section>
  );
}
