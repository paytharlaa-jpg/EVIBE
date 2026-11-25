import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './device';

gsap.registerPlugin(ScrollTrigger);
// Phones: the address bar showing/hiding must not re-measure every pinned film.
ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });

let lenis = null;

export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return null;
  // Butter: a low lerp glides every wheel step; wheel distance slightly reduced so
  // the scroll-driven films do not race. Touch keeps native momentum (no hijack).
  lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.8, smoothWheel: true, syncTouch: false, touchMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  // Keep lag smoothing: a long main-thread stall (3D shader compile) must not
  // fast-forward the intro animations to their end.
  gsap.ticker.lagSmoothing(500, 50);
  return lenis;
}

export const getLenis = () => lenis;

export const stopScroll = () => lenis?.stop();
export const resumeScroll = () => lenis?.start();

export { gsap, ScrollTrigger };
