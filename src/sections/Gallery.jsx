import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { stopScroll, resumeScroll } from '../lib/scroll';
import { gallery, galleryTags } from '../content';
import { ScrollTrigger } from '../lib/scroll';
import Picture from '../components/Picture';

// Direction-aware hover: the caption slides in from the edge the cursor entered.
function edge(e, el) {
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
  const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
  return Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : y > 0 ? 'bottom' : 'top';
}
const FROM = { top: { yPercent: -100, xPercent: 0 }, bottom: { yPercent: 100, xPercent: 0 }, left: { xPercent: -100, yPercent: 0 }, right: { xPercent: 100, yPercent: 0 } };

export default function Gallery({ filterable = false }) {
  const root = useRef(null);
  const [open, setOpen] = useState(-1);
  const [tag, setTag] = useState('All');
  useEffect(() => {
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [tag]);
  const dialog = useRef(null);
  const lastFocus = useRef(null);

  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        '.gl-grid',
        { rotateX: 22, yPercent: 8, scale: 0.9, transformPerspective: 1400, transformOrigin: '50% 0%' },
        { rotateX: 0, yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 15%', scrub: true } },
      );
      gsap.utils.toArray('.gl-item').forEach((it, i) => {
        gsap.fromTo(it, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out', delay: (i % 3) * 0.08, scrollTrigger: { trigger: it, start: 'top 92%' } });
        gsap.fromTo(it.querySelector('img'), { scale: 1.35 }, { scale: 1, duration: 1.8, ease: 'expo.out', delay: (i % 3) * 0.08, scrollTrigger: { trigger: it, start: 'top 92%' } });
      });
      const mm = gsap.matchMedia();
      mm.add('(min-width: 900px)', () => {
        gsap.utils.toArray('.gl-col').forEach((col, i) => {
          gsap.fromTo(col, { y: [60, -40, 120][i] }, { y: [-60, 40, -120][i], ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      });
      gsap.from('.gl-head .line-in', { yPercent: 110, stagger: 0.08, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.gl-head', start: 'top 80%' } });
    },
    [],
    root,
  );

  const enter = (e) => {
    const cap = e.currentTarget.querySelector('.gl-cap');
    gsap.fromTo(cap, FROM[edge(e, e.currentTarget)], { xPercent: 0, yPercent: 0, duration: 0.5, ease: 'power3.out', overwrite: true });
  };
  const leave = (e) => {
    const cap = e.currentTarget.querySelector('.gl-cap');
    gsap.to(cap, { ...FROM[edge(e, e.currentTarget)], duration: 0.45, ease: 'power3.in', overwrite: true });
  };

  const show = (i) => (e) => {
    lastFocus.current = e.currentTarget;
    setOpen(i);
  };
  const close = useCallback(() => {
    setOpen(-1);
    lastFocus.current?.focus();
  }, []);
  const step = useCallback((d) => setOpen((o) => (o + d + gallery.length) % gallery.length), []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open >= 0) {
      if (!d.open) d.showModal();
      stopScroll();
    } else if (d.open) {
      d.close();
      resumeScroll();
    }
  }, [open]);

  useEffect(() => {
    if (open < 0) return;
    const key = (e) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [open, step]);

  // Columns for desktop masonry; on mobile CSS collapses them.
  const cols = [[], [], []];
  gallery.forEach((g, i) => cols[i % 3].push({ ...g, i }));

  return (
    <section id="gallery" className="gallery section" data-theme="dark" ref={root} aria-labelledby="gallery-title">
      <div className="wrap">
        <header className="gl-head">
          <p className="eyebrow">Gallery</p>
          <h2 className="display" id="gallery-title" aria-label="Where the charge happens.">
            {['Where the', 'charge happens.'].map((l) => (
              <span className="line" key={l} aria-hidden="true">
                <span className="line-in">{l}</span>
              </span>
            ))}
          </h2>
        </header>
        {filterable && (
          <div className="gl-filters" role="group" aria-label="Filter gallery">
            {galleryTags.map((t) => (
              <button type="button" key={t} className={`chip ${tag === t ? 'is-active' : ''}`} aria-pressed={tag === t} onClick={() => setTag(t)}>
                {t}
                <sup>{t === 'All' ? gallery.length : gallery.filter((g) => g.tag === t).length}</sup>
              </button>
            ))}
          </div>
        )}
        <div className="gl-grid">
          {cols.map((col, ci) => (
            <div className="gl-col" key={ci}>
              {col.map((g) => (
                <button
                  type="button"
                  key={g.img}
                  className={`gl-item gl-item--${g.span} ${tag !== 'All' && g.tag !== tag ? 'is-filtered' : ''}`}
                  onClick={show(g.i)}
                  onPointerEnter={enter}
                  onPointerLeave={leave}
                  data-cursor="view"
                  data-cursor-label="View"
                  aria-label={`Open image: ${g.alt}`}
                >
                  <Picture name={g.img} alt={g.alt} sizes="(max-width: 900px) 50vw, 33vw" />
                  <span className="gl-cap" aria-hidden="true">
                    <span>{g.alt}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <dialog ref={dialog} className="lightbox" onClose={() => open >= 0 && close()} onClick={(e) => e.target === dialog.current && close()} aria-label="Image viewer">
        {open >= 0 && (
          <figure>
            <Picture name={gallery[open].img} alt={gallery[open].alt} sizes="90vw" eager />
            <figcaption>
              <span>
                {String(open + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
              </span>
              {gallery[open].alt}
            </figcaption>
          </figure>
        )}
        <button type="button" className="lb-btn lb-close" onClick={close} aria-label="Close image viewer">
          ✕
        </button>
        <button type="button" className="lb-btn lb-prev" onClick={() => step(-1)} aria-label="Previous image">
          ←
        </button>
        <button type="button" className="lb-btn lb-next" onClick={() => step(1)} aria-label="Next image">
          →
        </button>
      </dialog>
    </section>
  );
}
