import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, getLenis } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion, detectTier, isMobileWidth } from '../lib/device';
import { useStarted } from '../lib/started';
import { company, iq, waLink } from '../content';
import PageShell from '../components/PageShell';
import Magnetic from '../components/Magnetic';
import Tilt from '../components/Tilt';
import { TLink } from '../lib/transition';

const IQCity = lazy(() => import('../three/IQCity'));

const goForm = () => {
  const el = document.getElementById('iq-enquiry');
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 40;
  const l = getLenis();
  l ? l.scrollTo(y, { duration: 1.6 }) : window.scrollTo(0, y);
};

const Icon = ({ d, size = 30 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);
const STEP_ICONS = {
  discover: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4M11 8v6M8 11h6" />
    </>
  ),
  evaluate: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  expand: <path d="M7 17 17 7M9 7h8v8M4 20h16" />,
};

// ── Hero: the city scan ───────────────────────────────────────
function Hero() {
  const root = useRef(null);
  const progress = useRef(0);
  const started = useStarted();
  const [tier] = useState(() => detectTier());
  const H = iq.hero;

  useEffect(() => {
    const el = root.current;
    if (!started || prefersReducedMotion()) {
      el?.classList.add('is-in');
      return;
    }
    const tl = gsap.timeline({ delay: 0.3, onStart: () => el.classList.add('is-in') });
    tl.fromTo(el.querySelectorAll('.iqh-line-in'), { yPercent: 115 }, { yPercent: 0, duration: 1.4, stagger: 0.12, ease: 'expo.out' })
      .fromTo(el.querySelectorAll('.iqh-reveal'), { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out', clearProps: 'opacity,transform' }, 0.5)
      .fromTo(el.querySelector('.iqh-stage'), { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 2.2, ease: 'expo.out', clearProps: 'opacity,transform' }, 0);
    return () => tl.kill();
  }, [started]);

  useGsap(
    () => {
      ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom top', onUpdate: (s) => (progress.current = s.progress) });
      if (prefersReducedMotion()) return;
      gsap.to('.iqh-copy', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.9 } });
    },
    [],
    root,
  );

  return (
    <section className="iqh" ref={root} data-theme="dark" aria-labelledby="iqh-title">
      <div className="iqh-stage" aria-hidden="true">
        {tier > 0 ? (
          <Suspense fallback={null}>
            <IQCity tier={tier} progressRef={progress} />
          </Suspense>
        ) : (
          <div className="iqh-fallback" />
        )}
      </div>
      <div className="iqh-shade" aria-hidden="true" />
      <div className="iqh-copy wrap">
        <p className="iqh-crumbs iqh-reveal">
          <TLink to="/" className="u-link">
            Home
          </TLink>
          <span aria-hidden="true">/</span>
          <span>EVIBE IQ</span>
        </p>
        <p className="iqh-badge iqh-reveal">
          <span className="iqh-dot" aria-hidden="true" />
          {H.kicker}
        </p>
        <h1 className="iqh-title" id="iqh-title" aria-label={H.title.join(' ')}>
          {H.title.map((l, i) => (
            <span className={`iqh-line ${i ? 'iqh-line--accent' : ''}`} key={l} aria-hidden="true">
              <span className="iqh-line-in">{l}</span>
            </span>
          ))}
        </h1>
        <p className="iqh-body iqh-reveal">{H.body}</p>
        <div className="iqh-ctas iqh-reveal">
          <Magnetic>
            <button type="button" className="btn btn--primary" onClick={goForm}>
              <span className="btn-label">{H.cta} ↗</span>
            </button>
          </Magnetic>
          <span className="iqh-tagline">{H.tagline}</span>
        </div>
      </div>
      <div className="iqh-legend iqh-reveal" aria-hidden="true">
        <span>
          <i className="is-teal" /> Promising match
        </span>
        <span>
          <i /> Candidate site
        </span>
        <span className="iqh-scan">Scanning location insights…</span>
      </div>
    </section>
  );
}

// ── Discover · Evaluate · Expand ──────────────────────────────
function Does() {
  const root = useRef(null);
  const D = iq.does;
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.iqd-head > *', { y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      gsap.from('.iqd-step', { y: 90, opacity: 0, stagger: 0.15, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.iqd-steps', start: 'top 80%' } });
      gsap.fromTo('.iqd-line path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.iqd-steps', start: 'top 75%', end: 'bottom 55%', scrub: 0.9 } });
    },
    [],
    root,
  );
  return (
    <section className="iqd section" ref={root} data-theme="dark" aria-labelledby="iqd-title">
      <div className="wrap">
        <header className="iqd-head">
          <p className="eyebrow">{D.kicker}</p>
          <h2 className="display-sm" id="iqd-title">
            {D.title[0]} <em>{D.title[1]}</em>
          </h2>
          <p>{D.body}</p>
        </header>
        <div className="iqd-steps">
          <svg className="iqd-line" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 10 H1000" pathLength="1" />
          </svg>
          {D.steps.map((s, i) => (
            <article className="iqd-step" key={s.id}>
              <span className="iqd-no">0{i + 1}</span>
              <span className="iqd-ic">
                <Icon d={STEP_ICONS[s.id]} size={34} />
              </span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── What we look at: a property under review, layer by layer ──
function ParcelScan({ k }) {
  // k = how many factors are revealed (0-5); classes show layers
  return (
    <svg className={`ps ps--k${k}`} viewBox="0 0 800 600" role="img" aria-label="Illustrative property review">
      <defs>
        <pattern id="psGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgba(18,221,198,0.06)" strokeWidth="1" />
        </pattern>
        <marker id="psArr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 10 5 0 10z" fill="#12DDC6" />
        </marker>
        <linearGradient id="psScan" x1="0" x2="1">
          <stop offset="0" stopColor="#12DDC6" stopOpacity="0" />
          <stop offset="1" stopColor="#12DDC6" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#psGrid)" />

      {/* base: road */}
      <rect x="0" y="480" width="800" height="90" className="ps-road" />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={12 + i * 58} y="523" width="30" height="4" className="ps-dash" />
      ))}

      {/* 1 property: parcel + dimensions */}
      <g className="ps-l" data-k="0">
        <path d="M250 150 H560 L590 470 H230 Z" className="ps-parcel" />
        <path d="M230 492 H590" className="ps-dim" />
        <path d="M230 484 v16 M590 484 v16" className="ps-dim" />
        <text x="410" y="510" className="ps-txt">FRONTAGE</text>
        <path d="M612 150 V470" className="ps-dim" />
        <text x="626" y="314" className="ps-txt ps-txt--v">DEPTH</text>
        <rect x="330" y="270" width="150" height="58" rx="8" className="ps-tag" />
        <text x="405" y="296" className="ps-txt ps-txt--b">LAND AREA</text>
        <text x="405" y="314" className="ps-txt">Owned / lease</text>
      </g>

      {/* 2 road: entry / exit + visibility */}
      <g className="ps-l" data-k="1">
        <path d="M300 545 C300 500 300 480 300 440" className="ps-flow" markerEnd="url(#psArr)" />
        <path d="M520 440 C520 480 520 500 520 545" className="ps-flow" markerEnd="url(#psArr)" />
        <text x="300" y="590" className="ps-txt">ENTRY</text>
        <text x="520" y="590" className="ps-txt">EXIT</text>
        <path d="M60 530 L230 470 L230 590 Z" className="ps-cone" />
        <path d="M740 530 L590 470 L590 590 Z" className="ps-cone" />
      </g>

      {/* 3 surrounding activity */}
      <g className="ps-l" data-k="2">
        {[
          [40, 60, 'HOMES'],
          [640, 50, 'OFFICES'],
          [40, 290, 'HOTEL'],
          [660, 300, 'RETAIL'],
        ].map(([x, y, l]) => (
          <g key={l}>
            <rect x={x} y={y} width="110" height="80" rx="8" className="ps-bld" />
            <text x={x + 55} y={y + 46} className="ps-txt">{l}</text>
            <path d={`M${x + 55} ${y + 80} Q 410 ${y > 200 ? 330 : 220} 410 300`} className="ps-link" />
          </g>
        ))}
      </g>

      {/* 4 charging landscape */}
      <g className="ps-l" data-k="3">
        {[
          [120, 210],
          [720, 220],
          [700, 430],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="44" className="ps-ring" />
            <circle cx={x} cy={y} r="11" className="ps-ev" />
            <text x={x} y={y + 4} className="ps-txt ps-txt--ev">EV</text>
          </g>
        ))}
      </g>

      {/* 5 infrastructure readiness */}
      <g className="ps-l" data-k="4">
        <rect x="262" y="174" width="118" height="70" rx="6" className="ps-space" />
        <text x="321" y="214" className="ps-txt">CHARGING SPACE</text>
        <rect x="500" y="176" width="40" height="40" rx="6" className="ps-power" />
        <path d="M520 186 l-6 10 h12 l-6 10" className="ps-bolt" />
        <path d="M540 196 H580 V100 H800" className="ps-wire" />
        <text x="520" y="236" className="ps-txt">POWER</text>
      </g>

      {/* 6 commercial considerations */}
      <g className="ps-l" data-k="5">
        <rect x="440" y="340" width="170" height="112" rx="10" className="ps-sheet" />
        <text x="525" y="364" className="ps-txt ps-txt--b">ASSUMPTIONS</text>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="456" y={378 + i * 22} width="138" height="8" rx="4" className="ps-bar-bg" />
            <rect x="456" y={378 + i * 22} width={[96, 70, 118][i]} height="8" rx="4" className="ps-bar" />
          </g>
        ))}
      </g>

      {/* the scan line */}
      <rect className="ps-scanline" x="-140" y="0" width="140" height="480" fill="url(#psScan)" />
    </svg>
  );
}

function Factors() {
  const root = useRef(null);
  const [k, setK] = useState(0);
  const [reduced] = useState(() => prefersReducedMotion() || isMobileWidth());
  const F = iq.factors;
  const n = F.items.length;
  useGsap(
    () => {
      if (reduced) return;
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (s) => {
          setK(Math.min(n - 1, Math.floor(s.progress * n * 0.999)));
          gsap.set('.iqf-meter i', { scaleX: s.progress });
        },
      });
    },
    [],
    root,
  );
  const jump = (i) => () => {
    if (reduced) return setK(i);
    const el = root.current;
    const y = el.offsetTop + (el.offsetHeight - window.innerHeight) * ((i + 0.5) / n);
    const l = getLenis();
    l ? l.scrollTo(y, { duration: 1 }) : window.scrollTo(0, y);
  };
  const shown = reduced ? n - 1 : k;
  return (
    <section className={`iqf ${reduced ? 'is-static' : ''}`} ref={root} data-theme="deep" aria-labelledby="iqf-title">
      <div className="iqf-sticky">
        <div className="wrap iqf-grid">
          <div className="iqf-info">
            <p className="eyebrow">{F.kicker}</p>
            <h2 className="display-sm" id="iqf-title">
              {F.title}
            </h2>
            <p className="iqf-body">{F.body}</p>
            <ol className="iqf-list">
              {F.items.map((f, i) => (
                <li key={f.id} className={`${i <= shown ? 'is-on' : ''} ${i === shown ? 'is-now' : ''}`}>
                  <button type="button" onClick={jump(i)} aria-current={i === shown ? 'step' : undefined}>
                    <span className="iqf-no">0{i + 1}</span>
                    <span className="iqf-t">{f.title}</span>
                    <span className="iqf-check" aria-hidden="true">
                      ✓
                    </span>
                  </button>
                  <p>{f.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="iqf-visual">
            <div className="iqf-top" aria-hidden="true">
              <span>Location review</span>
              <span>
                {String(shown + 1).padStart(2, '0')} / 0{n}
              </span>
            </div>
            <ParcelScan k={shown} />
            <div className="iqf-meter" aria-hidden="true">
              <i />
            </div>
            <p className="iqf-caption">Illustrative. Every review depends on the information available for the site.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────
function How() {
  const root = useRef(null);
  const H = iq.how;
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.iqw-head > *', { y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      gsap.fromTo('.iqw-track i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.iqw-steps', start: 'top 70%', end: 'bottom 60%', scrub: 0.9 } });
      gsap.utils.toArray('.iqw-step', root.current).forEach((el) => {
        gsap.from(el, { x: 60, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 82%' } });
        ScrollTrigger.create({ trigger: el, start: 'top 62%', onEnter: () => el.classList.add('is-on'), onLeaveBack: () => el.classList.remove('is-on') });
      });
    },
    [],
    root,
  );
  return (
    <section className="iqw section" ref={root} data-theme="dark" aria-labelledby="iqw-title">
      <div className="wrap iqw-grid">
        <header className="iqw-head">
          <p className="eyebrow">{H.kicker}</p>
          <h2 className="display-sm" id="iqw-title">
            {H.title}
          </h2>
          <p>{H.body}</p>
        </header>
        <ol className="iqw-steps">
          <span className="iqw-track" aria-hidden="true">
            <i />
          </span>
          {H.steps.map((s, i) => (
            <li className={`iqw-step ${prefersReducedMotion() ? 'is-on' : ''}`} key={s.tag}>
              <span className="iqw-dot" aria-hidden="true" />
              <p className="iqw-tag">
                0{i + 1} · {s.tag}
              </p>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ── Where it can help ────────────────────────────────────────
const USE_ICONS = [
  <path key="0" d="M4 20 10 4h4l6 16M12 7v2M12 12v2M12 17v2" />,
  <path key="1" d="M3 21V10l9-6 9 6v11M8 21v-5h8v5M3 21h18" />,
  <path key="2" d="M3 20V8h18v12M3 12h18M7 8V4h10v4M3 20h18" />,
  <path key="3" d="M4 21V5l8-2v18M12 7l8 2v12M7 9h2M7 13h2M7 17h2M15 12h2M15 16h2M3 21h18" />,
  <path key="4" d="M2 7h11v9H2zM13 10h4l3 3v3h-7M6 19a2 2 0 1 0 0-.1M17 19a2 2 0 1 0 0-.1" />,
  <path key="5" d="M12 3 3 8v13h18V8ZM9 21v-6h6v6M8 11h.01M16 11h.01" />,
];
function Uses() {
  const root = useRef(null);
  const U = iq.uses;
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.iqu-head > *', { y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      gsap.from('.iqu-card', { y: 80, opacity: 0, rotateX: -18, transformOrigin: '50% 100%', stagger: 0.08, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.iqu-grid', start: 'top 82%' } });
    },
    [],
    root,
  );
  return (
    <section className="iqu section" ref={root} data-theme="dark" aria-labelledby="iqu-title">
      <div className="wrap">
        <header className="iqu-head">
          <p className="eyebrow">{U.kicker}</p>
          <h2 className="display-sm" id="iqu-title">
            {U.title}
          </h2>
          <p>{U.body}</p>
        </header>
        <div className="iqu-grid">
          {U.items.map((u, i) => (
            <Tilt as={TLink} to={u.to} className="iqu-card card" key={u.title} max={6}>
              <span className="iqu-ic">
                <Icon d={USE_ICONS[i]} size={28} />
              </span>
              <span className="iqu-no">0{i + 1}</span>
              <h3>{u.title}</h3>
              <p>{u.body}</p>
              <span className="iqu-go" aria-hidden="true">
                →
              </span>
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Outputs: a fanned stack of review documents ───────────────
function Outputs() {
  const root = useRef(null);
  const O = iq.outputs;
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.iqo-head > *', { y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      gsap.from('.iqo-doc', {
        y: 160,
        rotate: (i) => (i - 1.5) * 9,
        opacity: 0,
        stagger: 0.12,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.iqo-docs', start: 'top 82%' },
      });
    },
    [],
    root,
  );
  return (
    <section className="iqo section" ref={root} data-theme="light" aria-labelledby="iqo-title">
      <div className="wrap">
        <header className="iqo-head">
          <p className="eyebrow">{O.kicker}</p>
          <h2 className="display-sm" id="iqo-title">
            {O.title}
          </h2>
          <p>{O.body}</p>
        </header>
        <div className="iqo-docs">
          {O.items.map((d, i) => (
            <article className="iqo-doc" key={d.title} style={{ '--i': i }}>
              <div className="iqo-doc-top" aria-hidden="true">
                <img src="/brand/EVIBE_Horizontal_no_Tagline_FullColour.svg" alt="" width="70" height="16" />
                <span>IQ · 0{i + 1}</span>
              </div>
              <h3>{d.title}</h3>
              <p>{d.body}</p>
              <div className="iqo-lines" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </article>
          ))}
        </div>
        <aside className="iqo-private">
          <span className="iqo-lock" aria-hidden="true">
            <Icon
              d={
                <>
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3M12 15v2" />
                </>
              }
              size={26}
            />
          </span>
          <div>
            <p className="iqo-private-title">{iq.private.title}</p>
            <p>{iq.private.body}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

// ── Enquiry (EVIBE IQ fields) ────────────────────────────────
function IQForm() {
  const root = useRef(null);
  const F = iq.form;
  const [form, setForm] = useState({ name: '', phone: '', role: '', loc: '', size: '', status: '', msg: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState('');
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.iqe-head > *', { y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
      gsap.from('.iqe .field, .iqe .ct-actions', { y: 30, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: '.iqe .ct-form', start: 'top 85%' } });
    },
    [],
    root,
  );
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };
  const validate = () => {
    const er = {};
    if (form.name.trim().length < 2) er.name = 'Please tell us your name.';
    if (!/^[+\d][\d\s-]{8,15}$/.test(form.phone.trim())) er.phone = 'Enter a valid phone number, e.g. 98765 43210.';
    if (!form.role) er.role = 'Please select one.';
    if (form.loc.trim().length < 2) er.loc = 'Please share the preferred location.';
    setErrors(er);
    if (Object.keys(er).length) {
      document.getElementById(`iq-${Object.keys(er)[0]}`)?.focus();
      return false;
    }
    return true;
  };
  const message = () =>
    [
      'Hi EVIBE, I would like to discuss a location (EVIBE IQ).',
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `I am a: ${form.role}`,
      `Preferred location: ${form.loc.trim()}`,
      form.size.trim() && `Approximate land size: ${form.size.trim()}`,
      form.status && `Property status: ${form.status}`,
      form.msg.trim() && `Notes: ${form.msg.trim()}`,
    ]
      .filter(Boolean)
      .join('\n');
  const onWa = (e) => {
    e.preventDefault();
    if (!validate()) return;
    window.open(waLink(message()), '_blank', 'noopener');
    setSent('WhatsApp opened with your details. Just press send.');
  };
  const onMail = () => {
    if (!validate()) return;
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent('EVIBE IQ: location enquiry')}&body=${encodeURIComponent(message())}`;
    setSent('Your email app opened with the details filled in.');
  };
  const Err = ({ k }) =>
    errors[k] ? (
      <p className="field-err" id={`iq-${k}-err`}>
        {errors[k]}
      </p>
    ) : null;
  const aria = (k) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `iq-${k}-err` : undefined });
  return (
    <section id="iq-enquiry" className="iqe section" ref={root} data-theme="dark" aria-labelledby="iqe-title">
      <div className="wrap iqe-grid">
        <header className="iqe-head">
          <p className="eyebrow">{F.kicker}</p>
          <h2 className="display-sm" id="iqe-title">
            {F.title}
          </h2>
          <p>{F.body}</p>
          <div className="iqe-radar" aria-hidden="true">
            <span />
            <span />
            <span />
            <i />
          </div>
        </header>
        <form className="ct-form" onSubmit={onWa} noValidate>
          <div className={`field ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="iq-name">Your name *</label>
            <input id="iq-name" autoComplete="name" value={form.name} onChange={set('name')} {...aria('name')} />
            <Err k="name" />
          </div>
          <div className={`field ${errors.phone ? 'has-error' : ''}`}>
            <label htmlFor="iq-phone">Phone number *</label>
            <input id="iq-phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} {...aria('phone')} />
            <Err k="phone" />
          </div>
          <div className={`field ${errors.role ? 'has-error' : ''}`}>
            <label htmlFor="iq-role">I am a *</label>
            <select id="iq-role" value={form.role} onChange={set('role')} {...aria('role')}>
              <option value="">Please select</option>
              {F.roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <Err k="role" />
          </div>
          <div className={`field ${errors.loc ? 'has-error' : ''}`}>
            <label htmlFor="iq-loc">Preferred location *</label>
            <input id="iq-loc" autoComplete="address-level2" value={form.loc} onChange={set('loc')} {...aria('loc')} placeholder="City, area or highway" />
            <Err k="loc" />
          </div>
          <div className="field">
            <label htmlFor="iq-size">Approximate land size</label>
            <input id="iq-size" value={form.size} onChange={set('size')} placeholder="e.g. 10,000 sq ft" />
          </div>
          <div className="field">
            <label htmlFor="iq-status">Property status</label>
            <select id="iq-status" value={form.status} onChange={set('status')}>
              <option value="">Please select</option>
              {F.status.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="field field--full">
            <label htmlFor="iq-msg">
              Anything else we should know? <small>(optional)</small>
            </label>
            <textarea id="iq-msg" rows="3" value={form.msg} onChange={set('msg')} />
          </div>
          <div className="ct-actions field--full">
            <Magnetic>
              <button type="submit" className="btn btn--primary">
                <span className="btn-label">Send on WhatsApp</span>
              </button>
            </Magnetic>
            <button type="button" className="btn btn--ghost" onClick={onMail}>
              <span className="btn-label">Send by email</span>
            </button>
          </div>
          <p className="ct-sent field--full" role="status" aria-live="polite">
            {sent}
          </p>
        </form>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="iqc section" data-theme="deep" aria-labelledby="iqcta-title">
      <div className="wrap iqc-in">
        <div>
          <h2 className="display-sm" id="iqcta-title">
            {iq.cta.title}
          </h2>
          <p>{iq.cta.body}</p>
        </div>
        <Magnetic>
          <button type="button" className="btn btn--glow" onClick={goForm}>
            <span className="btn-label">{iq.cta.button} ↗</span>
          </button>
        </Magnetic>
      </div>
    </section>
  );
}

export default function IQPage() {
  return (
    <PageShell path="/iq" className="page-iq">
      <Hero />
      <Does />
      <Factors />
      <How />
      <Uses />
      <Outputs />
      <Cta />
      <IQForm />
    </PageShell>
  );
}
