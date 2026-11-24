import PageShell from '../components/PageShell';
import Story from '../story/Story';
import Marquee from '../sections/Marquee';
import Services from '../sections/Services';
import ProcessGraphic from '../sections/ProcessGraphic';
import Impact from '../sections/Impact';
import GalleryTeaser from '../sections/GalleryTeaser';
import Testimonials from '../sections/Testimonials';
import CtaBand from '../sections/CtaBand';

// The film first, then the company: services (sideways), the process drawing
// itself, numbers on a light stage, the zoom-into-our-work moment, voices, CTA.
export default function Home({ tier, onSceneReady }) {
  return (
    <PageShell path="/">
      <Story tier={tier} onReady={onSceneReady} />
      <Marquee />
      <Services />
      <ProcessGraphic />
      <Impact />
      <GalleryTeaser />
      <Testimonials />
      <CtaBand />
    </PageShell>
  );
}
