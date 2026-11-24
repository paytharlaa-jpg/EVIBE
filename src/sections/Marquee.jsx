import { useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { marquee } from '../content';

// Two counter-running bands; scroll speed pushes them faster and skews them.
export default function Marquee() {
  const root = useRef(null);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      const rows = gsap.utils.toArray('.mq-track');
      const tweens = rows.map((row, i) =>
        gsap.fromTo(row, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 38, ease: 'none', repeat: -1 }),
      );
      const skewTo = gsap.quickTo('.mq-row', 'skewX', { duration: 0.5, ease: 'power3.out' });
      const settle = gsap.delayedCall(0.15, () => skewTo(0)).pause();
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (s) => {
          const v = s.getVelocity();
          const boost = 1 + Math.min(Math.abs(v) / 400, 6);
          const dir = v < 0 ? -1 : 1;
          tweens.forEach((t) =>
            gsap.to(t, {
              timeScale: boost * dir,
              duration: 0.3,
              overwrite: true,
              onComplete: () => gsap.to(t, { timeScale: dir, duration: 1.2, ease: 'power2.out' }),
            }),
          );
          skewTo(gsap.utils.clamp(-8, 8, v / -300));
          settle.restart(true);
        },
      });
      gsap.to(root.current, { rotate: -2, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } });
    },
    [],
    root,
  );

  const items = [...marquee, ...marquee];
  return (
    <div className="marquee" ref={root} aria-label={marquee.join(', ')} role="region">
      {[0, 1].map((r) => (
        <div className={`mq-row mq-row--${r}`} key={r} aria-hidden="true">
          <div className="mq-track">
            {items.map((m, i) => (
              <span className="mq-item" key={i}>
                {m}
                <svg viewBox="0 0 24 24" width="22" height="22" className="mq-bolt">
                  <path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor" />
                </svg>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
