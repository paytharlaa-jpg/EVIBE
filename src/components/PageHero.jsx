import { useEffect, useMemo, useRef } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { useStarted } from '../lib/started';
import { TLink } from '../lib/transition';

// Page hero with a live motion-graphic backdrop:
//  "circuit" — energy lines drawing themselves with pulses travelling along them
//  "rings"   — charging rings radiating from a glowing core
//  "bars"    — a battery that keeps filling in segments
function Circuit() {
  const paths = useMemo(
    () => [
      'M-20 520 H260 L330 450 H620 L690 380 H1020 L1090 310 H1460',
      'M-20 600 H180 L250 530 H520 L600 610 H900 L980 530 H1460',
      'M-20 360 H120 L200 280 H460 L540 360 H760 L840 280 H1180 L1250 210 H1460',
      'M-20 700 H380 L450 640 H780 L860 700 H1460',
      'M300 -20 V120 L380 200 V420',
      'M1100 -20 V90 L1020 170 V330',
    ],
    [],
  );
  return (
    <svg className="ph-circuit" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="phg" x1="0" x2="1">
          <stop offset="0" stopColor="#12DDC6" stopOpacity="0" />
          <stop offset="0.4" stopColor="#12DDC6" />
          <stop offset="1" stopColor="#0A82FF" />
        </linearGradient>
        <radialGradient id="phdot">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.4" stopColor="#12DDC6" />
          <stop offset="1" stopColor="#12DDC6" stopOpacity="0" />
        </radialGradient>
      </defs>
      {paths.map((d, i) => (
        <g key={i}>
          <path d={d} className="ph-wire" style={{ '--d': `${i * 0.18}s` }} pathLength="1" />
          <circle r="7" fill="url(#phdot)">
            <animateMotion dur={`${3.2 + i * 0.7}s`} repeatCount="indefinite" path={d} begin={`${i * 0.4}s`} />
          </circle>
        </g>
      ))}
      {[
        [330, 450],
        [690, 380],
        [1090, 310],
        [600, 610],
        [540, 360],
        [840, 280],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" className="ph-node" style={{ '--d': `${0.8 + i * 0.15}s` }} />
      ))}
    </svg>
  );
}

function Rings() {
  return (
    <div className="ph-rings" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} style={{ '--i': i }} />
      ))}
      <i />
    </div>
  );
}

function Bars() {
  return (
    <div className="ph-bars" aria-hidden="true">
      <div className="ph-batt">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} style={{ '--i': i }} />
        ))}
      </div>
    </div>
  );
}

export default function PageHero({ kicker, title, sub, variant = 'circuit', index = '01', crumbs = true, compact = false, children }) {
  const root = useRef(null);
  const started = useStarted();

  useEffect(() => {
    if (!started || prefersReducedMotion()) {
      root.current?.classList.add('is-in');
      return;
    }
    const el = root.current;
    const tl = gsap.timeline({ delay: 0.35, onStart: () => el.classList.add('is-in') });
    tl.fromTo(el.querySelectorAll('.ph-ch'), { yPercent: 120, rotate: 10 }, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.022, ease: 'expo.out', clearProps: 'transform' })
      .fromTo(el.querySelectorAll('.ph-reveal'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out', clearProps: 'opacity,transform' }, 0.4)
      .fromTo(el.querySelector('.ph-index'), { opacity: 0, x: 120 }, { opacity: 1, x: 0, duration: 1.6, ease: 'expo.out', clearProps: 'opacity,transform' }, 0);
    return () => tl.kill();
  }, [started]);

  useGsap(
    () => {
      if (prefersReducedMotion() || compact) return;
      gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
        .to('.ph-content', { yPercent: -25, opacity: 0, ease: 'none' }, 0)
        .to('.ph-bg', { scale: 1.2, opacity: 0.2, ease: 'none' }, 0)
        .to('.ph-index', { xPercent: -30, ease: 'none' }, 0);
    },
    [],
    root,
  );

  let ci = 0;
  return (
    <section className={`ph ph--${variant} ${compact ? 'ph--compact' : ''}`} ref={root} data-theme="dark">
      <div className="ph-bg" aria-hidden="true">
        {variant === 'circuit' && <Circuit />}
        {variant === 'rings' && <Rings />}
        {variant === 'bars' && <Bars />}
      </div>
      <span className="ph-index" aria-hidden="true">
        {index}
      </span>
      <div className="ph-content wrap">
        {crumbs && (
          <p className="ph-crumbs ph-reveal">
            <TLink to="/" className="u-link">
              Home
            </TLink>
            <span aria-hidden="true">/</span>
            <span>{kicker}</span>
          </p>
        )}
        <h1 className="ph-title" aria-label={title.join(' ')}>
          {title.map((line, li) => (
            <span className={`ph-line ${li === title.length - 1 ? 'ph-line--accent' : ''}`} key={li} aria-hidden="true">
              {line.split(' ').map((w, wi) => (
                <span className="wd" key={wi}>
                  {[...w].map((c) => (
                    <span className="ph-ch" key={ci++}>
                      {c}
                    </span>
                  ))}
                  {' '}
                </span>
              ))}
            </span>
          ))}
        </h1>
        {sub && <p className="ph-sub ph-reveal">{sub}</p>}
        {children && <div className="ph-reveal ph-extra">{children}</div>}
      </div>
      <span className="ph-scroll ph-reveal" aria-hidden="true">
        <span /> Scroll
      </span>
    </section>
  );
}
