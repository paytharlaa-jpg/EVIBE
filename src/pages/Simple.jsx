import { lazy, Suspense, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion, detectTier } from '../lib/device';
import { testimonials } from '../content';
import PageShell from '../components/PageShell';
import PageHero from '../components/PageHero';
import Tilt from '../components/Tilt';
import Gallery from '../sections/Gallery';
import Testimonials from '../sections/Testimonials';
import FAQ from '../sections/FAQ';
import Contact from '../sections/Contact';
import CtaBand from '../sections/CtaBand';

const ContactCharger = lazy(() => import('../three/ContactCharger'));

export function GalleryPage() {
  return (
    <PageShell path="/gallery">
      <PageHero kicker="Gallery" title={['Where the', 'charge happens.']} sub="Public hubs, workplaces, homes and fleet depots. A look at the places electric journeys refuel." variant="rings" index="03" />
      <Gallery filterable />
      <CtaBand title={['Your site could', 'be next.']} />
    </PageShell>
  );
}

function QuoteGrid() {
  const root = useRef(null);
  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray('.qg-card').forEach((c, i) => {
        gsap.from(c, { y: 120, rotate: i % 2 ? 4 : -4, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 90%' } });
      });
    },
    [],
    root,
  );
  return (
    <section className="qg section" ref={root} data-theme="dark" aria-label="More from our customers">
      <div className="wrap qg-grid">
        {testimonials.map((t) => (
          <Tilt className="qg-card card" key={t.name} max={5}>
            <svg viewBox="0 0 64 48" width="36" aria-hidden="true">
              <path d="M0 48V27Q0 9 18 0l4 6Q12 12 12 22h12v26zm36 0V27q0-18 18-27l4 6q-10 6-10 16h12v26z" fill="currentColor" />
            </svg>
            <blockquote>{t.quote}</blockquote>
            <p>
              <b>{t.name}</b>
              <span>{t.place}</span>
            </p>
          </Tilt>
        ))}
      </div>
    </section>
  );
}

export function TestimonialsPage() {
  return (
    <PageShell path="/testimonials">
      <PageHero kicker="Testimonials" title={['Heard at', 'the plug point.']} sub="Homeowners, societies, fleets and businesses on what changed once they started charging with EVIBE." variant="circuit" index="04" />
      <Testimonials />
      <QuoteGrid />
      <CtaBand />
    </PageShell>
  );
}

export function FAQPage() {
  return (
    <PageShell path="/faq">
      <PageHero kicker="FAQ" title={['Questions,', 'answered.']} sub="Installation time, choosing a charger, electricity load, apartments, fast-charging hubs and maintenance." variant="bars" index="05" />
      <FAQ searchable />
      <CtaBand title={['Still curious?', 'Just ask us.']} />
    </PageShell>
  );
}

export function ContactPage() {
  const tier = detectTier();
  const root = useRef(null);
  const progress = useRef(0);
  const pct = useRef(null);
  const status = useRef(null);
  useGsap(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (s) => {
          progress.current = s.progress;
          const v = Math.round(5 + s.progress * 95);
          if (pct.current) pct.current.textContent = v;
          if (status.current) status.current.textContent = v >= 100 ? 'Fully charged · ready when you are' : 'Charging as you scroll';
        },
      });
    },
    [],
    root,
  );
  return (
    <PageShell path="/contact" className="page-contact">
      <section className="ctp" ref={root} data-theme="dark">
        <div className="ctp-left">
          <PageHero compact variant="none" kicker="Contact" title={['Let’s plug', 'you in.']} sub="WhatsApp, call or send the form. We reply the same working day and book a free site survey at a time that suits you." index="06" />
          <Contact bare />
        </div>
        <div className="ctp-right" aria-hidden="true">
          <div className="ctp-sticky">
            <div className="ctp-glow" />
            {tier > 0 && (
              <Suspense fallback={null}>
                <ContactCharger tier={tier} progressRef={progress} />
              </Suspense>
            )}
            <div className="ctp-meter">
              <p className="ctp-pct">
                <span ref={pct}>5</span>
                <small>%</small>
              </p>
              <p className="ctp-status" ref={status}>
                Charging as you scroll
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
