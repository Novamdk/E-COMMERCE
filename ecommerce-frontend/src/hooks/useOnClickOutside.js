import { useEffect, useRef } from 'react';

/**
 * Calls the handler on a pointer press that starts outside the ref'd element.
 * Listens on pointerdown rather than click so a press that begins inside and
 * drags out does not count as an outside click.
 *
 * @param {import('react').RefObject<HTMLElement>} ref
 * @param {(event: Event) => void} handler
 * @param {boolean} [enabled]
 */
export function useOnClickOutside(ref, handler, enabled = true) {
  // Keeps the effect from resubscribing whenever the caller passes a new closure.
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return undefined;

    const onPointerDown = (event) => {
      const el = ref.current;
      if (!el || el.contains(event.target)) return;
      handlerRef.current(event);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [ref, enabled]);
}
