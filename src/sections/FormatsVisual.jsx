import { useRef, useState } from 'react';
import { ScrollTrigger, getLenis } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion, isMobileWidth } from '../lib/device';
import { franchise } from '../content';
import { TLink } from '../lib/transition';

// Solutions page: the three EVIBE formats as illustrated night scenes
// (lightweight SVG, no 3D). Desktop: pinned, scroll steps through the formats.
// Phones: a simple stack.
const T = franchise.tiers;
const HEX = { teal: '#12DDC6', blue: '#2F8DFF', gold: '#E8B44C' };
const NAME = { starter: 'EVIBE Starter', signature: 'EVIBE Signature', flagship: 'EVIBE Flagship' };

function Car({ x, y = 330, color = '#e9edf2', flip = false }) {
  return (
    <g transform={`translate(${x} ${y}) ${flip ? 'scale(-1 1)' : ''}`} className="fv-car">
      <path d="M-58 0 Q-58 -14 -46 -17 L-30 -20 Q-18 -38 4 -38 L22 -38 Q38 -36 48 -20 L56 -17 Q64 -14 64 -2 L64 4 L-58 4 Z" fill={color} />
      <path d="M-24 -21 Q-14 -33 2 -33 L18 -33 Q30 -31 38 -21 Z" fill="#0b1830" opacity="0.85" />
      <rect x="54" y="-12" width="9" height="4" rx="2" fill="#ff3348" />
      <circle cx="-34" cy="4" r="11" fill="#0a0f18" />
      <circle cx="40" cy="4" r="11" fill="#0a0f18" />
      <circle cx="-34" cy="4" r="5" fill="#5b6574" />
      <circle cx="40" cy="4" r="5" fill="#5b6574" />
    </g>
  );
}

function Charger({ x, y = 334, c, live = false, cable = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-11" y="-62" width="22" height="62" rx="5" fill="#dfe5ec" />
      <rect x="-7" y="-55" width="14" height="16" rx="2" fill="#071b3c" />
      <rect x="-7" y="-55" width="14" height="16" rx="2" fill={c} className={live ? 'fv-screen is-live' : 'fv-screen'} />
      <rect x="-1.5" y="-34" width="3" height="28" rx="1.5" fill={c} opacity="0.9" />
      {cable && <path d="M10 -30 C 34 -30, 40 -10, 52 -14" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" className="fv-cable" />}
    </g>
  );
}

function Canopy({ x, w, c, label }) {
  return (
    <g>
      <rect x={x} y="150" width={w} height="20" rx="4" fill="#0b1730" />
      <rect x={x} y="149" width={w} height="3" fill={c} className="fv-strip" />
      <rect x={x} y="168" width={w} height="2" fill={c} opacity="0.8" />
      <path d={`M${x + 8} 170 L${x + w - 8} 170 L${x + w - 40} 380 L${x + 40} 380 Z`} fill="url(#fvBeam)" opacity="0.5" />
      <rect x={x + 10} y="170" width="8" height="210" fill="#aeb8c5" />
      <rect x={x + w - 18} y="170" width="8" height="210" fill="#aeb8c5" />
      <text x={x + w / 2} y="164" className="fv-sign" fill={c}>
        {label}
      </text>
    </g>
  );
}

function Pavilion({ x, w, h = 120, c, signs = [] }) {
  const y = 380 - h;
  const panes = Math.max(2, Math.round(w / 46));
  return (
    <g>
      <rect x={x} y={y - 14} width={w} height="14" fill="#0d1422" />
      <rect x={x} y={y - 15} width={w} height="2" fill={c} />
      <rect x={x} y={y} width={w} height={h} fill="url(#fvWarm)" />
      {Array.from({ length: panes + 1 }, (_, i) => (
        <rect key={i} x={x + (i * w) / panes - 1} y={y} width="2" height={h} fill="#1a2232" />
      ))}
      {signs.map((s, i) => (
        <g key={s} transform={`translate(${x + ((i + 0.5) * w) / signs.length} ${y + 26})`}>
          <rect x="-34" y="-12" width="68" height="20" rx="3" fill="#0a1426" />
          <text y="3" className="fv-menu" fill={c}>
            {s}
          </text>
        </g>
      ))}
      {/* tables + guests silhouettes */}
      {Array.from({ length: Math.max(1, Math.floor(w / 110)) }, (_, i) => {
        const tx = x + 40 + i * 110;
        return (
          <g key={i} className="fv-guest" style={{ '--d': `${i * 0.6}s` }}>
            <rect x={tx - 14} y="352" width="28" height="4" rx="2" fill="#6b4a2f" />
            <rect x={tx - 1.5} y="356" width="3" height="24" fill="#6b4a2f" />
            <circle cx={tx - 22} cy="334" r="6" fill="#1b2433" />
            <path d={`M${tx - 30} 362 Q${tx - 22} 340 ${tx - 14} 362 Z`} fill="#1b2433" />
            <circle cx={tx + 3} cy="348" r="3" fill="#f4f2ee" />
          </g>
        );
      })}
      {Array.from({ length: Math.max(2, Math.floor(w / 80)) }, (_, i) => (
        <circle key={`l${i}`} cx={x + 30 + i * 80} cy={y + 52} r="5" fill="#ffd59c" className="fv-lamp" />
      ))}
    </g>
  );
}

function Umbrella({ x, c }) {
  return (
    <g>
      <rect x={x - 1} y="318" width="2" height="62" fill="#cfd5dc" />
      <path d={`M${x - 34} 322 Q${x} 296 ${x + 34} 322 Z`} fill="#efe9df" />
      <rect x={x - 34} y="321" width="68" height="2" fill={c} />
    </g>
  );
}

function Art({ tier }) {
  const c = HEX[tier.color];
  const id = tier.id;
  return (
    <svg className="fv-svg" viewBox="0 100 800 330" role="img" aria-label={`Illustration of ${NAME[id]}`}>
      <defs>
        <linearGradient id="fvSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#040b1c" />
          <stop offset="1" stopColor="#0b2a5a" />
        </linearGradient>
        <linearGradient id="fvWarm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3b22" />
          <stop offset="1" stopColor="#2a1b10" />
        </linearGradient>
        <linearGradient id="fvBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4f6ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#e4f6ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect y="100" width="800" height="360" fill="url(#fvSky)" />
      {Array.from({ length: 34 }, (_, i) => (
        <circle key={i} cx={(i * 211) % 800} cy={104 + ((i * 97) % 44)} r={i % 3 ? 1 : 1.6} fill="#bfe9ff" opacity="0.6" />
      ))}
      <circle cx="740" cy="122" r="12" fill="#e8f4ff" opacity="0.9" />
      <rect y="380" width="800" height="80" fill="#0d1524" />
      <rect y="380" width="800" height="2" fill={c} opacity="0.5" />

      {id === 'starter' && (
        <g className="fv-scene">
          <Pavilion x={470} w={190} h={110} c={c} signs={['MINI CAFÉ']} />
          <text x="565" y="404" className="fv-label">
            Mini café + waiting room · approx. 10 × 10 ft
          </text>
          <Canopy x={110} w={300} c={c} label="EVIBE · DC CHARGING" />
          <Charger x={200} c={c} live cable />
          <Charger x={320} c={c} />
          <Car x={262} color="#1d4fb8" />
        </g>
      )}
      {id === 'signature' && (
        <g className="fv-scene">
          <Pavilion x={430} w={330} h={130} c={c} signs={['CAFÉ', 'F&B', 'LOUNGE']} />
          <Canopy x={40} w={370} c={c} label="EVIBE SIGNATURE" />
          {[110, 200, 290, 380].map((x, i) => (
            <Charger key={x} x={x - 30} c={c} live={i === 1} cable={i < 3} />
          ))}
          <Car x={130} color="#e9edf2" />
          <Car x={222} color="#b3121c" />
          <Car x={312} color="#20262f" />
          <text x="595" y="404" className="fv-label">
            Café & F&B · indoor seating · amenities
          </text>
        </g>
      )}
      {id === 'flagship' && (
        <g className="fv-scene">
          <Pavilion x={360} w={420} h={150} c={c} signs={['CAFÉ', 'KITCHEN', 'DESSERTS', 'LOUNGE']} />
          <path d="M360 216 Q570 236 780 216" stroke="#ffd59c" strokeWidth="1" fill="none" opacity="0.7" />
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx={372 + i * 36} cy={222 + Math.sin((i / 11) * Math.PI) * 9} r="2.6" fill="#ffd59c" className="fv-lamp" />
          ))}
          <Umbrella x={420} c={c} />
          <Umbrella x={560} c={c} />
          <Canopy x={14} w={330} c={c} label="EVIBE FLAGSHIP" />
          {[50, 106, 162, 218, 274, 320].map((x, i) => (
            <Charger key={x} x={x + 10} y={334} c={c} live={i === 2} cable={i < 4} />
          ))}
          <Car x={96} color="#e9edf2" />
          <Car x={208} color="#111418" />
          <Car x={318} color="#b3121c" />
          <g transform="translate(760 380)">
            <rect x="-14" y="-170" width="28" height="170" fill="#0b1730" />
            <rect x="-14" y="-170" width="2" height="170" fill={c} />
            <rect x="12" y="-170" width="2" height="170" fill={c} />
            <text x="0" y="-80" className="fv-pylon" fill={c} transform="rotate(-90 0 -80)">
              FLAGSHIP
            </text>
          </g>
          <text x="560" y="404" className="fv-label">
            Multiple F&B outlets · lounge · EVIBE Miles
          </text>
        </g>
      )}
    </svg>
  );
}

function Info({ t, i }) {
  return (
    <div className="fv-info">
      <p className="fv-kicker" style={{ color: HEX[t.color] }}>
        0{i + 1} · {t.format}
      </p>
      <h3 className="fv-name">
        EVIBE <span style={{ color: HEX[t.color] }}>{NAME[t.id].replace('EVIBE ', '')}</span>
      </h3>
      <p className="fv-tag">{t.tagline}</p>
      <p className="fv-lead">{t.lead}</p>
      <ul className="fv-feats">
        {t.features.map((f) => (
          <li key={f}>
            <span style={{ color: HEX[t.color] }} aria-hidden="true">
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>
      <TLink className="btn btn--ghost fv-cta" to={`/franchise#${t.id}`}>
        <span className="btn-label">Explore {NAME[t.id]} →</span>
      </TLink>
    </div>
  );
}

export default function FormatsVisual() {
  const root = useRef(null);
  const [idx, setIdx] = useState(0);
  const [stack] = useState(() => prefersReducedMotion() || isMobileWidth());
  useGsap(
    () => {
      if (stack) return;
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (s) => {
          setIdx(Math.min(2, Math.floor(s.progress * 3 * 0.999)));
          root.current.style.setProperty('--fvp', s.progress.toFixed(3));
        },
      });
    },
    [],
    root,
  );
  const jump = (i) => () => {
    const el = root.current;
    const y = el.offsetTop + (el.offsetHeight - window.innerHeight) * ((i + 0.5) / 3);
    const l = getLenis();
    l ? l.scrollTo(y, { duration: 1.2 }) : window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const head = (
    <header className="fv-head">
      <p className="eyebrow">Three formats · one ecosystem</p>
      <h2 className="display-sm">From a compact charging stop to the ultimate electric destination.</h2>
    </header>
  );

  if (stack) {
    return (
      <section className="fv fv--stack section" data-theme="dark" aria-label="EVIBE formats">
        <div className="wrap">
          {head}
          {T.map((t, i) => (
            <article className={`fv-item fv--${t.color}`} key={t.id} id={`fmt-${t.id}`}>
              <div className="fv-art">
                <Art tier={t} />
              </div>
              <Info t={t} i={i} />
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="fv fv--pin" ref={root} data-theme="dark" aria-label="EVIBE formats">
      <div className="fv-sticky">
        <div className="wrap fv-grid">
          <div className="fv-left">
            {head}
            <div className="fv-tabs" role="tablist" aria-label="Formats">
              {T.map((t, i) => (
                <button key={t.id} type="button" role="tab" aria-selected={i === idx} className={`fv-tab ${i === idx ? 'is-on' : ''}`} style={{ '--c': HEX[t.color] }} onClick={jump(i)}>
                  <span>0{i + 1}</span> {NAME[t.id].replace('EVIBE ', '')}
                </button>
              ))}
            </div>
            <div className="fv-info-wrap" key={T[idx].id}>
              <Info t={T[idx]} i={idx} />
            </div>
          </div>
          <div className="fv-stage">
            {T.map((t, i) => (
              <div className={`fv-art ${i === idx ? 'is-on' : ''}`} key={t.id} aria-hidden={i !== idx}>
                <Art tier={t} />
              </div>
            ))}
            <div className="fv-progress" aria-hidden="true">
              <i />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
