import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ScrollTrigger, startSmoothScroll, stopScroll, resumeScroll, gsap } from './lib/scroll';
import { detectTier } from './lib/device';
import { TransitionProvider } from './lib/transition';
import { StartedContext } from './lib/started';
import { waLink } from './content';
import Loader from './components/Loader';
import Nav from './components/Nav';
import Cursor from './components/Cursor';
import ScrollProgress from './components/ScrollProgress';
import Footer from './sections/Footer';
import Home from './pages/Home';
import About from './pages/About';
import ServicesPage from './pages/Services';
import { GalleryPage, FAQPage, ContactPage } from './pages/Simple';
import FranchisePage from './pages/Franchise';
import PartnerPage from './pages/Partner';
import IQPage from './pages/IQ';
import PayChargePage from './pages/PayCharge';

export default function App() {
  const { pathname } = useLocation();
  const [tier] = useState(() => detectTier());
  // Only the home page has to wait for the 3D film; other pages are ready at once.
  const [sceneReady, setSceneReady] = useState(() => pathname !== '/' || tier === 0);
  const [fontsReady, setFontsReady] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    startSmoothScroll();
    stopScroll();
    document.fonts?.ready.then(() => setFontsReady(true));
    const fallback = setTimeout(() => {
      setSceneReady(true);
      setFontsReady(true);
    }, 9000);
    return () => clearTimeout(fallback);
  }, []);

  // Keep ScrollTrigger in sync with real viewport changes.
  useEffect(() => {
    let w = window.innerWidth;
    const d = gsap.delayedCall(0.25, () => {
      if (Math.abs(window.innerWidth - w) > 1) {
        w = window.innerWidth;
        ScrollTrigger.refresh();
      }
    }).pause();
    const onResize = () => d.restart(true);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (fontsReady) ScrollTrigger.refresh();
  }, [fontsReady]);

  const onDone = useCallback(() => {
    setStarted(true);
    resumeScroll();
    document.documentElement.classList.add('is-loaded');
    ScrollTrigger.refresh();
  }, []);
  const onSceneReady = useCallback(() => setSceneReady(true), []);

  return (
    <StartedContext.Provider value={started}>
      <TransitionProvider>
        <div className="grain" aria-hidden="true" />
        {!started && <Loader ready={sceneReady && fontsReady} onDone={onDone} />}
        <Cursor />
        <Nav />
        <ScrollProgress />
        <Routes>
          <Route path="/" element={<Home tier={tier} onSceneReady={onSceneReady} />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/franchise" element={<FranchisePage />} />
          <Route path="/iq" element={<IQPage />} />
          <Route path="/pay-and-charge" element={<PayChargePage />} />
          <Route path="/partner" element={<PartnerPage />} />
          <Route path="/testimonials" element={<Navigate to="/partner" replace />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Home tier={tier} onSceneReady={onSceneReady} />} />
        </Routes>
        <Footer />
        <a className={`wa-float ${started ? 'is-in' : ''}`} href={waLink()} target="_blank" rel="noopener" aria-label="Chat with EVIBE on WhatsApp">
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"
            />
          </svg>
        </a>
      </TransitionProvider>
    </StartedContext.Provider>
  );
}
