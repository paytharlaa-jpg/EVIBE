import { useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion, detectTier } from '../lib/device';
import ServicesFilm from '../services/ServicesFilm';
import { services, waLink, solutionsIntro } from '../content';
import PageShell from '../components/PageShell';
import PageHero from '../components/PageHero';
import Picture from '../components/Picture';
import Magnetic from '../components/Magnetic';
import ProcessGraphic from '../sections/ProcessGraphic';
import FAQ from '../sections/FAQ';
import { TLink } from '../lib/transition';
import CtaBand from '../sections/CtaBand';

// Full service detail: sticky index on the left, each service a scene with a
// masked image, a giant outlined number and its inclusions.
function ServiceDetail() {
  const root = useRef(null);
  const [active, setActive] = useState(0);
  useGsap(
    () => {
      gsap.utils.toArray('.sd-item').forEach((it, i) => {
        ScrollTrigger.create({ trigger: it, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && setActive(i) });
        if (prefersReducedMotion()) return;
        const media = it.querySelector('.sd-media');
        gsap.fromTo(media, { clipPath: 'inset(15% 15% 15% 15% round 32px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', ease: 'none', scrollTrigger: { trigger: it, start: 'top 90%', end: 'top 30%', scrub: true } });
        gsap.fromTo(media.querySelector('img'), { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: it, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.from(it.querySelectorAll('.sd-copy > *'), { y: 60, opacity: 0, stagger: 0.07, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: it, start: 'top 65%' } });
        gsap.fromTo(it.querySelector('.sd-no'), { xPercent: 20, opacity: 0 }, { xPercent: -10, opacity: 1, ease: 'none', scrollTrigger: { trigger: it, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    },
    [],
    root,
  );
  const jump = (i) => () => document.getElementById(`svc-${services[i].id}`)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  return (
    <section className="sd section" ref={root} data-theme="dark" aria-label="Our services">
      <div className="wrap sd-grid">
        <nav className="sd-index" aria-label="Services">
          <p className="eyebrow">Services</p>
          <ol>
            {services.map((s, i) => (
              <li key={s.id}>
                <button type="button" className={active === i ? 'is-active' : ''} onClick={jump(i)}>
                  <span>{s.no}</span> {s.title}
                </button>
              </li>
            ))}
          </ol>
          <div className="sd-index-bar" aria-hidden="true">
            <span style={{ transform: `scaleY(${(active + 1) / services.length})` }} />
          </div>
        </nav>
        <div className="sd-list">
          {services.map((s) => (
            <article className="sd-item" id={`svc-${s.id}`} key={s.id} aria-labelledby={`sdt-${s.id}`}>
              <div className="sd-media" data-cursor="view" data-cursor-label={s.title}>
                <Picture name={s.img} alt="" sizes="(max-width: 900px) 100vw, 55vw" />
                <span className="sd-no" aria-hidden="true">
                  {s.no}
                </span>
              </div>
              <div className="sd-copy">
                <h2 id={`sdt-${s.id}`}>{s.title}</h2>
                <p className="sd-lead">{s.lead}</p>
                <p className="sd-text">{s.body}</p>
                <ul className="sd-tags">
                  {s.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <Magnetic>
                  <TLink className="btn btn--glow" to={`/contact?type=${encodeURIComponent(s.title)}`}>
                    <span className="btn-label">{s.cta}</span>
                  </TLink>
                </Magnetic>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  return (
    <PageShell path="/services">
      <PageHero
        kicker="Solutions"
        title={['Solutions for', 'every setting.']}
        sub={solutionsIntro.title + ' ' + solutionsIntro.body}
        variant="bars"
        index="02"
      />
      <ServicesFilm tier={detectTier()} />
      <ServiceDetail />
      <ProcessGraphic note />
      <FAQ limit={4} />
      <CtaBand title={['Not sure which fits?', 'Discuss your project.']} />
    </PageShell>
  );
}
