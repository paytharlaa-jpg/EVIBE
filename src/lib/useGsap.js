import { useLayoutEffect } from 'react';
import { gsap } from './scroll';

// Scoped GSAP effect with automatic cleanup (reverts tweens, kills ScrollTriggers).
export function useGsap(fn, deps = [], scope) {
  useLayoutEffect(() => {
    const ctx = gsap.context(fn, scope?.current ?? undefined);
    return () => ctx.revert();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
