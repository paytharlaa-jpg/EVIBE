import { useRef } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { values } from '../content';
import SplitText from '../components/SplitText';

// "Why EVIBE": four qualities on a light stage (no invented numbers).
export default function Impact() {
  const root = useRef(null);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.im-title .ch', { yPercent: 100, opacity: 0, stagger: 0.012, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.im-title', start: 'top 80%' } });
      gsap.from('.im-stat', { y: 60, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.im-stats', start: 'top 85%' } });
      gsap.fromTo('.im-curve path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'bottom 60%', scrub: 0.9 } });
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
          <p className="eyebrow">{values.kicker}</p>
          <SplitText as="h2" text={values.title} className="im-title display-sm" />
          <div className="im-stats">
            {values.items.map((s, i) => (
              <div className="im-stat" key={s.k}>
                <p className="im-idx">0{i + 1}</p>
                <p className="im-word">{s.k}</p>
                <p className="im-label">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
