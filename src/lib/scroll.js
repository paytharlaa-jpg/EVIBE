import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, isTouch } from './device';

gsap.registerPlugin(ScrollTrigger);
// Phones: the address bar showing/hiding must not re-measure every pinned film.
ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });

let lenis = null;

let norm = null;

export function startSmoothScroll() {
  if (lenis || norm || prefersReducedMotion()) return null;
  // Keep lag smoothing: a long main-thread stall (3D shader compile) must not
  // fast-forward the intro animations to their end.
  gsap.ticker.lagSmoothing(500, 50);
  if (isTouch()) {
    // Phones/tablets keep the browser's own (compositor-thread) scrolling:
    // JS-driven scrolling lags as soon as the 3D keeps the main thread busy.
    return null;
  }
  // Butter: a low lerp glides every wheel step; wheel distance slightly reduced so
  // the scroll-driven films do not race. Touch keeps native momentum (no hijack).
  lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.8, smoothWheel: true, syncTouch: false, touchMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  return lenis;
}

export const getLenis = () => lenis;

// Touch devices (no Lenis): pause scroll normalisation and lock with overflow.
export const stopScroll = () => {
  if (lenis) return lenis.stop();
  norm?.disable();
  document.documentElement.classList.add('scroll-lock');
};
export const resumeScroll = () => {
  if (lenis) return lenis.start();
  document.documentElement.classList.remove('scroll-lock');
  norm?.enable();
};

export { gsap, ScrollTrigger };
