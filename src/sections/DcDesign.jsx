import { useRef } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { dc } from '../content';

// EVIBE CHARGE · DC design: capacity options, site assessment, evaluation
// process and the "right-sized today" principle (Solutions page).
const MAX_KW = 240;

export default function DcDesign() {
  const root = useRef(null);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray('.dc-head', root.current).forEach((h) =>
        gsap.from(h.children, { y: 36, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 82%' } }),
      );
      gsap.from('.dc-cap', { y: 60, opacity: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.dc-caps', start: 'top 85%' } });
      gsap.fromTo('.dc-cap-bar i', { scaleX: 0 }, { scaleX: 1, stagger: 0.12, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.dc-caps', start: 'top 80%' } });
      gsap.from('.dc-factor', { y: 40, opacity: 0, stagger: 0.06, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.dc-factors', start: 'top 85%' } });
      gsap.fromTo('.dc-line i', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.dc-steps', start: 'top 80%', end: 'bottom 60%', scrub: 0.6 } });
      gsap.from('.dc-step', { y: 40, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.dc-steps', start: 'top 85%' } });
    },
    [],
    root,
  );
  const O = dc.options;
  const A = dc.assess;
  const P = dc.process;
  return (
    <section id="dc" className="dc section" ref={root} data-theme="dark" aria-labelledby="dc-title">
      <div className="wrap">
        <header className="dc-head dc-head--intro">
          <p className="eyebrow">{dc.kicker}</p>
          <h2 className="display-sm" id="dc-title">
            {dc.title}
          </h2>
          <p>{dc.body}</p>
        </header>

        <header className="dc-head">
          <p className="eyebrow">{O.kicker}</p>
          <h3 className="dc-h3">{O.title}</h3>
          <p>{O.body}</p>
        </header>
        <div className="dc-caps">
          {O.items.map((c) => (
            <article className="dc-cap" key={c.kw}>
              <p className="dc-kw">
                {c.kw}
                <small>kW</small>
              </p>
              <span className="dc-cap-bar" aria-hidden="true">
                <i style={{ width: `${(c.kw / MAX_KW) * 100}%` }} />
              </span>
              <h4>{c.title}</h4>
              <p>{c.body}</p>
            </article>
          ))}
        </div>

        <header className="dc-head">
          <p className="eyebrow">{A.kicker}</p>
          <h3 className="dc-h3">{A.title}</h3>
          <p>{A.body}</p>
        </header>
        <div className="dc-factors">
          {A.items.map((f, i) => (
            <article className="dc-factor" key={f.title}>
              <span className="dc-no">0{i + 1}</span>
              <h4>{f.title}</h4>
              <p>{f.body}</p>
            </article>
          ))}
        </div>

        <header className="dc-head">
          <p className="eyebrow">{P.kicker}</p>
          <h3 className="dc-h3">{P.title}</h3>
          <p>{P.body}</p>
        </header>
        <ol className="dc-steps">
          <span className="dc-line" aria-hidden="true">
            <i />
          </span>
          {P.steps.map((s, i) => (
            <li className="dc-step" key={s.title}>
              <span className="dc-dot">0{i + 1}</span>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>

        <aside className="dc-principle">
          <p className="eyebrow">{dc.principle.kicker}</p>
          <p className="dc-principle-title">{dc.principle.title}</p>
          <p>{dc.principle.body}</p>
        </aside>
        <p className="dc-note">
          <b>Important:</b> {dc.note}
        </p>
      </div>
    </section>
  );
}
