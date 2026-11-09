import { useEffect } from 'react';
import { useLenis } from 'lenis/react';

/**
 * Freezes page scrolling behind an overlay. Pauses Lenis as well, otherwise
 * smooth scrolling keeps running underneath the drawer, and compensates for
 * the vanishing scrollbar so the layout does not jump sideways.
 *
 * @param {boolean} active
 */
export function useScrollLock(active) {
  const lenis = useLenis();

  useEffect(() => {
    if (!active) return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    lenis?.stop();
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      lenis?.start();
    };
  }, [active, lenis]);
}
