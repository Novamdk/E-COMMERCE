/**
 * A cart line is identified by product + chosen variant, because the same
 * product can legitimately sit in the cart twice in different sizes. The id
 * is derived on demand rather than stored, so cart state stays minimal.
 */

/**
 * @param {{productId: string, size?: string|null, color?: string|null}} item
 * @returns {string} stable React key / lookup id for the line
 */
export function getLineId(item) {
  return [item.productId, item.size || '-', item.color || '-'].join('::');
}

/**
 * Joins stored cart items to the catalog, producing priced lines for the
 * totals math. Items whose product no longer exists are dropped rather than
 * rendered as broken rows.
 *
 * @param {{productId: string, size?: string|null, color?: string|null, qty: number}[]} items
 * @param {{id: string}[]} products
 * @returns {{id:string, product:object, qty:number, size:string|null, color:string|null}[]}
 */
export function toPricedLines(items, products) {
  if (!products?.length) return [];
  const byId = new Map(products.map((p) => [p.id, p]));

  return items
    .map((item) => {
      const product = byId.get(item.productId);
      if (!product) return null;
      return {
        id: getLineId(item),
        product,
        qty: item.qty,
        size: item.size ?? null,
        color: item.color ?? null,
      };
    })
    .filter(Boolean);
}
