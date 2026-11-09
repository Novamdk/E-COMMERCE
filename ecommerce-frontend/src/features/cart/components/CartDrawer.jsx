import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiTrash2, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Image } from '@/components/ui/Image';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Skeleton } from '@/components/ui/Skeleton';
import { GIFT_WITH_PURCHASE, productPath, ROUTES } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatCurrency';
import { primaryImage } from '@/lib/productImage';
import { useT } from '@/features/i18n';
import { useCart } from '../useCart';
import { useCartLines } from '../useCartLines';

const TITLE_ID = 'cart-drawer-title';
const PACKSHOT = 'p-[10%] mix-blend-multiply';

/** Placeholder rows while the catalog resolves behind stored cart ids. */
function LineSkeletons({ count }) {
  return (
    <div className="space-y-6 px-5 py-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-5">
          <Skeleton className="aspect-square w-32" />
          <div className="flex-1 space-y-3 pt-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * One product row: a large packshot on stone, then the name, price and a
 * quantity pill, with remove at the far right. Gift rows show "Free" and no
 * quantity; removing one takes the gift code off.
 */
function DrawerLine({ product, price, qty, onQty, onRemove, removeLabel, onNavigate }) {
  return (
    <li className="flex gap-5 py-5">
      <Link
        to={productPath(product.slug)}
        onClick={onNavigate}
        tabIndex={-1}
        aria-hidden="true"
        className="bg-surface-sunken w-32 shrink-0"
      >
        <Image
          name={primaryImage(product)}
          alt=""
          sizes="8rem"
          ratio="aspect-square"
          fit="contain"
          isTransparent
          imgClassName={PACKSHOT}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[0.8125rem] leading-snug font-medium tracking-[0.1em] uppercase">
            <Link to={productPath(product.slug)} onClick={onNavigate} className="hover:underline">
              {product.title}
            </Link>
          </h3>
          <button
            type="button"
            onClick={onRemove}
            aria-label={removeLabel}
            className="text-content-muted hover:text-content -mt-1 -mr-1 grid size-8 shrink-0 place-items-center transition-colors"
          >
            <FiTrash2 aria-hidden="true" className="size-[1.0625rem]" />
          </button>
        </div>
        <p className="text-[0.9375rem] tabular-nums">{price}</p>
        {onQty && (
          <div className="w-32">
            <QuantityStepper
              value={qty}
              onChange={onQty}
              max={Math.max(1, product.stock)}
              size="sm"
              label={product.title}
            />
          </div>
        )}
      </div>
    </li>
  );
}

/** Discount code pill with Apply inside it, then the applied code as a chip. */
function DiscountCode({ promo }) {
  const { applyPromo, removePromo } = useCart();
  const { t } = useT();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!code.trim()) return;
    const result = applyPromo(code);
    setFeedback(result.ok ? null : result.message);
    if (result.ok) setCode('');
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="border-content focus-within:ring-content/20 flex h-12 items-center rounded-full border bg-white pr-5 pl-5 focus-within:ring-2"
      >
        <label htmlFor="drawer-discount" className="sr-only">
          {t('cart.discountPlaceholder')}
        </label>
        <input
          id="drawer-discount"
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            setFeedback(null);
          }}
          placeholder={t('cart.discountPlaceholder')}
          autoComplete="off"
          aria-describedby="drawer-discount-feedback"
          className="placeholder:text-content-muted min-w-0 flex-1 bg-transparent text-sm uppercase outline-none placeholder:normal-case"
        />
        <button
          type="submit"
          disabled={!code.trim()}
          className="text-sm underline underline-offset-4 disabled:opacity-50"
        >
          {t('cart.apply')}
        </button>
      </form>
      <p
        id="drawer-discount-feedback"
        aria-live="polite"
        className="text-danger-600 min-h-0 px-5 pt-1 text-xs empty:hidden"
      >
        {feedback}
      </p>
      {promo && (
        <span className="border-border mt-2.5 inline-flex items-center gap-1.5 rounded-full border bg-white py-1 pr-1.5 pl-3 text-xs font-medium tracking-[0.06em]">
          {promo.code}
          <button
            type="button"
            onClick={removePromo}
            aria-label={t('cart.removeCode', { code: promo.code })}
            className="hover:bg-ink-100 grid size-5 place-items-center rounded-full"
          >
            <FiX aria-hidden="true" className="size-3.5" />
          </button>
        </span>
      )}
    </div>
  );
}

/** Progress toward the gift with purchase, and what to do once it is reached. */
function GiftProgress({ subtotal, totals }) {
  const { t } = useT();
  const percent = Math.min(100, Math.round((subtotal / GIFT_WITH_PURCHASE.THRESHOLD) * 100));
  const code = GIFT_WITH_PURCHASE.CODE;

  let message;
  if (totals.isGiftUnlocked) message = t('cart.giftAdded');
  else if (totals.giftRemaining > 0)
    message = t('cart.giftAway', { amount: formatCurrency(totals.giftRemaining) });
  else message = t('cart.giftUnlocked');

  return (
    <div className="bg-surface-sunken px-5 py-5">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={t('cart.giftProgress')}
        className="bg-ink-200 h-1.5 overflow-hidden rounded-full"
      >
        <div
          className="bg-content ease-out-soft h-full rounded-full transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-relaxed">
        {message}
        {!totals.isGiftUnlocked && (
          <>
            <br />
            {t('cart.useCode', { code })}
          </>
        )}
      </p>
    </div>
  );
}

/**
 * Slide-over cart, mounted once in the layout and opened from anywhere via
 * cart context. Laid out like Olaplex's: gift progress at the top, large
 * product rows, and a footer with the discount code and one checkout button
 * that carries the amount.
 */
export function CartDrawer() {
  const { isDrawerOpen, closeDrawer, itemCount, setQty, removeItem, removePromo } = useCart();
  const { lines, gifts, totals, loading, error } = useCartLines();
  const { t } = useT();
  const hasLines = !loading && !error && lines.length > 0;

  return (
    <Drawer
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      title={t('cart.title')}
      titleId={TITLE_ID}
      heading={
        <p className="text-sm font-medium tracking-[0.14em] uppercase">
          {t('cart.title')}
          {itemCount > 0 && <span className="text-content-muted"> ({itemCount})</span>}
        </p>
      }
      headerClassName="border-holiday-600/60"
      panelClassName="h-full w-full max-w-[30rem]"
      footer={
        hasLines && (
          <div className="space-y-4">
            <DiscountCode promo={totals.promo} />
            <Button to={ROUTES.CHECKOUT} size="lg" isFullWidth onClick={closeDrawer}>
              {t('cart.checkout')}
              <span aria-hidden="true" className="mx-2.5">
                •
              </span>
              <span className="tabular-nums">
                {formatCurrency(totals.subtotal - totals.discount)}
              </span>
            </Button>
            <div className="text-content-muted flex items-center justify-between gap-4 text-xs">
              <span>{t('cart.shippingNote')}</span>
              <Link
                to={ROUTES.CART}
                onClick={closeDrawer}
                className="shrink-0 underline underline-offset-4"
              >
                {t('cart.viewCart')}
              </Link>
            </div>
          </div>
        )
      }
    >
      {hasLines && <GiftProgress subtotal={totals.subtotal} totals={totals} />}

      {loading && itemCount > 0 && <LineSkeletons count={Math.min(itemCount, 3)} />}

      {error && !loading && (
        <div className="p-5">
          <p
            role="alert"
            className="rounded-field bg-danger-50 text-danger-600 px-3.5 py-3 text-sm"
          >
            {t('cart.loadError')}
          </p>
        </div>
      )}

      {!loading && !error && lines.length === 0 && (
        <div className="p-5">
          <EmptyState
            icon={FiShoppingBag}
            title={t('cart.empty')}
            body={t('cart.emptyBody')}
            action={
              <Button to={ROUTES.SHOP} onClick={closeDrawer}>
                {t('nav.shopAll')}
              </Button>
            }
            className="border-0 bg-transparent px-0 py-4"
          />
        </div>
      )}

      {hasLines && (
        <ul className="px-5">
          {lines.map((line) => (
            <DrawerLine
              key={line.id}
              product={line.product}
              price={formatCurrency(line.product.price * line.qty)}
              qty={line.qty}
              onQty={(next) => setQty(line.id, next)}
              onRemove={() => removeItem(line.id)}
              removeLabel={t('cart.remove', { title: line.product.title })}
              onNavigate={closeDrawer}
            />
          ))}
          {gifts.map((product) => (
            <DrawerLine
              key={`gift-${product.id}`}
              product={product}
              price={t('cart.free')}
              onRemove={removePromo}
              removeLabel={t('cart.removeGift', { title: product.title })}
              onNavigate={closeDrawer}
            />
          ))}
        </ul>
      )}
    </Drawer>
  );
}
