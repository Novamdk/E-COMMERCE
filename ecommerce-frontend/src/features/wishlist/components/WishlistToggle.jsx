import { FiHeart } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { useWishlist } from '../useWishlist';

const SIZES = {
  sm: 'size-9',
  md: 'size-11',
};

/**
 * Saves or unsaves a product. Available from the card and the detail page, and
 * both read the same context, so the state is always consistent.
 *
 * @param {object} props
 * @param {object} props.product
 * @param {'sm'|'md'} [props.size]
 * @param {boolean} [props.hasSurface] draws a solid chip behind the icon
 */
export function WishlistToggle({ product, size = 'sm', hasSurface = true }) {
  const { isWishlisted, toggle } = useWishlist();
  const isSaved = isWishlisted(product.id);

  return (
    <button
      type="button"
      onClick={() => toggle(product.id)}
      aria-pressed={isSaved}
      aria-label={
        isSaved ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`
      }
      className={cn(
        'grid place-items-center rounded-full transition-colors duration-200',
        SIZES[size] ?? SIZES.sm,
        hasSurface && 'bg-surface-raised/90 shadow-raised hover:bg-surface-raised backdrop-blur-sm',
        isSaved ? 'text-accent-600' : 'text-content-muted hover:text-content',
      )}
    >
      <FiHeart aria-hidden="true" className={cn('size-[1.125rem]', isSaved && 'fill-accent-600')} />
    </button>
  );
}
