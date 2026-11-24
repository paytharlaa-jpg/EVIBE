import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { testimonials } from '../content';

const AUTOPLAY = 7000;

export default function Testimonials() {
  const root = useRef(null);
  const quote = useRef(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const first = useRef(true);

  // Section entry: navy expands out of a circle over the light gallery.
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        '.ts-mask',
        { clipPath: 'circle(8% at 50% 60%)' },
        { clipPath: 'circle(85% at 50% 50%)', ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 95%', end: 'top 10%', scrub: true } },
      );
      gsap.from('.ts-mark', { scale: 0.4, rotate: -20, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 50%' } });
    },
    [],
    root,
  );

  // Word-by-word reveal on every change.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (prefersReducedMotion() || !quote.current) return;
    gsap.fromTo(
      quote.current.querySelectorAll('.tw'),
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.018, ease: 'expo.out' },
    );
  }, [i]);

  useEffect(() => {
    if (paused || prefersReducedMotion()) return;
    const t = setTimeout(() => setI((v) => (v + 1) % testimonials.length), AUTOPLAY);
    return () => clearTimeout(t);
  }, [i, paused]);

  const t = testimonials[i];
  return (
    <section
      id="testimonials"
      className="testimonials section"
      data-theme="dark"
      ref={root}
      aria-labelledby="testimonials-title"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="ts-mask" aria-hidden="true" />
      <div className="wrap ts-inner">
        <div className="ts-top">
          <p className="eyebrow" id="testimonials-title">
            Testimonials
          </p>
          <div className="ts-controls">
            <button type="button" className="round-btn" onClick={() => setI((v) => (v - 1 + testimonials.length) % testimonials.length)} aria-label="Previous testimonial">
              ←
            </button>
            <button type="button" className="round-btn" onClick={() => setI((v) => (v + 1) % testimonials.length)} aria-label="Next testimonial">
              →
            </button>
          </div>
        </div>
        <svg className="ts-mark" viewBox="0 0 64 48" aria-hidden="true">
          <path d="M0 48V27Q0 9 18 0l4 6Q12 12 12 22h12v26zm36 0V27q0-18 18-27l4 6q-10 6-10 16h12v26z" fill="currentColor" />
        </svg>
        <figure className="ts-figure" aria-live="polite">
          <blockquote ref={quote} className="ts-quote" key={i}>
            {t.quote.split(' ').map((w, k) => (
              <span key={k}>
                <span className="tw-wrap">
                  <span className="tw">{w}</span>
                </span>{' '}
              </span>
            ))}
          </blockquote>
          <figcaption className="ts-cite">
            <b>{t.name}</b>
            <span>{t.place}</span>
          </figcaption>
        </figure>
        <div className="ts-dots" role="tablist" aria-label="Choose testimonial">
          {testimonials.map((q, k) => (
            <button
              type="button"
              role="tab"
              key={q.name}
              aria-selected={k === i}
              aria-label={`Testimonial ${k + 1}`}
              className={`ts-dot ${k === i ? 'is-active' : ''} ${paused ? 'is-paused' : ''}`}
              onClick={() => setI(k)}
              style={{ '--dur': `${AUTOPLAY}ms` }}
            >
              <span />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
