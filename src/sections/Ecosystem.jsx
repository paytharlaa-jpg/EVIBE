import { useRef, useState } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { ecosystem } from '../content';

// "One Ecosystem. Every Step of the EV Journey." — seven glowing step circles
// orbit the EVIBE core and slowly rotate (text stays upright). Hovering a step
// pauses the orbit and lights it up; an energy pulse travels the ring.
const ICONS = {
  pin: (
    <>
      <path d="M12 21s-6-5.6-6-10.2A6 6 0 0 1 18 10.8C18 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.2" />
      <path d="M4 21h16" />
    </>
  ),
  plan: (
    <>
      <path d="M4 4h9v16H4z" />
      <path d="M7 8h3M7 12h3M7 16h2" />
      <path d="m14 17 5.5-5.5a1.6 1.6 0 0 0-2.3-2.3L11.7 14.7 11 18l3-1Z" />
    </>
  ),
  helmet: (
    <>
      <path d="M4 16a8 8 0 0 1 16 0" />
      <path d="M3 16h18v2.5H3z" />
      <path d="M10 8.5V6h4v2.5" />
    </>
  ),
  charger: (
    <>
      <rect x="4" y="3" width="10" height="18" rx="1.6" />
      <path d="m9.6 7-2.2 4h3l-2 4" />
      <path d="M14 9h2.5a1.5 1.5 0 0 1 1.5 1.5V15a1.5 1.5 0 0 0 3 0V9l-2-2" />
    </>
  ),
  chart: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M2 19h20" />
      <path d="M8 13v-2M12 13V8M16 13v-4" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1" />
      <path d="M3 9h18v3H3zM12 9v11" />
      <path d="M12 9S9.5 4 7.5 5.5 9 9 12 9Zm0 0s2.5-5 4.5-3.5S15 9 12 9Z" />
    </>
  ),
  headset: (
    <>
      <path d="M5 14v-2a7 7 0 0 1 14 0v2" />
      <rect x="3.5" y="13" width="4" height="6" rx="1.5" />
      <rect x="16.5" y="13" width="4" height="6" rx="1.5" />
      <path d="M18.5 19c0 1.5-2 2.5-5 2.5" />
    </>
  ),
};

export function EcoIcon({ name, size = 34 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

export default function Ecosystem({ compactHead = false }) {
  const root = useRef(null);
  const [active, setActive] = useState(-1);
  const n = ecosystem.steps.length;

  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.eco-wheel', start: 'top 78%' } });
      tl.from('.eco-core', { scale: 0.6, opacity: 0, duration: 1.3, ease: 'expo.out' })
        .from('.eco-node-in', { scale: 0.2, opacity: 0, duration: 1.2, stagger: 0.09, ease: 'expo.out' }, 0.2)
        .from('.eco-arcs path', { strokeDashoffset: 1, duration: 1.4, stagger: 0.06, ease: 'power2.out' }, 0.5);
      gsap.from('.eco-head > *', { y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
    },
    [],
    root,
  );

  // Arc segments between neighbouring steps (in a 1000×1000 viewBox, R = 400)
  const R = 400;
  const gap = 0.24; // radians left clear around each node
  const arcs = ecosystem.steps.map((_, i) => {
    const a0 = -Math.PI / 2 + (i / n) * Math.PI * 2 + gap;
    const a1 = -Math.PI / 2 + ((i + 1) / n) * Math.PI * 2 - gap;
    const p = (a) => [500 + R * Math.cos(a), 500 + R * Math.sin(a)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  });

  return (
    <section id="ecosystem" className="eco section" data-theme="dark" ref={root} aria-labelledby="eco-title">
      {!compactHead && (
        <header className="eco-head wrap">
          <p className="eyebrow">{ecosystem.kicker}</p>
          <h2 className="display-sm" id="eco-title">
            {ecosystem.title}
          </h2>
          <p className="eco-body">{ecosystem.body}</p>
        </header>
      )}
      <div className={`eco-wheel ${active >= 0 ? 'is-paused' : ''}`} style={{ '--n': n }}>
        <div className="eco-glow" aria-hidden="true" />
        <div className="eco-orbit">
          <svg className="eco-arcs" viewBox="0 0 1000 1000" aria-hidden="true">
            <defs>
              <marker id="ecoArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M0 0 10 5 0 10z" fill="#12DDC6" />
              </marker>
            </defs>
            <circle cx="500" cy="500" r={R} className="eco-track" />
            {arcs.map((d, i) => (
              <g key={i}>
                <path d={d} className="eco-arc-glow" pathLength="1" />
                <path d={d} className="eco-arc" markerEnd="url(#ecoArrow)" pathLength="1" />
              </g>
            ))}
            <circle r="9" className="eco-pulse">
              <animateMotion dur="9s" repeatCount="indefinite" path={`M500 ${500 - R} A${R} ${R} 0 1 1 499.9 ${500 - R}`} />
            </circle>
          </svg>
          {ecosystem.steps.map((s, i) => {
            const ang = -90 + (i / n) * 360;
            return (
              <div
                className={`eco-node ${active === i ? 'is-active' : ''}`}
                key={s.no}
                style={{ '--a': `${ang}deg` }}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(-1)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(-1)}
                tabIndex={0}
                aria-label={`${s.no} ${s.title}, ${s.brand}: ${s.body}`}
              >
                <div className="eco-node-upright">
                  <div className="eco-node-in">
                    <span className="eco-no">{s.no}</span>
                    <EcoIcon name={s.icon} />
                    <h3>{s.title}</h3>
                    <span className="eco-pill">{s.brand}</span>
                    <p>{s.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="eco-core">
          <img src="/brand/EVIBE_Wordmark_Reverse.svg" alt="EVIBE" width="240" height="72" />
          <p className="eco-core-title">
            {ecosystem.centre.title.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </p>
          <span className="eco-core-rule" aria-hidden="true" />
          <p className="eco-core-body">{ecosystem.centre.body}</p>
        </div>
      </div>

      {/* phones: the same lifecycle as a readable list */}
      <ol className="eco-list wrap">
        {ecosystem.steps.map((s) => (
          <li key={s.no}>
            <span className="eco-list-ic">
              <EcoIcon name={s.icon} size={26} />
            </span>
            <div>
              <p className="eco-list-top">
                <b>{s.no}</b> {s.title} <span className="eco-pill">{s.brand}</span>
              </p>
              <p className="eco-list-body">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
