import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Image } from '@/components/ui/Image';
import { cn } from '@/lib/cn';
import { useT } from '@/features/i18n';

/** Thumbnails shown at once in the desktop rail before it scrolls. */
const RAIL_STEP = 1;

/**
 * Product images: a vertical thumbnail rail on the left and one large frame,
 * the way Olaplex lays it out. On phones the rail moves under the image and
 * scrolls sideways. The rail is a tablist, so arrow keys move between views.
 *
 * Selection is local state with no reset logic: the caller keys this
 * component by product, so switching products remounts it.
 *
 * @param {object} props
 * @param {string[]} props.images manifest names
 * @param {string} props.title used to build per-thumbnail accessible names
 */
export function Gallery({ images, title }) {
  const { t } = useT();
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <Image name={undefined} alt={title} ratio="aspect-square" />;
  }

  const safeIndex = Math.min(activeIndex, images.length - 1);
  const go = (delta) => setActiveIndex((index) => (index + delta + images.length) % images.length);

  return (
    <div className="flex min-w-0 flex-col-reverse gap-2 lg:flex-row lg:gap-3">
      {images.length > 1 && (
        <div className="flex min-w-0 shrink-0 flex-col items-center gap-2 lg:w-20">
          <button
            type="button"
            onClick={() => go(-RAIL_STEP)}
            aria-label={t('product.previousImage')}
            className="text-content-muted hover:text-content hidden lg:block"
          >
            <FiChevronUp aria-hidden="true" className="size-5" />
          </button>
          <div
            role="tablist"
            aria-label={t('product.images', { title })}
            data-lenis-prevent
            className="flex w-full [scrollbar-width:none] gap-2 overflow-x-auto lg:max-h-[34rem] lg:flex-col lg:overflow-y-auto [&::-webkit-scrollbar]:hidden"
          >
            {images.map((name, index) => (
              <button
                key={`${name}-${index}`}
                role="tab"
                type="button"
                aria-selected={index === safeIndex}
                aria-label={t('product.showImage', { index: index + 1, total: images.length })}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'w-16 shrink-0 overflow-hidden border transition-colors lg:w-full',
                  index === safeIndex
                    ? 'border-content'
                    : 'border-transparent opacity-70 hover:opacity-100',
                )}
              >
                <Image name={name} alt="" sizes="5rem" ratio="aspect-square" />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(RAIL_STEP)}
            aria-label={t('product.nextImage')}
            className="text-content-muted hover:text-content hidden lg:block"
          >
            <FiChevronDown aria-hidden="true" className="size-5" />
          </button>
        </div>
      )}

      <Image
        name={images[safeIndex]}
        alt={t('product.imageAlt', { title, index: safeIndex + 1, total: images.length })}
        sizes="(min-width: 1024px) 50vw, 100vw"
        ratio="aspect-square"
        priority
        className="flex-1"
      />
    </div>
  );
}
