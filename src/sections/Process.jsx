import { useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { process } from '../content';

// Tall section with a sticky stage. The charger (in the 3D layer) comes apart
// as the steps advance; the step text swaps with masked reveals.
export default function Process() {
  const root = useRef(null);
  const [step, setStep] = useState(0);

  useGsap(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (s) => {
          setStep(Math.min(process.length - 1, Math.floor(s.progress * process.length * 0.999)));
          gsap.set('.pr-progress span', { scaleY: s.progress });
        },
      });
      gsap.fromTo('.pr-bg-no', { yPercent: 20 }, { yPercent: -20, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from('.pr-head > *', { y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 60%' } });
    },
    [],
    root,
  );

  return (
    <section id="process" className="process" data-theme="deep" ref={root} aria-labelledby="process-title" style={{ '--steps': process.length }}>
      <div className="pr-sticky">
        <span className="pr-bg-no" aria-hidden="true">
          {process[step].no}
        </span>
        <div className="wrap pr-layout">
          <div className="pr-spacer" aria-hidden="true" />
          <div className="pr-panel">
            <div className="pr-head">
              <p className="eyebrow">How it works</p>
              <h2 id="process-title" className="pr-title">
                From empty bay to <em>first charge.</em>
              </h2>
            </div>
            <ol className="pr-steps">
              {process.map((p, i) => (
                <li key={p.no} className={`pr-step ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`} aria-current={i === step ? 'step' : undefined}>
                  <span className="pr-step-no">{p.no}</span>
                  <div className="pr-step-body">
                    <h3>{p.title}</h3>
                    <div className="pr-step-text">
                      <p>{p.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="pr-progress" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}
