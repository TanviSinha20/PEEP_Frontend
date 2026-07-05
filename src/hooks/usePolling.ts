'use client';

import { useEffect, useRef } from 'react';

/**
 * Generic polling hook.
 * Calls `fn` every `intervalMs` while `active` is true.
 * Clears the interval when `active` becomes false or component unmounts.
 */
export function usePolling(
  fn: () => void,
  intervalMs: number,
  active: boolean
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!active) return;

    const id = setInterval(() => {
      fnRef.current();
    }, intervalMs);

    return () => clearInterval(id);
  }, [active, intervalMs]);
}
