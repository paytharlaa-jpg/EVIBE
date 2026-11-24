import { useRef } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { process } from '../content';

// Motion graphic: a power line draws itself across the page as you scroll,
// an energy pulse rides its tip, and each step lights up as the line reaches it.
const DESK = 'M0 210 C 140 210, 180 90, 330 90 S 520 300, 680 300 S 880 60, 1040 90 S 1260 260, 1400 200';
const NODES_X = [0.2, 0.44, 0.7, 0.93]; // where on the path each step sits (0..1 length)

export default function ProcessGraphic({ title = 'From empty bay to first charge.', kicker = 'How it works' }) {
  const root = useRef(null);
  useGsap(
    () => {
      const path = root.current.querySelector('.pg-path');
      const glow = root.current.querySelector('.pg-path-glow');
      const dot = root.current.querySelector('.pg-dot');
      const len = path.getTotalLength();
      const nodes = gsap.utils.toArray('.pg-node', root.current);
      const steps = gsap.utils.toArray('.pg-step', root.current);
      const nodeAt = NODES_X.map((f) => path.getPointAtLength(len * f));
      nodes.forEach((n, i) => {
        n.setAttribute('cx', nodeAt[i].x);
        n.setAttribute('cy', nodeAt[i].y);
      });
      const apply = (p) => {
        const L = len * p;
        path.style.strokeDashoffset = String(len - L);
        glow.style.strokeDashoffset = String(len - L);
        const pt = path.getPointAtLength(Math.max(0.01, L));
        dot.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
        nodes.forEach((n, i) => n.classList.toggle('is-on', p >= NODES_X[i] - 0.01));
        steps.forEach((s, i) => s.classList.toggle('is-on', p >= NODES_X[i] - 0.04));
      };
      path.style.strokeDasharray = String(len);
      glow.style.strokeDasharray = String(len);
      if (prefersReducedMotion()) {
        apply(1);
        return;
      }
      apply(0);
      gsap.to({}, {
        scrollTrigger: {
          trigger: root.current.querySelector('.pg-stage'),
          start: 'top 75%',
          end: 'bottom 45%',
          scrub: 0.6,
          onUpdate: (s) => apply(s.progress),
        },
      });
      gsap.from(root.current.querySelectorAll('.pg-head > *'), { y: 50, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
    },
    [],
    root,
  );

  return (
    <section className="pg section" data-theme="deep" ref={root} aria-labelledby="pg-title">
      <div className="wrap">
        <header className="pg-head">
          <p className="eyebrow">{kicker}</p>
          <h2 className="display-sm" id="pg-title">
            {title}
          </h2>
        </header>
        <div className="pg-stage">
          <svg className="pg-svg" viewBox="0 0 1400 380" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="pgGrad" x1="0" x2="1">
                <stop offset="0" stopColor="#12DDC6" />
                <stop offset="0.6" stopColor="#0A82FF" />
                <stop offset="1" stopColor="#88EE15" />
              </linearGradient>
              <filter id="pgBlur">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>
            <path d={DESK} className="pg-track" />
            <path d={DESK} className="pg-path-glow" filter="url(#pgBlur)" />
            <path d={DESK} className="pg-path" />
            {NODES_X.map((_, i) => (
              <circle key={i} r="12" className="pg-node" />
            ))}
            <g className="pg-dot">
              <circle r="22" fill="#12DDC6" opacity="0.25" />
              <circle r="8" fill="#fff" />
            </g>
          </svg>
          <ol className="pg-steps">
            {process.map((s) => (
              <li className="pg-step" key={s.no}>
                <span className="pg-no">{s.no}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
