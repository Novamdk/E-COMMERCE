import { useCallback, useEffect, useRef, useState } from 'react';
import { readStorage, writeStorage } from '@/lib/storage';

/**
 * State mirrored into localStorage, and kept in sync across browser tabs.
 *
 * @template T
 * @param {string} key
 * @param {T} initialValue
 * @returns {[T, (value: T | ((prev: T) => T)) => void]}
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue));

  // Skip the write on the very first render: it would just rewrite what we
  // only just read, and would clobber storage if the initial read failed.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return;
    }
    writeStorage(key, value);
  }, [key, value]);

  useEffect(() => {
    /** @param {StorageEvent} event */
    const handleStorage = (event) => {
      if (event.key !== key) return;
      setValue(readStorage(key, initialValue));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
    // initialValue is intentionally not a dependency: it is a default, and
    // callers routinely pass a fresh literal on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback((next) => {
    setValue((prev) => (typeof next === 'function' ? next(prev) : next));
  }, []);

  return [value, set];
}
