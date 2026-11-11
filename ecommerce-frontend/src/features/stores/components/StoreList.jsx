import { useEffect, useRef } from 'react';
import { FiNavigation, FiPhone } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { STORE_REGIONS } from '@/lib/constants';
import { useT } from '@/features/i18n';
import { directionsUrl, telHref } from '../storeUtils';

/**
 * Stockists grouped under their region. Choosing a store selects its pin on
 * the map; choosing a pin scrolls its entry into view here.
 *
 * @param {object} props
 * @param {import('@/services/storeService').Store[]} props.stores
 * @param {string|null} props.selectedId
 * @param {(id: string) => void} props.onSelect
 */
export function StoreList({ stores, selectedId, onSelect, className }) {
  const { t } = useT();
  const itemRefs = useRef(new Map());

  useEffect(() => {
    if (!selectedId) return;
    itemRefs.current.get(selectedId)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedId]);

  const groups = STORE_REGIONS.map((region) => ({
    ...region,
    stores: stores.filter((store) => store.region === region.id),
  })).filter((group) => group.stores.length > 0);

  return (
    <div className={cn('space-y-10', className)}>
      {groups.map((group) => (
        <section key={group.id} aria-labelledby={`region-${group.id}`}>
          <h2
            id={`region-${group.id}`}
            className="border-content flex items-baseline justify-between border-b pb-3 text-[0.6875rem] font-semibold tracking-[0.18em] uppercase"
          >
            {t(group.label)}
            <span className="text-content-muted font-normal tracking-normal normal-case">
              {group.stores.length}
            </span>
          </h2>
          <ul className="divide-border divide-y">
            {group.stores.map((store) => {
              const isSelected = store.id === selectedId;
              return (
                <li
                  key={store.id}
                  ref={(node) => {
                    if (node) itemRefs.current.set(store.id, node);
                    else itemRefs.current.delete(store.id);
                  }}
                  className={cn(
                    'relative py-5 pl-4 transition-colors',
                    isSelected && 'bg-surface-sunken',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute top-5 bottom-5 left-0 w-0.5 transition-colors',
                      isSelected ? 'bg-holiday-700' : 'bg-transparent',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => onSelect(store.id)}
                    aria-pressed={isSelected}
                    className="block w-full text-left"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-base font-medium">{store.name}</span>
                      <span className="text-gold-700 shrink-0 pt-1 text-[0.625rem] font-semibold tracking-[0.14em] uppercase">
                        {t(`stores.types.${store.type}`)}
                      </span>
                    </span>
                    <span className="text-content-muted mt-1 block text-sm leading-relaxed">
                      {store.address}
                      <br />
                      {store.city}, {store.state} {store.zip}
                    </span>
                  </button>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.6875rem] font-semibold tracking-[0.12em] uppercase">
                    <a
                      href={directionsUrl(store)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 underline underline-offset-4"
                    >
                      <FiNavigation aria-hidden="true" className="size-3.5" />
                      {t('stores.directions')}
                    </a>
                    {store.phone && (
                      <a
                        href={telHref(store.phone)}
                        className="text-content-muted hover:text-content inline-flex items-center gap-1.5"
                      >
                        <FiPhone aria-hidden="true" className="size-3.5" />
                        {store.phone}
                      </a>
                    )}
                    {store.website && (
                      <a
                        href={store.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-content-muted hover:text-content"
                      >
                        {t('stores.website')}
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
