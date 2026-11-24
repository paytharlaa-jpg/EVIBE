import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/scroll';
import { prefersReducedMotion } from '../lib/device';
import wordmarkRaw from '../assets/wordmark.svg?raw';

// Cinematic title sequence:
// an energy line races in → flash → the three blades fly out of depth and lock
// together → the wordmark rises letter by letter, the cable draws, the plug
// lights up → the tagline tracks in → (when ready) the camera punches through
// the logo, the letterbox opens and the film starts.
const BLADES = [
  { d: 'M402.461 74.815 C396.146 102.841 379.865 132.912 356.447 132.912 L204.724 132.912 C168.054 132.912 133.365 142.571 117.121 163.778 C127.835 117.589 155.898 74.815 189.721 74.815 L402.461 74.815 Z', g: ['#05E1C7', '#04CCB7', '#119C88'] },
  { d: 'M360.877 151.171 C354.011 180.386 337.529 205.255 312.393 205.255 L185.062 205.255 C149.838 205.255 114.939 212.947 98.134 231.839 C109.143 188.055 142.436 151.171 172.377 151.171 L360.877 151.171 Z', g: ['#0A82FF', '#0770F6', '#1846C6'] },
  { d: 'M370.067 223.055 C360.406 250.639 346.488 279.709 323.141 279.709 L82.578 279.709 C100.783 238.946 130.092 223.055 159.782 223.055 L370.067 223.055 Z', g: ['#FFFFFF', '#EEF2F8', '#DCE4F0'] },
];
const TAG = 'Elevating the Electric Experience.';

export default function Loader({ ready, onDone }) {
  const root = useRef(null);
  const wm = useRef(null);
  const [pct, setPct] = useState(0);
  const counter = useRef({ v: 0 });
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    // Tag the wordmark parts (order in the official SVG).
    const parts = [...wm.current.querySelectorAll('path')];
    const names = ['cable', 'l', 'l', 'l', 'l', 'plug', 'pill', 'panel', 'bolt'];
    parts.forEach((p, i) => p.classList.add(`wm-${names[i]}`));
    const cable = wm.current.querySelector('.wm-cable');
    const len = cable.getTotalLength();
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => setIntroDone(true) });
      const count = (to, d, at) => tl.to(counter.current, { v: to, duration: d, ease: 'power1.inOut', onUpdate: () => setPct(Math.round(counter.current.v)) }, at);
      if (reduced) {
        gsap.set('.ld2-blade, .ld2-word, .ld2-tag .tch', { opacity: 1 });
        count(90, 0.4, 0);
        return;
      }
      gsap.set(cable, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set('.wm-l, .wm-plug, .wm-pill, .wm-panel, .wm-bolt', { opacity: 0 });
      tl.fromTo('.ld2-streak', { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.7, ease: 'expo.in' })
        .fromTo('.ld2-spark', { left: '0%', opacity: 1 }, { left: '50%', duration: 0.7, ease: 'expo.in' }, 0)
        .to('.ld2-flash', { opacity: 1, scale: 1, duration: 0.08 }, 0.7)
        .to('.ld2-flash', { opacity: 0, scale: 2.4, duration: 0.9, ease: 'expo.out' }, 0.78)
        .to('.ld2-streak, .ld2-spark', { opacity: 0, duration: 0.5 }, 0.75)
        .fromTo(
          '.ld2-blade',
          { x: (i) => [-900, 900, -700][i], z: -1600, rotateY: (i) => [55, -55, 40][i], rotateZ: (i) => [-8, 8, -4][i], opacity: 0, filter: 'blur(18px)' },
          { x: 0, z: 0, rotateY: 0, rotateZ: 0, opacity: 1, filter: 'blur(0px)', duration: 1.25, stagger: 0.12, ease: 'expo.out' },
          0.72,
        )
        .fromTo('.ld2-lens', { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.25, ease: 'power2.out' }, 1.55)
        .to('.ld2-lens', { opacity: 0, scaleX: 1.6, duration: 0.8, ease: 'power2.out' }, 1.8)
        .fromTo('.wm-l', { y: 140, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.07, ease: 'expo.out' }, 1.65)
        .fromTo(['.wm-plug', '.wm-panel'], { scale: 0.2, transformOrigin: '50% 100%', opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(2)' }, 1.95)
        .to(cable, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 2.05)
        .fromTo('.wm-bolt', { opacity: 0, scale: 2.4, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.45, ease: 'expo.out' }, 2.65)
        .fromTo('.wm-pill', { opacity: 0 }, { opacity: 1, duration: 0.12, repeat: 3, yoyo: true }, 2.7)
        .set('.wm-pill', { opacity: 1 })
        .fromTo('.ld2-tag .tch', { opacity: 0, x: 18, filter: 'blur(6px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.018, ease: 'power3.out' }, 2.5)
        .fromTo('.ld2-meta', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, 0.4);
      count(86, 3.1, 0.2);
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!ready || !introDone) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: onDone });
      tl.to(counter.current, { v: 100, duration: reduced ? 0.2 : 0.5, ease: 'power2.inOut', onUpdate: () => setPct(Math.round(counter.current.v)) });
      if (reduced) {
        tl.to(root.current, { opacity: 0, duration: 0.4 });
        return;
      }
      tl.to('.ld2-meta', { opacity: 0, duration: 0.3 }, '+=0.2')
        .to('.ld2-brand', { scale: 9, opacity: 0, filter: 'blur(14px)', duration: 1.1, ease: 'expo.in' }, '<')
        .to('.ld2-flash', { opacity: 0.9, scale: 3, duration: 0.25, ease: 'power2.in' }, '-=0.25')
        .to('.ld2-bg', { opacity: 0, duration: 0.9, ease: 'power2.out' }, '-=0.05')
        .to('.ld2-flash', { opacity: 0, duration: 0.8 }, '<')
        .to('.ld2-bar--top', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '<0.1')
        .to('.ld2-bar--bottom', { yPercent: 100, duration: 1, ease: 'expo.inOut' }, '<');
    }, root);
    return () => ctx.revert();
  }, [ready, introDone, onDone]);

  return (
    <div className="ld2" ref={root} role="status" aria-live="polite" aria-label={`Loading EVIBE, ${pct} percent`}>
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
        <span>{pct < 100 ? 'Charging the experience' : 'Ready'}</span>
        <div className="ld2-progress">
          <span style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <b>{String(pct).padStart(3, '0')}</b>
      </div>
    </div>
  );
}
