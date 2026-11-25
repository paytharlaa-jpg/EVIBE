import { useRef, useState } from 'react';
import { gsap, ScrollTrigger, getLenis } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { franchise } from '../content';
import PageShell from '../components/PageShell';
import PageHero from '../components/PageHero';
import Magnetic from '../components/Magnetic';
import Contact from '../sections/Contact';
import CtaBand from '../sections/CtaBand';
import { TLink } from '../lib/transition';

const T = franchise.tiers;

const scrollToEl = (el, offset = 0) => {
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY + offset;
  const l = getLenis();
  l ? l.scrollTo(y, { duration: 1.4 }) : window.scrollTo(0, y);
};

// ── "Charge. Dine. Discover. Experience." ─────────────────────
function Words() {
  const root = useRef(null);
  const words = [
    { w: 'Charge.', d: 'DC charging at the heart of every format.' },
    { w: 'Dine.', d: 'From a compact café to multiple F&B outlets.' },
    { w: 'Discover.', d: 'Seating, lounges and amenities that make the stop worth it.' },
    { w: 'Experience.', d: 'A branded EVIBE destination, connected to the ecosystem.' },
  ];
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      const items = gsap.utils.toArray('.fw-item', root.current);
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (s) => {
          const k = Math.min(words.length - 1, Math.floor(s.progress * words.length * 0.999));
          items.forEach((it, i) => {
            it.classList.toggle('is-on', i <= k);
            it.classList.toggle('is-now', i === k);
          });
        },
      });
    },
    [],
    root,
  );
  return (
    <section className="fw" ref={root} data-theme="dark" aria-label="Charge. Dine. Discover. Experience.">
      <div className="fw-sticky">
        <ul className="fw-list wrap">
          {words.map((x, i) => (
            <li className={`fw-item ${prefersReducedMotion() ? 'is-on' : ''}`} key={x.w}>
              <span className="fw-no">0{i + 1}</span>
              <span className="fw-word">{x.w}</span>
              <span className="fw-desc">{x.d}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── The site plan that grows tier by tier ─────────────────────
// Elements carry a tier (1 starter, 2 signature, 3 flagship); `only` = shown
// on that tier alone. Illustrative layout, not a specification.
function Bay({ x, y, w = 46, h = 70, t, car = true, charger = true, i = 0 }) {
  return (
    <g className="sp-el" data-t={t} style={{ '--i': i }}>
      <rect x={x} y={y} width={w} height={h} className="sp-bay" />
      {car && <rect x={x + 8} y={y + 12} width={w - 16} height={h - 22} rx="8" className="sp-car" />}
      {car && <rect x={x + 12} y={y + 18} width={w - 24} height="12" rx="3" className="sp-glass" />}
      {charger && <rect x={x + w / 2 - 5} y={y - 13} width="10" height="11" rx="2" className="sp-charger" />}
    </g>
  );
}
function Box({ x, y, w, h, label, t, only, i = 0, kind = 'fb' }) {
  return (
    <g className="sp-el" data-t={t} data-only={only} style={{ '--i': i }}>
      <rect x={x} y={y} width={w} height={h} rx="8" className={`sp-box sp-box--${kind}`} />
      <text x={x + w / 2} y={y + h / 2 + 5} className="sp-label">
        {label}
      </text>
    </g>
  );
}
function Seats({ cx, cy, n = 3, t, i = 0 }) {
  return (
    <g className="sp-el" data-t={t} style={{ '--i': i }}>
      {Array.from({ length: n }, (_, k) => (
        <g key={k}>
          <circle cx={cx + (k % 3) * 26} cy={cy + Math.floor(k / 3) * 26} r="9" className="sp-table" />
        </g>
      ))}
    </g>
  );
}
function Tree({ x, y, t, r = 12, i = 0 }) {
  return <circle className="sp-el sp-tree" data-t={t} cx={x} cy={y} r={r} style={{ '--i': i }} />;
}

function SitePlan({ tier }) {
  return (
    <svg className={`sp sp--t${tier}`} viewBox="0 0 800 600" role="img" aria-label={`Illustrative site plan for ${T[tier - 1].name}`}>
      <defs>
        <pattern id="spGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgba(18,221,198,0.07)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#spGrid)" />
      {/* road */}
      <rect x="0" y="528" width="800" height="62" className="sp-road" />
      {Array.from({ length: 14 }, (_, k) => (
        <rect key={k} x={10 + k * 58} y="557" width="30" height="4" className="sp-dash" />
      ))}
      <path d="M140 528 v-40" className="sp-arrow" markerEnd="url(#spArr)" />
      <path d="M660 488 v40" className="sp-arrow" markerEnd="url(#spArr)" />
      <defs>
        <marker id="spArr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 10 5 0 10z" fill="#12DDC6" />
        </marker>
      </defs>
      {/* site boundaries */}
      <rect className="sp-el sp-bound" data-t="1" data-only="1" x="160" y="140" width="510" height="370" />
      <rect className="sp-el sp-bound" data-t="2" data-only="2" x="150" y="170" width="630" height="340" />
      <rect className="sp-el sp-bound" data-t="3" data-only="3" x="24" y="50" width="756" height="460" />

      {/* STARTER */}
      <rect className="sp-el sp-canopy" data-t="1" x="168" y="322" width="270" height="118" rx="10" style={{ '--i': 0 }} />
      <Bay t="1" x={180} y={350} i={1} />
      <Bay t="1" x={236} y={350} i={2} />
      <Bay t="1" x={292} y={350} car={false} i={3} />
      <Bay t="1" x={348} y={350} car={false} charger={false} i={4} />
      <Box t="1" x={466} y={336} w={120} h={86} label="CAFÉ" i={5} />
      <Seats t="1" cx={612} cy={352} n={3} i={6} />
      <text className="sp-el sp-mini" data-t="1" x="612" y="406" style={{ '--i': 6 }}>
        WAITING
      </text>
      <g className="sp-el" data-t="1" data-only="1" style={{ '--i': 7 }}>
        <rect x="180" y="160" width="470" height="140" rx="10" className="sp-expand" />
        <text x="415" y="236" className="sp-label sp-label--dim">
          EXPANDABLE SITE
        </text>
      </g>

      {/* SIGNATURE */}
      <rect className="sp-el sp-canopy sp-canopy--premium" data-t="2" x="168" y="186" width="270" height="118" rx="10" style={{ '--i': 0 }} />
      <Bay t="2" x={180} y={214} i={1} />
      <Bay t="2" x={236} y={214} i={2} />
      <Bay t="2" x={292} y={214} i={3} />
      <Bay t="2" x={348} y={214} car={false} i={4} />
      <Box t="2" x={466} y={190} w={170} h={110} label="CAFÉ & F&B" i={5} />
      <Box t="2" x={652} y={190} w={116} h={110} label="AMENITIES" kind="amen" i={6} />
      <Box t="2" x={652} y={322} w={116} h={100} label="INDOOR SEATS" kind="seat" i={7} />
      <Seats t="2" cx={600} cy={440} n={3} i={8} />

      {/* FLAGSHIP */}
      <rect className="sp-el sp-canopy sp-canopy--premium" data-t="3" x="36" y="186" width="112" height="254" rx="10" style={{ '--i': 0 }} />
      <Bay t="3" x={52} y={206} w={80} h={42} car charger={false} i={1} />
      <Bay t="3" x={52} y={262} w={80} h={42} car charger={false} i={2} />
      <Bay t="3" x={52} y={318} w={80} h={42} car charger={false} i={3} />
      <Bay t="3" x={52} y={374} w={80} h={42} car={false} charger={false} i={4} />
      <Box t="3" x={466} y={66} w={80} h={96} label="F&B" i={5} />
      <Box t="3" x={556} y={66} w={80} h={96} label="F&B" i={6} />
      <Box t="3" x={652} y={66} w={116} h={96} label="LOUNGE" kind="amen" i={7} />
      <Box t="3" x={36} y={66} w={112} h={96} label="EVIBE MILES" kind="tech" i={8} />
      <Seats t="3" cx={190} cy={80} n={9} i={9} />
      <text className="sp-el sp-mini" data-t="3" x="240" y="160" style={{ '--i': 9 }}>
        OUTDOOR SEATING
      </text>

      {/* landscaping + sign */}
      <Tree t="1" x={150} y={470} i={8} />
      <Tree t="1" x={636} y={470} i={8} />
      <Tree t="2" x={460} y={470} i={9} />
      <Tree t="2" x={760} y={470} r={14} i={9} />
      <Tree t="3" x={330} y={110} i={10} />
      <Tree t="3" x={420} y={130} r={10} i={10} />
      <Tree t="3" x={60} y={470} r={14} i={10} />
      <g className="sp-el" data-t="1" style={{ '--i': 9 }}>
        <rect x="96" y="474" width="34" height="34" rx="6" className="sp-sign" />
        <text x="113" y="496" className="sp-mini sp-mini--sign">
          EV
        </text>
      </g>
    </svg>
  );
}

function TierBuilder({ onPropose }) {
  const root = useRef(null);
  const [idx, setIdx] = useState(0);
  const reduced = prefersReducedMotion();
  useGsap(
    () => {
      if (reduced) return;
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (s) => {
          setIdx(Math.min(2, Math.floor(s.progress * 3 * 0.999)));
          gsap.set('.fb-progress span', { scaleY: s.progress });
        },
      });
    },
    [],
    root,
  );
  const jump = (i) => () => {
    if (reduced) return setIdx(i);
    const el = root.current;
    const span = el.offsetHeight - window.innerHeight;
    const y = el.offsetTop + span * ((i + 0.5) / 3);
    const l = getLenis();
    l ? l.scrollTo(y, { duration: 1.2 }) : window.scrollTo(0, y);
  };
  const t = T[idx];
  return (
    <section className={`fb ${reduced ? 'is-static' : ''}`} ref={root} data-theme="dark" aria-labelledby="fb-title">
      {T.map((x, i) => (
        <span id={x.id} className="fb-anchor" key={x.id} style={{ top: `${i * 31 + 4}%` }} />
      ))}
      <div className="fb-sticky">
        <div className="wrap fb-grid">
          <div className="fb-info">
            <p className="eyebrow" id="fb-title">
              Three formats · one ecosystem
            </p>
            <div className="fb-rail" role="tablist" aria-label="Franchise formats">
              {T.map((x, i) => (
                <button type="button" role="tab" aria-selected={i === idx} key={x.id} className={`fb-tab ${i === idx ? 'is-active' : ''}`} onClick={jump(i)}>
                  <span>0{i + 1}</span> {x.name.replace('EVIBE ', '')}
                </button>
              ))}
            </div>
            <div className="fb-card" key={t.id}>
              <p className="fb-format">{t.format}</p>
              <h2 className="fb-name">
                {t.name.split(' ').map((w, i) => (
                  <span key={w} className={i ? 'fb-name-accent' : ''}>
                    {w}{' '}
                  </span>
                ))}
              </h2>
              <p className="fb-tag">{t.tagline}</p>
              <ul className="fb-feats">
                {t.features.map((f, i) => (
                  <li key={f} style={{ '--i': i }}>
                    <span aria-hidden="true">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Magnetic>
                <button type="button" className="btn btn--primary" onClick={() => onPropose(t.type)}>
                  <span className="btn-label">Request Proposal</span>
                </button>
              </Magnetic>
            </div>
          </div>
          <div className="fb-visual">
            <div className="fb-level" aria-hidden="true">
              {T.map((x, i) => (
                <i key={x.id} className={i <= idx ? 'on' : ''} />
              ))}
            </div>
            <SitePlan tier={idx + 1} />
            <p className="fb-caption">Illustrative layout. Final scope is planned around your site.</p>
          </div>
          <div className="fb-progress" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}

function Compare({ onPropose }) {
  const root = useRef(null);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.fc-col', { y: 80, opacity: 0, stagger: 0.12, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 75%' } });
    },
    [],
    root,
  );
  const rows = [
    ['Charging', ['Essential DC charging setup', 'Multiple DC charging points', 'High-capacity DC charging']],
    ['Food & beverage', ['Compact café / refreshment outlet', 'Café and F&B options', 'Multiple café and F&B outlets']],
    ['Seating', ['Customer waiting space', 'Indoor customer seating', 'Premium indoor / outdoor seating']],
    ['Amenities', ['Compact EV charging destination', 'Customer amenities and office', 'Customer lounge and amenities']],
    ['Signature element', ['Expandable site planning', 'Premium branded canopy', 'Technology and membership ecosystem']],
  ];
  return (
    <section className="fc section" ref={root} data-theme="dark" aria-labelledby="fc-title">
      <div className="wrap">
        <header className="fc-head">
          <p className="eyebrow">Compare formats</p>
          <h2 className="display-sm" id="fc-title">
            Find your <em>format.</em>
          </h2>
        </header>
        <div className="fc-grid">
          {T.map((t, ti) => (
            <div className={`fc-col fc-col--${t.id}`} key={t.id}>
              <div className="fc-top">
                <span className="fc-format">{t.format}</span>
                <h3>{t.name}</h3>
                <p>{t.tagline}</p>
              </div>
              <dl>
                {rows.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v[ti]}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" className={`btn ${ti === 1 ? 'btn--primary' : 'btn--ghost'}`} onClick={() => onPropose(t.type)}>
                <span className="btn-label">Request Proposal</span>
              </button>
            </div>
          ))}
        </div>
        <p className="fc-note">{franchise.note}</p>
        <div className="fc-land">
          <div>
            <p className="eyebrow">Landowner partnerships</p>
            <p className="fc-land-title">Have a location with potential?</p>
          </div>
          <TLink className="btn btn--glow" to="/partner">
            <span className="btn-label">Submit Property Details</span>
          </TLink>
        </div>
      </div>
    </section>
  );
}

export default function FranchisePage() {
  const [type, setType] = useState(T[1].type);
  const propose = (t) => {
    setType(t);
    requestAnimationFrame(() => scrollToEl(document.getElementById('enquiry'), -40));
  };
  return (
    <PageShell path="/franchise">
      <PageHero kicker="Franchise" title={franchise.title} sub={franchise.body} variant="rings" index="04">
        <div className="fr-chips">
          {T.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="chip" onClick={(e) => (e.preventDefault(), scrollToEl(document.getElementById(t.id)))}>
              {t.name}
            </a>
          ))}
        </div>
      </PageHero>
      <Words />
      <TierBuilder onPropose={propose} />
      <Compare onPropose={propose} />
      <div className="fr-enquiry">
        <div className="wrap">
          <header className="fr-enquiry-head">
            <p className="eyebrow">Request a proposal</p>
            <h2 className="display-sm">
              Start your <em>EVIBE.</em>
            </h2>
            <p>Share a few details about yourself and the proposed site. The EVIBE team will take the discussion forward.</p>
          </header>
          <Contact bare cards={false} type={type} />
        </div>
      </div>
      <CtaBand title={['Build the future of', 'electric experiences.']} />
    </PageShell>
  );
}
