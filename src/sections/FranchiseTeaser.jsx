import { useRef } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { franchise } from '../content';
import { TLink } from '../lib/transition';
import Tilt from '../components/Tilt';

// Home teaser for the three franchise formats.
export default function FranchiseTeaser() {
  const root = useRef(null);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.ft2-head > *', { y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      gsap.from('.ft2-card', { y: 120, opacity: 0, rotateY: (i) => [-14, 0, 14][i], duration: 1.4, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.ft2-grid', start: 'top 85%' } });
    },
    [],
    root,
  );
  return (
    <section className="ft2 section" ref={root} data-theme="dark" aria-labelledby="ft2-title">
      <div className="wrap">
        <header className="ft2-head">
          <p className="eyebrow">{franchise.kicker}</p>
          <h2 className="display-sm" id="ft2-title">
            Choose Your <em>EVIBE.</em>
          </h2>
          <p>{franchise.body}</p>
        </header>
        <div className="ft2-grid">
          {franchise.tiers.map((t, i) => (
            <Tilt as={TLink} to={`/franchise#${t.id}`} className={`ft2-card ft2-card--${t.id} card`} key={t.id} max={7}>
              <span className="ft2-format">{t.format}</span>
              <span className="ft2-level" aria-hidden="true">
                {[0, 1, 2].map((k) => (
                  <i key={k} className={k <= i ? 'on' : ''} />
                ))}
              </span>
              <h3>{t.name}</h3>
              <p className="ft2-tag">{t.tagline}</p>
              <span className="ft2-go">Explore format →</span>
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  );
}
