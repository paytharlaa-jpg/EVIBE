import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, getLenis } from '../lib/scroll';
import { prefersReducedMotion, isMobileWidth } from '../lib/device';
import { S } from './state';
import { BEATS, battery, speedKmh, worldZ, STATION_Z, charging, lowAlarm, plug, range } from './timeline';
import { TLink } from '../lib/transition';
import { useStarted } from '../lib/started';
import { waLink } from '../content';
import Magnetic from '../components/Magnetic';
import Picture from '../components/Picture';

const StoryScene = lazy(() => import('./StoryScene'));

// Text cards, each alive within [from, to] of the film.
const CARDS = [
  { id: 'a', from: 0.0, to: 0.16, cls: 'sc-intro' },
  { id: 'b', from: 0.19, to: 0.32, cls: 'sc-low' },
  { id: 'c', from: 0.35, to: 0.49, cls: 'sc-arrive' },
  { id: 'd', from: 0.52, to: 0.62, cls: 'sc-plug' },
  { id: 'e', from: 0.63, to: 0.84, cls: 'sc-charge' },
  { id: 'f', from: 0.88, to: 1.01, cls: 'sc-go' },
];

const status = (p) => {
  if (p < 0.19) return ['Cruising', 'ok'];
  if (p < 0.33) return ['Low battery · find a charger', 'warn'];
  if (p < 0.5) return [`EVIBE charger · ${Math.max(0, Math.round((STATION_Z - worldZ(p)) * 1.6))} m`, 'info'];
  if (p < 0.6) return [plug(p) > 0.98 ? 'Connected' : 'Connecting…', 'info'];
  if (p < 0.84) return [`Charging · ${Math.round(48 + charging(p) * 72)} kW`, 'charge'];
  return ['Fully charged · ready to go', 'ok'];
};

function Chars({ text, base = 0 }) {
  return [...text].map((c, i) => (
    <span className="sch" style={{ '--i': base + i }} key={i} aria-hidden="true">
      {c === ' ' ? ' ' : c}
    </span>
  ));
}

export default function Story({ tier, onReady }) {
  const root = useRef(null);
  const stage = useRef(null);
  const hud = useRef({});
  const [active, setActive] = useState(true);
  const [reduced] = useState(() => prefersReducedMotion());
  const started = useStarted();
  const intro = useRef({ v: 0 });

  // The opening title plays in on its own once the loader opens.
  useEffect(() => {
    if (!started) return;
    const t = gsap.to(intro.current, { v: 1, duration: reduced ? 0.01 : 2.2, delay: 0.3, ease: 'power2.out' });
    return () => t.kill();
  }, [started, reduced]);

  // Scroll → progress
  useEffect(() => {
    S.mobile = isMobileWidth();
    if (reduced) {
      S.target = S.p = 0.72;
      return;
    }
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (s) => {
        S.target = s.progress;
      },
    });
    S.target = st.progress || 0;
    return () => st.kill();
  }, [reduced]);

  // Only render the film while it is on screen.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: '10% 0px' });
    io.observe(root.current);
    return () => io.disconnect();
  }, []);

  // DOM layer follows the eased film progress: cards, HUD, chapter rail.
  useEffect(() => {
    const el = stage.current;
    const cards = [...el.querySelectorAll('[data-card]')];
    const chapters = [...el.querySelectorAll('.sc-chap')];
    const h = {
      speed: el.querySelector('[data-hud=speed]'),
      batt: el.querySelector('[data-hud=batt]'),
      bar: el.querySelector('[data-hud=bar]'),
      range: el.querySelector('[data-hud=range]'),
      status: el.querySelector('[data-hud=status]'),
      big: el.querySelector('[data-hud=big]'),
      hudEl: el.querySelector('.sc-hud'),
    };
    let last = -1;
    let lastIntro = -1;
    const tick = () => {
      const p = reduced ? 0.72 : S.p;
      const iv = intro.current.v;
      if (Math.abs(p - last) < 0.00005 && iv === lastIntro) return;
      last = p;
      lastIntro = iv;
      el.style.setProperty('--p', p.toFixed(4));
      cards.forEach((c, i) => {
        const k = CARDS[i];
        const span = k.to - k.from;
        const inn = i === 0 ? intro.current.v : range(p, k.from, k.from + span * 0.32);
        const out = range(p, k.to - span * 0.22, k.to);
        c.style.setProperty('--in', inn.toFixed(3));
        c.style.setProperty('--out', out.toFixed(3));
        c.style.visibility = p >= k.from - 0.005 && p <= k.to + 0.005 ? 'visible' : 'hidden';
      });
      chapters.forEach((c, i) => {
        const b = BEATS[i];
        c.style.setProperty('--fill', range(p, b.from, b.to).toFixed(3));
        c.classList.toggle('is-active', p >= b.from && p < b.to);
      });
      const bat = battery(p);
      const pct = Math.round(bat * 100);
      h.speed.textContent = speedKmh(p);
      h.batt.textContent = pct;
      if (h.big) h.big.textContent = pct;
      h.bar.style.transform = `scaleX(${bat})`;
      h.range.textContent = Math.round(bat * 380);
      const [txt, tone] = status(p);
      h.status.textContent = txt;
      h.hudEl.dataset.tone = tone;
      h.hudEl.style.setProperty('--alarm', lowAlarm(p).toFixed(3));
      h.hudEl.style.setProperty('--charge', charging(p).toFixed(3));
    };
    gsap.ticker.add(tick);
    tick();
    return () => gsap.ticker.remove(tick);
  }, [reduced]);

  const jump = (b) => () => {
    const top = root.current.offsetTop;
    const span = root.current.offsetHeight - window.innerHeight;
    const y = top + span * (b.from + 0.01);
    const l = getLenis();
    l ? l.scrollTo(y, { duration: 1.6 }) : window.scrollTo(0, y);
  };

  return (
    <section id="home" className={`story ${reduced ? 'is-static' : ''}`} ref={root} data-theme="dark" aria-label="The EVIBE story: from low battery to fully charged">
      <div className="story-stage" ref={stage}>
        <div className="story-gl" aria-hidden="true">
          {tier > 0 ? (
            <Suspense fallback={null}>
              <StoryScene tier={tier} active={active && started} onReady={onReady} />
            </Suspense>
          ) : (
            <Picture name="charge-06" alt="" sizes="100vw" eager className="story-fallback" />
          )}
        </div>
        <div className="story-shade" aria-hidden="true" />
        <div className="letterbox letterbox--top" aria-hidden="true" />
        <div className="letterbox letterbox--bottom" aria-hidden="true" />

        {/* 01 · intro */}
        <div className="sc sc-intro" data-card>
          <p className="sc-kicker">
            <span className="rec" /> Somewhere on the highway · 10:42 PM
          </p>
          <h1 className="sc-title" aria-label="Every journey runs on charge.">
            <span className="sc-line">
              <Chars text="Every journey" />
            </span>
            <span className="sc-line sc-line--accent">
              <Chars text="runs on charge." base={13} />
            </span>
          </h1>
          <p className="sc-scroll" aria-hidden="true">
            <span /> Scroll to drive
          </p>
        </div>

        {/* 02 · low battery */}
        <div className="sc sc-low" data-card role="img" aria-label="Warning: battery low, 8 percent">
          <div className="sc-warn">
            <svg viewBox="0 0 48 24" aria-hidden="true">
              <rect x="1" y="3" width="40" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="43" y="9" width="4" height="6" rx="1" fill="currentColor" />
              <rect x="4" y="6" width="4" height="12" rx="1" fill="currentColor" />
            </svg>
            <span>Low battery</span>
          </div>
          <p className="sc-giant">
            <Chars text="8%" />
          </p>
          <p className="sc-sub">24 km of range left. Next charger?</p>
        </div>

        {/* 03 · arrival */}
        <div className="sc sc-arrive" data-card>
          <p className="sc-kicker">Then the road lights up</p>
          <h2 className="sc-title sc-title--md">
            <span className="sc-line">
              <Chars text="EVIBE." />
            </span>
            <span className="sc-line sc-line--accent">
              <Chars text="Right where you need it." base={6} />
            </span>
          </h2>
        </div>

        {/* 04 · plug */}
        <div className="sc sc-plug" data-card>
          <h2 className="sc-title sc-title--md">
            <span className="sc-line">
              <Chars text="Plug in." />
            </span>
          </h2>
          <p className="sc-sub">One cable. One tap. No fuss.</p>
          <p className="sc-tag">
            <i /> CCS2 · Handshake OK
          </p>
        </div>

        {/* 05 · charging */}
        <div className="sc sc-charge" data-card>
          <p className="sc-kicker">Fast DC charging</p>
          <p className="sc-counter" aria-live="off">
            <span data-hud="big">8</span>
            <small>%</small>
          </p>
          <p className="sc-sub">Built, installed and kept running by EVIBE.</p>
        </div>

        {/* 06 · go */}
        <div className="sc sc-go" data-card>
          <img className="sc-logo" src="/brand/EVIBE_Primary_with_Tagline_Reverse.svg" alt="EVIBE, Elevating the Electric Experience" width="520" height="160" />
          <div className="sc-ctas">
            <Magnetic>
              <a className="btn btn--primary" href={waLink('Hi EVIBE, I would like to book a free site survey.')} target="_blank" rel="noopener">
                <span className="btn-label">Book a free site survey</span>
              </a>
            </Magnetic>
            <TLink className="btn btn--ghost" to="/services">
              <span className="btn-label">Explore services</span>
            </TLink>
          </div>
        </div>

        {/* dashboard HUD */}
        <div className="sc-hud" data-tone="ok" aria-hidden="true">
          <div className="hud-speed">
            <b data-hud="speed">96</b>
            <span>km/h</span>
          </div>
          <div className="hud-batt">
            <div className="hud-batt-top">
              <span>Battery</span>
              <b>
                <span data-hud="batt">21</span>%
              </b>
            </div>
            <div className="hud-bar">
              <span data-hud="bar" />
            </div>
            <div className="hud-batt-bot">
              <span data-hud="status">Cruising</span>
              <span>
                <b data-hud="range">80</b> km
              </span>
            </div>
          </div>
        </div>

        {/* chapter rail */}
        <nav className="sc-chapters" aria-label="Story chapters">
          {BEATS.map((b, i) => (
            <button type="button" className="sc-chap" key={b.id} onClick={jump(b)}>
              <span className="sc-chap-no">{String(i + 1).padStart(2, '0')}</span>
              <span className="sc-chap-label">{b.label}</span>
              <span className="sc-chap-bar">
                <span />
              </span>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
