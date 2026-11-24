import { useRef } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { company, waLink } from '../content';
import Magnetic from '../components/Magnetic';
import { TLink } from '../lib/transition';

// Closing call to action: giant kinetic line, an energy bar that charges as you
// arrive, and the three ways to reach EVIBE.
export default function CtaBand({ title = ['Running low?', 'Let’s plug you in.'] }) {
  const root = useRef(null);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo('.cb-line .line-in', { yPercent: 115 }, { yPercent: 0, duration: 1.4, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 70%' } });
      gsap.fromTo('.cb-meter span', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'top 20%', scrub: true } });
      gsap.fromTo('.cb-bg', { xPercent: 0 }, { xPercent: -25, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from('.cb-actions > *', { y: 40, opacity: 0, stagger: 0.08, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cb-actions', start: 'top 90%' } });
    },
    [],
    root,
  );
  return (
    <section className="cb section" ref={root} data-theme="dark" aria-labelledby="cb-title">
      <div className="cb-bg" aria-hidden="true">
        EVIBE · CHARGE · EVIBE · CHARGE · EVIBE ·
      </div>
      <div className="wrap">
        <h2 className="cb-title" id="cb-title" aria-label={title.join(' ')}>
          {title.map((l, i) => (
            <span className={`line cb-line ${i === title.length - 1 ? 'cb-line--accent' : ''}`} key={l} aria-hidden="true">
              <span className="line-in">{l}</span>
            </span>
          ))}
        </h2>
        <div className="cb-meter" aria-hidden="true">
          <span />
        </div>
        <div className="cb-actions">
          <Magnetic>
            <a className="btn btn--primary" href={waLink('Hi EVIBE, I would like a quote for EV charging.')} target="_blank" rel="noopener">
              <span className="btn-label">WhatsApp us</span>
            </a>
          </Magnetic>
          <a className="btn btn--ghost" href={company.phoneHref}>
            <span className="btn-label">Call {company.phone}</span>
          </a>
          <TLink className="btn btn--ghost" to="/contact">
            <span className="btn-label">Send an enquiry</span>
          </TLink>
        </div>
      </div>
    </section>
  );
}
