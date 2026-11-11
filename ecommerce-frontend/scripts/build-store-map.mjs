/**
 * Draws the Southern California outline used by the store finder map and
 * writes it to src/data/socal-map.json (land, served counties, county lines,
 * plus the Mercator scale and offset used to place pins).
 *
 * One-off: rerun only to change the map's extent or which counties are
 * highlighted. Its dependencies are not part of the app:
 *   npm i --no-save us-atlas@3 d3-geo@3 topojson-client@3
 *   node scripts/build-store-map.mjs src/data/socal-map.json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { geoMercator, geoPath } from 'd3-geo';
import { merge, mesh } from 'topojson-client';
const topo = JSON.parse(
  readFileSync(new URL(import.meta.resolve('us-atlas/counties-10m.json')), 'utf8'),
);
const W = 600,
  H = 560;
const keep = new Set([
  '06037',
  '06059',
  '06073',
  '06065',
  '06071',
  '06111',
  '06083',
  '06029',
  '06025',
]);
const served = new Set(['06037', '06059', '06073']);
const geoms = topo.objects.counties.geometries.filter((g) => keep.has(g.id));
const bbox = {
  type: 'Feature',
  geometry: {
    type: 'MultiPoint',
    coordinates: [
      [-118.95, 34.42],
      [-116.75, 32.55],
    ],
  },
};
const projection = geoMercator().fitExtent(
  [
    [24, 24],
    [W - 24, H - 24],
  ],
  bbox,
);
projection.clipExtent([
  [0, 0],
  [W, H],
]);
const path = geoPath(projection).digits(1);
const land = path(merge(topo, geoms));
const servedLand = path(
  merge(
    topo,
    geoms.filter((g) => served.has(g.id)),
  ),
);
const borders = path(
  mesh(topo, { type: 'GeometryCollection', geometries: geoms }, (a, b) => a !== b),
);
const [tx, ty] = projection.translate();
const out = {
  width: W,
  height: H,
  scale: +projection.scale().toFixed(3),
  translate: [+tx.toFixed(3), +ty.toFixed(3)],
  land,
  servedLand,
  borders,
};
writeFileSync(process.argv[2], JSON.stringify(out));
console.log(out.scale, out.translate, land.length + servedLand.length + borders.length);
