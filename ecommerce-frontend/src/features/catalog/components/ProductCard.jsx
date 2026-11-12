import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/Image';
import { Rating } from '@/components/ui/Rating';
import { cn } from '@/lib/cn';
import { productPath } from '@/lib/constants';
import { discountPercent, formatCurrency } from '@/lib/formatCurrency';
import { cardImage as getCardImage, primaryImage, textureImage } from '@/lib/productImage';
import { useCart } from '@/features/cart';
import { useT } from '@/features/i18n';
import { WishlistToggle } from '@/features/wishlist';
import { setActiveTexture, useIsTextureActive } from '../activeTexture';

/**
 * Every packshot sits on the same warm stone ground. Multiply blending turns
 * each photo's own white backdrop into that stone, which is what makes a mixed
 * set of supplier images read as one consistent family. The close-up crops
 * already carry their own small margin, so the frame adds only a little.
 */
const PACKSHOT = 'p-[3%] mix-blend-multiply';

const GRID_SIZES = '(min-width: 1024px) 25vw, 50vw';

// A compact pill beside the price, as on Olaplex's grid, at every width.
const PILL =
  'relative z-10 inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-content px-3.5 sm:h-9 sm:px-4 text-[0.625rem] sm:text-[0.6875rem] font-semibold tracking-[0.12em] uppercase transition-colors hover:bg-content hover:text-content-inverse disabled:pointer-events-none disabled:opacity-40';

/**
 * Catalog tile: packshot on stone, and when the pointer or a finger reaches
 * the tile the formula's texture cross-fades in, so a shopper sees what the
 * cream, gel or oil actually looks like. The texture stays until the shopper
 * moves onto another tile, which then takes it over (see activeTexture.js).
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
  const href = productPath(product.slug);
  const cardImage = getCardImage(product);
  const mainImage = primaryImage(product);
  // The texture shot if there is one, else a second, genuinely different photo.
  const hoverImage =
    textureImage(product) ?? product.images.find((name) => name !== mainImage) ?? null;
  const isTextureShown = useIsTextureActive(product.id) && Boolean(hoverImage);
  const showTexture = () => setActiveTexture(product.id);
  const pointerHandlers = hoverImage
    ? { onMouseEnter: showTexture, onTouchStart: showTexture, onFocus: showTexture }
    : {};

  return (
    <article
      {...pointerHandlers}
      data-part="product-card"
      className={cn(
        'group bg-surface-sunken relative isolate flex h-full flex-col overflow-hidden [-webkit-touch-callout:none]',
        isFlush ? 'p-4 sm:p-6' : 'rounded-card p-4 sm:p-5',
      )}
    >
      {hoverImage && (
        // The texture fills the whole tile behind the name and price, as on
        // Olaplex, easing in with a slow settle from a slight zoom. A soft
        // wash at the foot keeps the copy readable over any texture.
        <span
          aria-hidden="true"
          className={cn(
            'ease-out-soft pointer-events-none absolute inset-0 -z-10 transition-opacity duration-700',
            isTextureShown ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Image
            name={hoverImage}
            alt=""
            sizes={GRID_SIZES}
            fit="cover"
            isTransparent
            className="size-full"
            imgClassName={cn(
              'ease-out-soft transition-transform duration-[1200ms] mix-blend-multiply',
              isTextureShown ? 'scale-100' : 'scale-110',
            )}
          />
          <span className="from-surface-sunken via-surface-sunken/70 absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t to-transparent" />
        </span>
      )}

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

      <Link
        to={href}
        tabIndex={-1}
        aria-hidden="true"
        className={cn(
          'ease-out-soft relative mt-2 block transition-[opacity,transform] duration-700',
          isTextureShown && 'scale-95 opacity-0',
        )}
      >
        <Image
          name={cardImage}
          alt=""
          sizes={GRID_SIZES}
          ratio="aspect-[4/5]"
          fit="contain"
          priority={isPriority}
          isTransparent
          imgClassName={PACKSHOT}
        />
      </Link>

      <div className="mt-5 flex flex-1 flex-col gap-1.5">
        <p
          data-part="product-eyebrow"
          className="text-content-muted line-clamp-1 text-[0.6875rem] tracking-[0.08em] uppercase"
        >
          {product.subtitle}
        </p>
        <h3
          data-part="product-name"
          className="text-[0.8125rem] leading-snug font-semibold tracking-[0.08em] uppercase"
        >
          {/* Stretched link: the whole tile is clickable, with one accessible name. */}
          <Link to={href} className="after:absolute after:inset-0 after:content-['']">
            {product.title}
          </Link>
        </h3>

        {product.reviewCount > 0 && (
          <Rating value={product.rating} reviewCount={product.reviewCount} size="sm" />
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
