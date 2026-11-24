import { useRef } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { impact } from '../content';
import SplitText from '../components/SplitText';

export default function Impact() {
  const root = useRef(null);
  useGsap(
    () => {
      const reduced = prefersReducedMotion();
      gsap.utils.toArray('.im-num').forEach((el) => {
        const end = Number(el.dataset.value);
        const o = { v: reduced ? end : 0 };
        el.textContent = String(Math.round(o.v));
        if (reduced) return;
        gsap.to(o, {
          v: end,
          duration: 2,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
          onUpdate: () => {
            el.textContent = String(Math.round(o.v));
          },
        });
      });
      if (reduced) return;
      gsap.from('.im-title .ch', { yPercent: 100, opacity: 0, stagger: 0.012, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.im-title', start: 'top 80%' } });
      gsap.from('.im-stat', { y: 60, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.im-stats', start: 'top 85%' } });
      gsap.fromTo('.im-curve path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'bottom 60%', scrub: true } });
    },
    [],
    root,
  );
  return (
    <section id="impact" className="impact section" data-theme="light" ref={root} aria-labelledby="impact-title">
      <svg className="im-curve" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 260 C 200 250, 300 220, 420 190 S 640 120, 760 110 S 980 60, 1200 30" pathLength="1" />
      </svg>
      <div className="wrap im-grid">
        <div>
          <p className="eyebrow">{impact.kicker}</p>
          <SplitText as="h2" text={impact.title} className="im-title display-sm" />
          <div className="im-stats">
            {impact.stats.map((s) => (
              <div className="im-stat" key={s.label}>
                <p className="im-value">
                  <span className="im-num" data-value={s.value}>
                    {s.value}
                  </span>
                  <span className="im-suffix">{s.suffix}</span>
                </p>
                <p className="im-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
