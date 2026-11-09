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
 * @param {{ images?: string[] }} product
 * @returns {string|undefined} the manifest name of the primary image
 */
export function primaryImage(product) {
  return product?.images?.[0];
}
