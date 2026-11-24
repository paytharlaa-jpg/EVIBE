import { useEffect, useRef } from 'react';
import { gsap } from '../lib/scroll';
import { isTouch, prefersReducedMotion } from '../lib/device';

// 3D tilt toward the cursor with a moving light spot (--mx / --my).
export default function Tilt({ children, className = '', max = 8, as: Tag = 'div', ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isTouch() || prefersReducedMotion()) return;
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    gsap.set(el, { transformPerspective: 900 });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * max * 2);
      rx(-(py - 0.5) * max * 2);
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [max]);
  return (
    <Tag ref={ref} className={`tilt ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
