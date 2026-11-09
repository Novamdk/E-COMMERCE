import { useState } from 'react';
import { FiCheck, FiShoppingBag, FiTruck } from 'react-icons/fi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Rating } from '@/components/ui/Rating';
import { FREE_SHIPPING_THRESHOLD, LOW_STOCK_THRESHOLD } from '@/lib/constants';
import { discountPercent, formatCurrency } from '@/lib/formatCurrency';
import { useCart } from '@/features/cart';
import { WishlistToggle } from '@/features/wishlist';
import { VariantPicker } from './VariantPicker';

/**
 * Everything on the right-hand side of the product page: price, variants,
 * quantity, stock state and the add-to-cart action.
 *
 * @param {{ product: object }} props
 */
export function ProductPurchasePanel({ product }) {
  const { addItem } = useCart();
  const { sizes, colors } = product.variants;

  const [size, setSize] = useState(sizes[0] ?? null);
  const [color, setColor] = useState(colors[0] ?? null);
  const [qty, setQty] = useState(1);
  const [errors, setErrors] = useState({});

  const saving = discountPercent(product.price, product.compareAtPrice);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= LOW_STOCK_THRESHOLD;
  const qualifiesForFreeShipping = product.price * qty >= FREE_SHIPPING_THRESHOLD;

  const handleAddToCart = () => {
    const nextErrors = {};
    if (sizes.length > 0 && !size) nextErrors.size = 'Choose a size.';
    if (colors.length > 0 && !color) nextErrors.color = 'Choose a colour.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    addItem(product, { size, color, qty });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {product.isBestSeller && <Badge variant="brand">Best seller</Badge>}
          {saving > 0 && <Badge variant="sale">Save {saving}%</Badge>}
        </div>

        <h1 className="font-display text-display-sm sm:text-display">{product.title}</h1>
        <p className="text-content-muted">{product.subtitle}</p>
        <Rating value={product.rating} reviewCount={product.reviewCount} size="md" />
      </div>

      <div className="flex items-baseline gap-3">
        <span className="font-display text-4xl tracking-tight">
          {formatCurrency(product.price)}
        </span>
        {product.compareAtPrice && (
          <span className="text-content-subtle text-lg line-through">
            {formatCurrency(product.compareAtPrice)}
          </span>
        )}
      </div>

      {product.excerpt && <p className="text-content-muted leading-relaxed">{product.excerpt}</p>}

      {(sizes.length > 0 || colors.length > 0) && (
        <div className="border-border flex flex-col gap-5 border-t pt-6">
          <VariantPicker
            name="size"
            label="Size"
            options={sizes}
            value={size}
            onChange={(next) => {
              setSize(next);
              setErrors((prev) => ({ ...prev, size: null }));
            }}
            error={errors.size}
          />
          <VariantPicker
            name="color"
            label="Colour"
            options={colors}
            value={color}
            onChange={(next) => {
              setColor(next);
              setErrors((prev) => ({ ...prev, color: null }));
            }}
            error={errors.color}
          />
        </div>
      )}

      <div className="border-border flex flex-col gap-4 border-t pt-6">
        <p aria-live="polite" className="flex items-center gap-2 text-sm">
          {isOutOfStock ? (
            <span className="text-content-muted">Currently out of stock</span>
          ) : (
            <>
              <FiCheck aria-hidden="true" className="text-success-600 size-4" />
              <span className={isLowStock ? 'text-accent-600' : 'text-success-600'}>
                {isLowStock ? `Only ${product.stock} left in stock` : 'In stock, ships today'}
              </span>
            </>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <QuantityStepper
            value={qty}
            onChange={setQty}
            max={Math.max(1, product.stock)}
            label={product.title}
          />
          <Button size="lg" className="flex-1" disabled={isOutOfStock} onClick={handleAddToCart}>
            <FiShoppingBag aria-hidden="true" className="size-4" />
            {isOutOfStock ? 'Out of stock' : 'Add to cart'}
          </Button>
          <WishlistToggle product={product} size="md" hasSurface={false} />
        </div>

        <p className="text-content-subtle flex items-center gap-2 text-xs">
          <FiTruck aria-hidden="true" className="size-4 shrink-0" />
          {qualifiesForFreeShipping
            ? 'This order qualifies for free shipping.'
            : `Free shipping on orders over ${formatCurrency(FREE_SHIPPING_THRESHOLD, { compact: true })}.`}
        </p>
      </div>
    </div>
  );
}
