import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/Image';
import { Rating } from '@/components/ui/Rating';
import { cn } from '@/lib/cn';
import { LOW_STOCK_THRESHOLD, productPath } from '@/lib/constants';
import { discountPercent, formatCurrency } from '@/lib/formatCurrency';
import { primaryImage, textureImage } from '@/lib/productImage';
import { useCart } from '@/features/cart';
import { useT } from '@/features/i18n';
import { WishlistToggle } from '@/features/wishlist';

/**
 * Every packshot sits inset on the same warm stone ground. Multiply blending
 * turns each photo's own white backdrop into that stone, which is what makes
 * a mixed set of supplier images read as one consistent family.
 */
const PACKSHOT = 'p-[11%] mix-blend-multiply';

/** How long the texture stays up after the finger lifts. */
const TEXTURE_LINGER_MS = 1500;

const GRID_SIZES = '(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw';

// A compact pill beside the price, as on Olaplex's grid, at every width.
const PILL =
  'relative z-10 inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-content px-3.5 sm:h-9 sm:px-4 text-[0.625rem] sm:text-[0.6875rem] font-semibold tracking-[0.12em] uppercase transition-colors hover:bg-content hover:text-content-inverse disabled:pointer-events-none disabled:opacity-40';

/**
 * Catalog tile: packshot on stone, and on hover the formula's texture fades
 * in so a shopper sees what the cream, gel or oil actually looks like. On
 * touch screens the same swap happens while a finger rests on the tile, so
 * dragging through the grid flashes each formula, as on Olaplex.
 * Products with a size or colour axis send the shopper to the detail page to
 * choose, rather than guessing a variant on their behalf.
 *
 * @param {object} props
 * @param {object} props.product
 * @param {boolean} [props.isPriority] eager-load the image (first row only)
 * @param {boolean} [props.isFlush] edge-to-edge grid tile: no rounding, more padding
 */
export function ProductCard({ product, isPriority = false, isFlush = false }) {
  const { addItem } = useCart();
  const { t } = useT();

  const saving = discountPercent(product.price, product.compareAtPrice);
  const hasVariants = product.variants.sizes.length > 0 || product.variants.colors.length > 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= LOW_STOCK_THRESHOLD;
  const href = productPath(product.slug);
  const cardImage = primaryImage(product);
  // The texture shot if there is one, else a second, genuinely different photo.
  const hoverImage =
    textureImage(product) ?? product.images.find((name) => name !== cardImage) ?? null;
  const [isTouched, setIsTouched] = useState(false);
  const lingerRef = useRef(null);
  useEffect(() => () => window.clearTimeout(lingerRef.current), []);
  const release = () => {
    window.clearTimeout(lingerRef.current);
    lingerRef.current = window.setTimeout(() => setIsTouched(false), TEXTURE_LINGER_MS);
  };
  const touchHandlers = hoverImage
    ? {
        onTouchStart: () => {
          window.clearTimeout(lingerRef.current);
          setIsTouched(true);
        },
        onTouchEnd: release,
        onTouchCancel: release,
      }
    : {};

  return (
    <article
      {...touchHandlers}
      className={cn(
        'group bg-surface-sunken relative flex h-full flex-col [-webkit-touch-callout:none]',
        isFlush ? 'p-4 sm:p-6' : 'rounded-card p-4 sm:p-5',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex flex-wrap gap-1.5">
          {product.isBestSeller && (
            <span className="bg-surface-raised rounded-full px-2.5 py-1 text-[0.6875rem] font-medium">
              {t('product.bestseller')}
            </span>
          )}
          {saving > 0 && (
            <span className="bg-surface-raised rounded-full px-2.5 py-1 text-[0.6875rem] font-medium">
              {t('product.savings', { percent: saving })}
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-surface-raised text-content-muted rounded-full px-2.5 py-1 text-[0.6875rem] font-medium">
              {t('product.soldOut')}
            </span>
          )}
        </span>
        <span className="relative z-10 -mt-1 -mr-1">
          <WishlistToggle product={product} />
        </span>
      </div>

      <Link to={href} tabIndex={-1} aria-hidden="true" className="relative mt-2 block">
        <Image
          name={cardImage}
          alt=""
          sizes={GRID_SIZES}
          ratio="aspect-square"
          fit="contain"
          priority={isPriority}
          isTransparent
          imgClassName={cn(
            PACKSHOT,
            'ease-out-soft transition duration-700',
            hoverImage && (isTouched ? 'opacity-0' : 'group-hover:opacity-0'),
          )}
        />
        {hoverImage && (
          // Wrapped, because Image's own box is `relative` and cannot also be absolute.
          <span
            className={cn(
              'ease-out-soft absolute inset-0 transition-opacity duration-500',
              isTouched ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            )}
          >
            <Image
              name={hoverImage}
              alt=""
              sizes={GRID_SIZES}
              ratio="aspect-square"
              fit="cover"
              isTransparent
              imgClassName="mix-blend-multiply"
            />
          </span>
        )}
      </Link>

      <div className="mt-5 flex flex-1 flex-col gap-1.5">
        <p className="text-content-muted line-clamp-1 text-[0.6875rem] tracking-[0.08em] uppercase">
          {product.subtitle}
        </p>
        <h3 className="text-[0.8125rem] leading-snug font-semibold tracking-[0.08em] uppercase">
          {/* Stretched link: the whole tile is clickable, with one accessible name. */}
          <Link to={href} className="after:absolute after:inset-0 after:content-['']">
            {product.title}
          </Link>
        </h3>

        <Rating value={product.rating} reviewCount={product.reviewCount} size="sm" />

        {isLowStock && (
          <span className="text-holiday-600 text-xs font-medium">
            {t('product.onlyLeft', { count: product.stock })}
          </span>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3 sm:gap-3">
          <p className="flex min-w-0 flex-col sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
            <span className="text-sm font-semibold sm:text-[0.9375rem]">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-content-subtle text-xs">
                {t('product.value', { price: formatCurrency(product.compareAtPrice) })}
              </span>
            )}
          </p>

          {hasVariants ? (
            <Link to={href} className={PILL}>
              {t('product.select')}
            </Link>
          ) : (
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => addItem(product, { qty: 1 })}
              aria-label={t('product.addToCartLabel', { title: product.title })}
              className={PILL}
            >
              {isOutOfStock ? t('product.soldOut') : t('product.add')}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
