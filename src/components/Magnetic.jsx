import { useEffect, useRef } from 'react';
import { gsap } from '../lib/scroll';
import { isTouch, prefersReducedMotion } from '../lib/device';

// Child follows the cursor slightly while hovered, then springs back.
// Also exposes --mx / --my so the CTA can light up where the cursor is.
export default function Magnetic({ children, strength = 0.3, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isTouch() || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * strength);
      yTo((e.clientY - r.top - r.height / 2) * strength);
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength]);
  return (
    <span ref={ref} className={`magnetic ${className}`}>
      {children}
    </span>
  );
}
