import { useRef, useState } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { services, waLink } from '../content';
import Picture from '../components/Picture';
import Magnetic from '../components/Magnetic';

// Desktop: vertical scroll drives a pinned horizontal track.
// Mobile: cards stack on top of each other as you scroll.
export default function Services() {
  const root = useRef(null);
  const [idx, setIdx] = useState(0);

  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 900px)', () => {
        const track = root.current.querySelector('.svc-track');
        const dist = () => track.scrollWidth - window.innerWidth;
        const scroll = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            pin: '.svc-pin',
            start: 'top top',
            end: () => `+=${dist()}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (s) => {
              setIdx(Math.min(services.length - 1, Math.max(0, Math.round(s.progress * (services.length + 0.6) - 0.6))));
              gsap.set('.svc-hud-bar span', { scaleX: s.progress });
            },
          },
        });
        gsap.utils.toArray('.svc-panel').forEach((p) => {
          const media = p.querySelector('.svc-media');
          const img = p.querySelector('img');
          gsap.fromTo(media, { clipPath: 'inset(12% 30% 12% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: p, containerAnimation: scroll, start: 'left 95%', end: 'left 35%', scrub: true } });
          gsap.fromTo(img, { xPercent: -12, scale: 1.25 }, { xPercent: 12, scale: 1.1, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: scroll, start: 'left right', end: 'right left', scrub: true } });
          gsap.from(p.querySelectorAll('.svc-reveal'), { y: 60, opacity: 0, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: p, containerAnimation: scroll, start: 'left 75%', end: 'left 40%', scrub: true } });
          gsap.fromTo(p.querySelector('.svc-no'), { xPercent: 40 }, { xPercent: -40, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: scroll, start: 'left right', end: 'right left', scrub: true } });
        });
        gsap.from('.svc-intro .line-in', { yPercent: 110, duration: 1.2, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 70%' } });
      });
      mm.add('(max-width: 899px)', () => {
        const cards = gsap.utils.toArray('.svc-panel');
        cards.forEach((c, i) => {
          if (i === cards.length - 1) return;
          gsap.to(c.querySelector('.svc-card-in'), {
            scale: 0.9,
            opacity: 0.45,
            ease: 'none',
            scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 15%', scrub: true },
          });
        });
        gsap.from('.svc-intro .line-in', { yPercent: 110, duration: 1.2, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      });
      return () => mm.revert();
    },
    [],
    root,
  );

  return (
    <section id="services" className="services" data-theme="dark" ref={root} aria-labelledby="services-title">
      <div className="svc-pin">
        <div className="svc-track">
          <div className="svc-intro">
            <p className="eyebrow">Services</p>
            <h2 className="display" id="services-title" aria-label="Five ways we power you.">
              {['Five ways', 'we power', 'you.'].map((l) => (
                <span className="line" key={l} aria-hidden="true">
                  <span className="line-in">{l}</span>
                </span>
              ))}
            </h2>
            <p className="svc-intro-sub">From a single wall box in your garage to a highway hub, one team plans, builds and runs it.</p>
            <span className="svc-hint" aria-hidden="true">
              Keep scrolling
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </div>

          {services.map((s, i) => (
            <article className="svc-panel" key={s.id} style={{ '--i': i }} aria-labelledby={`svc-${s.id}`}>
              <div className="svc-card-in">
                <div className="svc-media" data-cursor="view" data-cursor-label={s.title}>
                  <Picture name={s.img} alt="" sizes="(max-width: 900px) 92vw, 40vw" />
                  <span className="svc-no" aria-hidden="true">
                    {s.no}
                  </span>
                </div>
                <div className="svc-body">
                  <p className="svc-reveal svc-index">
                    {s.no} / {String(services.length).padStart(2, '0')}
                  </p>
                  <h3 className="svc-reveal" id={`svc-${s.id}`}>
                    {s.title}
                  </h3>
                  <p className="svc-reveal svc-lead">{s.lead}</p>
                  <p className="svc-reveal svc-text">{s.body}</p>
                  <ul className="svc-reveal svc-tags">
                    {s.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <a className="svc-reveal u-link svc-cta" href={waLink(`Hi EVIBE, I am interested in ${s.title.toLowerCase()}.`)} target="_blank" rel="noopener">
                    Ask about {s.title.toLowerCase()} →
                  </a>
                </div>
              </div>
            </article>
          ))}

          <div className="svc-outro">
            <p className="svc-outro-title">Not sure which one fits?</p>
            <p>Tell us about your site. We will recommend the right setup, with no obligation.</p>
            <Magnetic>
              <a className="btn btn--primary" href={waLink('Hi EVIBE, can you help me choose the right charging setup?')} target="_blank" rel="noopener">
                <span className="btn-label">Talk to an expert</span>
              </a>
            </Magnetic>
          </div>
        </div>
        <div className="svc-hud" aria-hidden="true">
          <span className="svc-hud-count">
            {String(idx + 1).padStart(2, '0')} <i>/ {String(services.length).padStart(2, '0')}</i>
          </span>
          <span className="svc-hud-name">{services[idx].title}</span>
          <div className="svc-hud-bar">
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}
