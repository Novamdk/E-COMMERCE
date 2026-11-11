import map from '@/data/socal-map.json';

/** The map artwork's own coordinate space (drawn by scripts/build-store-map.mjs). */
export const MAP_WIDTH = map.width;
export const MAP_HEIGHT = map.height;

/** Largest zoom a region or cluster may fly to. */
const MAX_ZOOM = 16;
/** Breathing room around a fitted group of pins, in on-screen map units. */
const FIT_PADDING = 48;

/**
 * Web Mercator, matching the projection the coastline was drawn with, so a
 * store's latitude and longitude land on the right spot of the artwork.
 *
 * @param {number} lng
 * @param {number} lat
 * @returns {[number, number]} x, y in map units
 */
export function project(lng, lat) {
  const lambda = (lng * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const x = lambda * map.scale + map.translate[0];
  const y = -Math.log(Math.tan(Math.PI / 4 + phi / 2)) * map.scale + map.translate[1];
  return [x, y];
}

/** @param {import('@/services/storeService').Store} store */
export function fullAddress(store) {
  return `${store.address}, ${store.city}, ${store.state} ${store.zip}`;
}

/** Google Maps directions to a store, which opens the app on phones. */
export function directionsUrl(store) {
  const query = encodeURIComponent(`${store.name}, ${fullAddress(store)}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/** @param {string} phone */
export function telHref(phone) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/**
 * Stores in a region (or all) whose name, city or zip matches the query.
 *
 * @param {import('@/services/storeService').Store[]} stores
 * @param {{region: string, query: string}} filters region 'all' for every region
 */
export function filterStores(stores, { region, query }) {
  const needle = query.trim().toLowerCase();
  return stores.filter((store) => {
    if (region !== 'all' && store.region !== region) return false;
    if (!needle) return true;
    return [store.name, store.city, store.zip].some((field) =>
      field.toLowerCase().includes(needle),
    );
  });
}

/**
 * The pan and zoom that frames a set of points, never zooming out past the
 * whole map nor in past MAX_ZOOM.
 *
 * @param {[number, number][]} points in map units
 * @returns {{k: number, x: number, y: number}} transform: translate(x, y) scale(k)
 */
export function fitView(points) {
  if (points.length === 0) return { k: 1, x: 0, y: 0 };
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  // Padding stays the same on screen at any zoom, so it comes off the frame.
  const spanX = Math.max(maxX - minX, 1e-6);
  const spanY = Math.max(maxY - minY, 1e-6);
  const k = Math.max(
    1,
    Math.min(
      MAX_ZOOM,
      (MAP_WIDTH - 2 * FIT_PADDING) / spanX,
      (MAP_HEIGHT - 2 * FIT_PADDING) / spanY,
    ),
  );
  const centreX = (minX + maxX) / 2;
  const centreY = (minY + maxY) / 2;
  return clampView({ k, x: MAP_WIDTH / 2 - centreX * k, y: MAP_HEIGHT / 2 - centreY * k });
}

/** Keeps the artwork covering the frame, so panning never shows an edge. */
export function clampView({ k, x, y }) {
  return {
    k,
    x: Math.min(0, Math.max(MAP_WIDTH - MAP_WIDTH * k, x)),
    y: Math.min(0, Math.max(MAP_HEIGHT - MAP_HEIGHT * k, y)),
  };
}

/**
 * Zooms by a factor about the centre of the frame.
 * @param {{k: number, x: number, y: number}} view
 * @param {number} factor
 */
export function zoomBy(view, factor) {
  const k = Math.max(1, Math.min(MAX_ZOOM, view.k * factor));
  const ratio = k / view.k;
  const cx = MAP_WIDTH / 2;
  const cy = MAP_HEIGHT / 2;
  return clampView({ k, x: cx - (cx - view.x) * ratio, y: cy - (cy - view.y) * ratio });
}

/**
 * Groups pins that would overlap on screen at the current zoom, so a dense
 * area shows one numbered circle instead of a pile of pins.
 *
 * @template {{id: string, point: [number, number]}} T
 * @param {T[]} items
 * @param {number} k current zoom
 * @param {number} radius on-screen distance, in map units at zoom 1
 * @returns {{id: string, point: [number, number], items: T[]}[]}
 */
export function clusterPins(items, k, radius = 22) {
  /** @type {{id: string, point: [number, number], items: T[]}[]} */
  const clusters = [];
  for (const item of items) {
    const near = clusters.find(
      (cluster) =>
        Math.hypot(cluster.point[0] - item.point[0], cluster.point[1] - item.point[1]) * k < radius,
    );
    if (near) {
      near.items.push(item);
      const count = near.items.length;
      near.point = [
        near.point[0] + (item.point[0] - near.point[0]) / count,
        near.point[1] + (item.point[1] - near.point[1]) / count,
      ];
    } else {
      clusters.push({ id: item.id, point: [...item.point], items: [item] });
    }
  }
  return clusters;
}

export const MAP_ART = { land: map.land, servedLand: map.servedLand, borders: map.borders };

/**
 * Centres one point at a given zoom, for when a store is picked from the list.
 * @param {[number, number]} point
 * @param {number} [k]
 */
export function centreOn([px, py], k = 3) {
  return clampView({ k, x: MAP_WIDTH / 2 - px * k, y: MAP_HEIGHT / 2 - py * k });
}
