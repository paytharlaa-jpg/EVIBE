import { lazy, Suspense, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion, detectTier } from '../lib/device';
import { enquiry } from '../content';
import PageShell from '../components/PageShell';
import PageHero from '../components/PageHero';
import Gallery from '../sections/Gallery';
import FAQ from '../sections/FAQ';
import Contact from '../sections/Contact';
import CtaBand from '../sections/CtaBand';

const ContactCharger = lazy(() => import('../three/ContactCharger'));

export function GalleryPage() {
  return (
    <PageShell path="/gallery">
      <PageHero kicker="Gallery" title={['Where the', 'charge happens.']} sub="Highway hubs, commercial premises, communities and fleets. A look at the places electric journeys refuel." variant="rings" index="06" />
      <Gallery filterable />
      <CtaBand title={['Your site could', 'be next.']} />
    </PageShell>
  );
}

export function FAQPage() {
  return (
    <PageShell path="/faq">
      <PageHero kicker="FAQ" title={['Questions,', 'answered.']} sub="EVIBE charging solutions, deployment, technology, franchise formats and landowner partnerships." variant="bars" index="07" />
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
          <PageHero compact variant="none" kicker={enquiry.kicker} title={enquiry.title} sub={enquiry.body} index="08" />
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
