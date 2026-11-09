import { useEffect, useMemo, useRef, useState } from 'react';
import { FiMinus, FiNavigation, FiPlus, FiMaximize2 } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { useT } from '@/features/i18n';
import {
  MAP_ART,
  MAP_HEIGHT,
  MAP_WIDTH,
  clusterPins,
  directionsUrl,
  fitView,
  project,
  zoomBy,
} from '../storeUtils';

/** Region names drawn on the land, placed by longitude and latitude. */
const PLACE_LABELS = [
  { id: 'la', lng: -118.35, lat: 34.36 },
  { id: 'oc', lng: -117.5, lat: 33.86 },
  { id: 'sd', lng: -116.95, lat: 32.68 },
];
/** On-screen distance, in CSS pixels, below which pins merge into one. */
const CLUSTER_PX = 34;
const OCEAN_LABEL = project(-118.45, 33.2);

const MOTION = 'transition-transform duration-700 ease-out-soft motion-reduce:transition-none';
/** Pins and labels glide with the map, in step with its zoom. */
const GLIDE = 'transition-[left,top] duration-700 ease-out-soft motion-reduce:transition-none';

/**
 * A drawn map of Southern California, styled to the brand rather than a
 * street map: cream land, blush on the counties we serve, gold pins. Nearby
 * pins merge into a numbered circle that zooms in when tapped. Directions go
 * out to Google Maps from each store, so the page needs no map provider.
 *
 * @param {object} props
 * @param {import('@/services/storeService').Store[]} props.stores stores to pin
 * @param {string|null} props.selectedId
 * @param {(id: string) => void} props.onSelect
 * @param {{k: number, x: number, y: number}} props.view
 * @param {(view: {k: number, x: number, y: number}) => void} props.onViewChange
 */
export function StoreMap({ stores, selectedId, onSelect, view, onViewChange, className }) {
  const { t } = useT();

  const pins = useMemo(
    () => stores.map((store) => ({ id: store.id, store, point: project(store.lng, store.lat) })),
    [stores],
  );
  // Pins merge when closer than this on screen, whatever size the map is drawn at.
  const frameRef = useRef(null);
  const [frameWidth, setFrameWidth] = useState(MAP_WIDTH);
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => setFrameWidth(entry.contentRect.width));
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);
  const clusterRadius = CLUSTER_PX * (MAP_WIDTH / Math.max(frameWidth, 1));
  const clusters = useMemo(
    () => clusterPins(pins, view.k, clusterRadius),
    [pins, view.k, clusterRadius],
  );
  const selected = pins.find((pin) => pin.id === selectedId) ?? null;

  // Stores on the same block stay grouped even fully zoomed in; tapping such
  // a group lists them instead of zooming.
  // The list closes by itself once the map moves or a store is chosen.
  const [openState, setOpenState] = useState(null);
  const openClusterId =
    openState && openState.view === view && openState.selectedId === selectedId
      ? openState.id
      : null;
  const openCluster = clusters.find((cluster) => cluster.id === openClusterId) ?? null;
  const openGroup = (cluster) => {
    const next = fitView(cluster.items.map((item) => item.point));
    if (next.k > view.k * 1.05) onViewChange(next);
    else setOpenState({ id: cluster.id, view, selectedId });
  };

  /** Map units to on-screen position, as a share of the frame. */
  const toScreen = ([x, y]) => [view.x + x * view.k, view.y + y * view.k];
  const percent = ([x, y]) => ({
    left: `${(x / MAP_WIDTH) * 100}%`,
    top: `${(y / MAP_HEIGHT) * 100}%`,
  });

  return (
    <div
      ref={frameRef}
      className={cn('bg-surface-sunken relative [aspect-ratio:600/560] overflow-hidden', className)}
    >
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label={t('stores.mapLabel', { count: stores.length })}
        className="absolute inset-0 block size-full"
      >
        <g
          className={MOTION}
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}
        >
          <path d={MAP_ART.land} fill="oklch(0.985 0.006 80)" />
          <path d={MAP_ART.servedLand} fill="oklch(0.955 0.022 18)" />
          <path
            d={MAP_ART.borders}
            fill="none"
            stroke="oklch(0.8 0.03 30)"
            strokeWidth={0.8 / view.k}
            strokeDasharray={`${3 / view.k} ${3 / view.k}`}
          />
          <path
            d={MAP_ART.land}
            fill="none"
            stroke="var(--color-gold-500)"
            strokeOpacity="0.55"
            strokeWidth={1 / view.k}
          />
        </g>

        {/* Labels and pins stay the same size at every zoom. */}
        <text
          className={MOTION}
          style={{
            transform: `translate(${toScreen(OCEAN_LABEL)[0]}px, ${toScreen(OCEAN_LABEL)[1]}px)`,
          }}
          textAnchor="middle"
          fill="oklch(0.62 0.03 60)"
          fontSize="13"
          fontStyle="italic"
          letterSpacing="0.08em"
        >
          {t('stores.ocean')}
        </text>
        {view.k < 1.8 &&
          PLACE_LABELS.map((place) => {
            const [x, y] = toScreen(project(place.lng, place.lat));
            return (
              <text
                key={place.id}
                className={MOTION}
                style={{ transform: `translate(${x}px, ${y}px)`, textTransform: 'uppercase' }}
                textAnchor="middle"
                fill="oklch(0.45 0.05 20)"
                fontSize="10.5"
                fontWeight="600"
                letterSpacing="0.2em"
              >
                {t(`stores.regions.${place.id}`)}
              </text>
            );
          })}
      </svg>

      {/* Pins are buttons, so they can be reached with a keyboard. */}
      <ul className="absolute inset-0">
        {clusters.map((cluster) => {
          const position = percent(toScreen(cluster.point));
          if (cluster.items.length > 1) {
            return (
              <li key={cluster.id} className={cn('absolute', GLIDE)} style={position}>
                <button
                  type="button"
                  onClick={() => openGroup(cluster)}
                  aria-expanded={cluster.id === openClusterId}
                  aria-label={t('stores.zoomCluster', { count: cluster.items.length })}
                  className="bg-holiday-700 text-content-inverse ring-gold-300 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-xs font-semibold shadow-md ring-2 transition-transform hover:scale-110 sm:size-9"
                >
                  {cluster.items.length}
                </button>
              </li>
            );
          }
          const pin = cluster.items[0];
          const isSelected = pin.id === selectedId;
          return (
            <li key={cluster.id} className={cn('absolute', GLIDE)} style={position}>
              <button
                type="button"
                onClick={() => onSelect(pin.id)}
                aria-label={pin.store.name}
                aria-pressed={isSelected}
                className={cn(
                  'block -translate-x-1/2 -translate-y-full transition-transform hover:scale-110',
                  isSelected && 'z-10 scale-125',
                )}
              >
                <svg viewBox="0 0 24 32" className="w-5 drop-shadow-md sm:w-6" aria-hidden="true">
                  <path
                    d="M12 31C12 31 22 19.5 22 12A10 10 0 0 0 2 12C2 19.5 12 31 12 31Z"
                    fill={isSelected ? 'var(--color-holiday-700)' : 'var(--color-gold-500)'}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <circle cx="12" cy="12" r="3.5" fill="white" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Stores too close to separate, listed above their group. */}
      {openCluster && (
        <div
          className="pointer-events-none absolute z-20"
          style={percent(toScreen(openCluster.point))}
        >
          <ul className="bg-surface-raised shadow-lifted pointer-events-auto absolute bottom-7 left-1/2 max-h-64 w-60 -translate-x-1/2 overflow-y-auto py-2 text-left">
            {openCluster.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className="hover:bg-surface-sunken block w-full px-4 py-2 text-left"
                >
                  <span className="block text-sm leading-snug font-medium">{item.store.name}</span>
                  <span className="text-content-muted block text-xs">{item.store.address}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* The chosen store, pinned above its marker. */}
      {selected && (
        <div
          className={cn('pointer-events-none absolute z-20', GLIDE)}
          style={percent(toScreen(selected.point))}
        >
          <div className="bg-surface-raised shadow-lifted pointer-events-auto absolute bottom-10 left-1/2 w-56 -translate-x-1/2 p-4 text-left">
            <p className="text-sm leading-snug font-semibold">{selected.store.name}</p>
            <p className="text-content-muted mt-1 text-xs">
              {selected.store.address}, {selected.store.city}
            </p>
            <a
              href={directionsUrl(selected.store)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-[0.12em] uppercase underline underline-offset-4"
            >
              <FiNavigation aria-hidden="true" className="size-3.5" />
              {t('stores.directions')}
            </a>
          </div>
        </div>
      )}

      <div className="absolute top-3 right-3 z-20 flex flex-col overflow-hidden rounded-full bg-white shadow-md">
        <MapButton label={t('stores.zoomIn')} onClick={() => onViewChange(zoomBy(view, 1.6))}>
          <FiPlus />
        </MapButton>
        <MapButton label={t('stores.zoomOut')} onClick={() => onViewChange(zoomBy(view, 1 / 1.6))}>
          <FiMinus />
        </MapButton>
        <MapButton label={t('stores.showAll')} onClick={() => onViewChange({ k: 1, x: 0, y: 0 })}>
          <FiMaximize2 />
        </MapButton>
      </div>
    </div>
  );
}

function MapButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="hover:bg-ink-100 grid size-9 place-items-center [&>svg]:size-4"
    >
      {children}
    </button>
  );
}
