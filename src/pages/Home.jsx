import PageShell from '../components/PageShell';
import Story from '../story/Story';
import IntroPillars from '../sections/IntroPillars';
import Ecosystem from '../sections/Ecosystem';
import Services from '../sections/Services';
import ProcessGraphic from '../sections/ProcessGraphic';
import Impact from '../sections/Impact';
import FranchiseTeaser from '../sections/FranchiseTeaser';
import GalleryTeaser from '../sections/GalleryTeaser';
import CtaBand from '../sections/CtaBand';

// The film first, then the company: the ecosystem promise and its four pillars,
// the rotating lifecycle, solutions by location (sideways), the coordinated
// process drawing itself, why EVIBE, franchise formats, our work, enquiry.
export default function Home({ tier, onSceneReady }) {
  return (
    <PageShell path="/">
      <Story tier={tier} onReady={onSceneReady} />
      <IntroPillars />
      <Ecosystem />
      <Services />
      <ProcessGraphic />
      <Impact />
      <FranchiseTeaser />
      <GalleryTeaser />
      <CtaBand />
    </PageShell>
  );
}
