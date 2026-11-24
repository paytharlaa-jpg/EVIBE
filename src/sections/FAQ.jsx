import { useRef, useState } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { faqs, waLink } from '../content';

export default function FAQ({ searchable = false, limit }) {
  const root = useRef(null);
  const [open, setOpen] = useState(0);
  const [q, setQ] = useState('');
  const list = faqs
    .map((f, i) => ({ ...f, i }))
    .filter((f) => !q || (f.q + ' ' + f.a).toLowerCase().includes(q.toLowerCase()))
    .slice(0, limit || faqs.length);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo('.fq-item', { '--line': 0 }, { '--line': 1, duration: 1.2, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.fq-list', start: 'top 85%' } });
      gsap.from('.fq-item button', { y: 30, opacity: 0, duration: 1, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: '.fq-list', start: 'top 85%' } });
      gsap.from('.fq-side > *', { y: 40, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 70%' } });
    },
    [],
    root,
  );
  return (
    <section id="faq" className="faq section" data-theme="dark" ref={root} aria-labelledby="faq-title">
      <div className="wrap fq-grid">
        <div className="fq-side">
          <p className="eyebrow">FAQ</p>
          <h2 className="display-sm" id="faq-title">
            Questions, <em>answered.</em>
          </h2>
          <p className="fq-note">Can’t find yours? We reply on WhatsApp the same working day.</p>
          <a className="u-link" href={waLink('Hi EVIBE, I have a question about EV charging.')} target="_blank" rel="noopener">
            Ask on WhatsApp →
          </a>
        </div>
        <div className="fq-list">
          {searchable && (
            <div className="fq-search">
              <label htmlFor="fq-q" className="sr-only">
                Search questions
              </label>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input id="fq-q" type="search" placeholder="Search: load, apartment, AMC…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          )}
          {list.length === 0 && <p className="fq-empty">No matches. Ask us directly on WhatsApp.</p>}
          {list.map((f) => {
            const i = f.i;
            const isOpen = open === i;
            return (
              <div className={`fq-item ${isOpen ? 'is-open' : ''}`} key={f.q}>
                <h3>
                  <button type="button" aria-expanded={isOpen} aria-controls={`fq-a-${i}`} id={`fq-q-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                    <span className="fq-no">{String(i + 1).padStart(2, '0')}</span>
                    <span className="fq-q">{f.q}</span>
                    <span className="fq-icon" aria-hidden="true" />
                  </button>
                </h3>
                <div className="fq-a" id={`fq-a-${i}`} role="region" aria-labelledby={`fq-q-${i}`}>
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
