import { FiShoppingBag } from 'react-icons/fi';
import { useT } from '@/features/i18n';
import { useCart } from '../useCart';

/**
 * Header cart trigger. The count is mirrored into an aria-live region so a
 * screen-reader user hears the cart change after adding from any surface.
 */
export function CartBadge() {
  const { itemCount, openDrawer } = useCart();
  const { t } = useT();

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        aria-label={itemCount > 0 ? t('cart.open', { count: itemCount }) : t('cart.openEmpty')}
        className="text-content hover:bg-ink-100 relative grid size-10 place-items-center rounded-full transition-colors"
      >
        <FiShoppingBag aria-hidden="true" className="size-[1.1875rem]" />
        {itemCount > 0 && (
          <span
            aria-hidden="true"
            className="bg-accent-600 text-content-inverse absolute -top-0.5 -right-0.5 grid size-[1.125rem] place-items-center rounded-full text-[0.625rem] font-bold tabular-nums"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      <span role="status" aria-live="polite" className="sr-only">
        {itemCount === 0 ? t('cart.statusEmpty') : t('cart.status', { count: itemCount })}
      </span>
    </>
  );
}
