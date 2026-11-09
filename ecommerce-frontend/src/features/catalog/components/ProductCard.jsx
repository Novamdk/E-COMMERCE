import { Link } from 'react-router-dom';
import { FiShoppingBag, FiSliders } from 'react-icons/fi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';
import { Rating } from '@/components/ui/Rating';
import { cn } from '@/lib/cn';
import { LOW_STOCK_THRESHOLD, productPath } from '@/lib/constants';
import { discountPercent, formatCurrency } from '@/lib/formatCurrency';
import { primaryImage } from '@/lib/productImage';
import { useCart } from '@/features/cart';
import { WishlistToggle } from '@/features/wishlist';

/**
 * Every packshot sits inset on the same warm stone ground. Multiply blending
 * turns each photo's own white backdrop into that stone, which is what makes
 * a mixed set of supplier images read as one consistent family.
 */
const PACKSHOT = 'p-[9%] mix-blend-multiply transition-transform duration-700 ease-out-soft';

const GRID_SIZES = '(min-width: 1280px) 22rem, (min-width: 768px) 33vw, 50vw';

/**
 * Catalog tile. Products with a size or colour axis send the shopper to the
 * detail page to choose, rather than guessing a variant on their behalf.
 *
 * @param {object} props
 * @param {object} props.product
 * @param {boolean} [props.isPriority] eager-load the image (first row only)
 */
export function ProductCard({ product, isPriority = false }) {
  const { addItem } = useCart();

  const saving = discountPercent(product.price, product.compareAtPrice);
  const hasVariants = product.variants.sizes.length > 0 || product.variants.colors.length > 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= LOW_STOCK_THRESHOLD;
  const href = productPath(product.slug);
  const cardImage = primaryImage(product);
  // A second shot swaps in on hover, as long as it is genuinely different.
  const hoverImage = product.images.find((name) => name !== cardImage) ?? null;

  return (
    <article className="group relative flex h-full flex-col">
      <div className="rounded-card bg-surface-sunken relative overflow-hidden">
        <Link to={href} tabIndex={-1} aria-hidden="true" className="block">
          <Image
            name={cardImage}
            alt=""
            sizes={GRID_SIZES}
            ratio="aspect-square"
            fit="contain"
            priority={isPriority}
            imgClassName={cn(PACKSHOT, 'group-hover:scale-[1.03]')}
          />
          {hoverImage && (
            // Wrapped, because Image's own box is `relative` and cannot also be absolute.
            <span className="ease-out-soft absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <Image
                name={hoverImage}
                alt=""
                sizes={GRID_SIZES}
                ratio="aspect-square"
                fit="contain"
                imgClassName={PACKSHOT}
              />
            </span>
          )}
        </Link>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="flex flex-wrap gap-1.5">
            {product.isBestSeller && <Badge variant="light">Bestseller</Badge>}
            {saving > 0 && <Badge variant="sale">Save {saving}%</Badge>}
            {isOutOfStock && <Badge variant="neutral">Sold out</Badge>}
          </span>
          <span className="pointer-events-auto">
            <WishlistToggle product={product} />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center gap-1.5 pt-5 text-center">
        <h3 className="text-[0.8125rem] leading-snug font-semibold tracking-[0.08em] uppercase">
          {/* Stretched link: the whole tile is clickable, with one accessible name. */}
          <Link to={href} className="after:absolute after:inset-0 after:content-['']">
            {product.title}
          </Link>
        </h3>

        <p className="text-content-muted line-clamp-1 text-sm">{product.subtitle}</p>

        <Rating value={product.rating} reviewCount={product.reviewCount} size="sm" />

        <p className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-[0.9375rem] font-semibold">{formatCurrency(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-content-subtle text-sm line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </p>

        {isLowStock && (
          <span className="text-accent-600 text-xs font-medium">Only {product.stock} left</span>
        )}

        <div className={cn('relative z-10 w-full pt-3', isOutOfStock && 'opacity-60')}>
          {hasVariants ? (
            <Button to={href} variant="outline" size="sm" isFullWidth>
              <FiSliders aria-hidden="true" className="size-3.5" />
              Choose options
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              isFullWidth
              disabled={isOutOfStock}
              onClick={() => addItem(product, { qty: 1 })}
              aria-label={`Add ${product.title} to cart`}
            >
              <FiShoppingBag aria-hidden="true" className="size-3.5" />
              {isOutOfStock ? 'Sold out' : 'Add to bag'}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
