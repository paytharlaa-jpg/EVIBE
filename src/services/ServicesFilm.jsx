import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, getLenis } from '../lib/scroll';
import { isMobileWidth, prefersReducedMotion } from '../lib/device';
import { franchise } from '../content';
import { TLink } from '../lib/transition';
import { SS } from './state';
import { CHAPTERS, range, cafeCharge, sigCharge, flagCharge } from './timeline';
import Picture from '../components/Picture';

const ServicesScene = lazy(() => import('./ServicesScene'));

// A pinned film on the Solutions page that walks through the three EVIBE
// formats: Starter (café), Signature and Flagship. DC charging only.
const NAME = { starter: 'EVIBE Starter', signature: 'EVIBE Signature', flagship: 'EVIBE Flagship' };
const tier = (id) => franchise.tiers.find((t) => t.id === id);
const COPY = {
  cafe: { t: tier('starter'), kicker: '01 · EVIBE Starter', title: ['Charge your car.', 'Enjoy your coffee.'], body: 'A compact EV charging destination with a combined mini café and customer waiting room. Plug in, step inside and relax while your car charges outside.', level: cafeCharge },
  sig: { t: tier('signature'), kicker: '02 · EVIBE Signature', title: ['More than a stop.', 'An experience.'], level: sigCharge },
  flag: { t: tier('flagship'), kicker: '03 · EVIBE Flagship', title: ['The ultimate', 'electric experience.'], level: flagCharge },
};

export default function ServicesFilm({ tier }) {
  const root = useRef(null);
  const stage = useRef(null);
  const [active, setActive] = useState(false);
  const [reduced] = useState(() => prefersReducedMotion());

  useEffect(() => {
    SS.mobile = isMobileWidth();
    SS.p = SS.target = reduced ? 0.84 : 0;
    if (reduced) return;
    const st = ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom bottom', onUpdate: (s) => (SS.target = s.progress) });
    return () => st.kill();
  }, [reduced]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: '20% 0px' });
    io.observe(root.current);
    return () => io.disconnect();
  }, []);

  // DOM layer follows the eased film progress.
  useEffect(() => {
    const el = stage.current;
    const cards = [...el.querySelectorAll('[data-ch]')];
    const rails = [...el.querySelectorAll('.svf-rail-item')];
    let last = -1;
    const tick = () => {
      const p = reduced ? 0.84 : SS.p;
      if (Math.abs(p - last) < 0.00005) return;
      last = p;
      cards.forEach((c, i) => {
        const ch = CHAPTERS[i];
        const span = ch.to - ch.from;
        const inn = i === 0 ? 1 : range(p, ch.from, ch.from + span * 0.25);
        const out = i === CHAPTERS.length - 1 ? 0 : range(p, ch.to - span * 0.18, ch.to);
        c.style.setProperty('--in', inn.toFixed(3));
        c.style.setProperty('--out', out.toFixed(3));
        c.style.visibility = p >= ch.from - 0.01 && p <= ch.to + 0.01 ? 'visible' : 'hidden';
        const pct = c.querySelector('[data-pct]');
        if (pct) pct.textContent = Math.round(COPY[ch.id].level(p) * 100);
        const bar = c.querySelector('[data-bar]');
        if (bar) bar.style.transform = `scaleX(${COPY[ch.id].level(p)})`;
      });
      rails.forEach((r, i) => {
        const ch = CHAPTERS[i];
        r.style.setProperty('--fill', range(p, ch.from, ch.to).toFixed(3));
        r.classList.toggle('is-active', p >= ch.from - 0.02 && p < (CHAPTERS[i + 1]?.from ?? 2) - 0.02);
      });
    };
    gsap.ticker.add(tick);
    tick();
    return () => gsap.ticker.remove(tick);
  }, [reduced]);

  const jump = (ch) => () => {
    const y = root.current.offsetTop + (root.current.offsetHeight - window.innerHeight) * (ch.from + 0.04);
    const l = getLenis();
    l ? l.scrollTo(y, { duration: 1.6 }) : window.scrollTo(0, y);
  };

  return (
    <section className={`svf ${reduced ? 'is-static' : ''}`} ref={root} data-theme="dark" aria-label="Three EVIBE formats: Starter, Signature and Flagship">
      <div className="svf-stage" ref={stage}>
        <div className="svf-gl" aria-hidden="true">
          {tier > 0 ? (
            <Suspense fallback={null}>
              <ServicesScene tier={tier} active={active} />
            </Suspense>
          ) : (
            <Picture name="charge-03" alt="" sizes="100vw" className="svf-fallback" />
          )}
        </div>
        <div className="svf-shade" aria-hidden="true" />
        <p className="svf-head" aria-hidden="true">
          Three formats. <b>One ecosystem.</b>
        </p>

        {CHAPTERS.map((ch) => {
          const c = COPY[ch.id];
          return (
            <article className={`svf-card svf-card--${c.t.color}`} data-ch key={ch.id} aria-labelledby={`svf-${ch.id}`}>
              <p className="svf-kicker">{c.kicker}</p>
              <h2 className="svf-title" id={`svf-${ch.id}`}>
                {c.title.map((l, i) => (
                  <span className={`svf-line ${i ? 'svf-line--accent' : ''}`} key={l} style={{ '--d': i }}>
                    {l}
                  </span>
                ))}
              </h2>
              <p className="svf-body">{c.body || c.t.lead}</p>
              <div className="svf-meter" aria-hidden="true">
                <div className="svf-meter-top">
                  <span>{ch.rate}</span>
                  <b>
                    <span data-pct>0</span>%
                  </b>
                </div>
                <div className="svf-bar">
                  <span data-bar />
                </div>
              </div>
              <TLink className="u-link svf-cta" to={`/franchise#${c.t.id}`}>
                Explore {NAME[c.t.id]} →
              </TLink>
            </article>
          );
        })}

        <nav className="svf-rail" aria-label="Charging stories">
          {CHAPTERS.map((ch, i) => (
            <button type="button" className={`svf-rail-item svf-rail-item--${COPY[ch.id].t.color}`} key={ch.id} onClick={jump(ch)}>
              <span className="svf-rail-no">0{i + 1}</span>
              <span className="svf-rail-label">{ch.label}</span>
              <span className="svf-rail-bar">
                <span />
              </span>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
