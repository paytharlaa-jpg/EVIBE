import { useRef } from 'react';
import { gsap, getLenis } from '../lib/scroll';
import { TLink } from '../lib/transition';
import MotionToggle from '../components/MotionToggle';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { company, nav, services, waLink } from '../content';

export default function Footer() {
  const root = useRef(null);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      // Curtain reveal (desktop): the footer is pinned underneath (CSS sticky)
      // and the page lifts off it. As it opens: the shade lifts, the columns
      // rise in, and the wordmark charges up from the bottom.
      const st = { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: true };
      const tl = gsap.timeline({ scrollTrigger: st, defaults: { ease: 'none' } });
      tl.fromTo('.ft-shade', { opacity: 1 }, { opacity: 0, duration: 0.6 }, 0)
        .fromTo('.ft-top > *', { y: 70, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.5 }, 0.1)
        .fromTo('.ft-mark', { clipPath: 'inset(100% 0 0 0)', y: 50 }, { clipPath: 'inset(0% 0 0 0)', y: 0, duration: 0.6 }, 0.35)
        .fromTo('.ft-charge span', { scaleX: 0 }, { scaleX: 1, duration: 0.65 }, 0.3)
        .fromTo('.ft-bottom', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.7);
    },
    [],
    root,
  );
  return (
    <footer className="footer" data-theme="dark" ref={root}>
      <div className="ft-shade" aria-hidden="true" />
      <div className="ft-inner wrap">
        <div className="ft-top">
          <div className="ft-brand">
            <img src="/brand/EVIBE_Primary_with_Tagline_Reverse.svg" alt="EVIBE, Elevating the Electric Experience" width="260" height="78" loading="lazy" />
            <p>EV charging points for homes, businesses, fleets and public hubs.</p>
          </div>
          <nav className="ft-col" aria-label="Footer">
            <h3>Explore</h3>
            {nav.map((n) => (
              <TLink key={n.path} to={n.path} className="u-link">
                {n.label}
              </TLink>
            ))}
          </nav>
          <div className="ft-col">
            <h3>Services</h3>
            {services.map((s) => (
              <TLink key={s.id} to="/services" className="u-link">
                {s.title}
              </TLink>
            ))}
          </div>
          <div className="ft-col">
            <h3>Contact</h3>
            <a href={company.phoneHref} className="u-link">
              {company.phone}
            </a>
            <a href={waLink()} target="_blank" rel="noopener" className="u-link">
              WhatsApp
            </a>
            <a href={`mailto:${company.email}`} className="u-link">
              {company.email}
            </a>
          </div>
        </div>
        <div className="ft-charge" aria-hidden="true">
          <span />
        </div>
        <div className="ft-mark" aria-hidden="true">
          <img src="/brand/EVIBE_Wordmark_Reverse.svg" alt="" width="1200" height="300" loading="lazy" />
        </div>
        <div className="ft-bottom">
          <span>
            © {new Date().getFullYear()} {company.legal}
          </span>
          <MotionToggle />
          <a
            href="#top"
            className="u-link"
            onClick={(e) => {
              e.preventDefault();
              const l = getLenis();
              l ? l.scrollTo(0, { duration: 1.8 }) : window.scrollTo(0, 0);
            }}
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
