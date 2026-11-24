import { useRef } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { TLink } from '../lib/transition';
import Picture from '../components/Picture';

// Pinned "zoom into the picture": a small card grows to full bleed while the
// headline splits apart around it, then the CTA rises.
export default function GalleryTeaser() {
  const root = useRef(null);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=150%', pin: '.gt-pin', scrub: 0.8 },
      });
      tl.fromTo('.gt-frame', { clipPath: 'inset(28% 34% 28% 34% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut' }, 0)
        .fromTo('.gt-frame img', { scale: 1.35 }, { scale: 1, ease: 'power2.inOut' }, 0)
        .to('.gt-word--l', { xPercent: -70, opacity: 0, ease: 'power2.in' }, 0)
        .to('.gt-word--r', { xPercent: 70, opacity: 0, ease: 'power2.in' }, 0)
        .fromTo('.gt-shade', { opacity: 0 }, { opacity: 1 }, 0.55)
        .fromTo('.gt-cta > *', { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08 }, 0.65);
    },
    [],
    root,
  );
  return (
    <section className="gt" ref={root} data-theme="dark" aria-labelledby="gt-title">
      <div className="gt-pin">
        <div className="gt-frame">
          <Picture name="charge-06" alt="Electric car with headlights on at dusk" sizes="100vw" />
          <div className="gt-shade" />
        </div>
        <h2 className="gt-words" aria-hidden="true">
          <span className="gt-word gt-word--l">Our</span>
          <span className="gt-word gt-word--r">work</span>
        </h2>
        <div className="gt-cta wrap">
          <p className="eyebrow">Gallery</p>
          <p className="gt-title" id="gt-title">
            Where the charge happens.
          </p>
          <TLink to="/gallery" className="btn btn--primary">
            <span className="btn-label">View the gallery</span>
          </TLink>
        </div>
      </div>
    </section>
  );
}
