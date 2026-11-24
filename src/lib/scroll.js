import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './device';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return null;
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true, touchMultiplier: 1.4 });
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
