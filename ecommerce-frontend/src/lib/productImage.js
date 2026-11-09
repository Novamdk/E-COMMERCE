import imageMeta from '@/data/images.json';

const PLACEHOLDER = {
  src: '',
  srcSet: '',
  width: 800,
  height: 800,
  aspect: 1,
  alt: '',
};

/**
 * Resolves a manifest image name into everything an <img> needs: a src, a
 * full srcSet across the encoded AVIF widths, and intrinsic width/height so
 * the browser reserves the right box before the bytes land.
 *
 * Swapping to a CDN means changing the two template strings here and nothing else.
 *
 * @param {string|undefined} name manifest key, e.g. "argan-shampoo-0"
 * @param {{ width?: number }} [options] preferred rendered width in CSS px
 * @returns {{src:string, srcSet:string, width:number, height:number, aspect:number}}
 */
export function getImage(name, options = {}) {
  const meta = name ? imageMeta[name] : null;
  if (!meta) return PLACEHOLDER;

  const widths = meta.widths ?? [meta.width];
  const target = options.width
    ? (widths.find((w) => w >= options.width) ?? widths[widths.length - 1])
    : widths[widths.length - 1];

  return {
    src: `/img/${name}-${target}.avif`,
    srcSet: widths.map((w) => `/img/${name}-${w}.avif ${w}w`).join(', '),
    width: target,
    height: Math.round(target / (meta.aspect || 1)),
    aspect: meta.aspect || 1,
  };
}

/**
 * Cleanest packshot per product: the product itself on a plain, light
 * backdrop with little or no printed text. The source site leads several
 * galleries with busy marketing collages; using these on cards, in the bag
 * and at checkout is what keeps every surface looking like one set.
 * Products not listed fall back to their first gallery image.
 */
const PACKSHOTS = {
  'hair-care-package': 'hair-care-package-3',
  'retinal-eye-lift': 'retinal-eye-lift-5',
  'dark-spot-collagen-cream': 'dark-spot-collagen-cream-6',
  'collagen-anti-aging-cream': 'collagen-anti-aging-cream-1',
  'hair-regrowth-serum': 'hair-regrowth-serum-3',
  'lash-growth-serum': 'lash-growth-serum-4',
};

/**
 * @param {{ slug?: string, images?: string[] }} product
 * @returns {string|undefined} the manifest name of the primary image
 */
export function primaryImage(product) {
  return PACKSHOTS[product?.slug] ?? product?.images?.[0];
}
