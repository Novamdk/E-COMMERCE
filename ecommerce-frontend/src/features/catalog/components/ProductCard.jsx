import { Link } from 'react-router-dom';
import { FiShoppingBag, FiSliders } from 'react-icons/fi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';
import { Rating } from '@/components/ui/Rating';
import { cn } from '@/lib/cn';
import { LOW_STOCK_THRESHOLD, productPath } from '@/lib/constants';
import { discountPercent, formatCurrency } from '@/lib/formatCurrency';
import { useCart } from '@/features/cart';
import { WishlistToggle } from '@/features/wishlist';

const GRID_SIZES = '(min-width: 1280px) 20rem, (min-width: 768px) 33vw, 50vw';

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

  return (
    <article className="group relative flex flex-col">
      <div className="rounded-card bg-surface-sunken relative overflow-hidden">
        <Link to={href} tabIndex={-1} aria-hidden="true" className="block">
          <Image
            name={product.images[0]}
            alt=""
            sizes={GRID_SIZES}
            ratio="aspect-[4/5]"
            priority={isPriority}
            imgClassName="transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
          />
        </Link>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="flex flex-wrap gap-1.5">
            {product.isBestSeller && <Badge variant="inverse">Best seller</Badge>}
            {saving > 0 && <Badge variant="sale">-{saving}%</Badge>}
            {isOutOfStock && <Badge variant="neutral">Sold out</Badge>}
          </span>
          <span className="pointer-events-auto">
            <WishlistToggle product={product} />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 pt-4">
        <Rating value={product.rating} reviewCount={product.reviewCount} />

        <h3 className="text-[0.9375rem] leading-snug font-medium">
          {/* Stretched link: the whole tile is clickable, with one accessible name. */}
          <Link to={href} className="after:absolute after:inset-0 after:content-['']">
            {product.title}
          </Link>
        </h3>

        <p className="text-content-subtle line-clamp-1 text-sm">{product.subtitle}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <p className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-content-subtle text-sm line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </p>

          {isLowStock && (
            <span className="text-accent-600 text-xs font-medium">{product.stock} left</span>
          )}
        </div>

        <div className={cn('relative z-10 pt-1', isOutOfStock && 'opacity-60')}>
          {hasVariants ? (
            <Button to={href} variant="secondary" size="sm" isFullWidth>
              <FiSliders aria-hidden="true" className="size-4" />
              Choose options
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              isFullWidth
              disabled={isOutOfStock}
              onClick={() => addItem(product, { qty: 1 })}
              aria-label={`Add ${product.title} to cart`}
            >
              <FiShoppingBag aria-hidden="true" className="size-4" />
              {isOutOfStock ? 'Sold out' : 'Add to cart'}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
