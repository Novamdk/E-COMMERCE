import { useSyncExternalStore } from 'react';

/**
 * Which product card is showing its texture shot. Only one at a time: a card
 * keeps its texture after the pointer or finger leaves, and hands it back
 * only when the shopper moves onto another card, so the grid never flickers
 * back and forth.
 */
let activeId = null;
const listeners = new Set();

/** @param {string} id */
export function setActiveTexture(id) {
  if (id === activeId) return;
  activeId = id;
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** @param {string} id @returns {boolean} whether this card shows its texture */
export function useIsTextureActive(id) {
  return useSyncExternalStore(
    subscribe,
    () => activeId === id,
    () => false,
  );
}
