import { useCallback, useState } from 'react';
import { cn } from '@/lib/cn';
import { getImage } from '@/lib/productImage';

const FITS = {
  cover: 'object-cover',
  contain: 'object-contain',
};

/**
 * Every image in the storefront goes through here, which is what guarantees
 * the whole-app invariants: responsive AVIF srcSet, intrinsic width/height so
 * nothing shifts while loading, lazy by default, and a shimmer placeholder
 * that fades out on decode.
 *
 * @param {object} props
 * @param {string} props.name manifest key from src/data/images.json
 * @param {string} props.alt empty string marks it decorative
 * @param {string} [props.sizes] the sizes attribute; always pass one for grids
 * @param {boolean} [props.priority] eager-load above-the-fold images
 * @param {'cover'|'contain'} [props.fit]
 * @param {string} [props.ratio] Tailwind aspect class, e.g. "aspect-square"
 * @param {boolean} [props.isTransparent] no backdrop or shimmer, for artwork with an alpha channel such as the logo
 */
export function Image({
  name,
  alt,
  sizes = '100vw',
  priority = false,
  fit = 'cover',
  ratio,
  className,
  imgClassName,
  isTransparent = false,
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { src, srcSet, width, height } = getImage(name);
  // On a server-rendered page the image can finish loading before React takes
  // over, so its load event is never seen; catch that case when it attaches.
  const imgRef = useCallback((node) => {
    if (node?.complete && node.naturalWidth > 0) setIsLoaded(true);
  }, []);

  if (!src) {
    return (
      <div
        className={cn('bg-surface-sunken grid place-items-center', ratio, className)}
        role="img"
        aria-label={alt || 'Image unavailable'}
      >
        <span className="text-content-subtle text-xs">No image</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        !isTransparent && 'bg-surface-sunken',
        ratio,
        className,
      )}
    >
      {!isLoaded && !isTransparent && (
        <div className="bg-ink-200/60 absolute inset-0 animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          'ease-out-soft size-full transition-opacity duration-500',
          FITS[fit] ?? FITS.cover,
          isLoaded ? 'opacity-100' : 'opacity-0',
          imgClassName,
        )}
      />
    </div>
  );
}
