import { useRef } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { aboutPage, about } from '../content';
import PageShell from '../components/PageShell';
import PageHero from '../components/PageHero';
import Picture from '../components/Picture';
import Tilt from '../components/Tilt';
import ProcessGraphic from '../sections/ProcessGraphic';
import Impact from '../sections/Impact';
import CtaBand from '../sections/CtaBand';

function StoryBlocks() {
  const root = useRef(null);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray('.as-block').forEach((b, i) => {
        const media = b.querySelector('.as-media');
        gsap.fromTo(media, { clipPath: i % 2 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: b, start: 'top 75%' } });
        gsap.fromTo(media.querySelector('img'), { scale: 1.3, yPercent: -8 }, { scale: 1.05, yPercent: 8, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.from(b.querySelectorAll('.as-copy > *'), { y: 50, opacity: 0, stagger: 0.1, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: b, start: 'top 70%' } });
        gsap.fromTo(b.querySelector('.as-no'), { yPercent: 40 }, { yPercent: -40, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    },
    [],
    root,
  );
  const imgs = ['charge-03', 'charge-07'];
  return (
    <section className="as section" ref={root} data-theme="dark">
      <div className="wrap">
        {aboutPage.story.map((s, i) => (
          <article className={`as-block ${i % 2 ? 'is-flip' : ''}`} key={s.title}>
            <div className="as-media">
              <Picture name={imgs[i]} alt="" sizes="(max-width: 900px) 100vw, 50vw" />
            </div>
            <div className="as-copy">
              <span className="as-no" aria-hidden="true">
                0{i + 1}
              </span>
              <p className="eyebrow">{s.title}</p>
              <p className="as-text">{s.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Values() {
  const root = useRef(null);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.av-card', { y: 100, rotateX: -30, opacity: 0, transformOrigin: '50% 100%', stagger: 0.1, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.av-grid', start: 'top 80%' } });
      gsap.from('.av-head > *', { y: 40, opacity: 0, stagger: 0.1, duration: 1, scrollTrigger: { trigger: root.current, start: 'top 75%' } });
    },
    [],
    root,
  );
  return (
    <section className="av section" ref={root} data-theme="dark">
      <div className="wrap">
        <header className="av-head">
          <p className="eyebrow">What we stand for</p>
          <h2 className="display-sm">
            One team. <em>Survey to service.</em>
          </h2>
        </header>
        <div className="av-grid">
          {aboutPage.values.map((v) => (
            <Tilt className="av-card card" key={v.k}>
              <span className="av-k">{v.k}</span>
              <h3>{v.t}</h3>
              <p>{v.d}</p>
            </Tilt>
          ))}
        </div>
        <div className="av-pillars">
          {about.pillars.map((p) => (
            <div className="av-pillar" key={p.k}>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function About() {
  const h = aboutPage.hero;
  return (
    <PageShell path="/about">
      <PageHero kicker={h.kicker} title={h.title} sub={h.sub} variant="circuit" index="01" />
      <StoryBlocks />
      <Values />
      <ProcessGraphic />
      <Impact />
      <CtaBand />
    </PageShell>
  );
}
