import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../lib/scroll';
import { prefersReducedMotion } from '../lib/device';
import { createSfx } from '../lib/sfx';
import { setIntroMoving } from '../lib/intro';
import wordmarkRaw from '../assets/wordmark.svg?raw';

// Cinematic intro with a Hollywood-trailer sound design (sound ON by default).
// 1) Pre-roll: a calm, still screen while the site prepares its 3D (max 4 s),
//    so the trailer never stutters.
// 2) Trailer: riser → BRAAM on the flash → blades whoosh in and land on thuds →
//    letters tick → power surge + crack on the bolt → tension drone with a
//    heartbeat while the counter fills → reverse swell and final hit as the
//    camera punches through.
// Browsers hold audio until the first click/tap/key; sound starts from there.
// Only transforms and opacity are animated (no blur filters).
const BLADES = [
  { d: 'M402.461 74.815 C396.146 102.841 379.865 132.912 356.447 132.912 L204.724 132.912 C168.054 132.912 133.365 142.571 117.121 163.778 C127.835 117.589 155.898 74.815 189.721 74.815 L402.461 74.815 Z', g: ['#05E1C7', '#04CCB7', '#119C88'] },
  { d: 'M360.877 151.171 C354.011 180.386 337.529 205.255 312.393 205.255 L185.062 205.255 C149.838 205.255 114.939 212.947 98.134 231.839 C109.143 188.055 142.436 151.171 172.377 151.171 L360.877 151.171 Z', g: ['#0A82FF', '#0770F6', '#1846C6'] },
  { d: 'M370.067 223.055 C360.406 250.639 346.488 279.709 323.141 279.709 L82.578 279.709 C100.783 238.946 130.092 223.055 159.782 223.055 L370.067 223.055 Z', g: ['#FFFFFF', '#EEF2F8', '#DCE4F0'] },
];
const TAG = 'Elevating the Electric Experience.';
const HOLD_AT = 3.15; // seconds into the trailer when everything stands still
const PREROLL_MAX = 4000;

function soundPref() {
  try {
    return localStorage.getItem('evibe-sound') !== 'off';
  } catch {
    return true;
  }
}

export default function Loader({ ready, onDone }) {
  const root = useRef(null);
  const wm = useRef(null);
  const pctEl = useRef(null);
  const barEl = useRef(null);
  const labelEl = useRef(null);
  const counter = useRef({ v: 0 });
  const fx = useRef(null);
  const drone = useRef(null);
  const holding = useRef(false);
  const [phase, setPhase] = useState('preroll'); // preroll → trailer
  const [introDone, setIntroDone] = useState(false);
  const [sound, setSound] = useState(() => soundPref()); // the visitor's choice
  const [audible, setAudible] = useState(false); // browser actually playing
  const [hasAudio, setHasAudio] = useState(false);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  const paint = () => {
    const v = Math.round(counter.current.v);
    if (pctEl.current) pctEl.current.textContent = String(v).padStart(3, '0');
    if (barEl.current) barEl.current.style.transform = `scaleX(${v / 100})`;
    if (labelEl.current) labelEl.current.textContent = v < 100 ? 'Charging the experience' : 'Ready';
    root.current?.setAttribute('aria-label', `Loading EVIBE, ${v} percent`);
    drone.current?.set(v / 100);
  };

  // Audio: created at once (sound on by default). If the browser holds it,
  // the first click / tap / key anywhere unlocks it.
  useEffect(() => {
    const s = createSfx();
    fx.current = s;
    if (!s) return;
    setHasAudio(true);
    s.setMuted(!soundPref());
    const sync = () => setAudible(s.ctx.state === 'running');
    s.ctx.addEventListener?.('statechange', sync);
    sync();
    const unlock = () => {
      s.unlock();
      // late unlock during the hold: bring in the tension drone
      setTimeout(() => {
        if (holding.current && !drone.current && s.running) drone.current = s.drone();
      }, 60);
    };
    const evs = ['pointerdown', 'keydown', 'touchstart'];
    evs.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
    return () => {
      evs.forEach((e) => window.removeEventListener(e, unlock));
      s.ctx.removeEventListener?.('statechange', sync);
    };
  }, []);

  // Pre-roll: hold still until the 3D is prepared (or the safety limit).
  useEffect(() => {
    if (phase !== 'preroll') return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.ld2-meta', { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.2 });
      gsap.to(counter.current, { v: 8, duration: 2.5, ease: 'power1.out', onUpdate: paint });
    }, root);
    let gone = false;
    const go = () => {
      if (gone) return;
      gone = true;
      setPhase('trailer');
    };
    if (ready) go();
    const t = setTimeout(go, PREROLL_MAX);
    return () => {
      clearTimeout(t);
      ctx.kill();
    };
  }, [phase, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trailer (layout effect: initial states set before the first paint)
  useLayoutEffect(() => {
    if (phase !== 'trailer') return;
    const parts = [...wm.current.querySelectorAll('path')];
    const names = ['cable', 'l', 'l', 'l', 'l', 'plug', 'pill', 'panel', 'bolt'];
    parts.forEach((p, i) => p.classList.add(`wm-${names[i]}`));
    const cable = wm.current.querySelector('.wm-cable');
    const len = cable.getTotalLength();
    const reduced = prefersReducedMotion();
    const s = fx.current;
    const cue = (fn) => () => s && fn(s);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIntroMoving(false);
          setIntroDone(true);
        },
      });
      const count = (to, d, at) => tl.to(counter.current, { v: to, duration: d, ease: 'power1.inOut', onUpdate: paint }, at);
      if (reduced) {
        gsap.set('.ld2-blade, .ld2-word, .ld2-tag .tch, .ld2-meta', { opacity: 1 });
        tl.call(cue((f) => f.hit(0.6)), null, 0);
        count(90, 0.4, 0);
        return;
      }
      setIntroMoving(true);
      gsap.set(cable, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set('.wm-l, .wm-plug, .wm-pill, .wm-panel, .wm-bolt', { opacity: 0 });
      tl.call(cue((f) => f.riser(0.72)), null, 0)
        .fromTo('.ld2-streak', { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.7, ease: 'expo.in' }, 0)
        .fromTo('.ld2-spark', { x: 0, opacity: 1 }, { x: () => window.innerWidth / 2, duration: 0.7, ease: 'expo.in' }, 0)
        .call(cue((f) => f.hit(1)), null, 0.7)
        .to('.ld2-flash', { opacity: 1, scale: 1, duration: 0.08 }, 0.7)
        .to('.ld2-flash', { opacity: 0, scale: 2.4, duration: 0.9, ease: 'expo.out' }, 0.78)
        .to('.ld2-streak, .ld2-spark', { opacity: 0, duration: 0.5 }, 0.75)
        .set('.ld2-streak, .ld2-spark', { autoAlpha: 0 }, 1.3)
        .fromTo(
          '.ld2-blade',
          { x: (i) => [-900, 900, -700][i], z: -1600, rotateY: (i) => [55, -55, 40][i], rotateZ: (i) => [-8, 8, -4][i], skewX: (i) => [-25, 25, -20][i], opacity: 0 },
          { x: 0, z: 0, rotateY: 0, rotateZ: 0, skewX: 0, opacity: 1, duration: 1.25, stagger: 0.12, ease: 'expo.out' },
          0.72,
        )
        .call(cue((f) => f.whooshHit(-0.8, 0.8)), null, 0.78)
        .call(cue((f) => f.whooshHit(0.8, 0.9)), null, 0.9)
        .call(cue((f) => f.whooshHit(-0.4, 1.05)), null, 1.02)
        .fromTo('.ld2-lens', { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.25, ease: 'power2.out' }, 1.55)
        .to('.ld2-lens', { opacity: 0, scaleX: 1.6, duration: 0.8, ease: 'power2.out' }, 1.8)
        .fromTo('.wm-l', { y: 140, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease: 'expo.out' }, 1.65);
      [0, 1, 2, 3].forEach((i) => tl.call(cue((f) => f.tick(-0.6 + i * 0.4, i)), null, 1.74 + i * 0.07));
      tl.fromTo(['.wm-plug', '.wm-panel'], { scale: 0.2, transformOrigin: '50% 100%', opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(2)' }, 1.95)
        .call(cue((f) => f.surge(0.72)), null, 1.98)
        .to(cable, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 2.05)
        .fromTo('.wm-bolt', { opacity: 0, scale: 2.4, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.45, ease: 'expo.out' }, 2.65)
        .fromTo('.wm-pill', { opacity: 0 }, { opacity: 1, duration: 0.12, repeat: 3, yoyo: true }, 2.7)
        .set('.wm-pill', { opacity: 1 })
        .fromTo('.ld2-tag .tch', { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.018, ease: 'power3.out' }, 2.5)
        .call(() => {
          setIntroMoving(false);
          holding.current = true;
          if (s && s.running && !readyRef.current) drone.current = s.drone();
        }, null, HOLD_AT);
      count(86, 3.1, 0.2);
    }, root);
    return () => {
      ctx.revert();
      setIntroMoving(false);
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Exit once the trailer has played and the site is ready.
  useEffect(() => {
    if (!ready || !introDone) return;
    const reduced = prefersReducedMotion();
    const s = fx.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          holding.current = false;
          drone.current?.stop();
          s?.close(6);
          onDone();
        },
      });
      tl.to(counter.current, { v: 100, duration: reduced ? 0.2 : 0.5, ease: 'power2.inOut', onUpdate: paint });
      if (reduced) {
        tl.to(root.current, { opacity: 0, duration: 0.4 });
        return;
      }
      tl.call(() => {
        holding.current = false;
        drone.current?.stop(0.2);
        s?.exit();
      })
        .to('.ld2-meta, .ld2-sound', { opacity: 0, duration: 0.3 }, '+=0.15')
        .to('.ld2-brand', { scale: 9, opacity: 0, duration: 1.1, ease: 'expo.in' }, '<')
        .to('.ld2-flash', { opacity: 0.9, scale: 3, duration: 0.25, ease: 'power2.in' }, '-=0.25')
        .to('.ld2-bg', { opacity: 0, duration: 0.9, ease: 'power2.out' }, '-=0.05')
        .to('.ld2-flash', { opacity: 0, duration: 0.8 }, '<')
        .to('.ld2-bar--top', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '<0.1')
        .to('.ld2-bar--bottom', { yPercent: 100, duration: 1, ease: 'expo.inOut' }, '<');
    }, root);
    return () => ctx.revert();
  }, [ready, introDone, onDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sound button: if the browser is holding audio, this click unlocks it;
  // otherwise it toggles mute. The choice is remembered.
  const remember = (on) => {
    try {
      localStorage.setItem('evibe-sound', on ? 'on' : 'off');
    } catch {
      /* private mode */
    }
  };
  const onSound = () => {
    const s = fx.current;
    if (!s) return;
    if (!s.running) {
      s.unlock();
      s.setMuted(false);
      setSound(true);
      remember(true);
      return;
    }
    const next = !sound;
    s.setMuted(!next);
    setSound(next);
    remember(next);
  };
  const label = !sound ? 'Sound off' : audible ? 'Sound on' : 'Tap for sound';

  return (
    <div className={`ld2 ld2--${phase}`} ref={root} role="status" aria-live="polite" aria-label="Loading EVIBE">
      <div className="ld2-bg" />
      <div className="ld2-streak" aria-hidden="true" />
      <div className="ld2-spark" aria-hidden="true" />
      <div className="ld2-flash" aria-hidden="true" />
      <div className="ld2-brand" aria-hidden="true">
        <div className="ld2-mark">
          <div className="ld2-symbol">
            {BLADES.map((b, i) => (
              <svg className="ld2-blade" viewBox="61.86 54.11 361.28 246.28" key={i}>
                <defs>
                  <linearGradient id={`ldb${i}`} gradientUnits="userSpaceOnUse" x1="70" y1="0" x2="405" y2="0">
                    <stop offset="0" stopColor={b.g[0]} />
                    <stop offset="0.5" stopColor={b.g[1]} />
                    <stop offset="1" stopColor={b.g[2]} />
                  </linearGradient>
                </defs>
                <path d={b.d} fill={`url(#ldb${i})`} />
              </svg>
            ))}
            <span className="ld2-lens" />
          </div>
          <div className="ld2-word" ref={wm} dangerouslySetInnerHTML={{ __html: wordmarkRaw }} />
        </div>
        <p className="ld2-tag">
          {[...TAG].map((c, i) => (
            <span className="tch" key={i}>
              {c === ' ' ? ' ' : c}
            </span>
          ))}
        </p>
      </div>
      <div className="ld2-bar ld2-bar--top" aria-hidden="true" />
      <div className="ld2-bar ld2-bar--bottom" aria-hidden="true" />
      <div className="ld2-meta" aria-hidden="true">
        <span ref={labelEl}>Charging the experience</span>
        <div className="ld2-progress">
          <span ref={barEl} style={{ transform: 'scaleX(0)' }} />
        </div>
        <b ref={pctEl}>000</b>
      </div>
      {hasAudio && (
        <button
          type="button"
          className={`ld2-sound ${audible && sound ? 'is-on' : ''} ${!audible && sound ? 'is-blocked' : ''}`}
          onClick={onSound}
          aria-pressed={sound && audible}
          aria-label={label}
        >
          <span className={`gate-eq ${audible && sound ? '' : 'is-muted'}`} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          {label}
        </button>
      )}
    </div>
  );
}
