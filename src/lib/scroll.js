import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, isTouch } from './device';

gsap.registerPlugin(ScrollTrigger);
// Phones: the address bar showing/hiding must not re-measure every pinned film.
ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });

let lenis = null;

export function startSmoothScroll() {
  // Phones/tablets (iOS Safari especially) keep their own native momentum
  // scrolling: a JS smooth-scroller there fights the browser and makes the
  // pinned 3D films shake.
  if (lenis || prefersReducedMotion() || isTouch()) return null;
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

// Without Lenis (touch devices) lock scrolling with overflow instead.
export const stopScroll = () => (lenis ? lenis.stop() : document.documentElement.classList.add('scroll-lock'));
export const resumeScroll = () => (lenis ? lenis.start() : document.documentElement.classList.remove('scroll-lock'));

export { gsap, ScrollTrigger };
