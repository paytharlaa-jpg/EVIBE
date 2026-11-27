import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion, isMobileWidth } from '../lib/device';
import { useStarted } from '../lib/started';
import { payment, waLink } from '../content';
import PageShell from '../components/PageShell';
import Magnetic from '../components/Magnetic';
import CtaBand from '../sections/CtaBand';
import { TLink } from '../lib/transition';

// Payment process: the 7-step WhatsApp charging journey, shown as phone screens.
const P = payment;

const ICON = {
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />,
  shield: <path d="M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6Z M9 12l2 2 4-4" />,
  live: <path d="M12 12h.01M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8" />,
  refund: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4M12 8v1.5M12 15v1.5" />,
  app: <path d="M7 3h10v18H7z M3 3l18 18" />,
  coins: <path d="M8 7a5 2 0 1 0 10 0a5 2 0 1 0-10 0M8 7v4c0 1.1 2.2 2 5 2s5-.9 5-2V7M6 13c0 1.1 2.2 2 5 2M6 13v4c0 1.1 2.2 2 5 2s5-.9 5-2" />,
};
const Ic = ({ d, size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

// ── phone screens (illustrative) ───────────────────────────────
function Chat({ children }) {
  return (
    <>
      <div className="pc-chat-top">
        <span className="pc-ava">E</span>
        <span>
          EVIBE Charging <i aria-hidden="true">✓</i>
        </span>
      </div>
      <div className="pc-chat-body">{children}</div>
    </>
  );
}

function Screen({ id }) {
  switch (id) {
    case 'scan':
      return (
        <div className="pc-scr pc-scan">
          <div className="pc-charger">
            <span className="pc-brand">EVIBE</span>
            <div className="pc-qr" aria-hidden="true">
              {Array.from({ length: 49 }, (_, i) => (
                <i key={i} className={(i * 7 + (i % 5)) % 3 ? 'on' : ''} />
              ))}
            </div>
            <span className="pc-scanline" />
          </div>
          <p className="pc-hint">Point your camera at the QR</p>
        </div>
      );
    case 'details':
      return (
        <div className="pc-scr">
          <Chat>
            <div className="pc-bubble">
              <b>Welcome to EVIBE Charging</b>
              <dl>
                <div>
                  <dt>Station</dt>
                  <dd>EVIBE Hub</dd>
                </div>
                <div>
                  <dt>Charger</dt>
                  <dd>Gun A</dd>
                </div>
                <div>
                  <dt>Connector</dt>
                  <dd>CCS2</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd className="ok">Available</dd>
                </div>
              </dl>
            </div>
            <span className="pc-btn">Pay & Start Charging</span>
          </Chat>
        </div>
      );
    case 'amount':
      return (
        <div className="pc-scr">
          <Chat>
            <div className="pc-bubble">
              <b>Select charging amount</b>
              <div className="pc-chips">
                {['₹100', '₹200', '₹500', '₹1,000'].map((a, i) => (
                  <span key={a} className={i === 1 ? 'is-on' : ''}>
                    {a}
                  </span>
                ))}
              </div>
              <p className="pc-or">or enter amount / energy</p>
              <span className="pc-input">₹ 200.00</span>
            </div>
          </Chat>
        </div>
      );
    case 'pay':
      return (
        <div className="pc-scr pc-paysheet">
          <p className="pc-sheet-title">Secure checkout</p>
          <p className="pc-amt">₹200.00</p>
          {['UPI apps', 'Debit / credit card', 'Other options'].map((o) => (
            <span key={o} className="pc-opt">
              {o} <i aria-hidden="true">›</i>
            </span>
          ))}
          <span className="pc-btn pc-btn--lock">🔒 Pay ₹200.00</span>
        </div>
      );
    case 'start':
      return (
        <div className="pc-scr pc-center">
          <span className="pc-check" aria-hidden="true">
            ✓
          </span>
          <b className="pc-big">Charging started</b>
          <dl className="pc-kv">
            <div>
              <dt>Amount</dt>
              <dd>₹200.00</dd>
            </div>
            <div>
              <dt>Est. energy</dt>
              <dd>8.5 kWh</dd>
            </div>
          </dl>
        </div>
      );
    case 'track':
      return (
        <div className="pc-scr pc-center">
          <p className="pc-sheet-title">Live charging</p>
          <div className="pc-ring" aria-hidden="true">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" className="bg" />
              <circle cx="50" cy="50" r="42" className="fg" pathLength="100" />
            </svg>
            <b>68%</b>
          </div>
          <dl className="pc-kv">
            <div>
              <dt>Energy</dt>
              <dd>5.82 kWh</dd>
            </div>
            <div>
              <dt>Amount used</dt>
              <dd>₹137.20</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>00:06:24</dd>
            </div>
          </dl>
          <div className="pc-row">
            <span className="pc-btn pc-btn--ghost">Top up</span>
            <span className="pc-btn pc-btn--stop">Stop</span>
          </div>
        </div>
      );
    default:
      return (
        <div className="pc-scr pc-center">
          <span className="pc-check" aria-hidden="true">
            ✓
          </span>
          <b className="pc-big">Charging complete</b>
          <dl className="pc-kv">
            <div>
              <dt>Paid</dt>
              <dd>₹200.00</dd>
            </div>
            <div>
              <dt>Used</dt>
              <dd>₹137.20</dd>
            </div>
          </dl>
          <div className="pc-refund">
            <Ic d={ICON.refund} size={18} />
            <span>
              <b>₹62.80 refunded</b> to your original payment account
            </span>
          </div>
        </div>
      );
  }
}

function Phone({ id, active }) {
  return (
    <div className={`pc-phone ${active ? 'is-on' : ''}`}>
      <span className="pc-notch" aria-hidden="true" />
      <Screen id={id} />
    </div>
  );
}

// ── hero ──────────────────────────────────────────────────────
function Hero() {
  const root = useRef(null);
  const started = useStarted();
  useEffect(() => {
    const el = root.current;
    if (!started || prefersReducedMotion()) {
      el.classList.add('is-in');
      return;
    }
    const tl = gsap.timeline({ delay: 0.25, onStart: () => el.classList.add('is-in') });
    tl.fromTo(el.querySelectorAll('.pch-line-in'), { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: 0.1, ease: 'expo.out', clearProps: 'transform' })
      .fromTo(el.querySelectorAll('.pch-reveal'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', clearProps: 'opacity,transform' }, 0.4)
      .fromTo(el.querySelector('.pch-visual'), { opacity: 0, y: 60, rotate: 4 }, { opacity: 1, y: 0, rotate: 0, duration: 1.4, ease: 'expo.out', clearProps: 'opacity,transform' }, 0.2);
    return () => tl.kill();
  }, [started]);
  return (
    <section className="pch" ref={root} data-theme="dark" aria-labelledby="pch-title">
      <div className="wrap pch-grid">
        <div className="pch-copy">
          <p className="pch-crumbs pch-reveal">
            <TLink to="/" className="u-link">
              Home
            </TLink>
            <span aria-hidden="true">/</span>
            <span>{P.kicker}</span>
          </p>
          <p className="eyebrow pch-reveal">{P.eyebrow}</p>
          <h1 className="pch-title" id="pch-title" aria-label={P.title.join(' ')}>
            {P.title.map((l, i) => (
              <span className={`pch-line ${i ? 'pch-line--accent' : ''}`} key={l} aria-hidden="true">
                <span className="pch-line-in">{l}</span>
              </span>
            ))}
          </h1>
          <p className="pch-body pch-reveal">{P.body}</p>
          <ul className="pch-perks pch-reveal">
            {P.perks.map((k, i) => (
              <li key={k}>
                <Ic d={[ICON.bolt, ICON.shield, ICON.live, ICON.refund][i]} size={18} />
                {k}
              </li>
            ))}
          </ul>
          <div className="pch-ctas pch-reveal">
            <Magnetic>
              <a className="btn btn--primary" href="#journey">
                <span className="btn-label">See how it works ↓</span>
              </a>
            </Magnetic>
            <a className="btn btn--ghost" href={waLink('Hi EVIBE, I would like to know more about charging through WhatsApp.')} target="_blank" rel="noopener">
              <span className="btn-label">Ask on WhatsApp</span>
            </a>
          </div>
        </div>
        <div className="pch-visual" aria-hidden="true">
          <div className="pch-glow" />
          <div className="pch-phone pch-phone--back">
            <Phone id="scan" />
          </div>
          <div className="pch-phone pch-phone--front">
            <Phone id="track" active />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── the 7-step workflow ───────────────────────────────────────
function Journey() {
  const root = useRef(null);
  const track = useRef(null);
  const [idx, setIdx] = useState(0);
  const [stack] = useState(() => prefersReducedMotion() || isMobileWidth());
  const n = P.steps.length;
  useGsap(
    () => {
      if (stack) {
        if (prefersReducedMotion()) return;
        gsap.utils.toArray('.pcj-item', root.current).forEach((el) =>
          gsap.from(el, { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }),
        );
        return;
      }
      const tr = track.current;
      const dist = () => tr.scrollWidth - tr.parentElement.clientWidth + 80;
      gsap.to(tr, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (s) => {
            setIdx(Math.min(n - 1, Math.floor(s.progress * n * 0.999)));
            root.current.style.setProperty('--pcp', s.progress.toFixed(3));
          },
        },
      });
    },
    [],
    root,
  );
  const head = (
    <header className="pcj-head">
      <p className="eyebrow">Charge on WhatsApp · 7 steps</p>
      <h2 className="display-sm">{P.flow.title}</h2>
      <p>{P.flow.body}</p>
    </header>
  );
  if (stack) {
    return (
      <section id="journey" className="pcj pcj--stack section" ref={root} data-theme="dark" aria-label="Charging journey">
        <div className="wrap">
          {head}
          <ol className="pcj-list">
            {P.steps.map((s, i) => (
              <li className="pcj-item" key={s.id}>
                <Phone id={s.id} active />
                <div className="pcj-text">
                  <span className="pcj-no">0{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="pcj-note">{P.flow.note}</p>
        </div>
      </section>
    );
  }
  return (
    <section id="journey" className="pcj pcj--pin" ref={root} data-theme="dark" aria-label="Charging journey">
      <div className="pcj-sticky">
        <div className="wrap">{head}</div>
        <div className="pcj-viewport">
          <ol className="pcj-track" ref={track}>
            {P.steps.map((s, i) => (
              <li className={`pcj-step ${i === idx ? 'is-on' : ''} ${i < idx ? 'is-done' : ''}`} key={s.id}>
                <Phone id={s.id} active={i <= idx} />
                <div className="pcj-text">
                  <span className="pcj-no">0{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
                {i < n - 1 && (
                  <span className="pcj-arrow" aria-hidden="true">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
        <div className="wrap pcj-foot">
          <div className="pcj-bar" aria-hidden="true">
            <i />
          </div>
          <p className="pcj-note">{P.flow.note}</p>
        </div>
      </div>
    </section>
  );
}

// ── refund explainer + the EVIBE difference ───────────────────
function Refund() {
  const root = useRef(null);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 70%' } });
      tl.from('.pcr-copy > *', { y: 30, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' })
        .fromTo('.pcr-used', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power3.out' }, 0.3)
        .fromTo('.pcr-back', { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.out' }, 1.2)
        .from('.pcr-arrow', { x: -20, opacity: 0, duration: 0.6 }, 1.6)
        .from('.pcd-item', { y: 30, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, 0.6);
    },
    [],
    root,
  );
  return (
    <section className="pcr section" ref={root} data-theme="deep" aria-labelledby="pcr-title">
      <div className="wrap">
        <div className="pcr-grid">
          <div className="pcr-copy">
            <span className="pcr-rupee" aria-hidden="true">
              ₹
            </span>
            <h2 className="display-sm" id="pcr-title">
              {P.refund.title}
            </h2>
            <p>{P.refund.body}</p>
          </div>
          <div className="pcr-visual" aria-label="Example: ₹200 paid, ₹137.20 used, ₹62.80 refunded">
            <p className="pcr-paid">
              Paid <b>₹200.00</b>
            </p>
            <div className="pcr-bar">
              <span className="pcr-used" style={{ width: '68.6%' }}>
                Used ₹137.20
              </span>
              <span className="pcr-back" style={{ width: '31.4%' }}>
                ₹62.80
              </span>
            </div>
            <div className="pcr-to">
              <span className="pcr-arrow" aria-hidden="true">
                ↳
              </span>
              <span>
                <b>₹62.80 refunded</b> to the original payment account
              </span>
            </div>
            <p className="pcr-eg">Illustrative example</p>
          </div>
        </div>
        <div className="pcd">
          <p className="pcd-title">The EVIBE difference</p>
          <ul>
            {P.difference.map((d, i) => (
              <li className="pcd-item" key={d}>
                <span className="pcd-ic">
                  <Ic d={[ICON.app, ICON.coins, ICON.refund][i]} size={26} />
                </span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function PayChargePage() {
  useEffect(() => {
    // the horizontal track measures fonts/widths: refresh once they settle
    const id = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => clearTimeout(id);
  }, []);
  return (
    <PageShell path="/pay-and-charge" className="page-pay">
      <Hero />
      <Journey />
      <Refund />
      <CtaBand title={['No app. No hassle.', 'Just charge.']} />
    </PageShell>
  );
}
