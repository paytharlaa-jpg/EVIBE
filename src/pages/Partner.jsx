import { useRef, useState } from 'react';
import { gsap, getLenis } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { partner, services } from '../content';
import PageShell from '../components/PageShell';
import PageHero from '../components/PageHero';
import Tilt from '../components/Tilt';
import Magnetic from '../components/Magnetic';
import Contact from '../sections/Contact';
import ProcessGraphic from '../sections/ProcessGraphic';
import { TLink } from '../lib/transition';

const goEnquiry = () => {
  const el = document.getElementById('enquiry');
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 40;
  const l = getLenis();
  l ? l.scrollTo(y, { duration: 1.4 }) : window.scrollTo(0, y);
};

const ICON = {
  land: <path d="M12 21s-6-5.6-6-10.2A6 6 0 0 1 18 10.8C18 15.4 12 21 12 21Zm0-8.3a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM3 21h18" />,
  host: <path d="M3 21V9l9-6 9 6v12M9 21v-6h6v6M3 21h18" />,
  biz: <path d="M8 12h8M12 8v8M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0Z" />,
};

function Types({ onPick }) {
  const root = useRef(null);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.pt-card', { y: 100, rotateX: -20, opacity: 0, transformOrigin: '50% 100%', stagger: 0.12, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 80%' } });
    },
    [],
    root,
  );
  return (
    <section className="ptn section" ref={root} data-theme="dark" aria-label="Ways to partner">
      <div className="wrap ptn-grid">
        {partner.types.map((t, i) => (
          <Tilt className="pt-card card" key={t.id} max={6}>
            <span className="pt-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {ICON[t.id]}
              </svg>
            </span>
            <span className="pt-no">0{i + 1}</span>
            <h2>{t.title}</h2>
            <p>{t.body}</p>
            <button type="button" className="u-link pt-cta" onClick={() => onPick(t.type)}>
              {t.cta} →
            </button>
          </Tilt>
        ))}
      </div>
    </section>
  );
}

function Landowner({ onPick }) {
  const root = useRef(null);
  const L = partner.landowner;
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.lo-copy > *', { y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 70%' } });
      gsap.from('.lo-check', { x: 40, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.lo-checks', start: 'top 85%' } });
      gsap.fromTo('.lo-check i', { scaleX: 0 }, { scaleX: 1, stagger: 0.1, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: '.lo-checks', start: 'top 85%' } });
      gsap.fromTo('.lo-radar span', { scale: 0.15, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 3.2, stagger: 1.05, repeat: -1, ease: 'power1.out' });
    },
    [],
    root,
  );
  return (
    <section className="lo section" ref={root} data-theme="deep" aria-labelledby="lo-title">
      <div className="wrap lo-grid">
        <div className="lo-copy">
          <p className="eyebrow">{L.kicker}</p>
          <h2 className="display-sm" id="lo-title">
            {L.title}
          </h2>
          <p className="lo-body">{L.body}</p>
          <div className="lo-radar" aria-hidden="true">
            <span />
            <span />
            <span />
            <svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {ICON.land}
            </svg>
          </div>
        </div>
        <div className="lo-side">
          <p className="lo-side-title">{L.assessTitle}</p>
          <ol className="lo-checks">
            {L.assess.map((a, i) => (
              <li className="lo-check" key={a}>
                <b>0{i + 1}</b>
                <span>{a}</span>
                <i aria-hidden="true" />
              </li>
            ))}
          </ol>
          <Magnetic>
            <button type="button" className="btn btn--primary" onClick={() => onPick('Landowner Partnership')}>
              <span className="btn-label">Submit Property Details</span>
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

function Settings() {
  return (
    <section className="pst section" data-theme="dark" aria-label="Locations we work with">
      <div className="wrap">
        <p className="eyebrow">Solutions for every setting</p>
        <div className="pst-list">
          {services.map((s) => (
            <TLink key={s.id} to={`/services#svc-${s.id}`} className="pst-item" data-cursor="link">
              <span>{s.no}</span>
              {s.title}
              <i aria-hidden="true">→</i>
            </TLink>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PartnerPage() {
  const [type, setType] = useState('Landowner Partnership');
  const pick = (t) => {
    setType(t);
    requestAnimationFrame(goEnquiry);
  };
  const h = partner.hero;
  return (
    <PageShell path="/partner">
      <PageHero kicker={h.kicker} title={h.title} sub={h.sub} variant="circuit" index="05" />
      <Types onPick={pick} />
      <Landowner onPick={pick} />
      <Settings />
      <ProcessGraphic note />
      <div className="fr-enquiry">
        <div className="wrap">
          <header className="fr-enquiry-head">
            <p className="eyebrow">Start a conversation</p>
            <h2 className="display-sm">
              Let’s build the electric experience <em>together.</em>
            </h2>
            <p>Tell us what you are exploring. The EVIBE team can understand your requirement and discuss the next steps.</p>
          </header>
          <Contact bare cards={false} type={type} />
        </div>
      </div>
    </PageShell>
  );
}
