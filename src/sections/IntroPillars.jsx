import { useRef } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { intro, pillars } from '../content';
import { TLink } from '../lib/transition';
import Magnetic from '../components/Magnetic';
import Tilt from '../components/Tilt';

// "Not Just Chargers. An Entire EV Charging Ecosystem." + the four pillars.
export default function IntroPillars() {
  const root = useRef(null);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.ip-title .line-in', { yPercent: 110, duration: 1.3, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      gsap.from('.ip-copy > p, .ip-ctas', { y: 40, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 65%' } });
      gsap.from('.ip-card', { y: 110, rotateX: -25, opacity: 0, transformOrigin: '50% 100%', duration: 1.3, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.ip-grid', start: 'top 85%' } });
      gsap.fromTo('.ip-tagline', { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', ease: 'none', scrollTrigger: { trigger: '.ip-tagline', start: 'top 90%', end: 'top 50%', scrub: 0.9 } });
    },
    [],
    root,
  );
  return (
    <section className="ip section" ref={root} data-theme="dark" aria-labelledby="ip-title">
      <div className="wrap">
        <div className="ip-copy">
          <p className="eyebrow">{intro.kicker}</p>
          <h2 className="ip-title display" id="ip-title" aria-label={intro.title.join(' ')}>
            {intro.title.map((l, i) => (
              <span className={`line ${i ? 'ip-accent' : ''}`} key={l} aria-hidden="true">
                <span className="line-in">{l}</span>
              </span>
            ))}
          </h2>
          <p className="ip-body">{intro.body}</p>
          <div className="ip-ctas">
            <Magnetic>
              <TLink className="btn btn--primary" to="/services">
                <span className="btn-label">Explore Solutions</span>
              </TLink>
            </Magnetic>
            <TLink className="btn btn--ghost" to="/partner">
              <span className="btn-label">Partner With Us</span>
            </TLink>
          </div>
        </div>
        <p className="ip-tagline" aria-label={intro.tagline}>
          {intro.tagline}
        </p>
        <div className="ip-grid">
          {pillars.map((p) => (
            <Tilt className="ip-card card" key={p.no} max={6}>
              <span className="ip-no">
                {p.no} · {p.tag}
              </span>
              <h3>{p.name}</h3>
              <p>{p.body}</p>
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  );
}
