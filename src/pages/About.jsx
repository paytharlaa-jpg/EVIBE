import { useRef } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { aboutPage, pillars, technology, evibeIQ } from '../content';
import PageShell from '../components/PageShell';
import PageHero from '../components/PageHero';
import Picture from '../components/Picture';
import Tilt from '../components/Tilt';
import Ecosystem from '../sections/Ecosystem';
import ProcessGraphic from '../sections/ProcessGraphic';
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
      });
      gsap.from('.as-check', { x: -30, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.as-checks', start: 'top 85%' } });
    },
    [],
    root,
  );
  const imgs = ['charge-07', 'charge-04'];
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
              {i === 0 && (
                <ul className="as-checks">
                  {aboutPage.checks.map((c) => (
                    <li className="as-check" key={c}>
                      <span aria-hidden="true">✓</span> {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Pillars() {
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
          <p className="eyebrow">The complete EV charging lifecycle</p>
          <h2 className="display-sm">
            Four pillars. <em>One brand.</em>
          </h2>
        </header>
        <div className="av-grid">
          {pillars.map((v) => (
            <Tilt className="av-card card" key={v.no}>
              <span className="av-k">{v.no}</span>
              <span className="av-tag">{v.tag}</span>
              <h3>{v.name}</h3>
              <p>{v.body}</p>
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  );
}

function Technology() {
  const root = useRef(null);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.tx-card', { y: 80, opacity: 0, stagger: 0.1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.tx-grid', start: 'top 85%' } });
      gsap.from('.tx-head > *, .iq > *', { y: 40, opacity: 0, stagger: 0.08, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      gsap.fromTo('.iq-radar span', { scale: 0.2, opacity: 0.9 }, { scale: 2.4, opacity: 0, duration: 3, stagger: 1, repeat: -1, ease: 'power1.out' });
    },
    [],
    root,
  );
  return (
    <section id="technology" className="tx section" ref={root} data-theme="deep" aria-labelledby="tx-title">
      <div className="wrap">
        <header className="tx-head">
          <p className="eyebrow">{technology.kicker}</p>
          <h2 className="display-sm" id="tx-title">
            {technology.title}
          </h2>
          <p>{technology.body}</p>
        </header>
        <div className="tx-grid">
          {technology.items.map((t) => (
            <Tilt className="tx-card card" key={t.name} max={5}>
              <h3>{t.name}</h3>
              <p>{t.body}</p>
              <span className="tx-status">{t.status}</span>
            </Tilt>
          ))}
        </div>
        <div className="iq">
          <div className="iq-copy">
            <p className="eyebrow">{evibeIQ.kicker}</p>
            <p className="iq-sub">{evibeIQ.sub}</p>
            <h3 className="display-sm">{evibeIQ.title}</h3>
            <p className="iq-body">{evibeIQ.body}</p>
            <ul>
              {evibeIQ.points.map((p) => (
                <li key={p}>
                  <span aria-hidden="true">✓</span> {p}
                </li>
              ))}
            </ul>
            <p className="iq-note">{evibeIQ.note}</p>
          </div>
          <div className="iq-radar" aria-hidden="true">
            <span />
            <span />
            <span />
            <i />
            <b className="iq-dot iq-dot--1" />
            <b className="iq-dot iq-dot--2" />
            <b className="iq-dot iq-dot--3" />
          </div>
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
      <Pillars />
      <Ecosystem />
      <Technology />
      <ProcessGraphic note />
      <CtaBand />
    </PageShell>
  );
}
