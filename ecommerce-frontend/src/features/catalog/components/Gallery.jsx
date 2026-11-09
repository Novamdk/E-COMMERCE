import { useState } from 'react';
import { Image } from '@/components/ui/Image';
import { cn } from '@/lib/cn';

/**
 * Product image gallery: one large frame plus a thumbnail rail implemented as
 * a tablist, so arrow keys move between views.
 *
 * Selection is plain local state with no reset logic — the caller gives this
 * component a `key` tied to the product, so switching products remounts it.
 *
 * @param {object} props
 * @param {string[]} props.images manifest names
 * @param {string} props.title used to build per-thumbnail accessible names
 */
export function Gallery({ images, title }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <Image name={undefined} alt={title} ratio="aspect-square" className="rounded-panel" />;
  }

  const safeIndex = Math.min(activeIndex, images.length - 1);

  return (
    <div className="flex flex-col gap-3">
      <Image
        name={images[safeIndex]}
        alt={`${title} — view ${safeIndex + 1} of ${images.length}`}
        sizes="(min-width: 1024px) 34rem, 100vw"
        ratio="aspect-square"
        priority
        className="rounded-panel"
      />

      {images.length > 1 && (
        <div role="tablist" aria-label={`${title} images`} className="grid grid-cols-5 gap-2.5">
          {images.map((name, index) => (
            <button
              key={`${name}-${index}`}
              role="tab"
              type="button"
              aria-selected={index === safeIndex}
              aria-label={`Show view ${index + 1} of ${images.length}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'rounded-field overflow-hidden transition-all duration-200',
                index === safeIndex
                  ? 'ring-brand-700 ring-offset-surface ring-2 ring-offset-2'
                  : 'opacity-65 hover:opacity-100',
              )}
            >
              <Image name={name} alt="" sizes="6rem" ratio="aspect-square" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
