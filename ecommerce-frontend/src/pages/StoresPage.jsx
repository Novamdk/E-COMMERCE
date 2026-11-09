import { useCallback, useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { Skeleton } from '@/components/ui/Skeleton';
import { Container } from '@/components/layout/Container';
import { useAsync } from '@/hooks/useAsync';
import { usePageMeta } from '@/hooks/usePageMeta';
import { cn } from '@/lib/cn';
import { ROUTES, STORE_REGIONS } from '@/lib/constants';
import { getStores } from '@/services/storeService';
import { useT } from '@/features/i18n';
import { centreOn, filterStores, fitView, project, StoreList, StoreMap } from '@/features/stores';

const EYEBROW = 'text-[0.6875rem] font-semibold tracking-[0.2em] uppercase';
const WHOLE_MAP = { k: 1, x: 0, y: 0 };

/** @param {boolean} isActive */
const pill = (isActive) =>
  cn(
    'h-10 shrink-0 rounded-full border px-4 text-xs font-medium tracking-[0.06em] transition-colors',
    isActive
      ? 'border-content bg-content text-content-inverse'
      : 'border-border hover:border-content bg-white',
  );

/**
 * Store finder: the salons, boutiques and spas that carry the range, as a
 * list grouped by region beside a drawn map of Southern California. Region
 * pills and a city or zip search narrow both at once. On phones the list
 * comes first and the map is one tap away.
 */
export default function StoresPage() {
  const { t } = useT();
  usePageMeta({ title: t('stores.title'), description: t('seo.stores'), path: ROUTES.STORES });

  const fetchStores = useCallback(() => getStores(), []);
  const stores = useAsync(fetchStores);

  const [region, setRegion] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState(WHOLE_MAP);
  const [panel, setPanel] = useState('list');

  const all = useMemo(() => stores.data ?? [], [stores.data]);
  const visible = useMemo(() => filterStores(all, { region, query }), [all, region, query]);
  const hasSamples = all.some((store) => store.isSample);

  /** Narrow the list and frame the matching pins. */
  const applyFilters = (next) => {
    const filters = { region, query, ...next };
    if (next.region !== undefined) setRegion(next.region);
    if (next.query !== undefined) setQuery(next.query);
    const matches = filterStores(all, filters);
    const isEverything = filters.region === 'all' && !filters.query.trim();
    setView(
      isEverything || matches.length === 0
        ? WHOLE_MAP
        : fitView(matches.map((store) => project(store.lng, store.lat))),
    );
    if (!matches.some((store) => store.id === selectedId)) setSelectedId(null);
  };

  const selectFromList = (id) => {
    const store = all.find((item) => item.id === id);
    setSelectedId(id);
    if (store) setView(centreOn(project(store.lng, store.lat)));
  };

  return (
    <>
      <Container width="wide" className="pt-8 pb-16 lg:pt-12 lg:pb-24">
        <header className="max-w-2xl">
          <p className={cn(EYEBROW, 'text-gold-600')}>{t('stores.eyebrow')}</p>
          <h1 className="font-display text-display-sm sm:text-display mt-3">{t('stores.title')}</h1>
          <p className="text-content-muted mt-4 leading-relaxed sm:text-lg">{t('stores.intro')}</p>
        </header>

        {hasSamples && (
          <p className="bg-gold-50 text-gold-700 mt-6 px-4 py-2.5 text-xs sm:text-sm">
            {t('stores.sampleNote')}
          </p>
        )}

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label={t('stores.regionsLabel')}
            className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
          >
            <button
              type="button"
              aria-pressed={region === 'all'}
              onClick={() => applyFilters({ region: 'all' })}
              className={pill(region === 'all')}
            >
              {t('stores.allRegions')}
            </button>
            {STORE_REGIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={region === item.id}
                onClick={() => applyFilters({ region: item.id })}
                className={pill(region === item.id)}
              >
                {t(item.label)}
              </button>
            ))}
          </div>

          <label className="border-border focus-within:border-content flex h-11 items-center gap-3 rounded-full border bg-white px-5 lg:w-80">
            <FiSearch aria-hidden="true" className="text-content-muted size-4 shrink-0" />
            <span className="sr-only">{t('stores.searchLabel')}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => applyFilters({ query: event.target.value })}
              placeholder={t('stores.searchPlaceholder')}
              className="placeholder:text-content-muted min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
        </div>

        {/* Phones: list or map */}
        <div
          role="group"
          aria-label={t('stores.viewLabel')}
          className="border-content mt-6 grid grid-cols-2 border lg:hidden"
        >
          {['list', 'map'].map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={panel === item}
              onClick={() => setPanel(item)}
              className={cn(
                'h-11 text-[0.6875rem] font-semibold tracking-[0.16em] uppercase transition-colors',
                panel === item ? 'bg-content text-content-inverse' : 'bg-white',
              )}
            >
              {t(`stores.${item}View`)}
            </button>
          ))}
        </div>

        {stores.loading ? (
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,26rem)_1fr]">
            <div className="space-y-6">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="hidden aspect-[600/560] w-full lg:block" />
          </div>
        ) : stores.error ? (
          <ErrorPanel
            className="mt-8"
            title={t('stores.loadError')}
            error={stores.error}
            onRetry={stores.refetch}
          />
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-12">
            <div
              data-lenis-prevent
              className={cn(
                'lg:block lg:max-h-[calc(100svh-12rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-4',
                panel === 'list' ? 'block' : 'hidden',
              )}
            >
              <p className="text-content-muted mb-6 text-sm" aria-live="polite">
                {t('stores.showing', { count: visible.length, total: all.length })}
              </p>
              {visible.length > 0 ? (
                <StoreList stores={visible} selectedId={selectedId} onSelect={selectFromList} />
              ) : (
                <div className="border-border border-t pt-8">
                  <p className="font-medium">{t('stores.noneTitle')}</p>
                  <p className="text-content-muted mt-2 text-sm">{t('stores.noneBody')}</p>
                  <Button
                    variant="outline"
                    className="mt-5"
                    onClick={() => applyFilters({ region: 'all', query: '' })}
                  >
                    {t('stores.clear')}
                  </Button>
                </div>
              )}
            </div>

            <div className={cn('lg:block', panel === 'map' ? 'block' : 'hidden')}>
              <div className="mx-auto max-w-[44rem] lg:sticky lg:top-28">
                <StoreMap
                  stores={visible}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  view={view}
                  onViewChange={setView}
                />
              </div>
            </div>
          </div>
        )}
      </Container>

      {/* Wholesale enquiries */}
      <section className="bg-surface-sunken">
        <Container width="wide" className="py-16 text-center lg:py-20">
          <p className={cn(EYEBROW, 'text-gold-700')}>{t('stores.partnerEyebrow')}</p>
          <h2 className="font-display text-display-sm sm:text-display mx-auto mt-4 max-w-xl">
            {t('stores.partnerTitle')}
          </h2>
          <p className="text-content-muted mx-auto mt-4 max-w-md">{t('stores.partnerBody')}</p>
          <Button to={ROUTES.CONTACT} size="lg" className="mt-8">
            {t('stores.partnerCta')}
          </Button>
        </Container>
      </section>
    </>
  );
}
