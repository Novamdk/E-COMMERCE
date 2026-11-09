import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';

/**
 * Resets scroll to the top when the path changes.
 *
 * Done through Lenis rather than window.scrollTo because Lenis owns the scroll
 * position while it is running — a raw scrollTo gets animated back by the next
 * frame. Query-string-only changes (filters, pagination) deliberately do not
 * reset, so adjusting a filter does not yank the page.
 */
export function useScrollToTopOnNavigate() {
  const { pathname } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, lenis]);
}
