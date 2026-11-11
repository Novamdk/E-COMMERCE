import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiChevronDown, FiMapPin, FiTruck } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Rating } from '@/components/ui/Rating';
import {
  FREE_SHIPPING_THRESHOLD,
  LOW_STOCK_THRESHOLD,
  ROUTES,
  SHOW_STORE_FINDER,
} from '@/lib/constants';
import { discountPercent, formatCurrency } from '@/lib/formatCurrency';
import { useCart } from '@/features/cart';
import { useT } from '@/features/i18n';
import { WishlistToggle } from '@/features/wishlist';
import { ProductBreadcrumbs } from './ProductBreadcrumbs';
import { VariantPicker } from './VariantPicker';

/** The first sentence of a description, for the one-line summary. */
const firstSentence = (text) => text.split(/(?<=[.!?])\s/)[0] ?? '';

/**
 * Everything to buy on one screen, Olaplex-style: breadcrumb, name, reviews,
 * price, a one-line description, quantity and Add to cart, then the key
 * benefits and folding sections for how to use and the full details.
 *
 * @param {{ product: object }} props
 */
export function ProductPurchasePanel({ product }) {
  const { t } = useT();
  const { addItem } = useCart();
  const { sizes, colors } = product.variants;

  const [size, setSize] = useState(sizes[0] ?? null);
  const [color, setColor] = useState(colors[0] ?? null);
  const [qty, setQty] = useState(1);
  const [errors, setErrors] = useState({});

  const saving = discountPercent(product.price, product.compareAtPrice);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= LOW_STOCK_THRESHOLD;
  const description = product.description.split('\n\n').filter(Boolean);

  const handleAddToCart = () => {
    const nextErrors = {};
    if (sizes.length > 0 && !size) nextErrors.size = t('product.chooseSize');
    if (colors.length > 0 && !color) nextErrors.color = t('product.chooseColour');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    addItem(product, { size, color, qty });
  };

  return (
    <div className="flex flex-col gap-5">
      <ProductBreadcrumbs product={product} />

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold tracking-[0.06em] uppercase sm:text-2xl">
            {product.title}
          </h1>
          <WishlistToggle product={product} size="md" hasSurface={false} />
        </div>
        <Rating value={product.rating} reviewCount={product.reviewCount} size="md" />
      </div>

      <p className="flex items-baseline gap-2">
        <span className="text-xl font-semibold">{formatCurrency(product.price)}</span>
        {product.compareAtPrice && (
          <span className="text-content-subtle text-sm">
            {t('product.value', { price: formatCurrency(product.compareAtPrice) })}
          </span>
        )}
        {saving > 0 && (
          <span className="bg-holiday-600 text-content-inverse ml-1 rounded-full px-2.5 py-0.5 text-[0.625rem] font-semibold tracking-[0.08em] uppercase">
            {t('product.savings', { percent: saving })}
          </span>
        )}
      </p>

      {description[0] && (
        <p className="text-content-muted max-w-lg text-sm leading-relaxed">
          {firstSentence(description[0])}
        </p>
      )}

      {(sizes.length > 0 || colors.length > 0) && (
        <div className="flex flex-col gap-5">
          <VariantPicker
            name="size"
            label={t('product.size')}
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
            label={t('product.colour')}
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

      <div className="flex items-center gap-3">
        <QuantityStepper
          value={qty}
          onChange={setQty}
          max={Math.max(1, product.stock)}
          label={product.title}
        />
        <Button size="lg" className="flex-1" disabled={isOutOfStock} onClick={handleAddToCart}>
          {isOutOfStock ? t('product.soldOut') : t('product.addToCart')}
        </Button>
      </div>

      <div className="text-content-muted space-y-1.5 text-xs">
        <p className="flex items-center gap-2">
          <FiTruck aria-hidden="true" className="size-4 shrink-0" />
          {t('announcements.freeShipping', {
            amount: formatCurrency(FREE_SHIPPING_THRESHOLD, { compact: true }),
          })}
        </p>
        {SHOW_STORE_FINDER && (
          <p className="flex items-center gap-2">
            <FiMapPin aria-hidden="true" className="size-4 shrink-0" />
            <span>
              {t('product.inStores')}{' '}
              <Link to={ROUTES.STORES} className="text-content underline underline-offset-2">
                {t('stores.find')}
              </Link>
            </span>
          </p>
        )}
        {isLowStock && (
          <p aria-live="polite" className="text-holiday-600 font-semibold">
            {t('product.onlyLeft', { count: product.stock })}
          </p>
        )}
      </div>

      {product.benefits?.length > 0 && (
        <section aria-labelledby="benefits-heading" className="pt-2">
          <h2
            id="benefits-heading"
            className="text-[0.6875rem] font-bold tracking-[0.14em] uppercase"
          >
            {t('product.keyBenefits')}
          </h2>
          <ul className="mt-3 space-y-1.5">
            {product.benefits.map((benefit) => (
              <li
                key={benefit}
                className="bg-surface-sunken flex items-center gap-3 px-4 py-2.5 text-sm"
              >
                <FiCheck aria-hidden="true" className="size-4 shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="border-border border-t">
        {product.howToUse?.length > 0 && (
          <Fold title={t('product.howToUse')} isOpen>
            <ol className="space-y-2">
              {product.howToUse.map((step, index) => (
                <li key={step}>
                  <span className="font-semibold">{t('product.step', { index: index + 1 })} </span>
                  {step}
                </li>
              ))}
            </ol>
          </Fold>
        )}
        {description.length > 0 && (
          <Fold title={t('product.details')}>
            <div className="space-y-3">
              {description.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </Fold>
        )}
      </div>
    </div>
  );
}

/** A folding section: native <details>, so it works without script and with find-in-page. */
function Fold({ title, isOpen = false, children }) {
  return (
    <details open={isOpen} className="group border-border border-b">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[0.6875rem] font-bold tracking-[0.14em] uppercase [&::-webkit-details-marker]:hidden">
        {title}
        <FiChevronDown
          aria-hidden="true"
          className="size-4 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="text-content-muted pb-5 text-sm leading-relaxed">{children}</div>
    </details>
  );
}
