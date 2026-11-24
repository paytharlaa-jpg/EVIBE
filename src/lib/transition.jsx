import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap, ScrollTrigger, getLenis, stopScroll, resumeScroll } from './scroll';
import { prefersReducedMotion } from './device';
import { pages } from '../content';

// Page transitions: three brand blades sweep in, the next page's name flashes
// in the middle, the route changes behind the curtain, then the blades sweep out.
const Ctx = createContext({ go: () => {}, busy: false });
export const useTransition = () => useContext(Ctx);

export function TransitionProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const overlay = useRef(null);
  const label = useRef(null);
  const busy = useRef(false);
  const pendingReveal = useRef(false);
  const [title, setTitle] = useState('');

  const go = useCallback(
    (to) => {
      const [path, hash] = to.split('#');
      if (busy.current) return;
      if (path === location.pathname || (path === '' && hash)) {
        if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
        else getLenis() ? getLenis().scrollTo(0, { duration: 1.4 }) : window.scrollTo(0, 0);
        return;
      }
      busy.current = true;
      setTitle(pages.find((p) => p.path === path)?.label || '');
      stopScroll();
      const reduced = prefersReducedMotion();
      const el = overlay.current;
      gsap.set(el, { visibility: 'visible' });
      const tl = gsap.timeline({
        onComplete: () => {
          pendingReveal.current = true;
          navigate(to);
        },
      });
      if (reduced) {
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.25 });
        return;
      }
      gsap.set(el, { opacity: 1 });
      tl.fromTo(el.querySelectorAll('.pt-blade'), { xPercent: -130, skewX: -18 }, { xPercent: 0, skewX: -18, duration: 0.75, stagger: 0.08, ease: 'expo.inOut' })
        .fromTo(label.current, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, ease: 'expo.out' }, 0.62)
        .to({}, { duration: 0.15 });
    },
    [location.pathname, navigate],
  );

  // After the new route has rendered: jump to top, refresh triggers, reveal.
  useLayoutEffect(() => {
    if (!pendingReveal.current) return;
    pendingReveal.current = false;
    const lenis = getLenis();
    lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0);
    window.scrollTo(0, 0);
    const el = overlay.current;
    const reduced = prefersReducedMotion();
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(el, { visibility: 'hidden' });
          busy.current = false;
          resumeScroll();
          const hash = location.hash.slice(1);
          if (hash) document.getElementById(hash)?.scrollIntoView();
        },
      });
      if (reduced) {
        tl.to(el, { opacity: 0, duration: 0.25 });
        return;
      }
      tl.to(label.current, { yPercent: -120, opacity: 0, duration: 0.45, ease: 'expo.in' })
        .to(el.querySelectorAll('.pt-blade'), { xPercent: 130, duration: 0.8, stagger: 0.07, ease: 'expo.inOut' }, 0.15);
    });
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Browser back/forward: no curtain, just reset scroll + triggers.
  useEffect(() => {
    const onPop = () => requestAnimationFrame(() => ScrollTrigger.refresh());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <Ctx.Provider value={{ go }}>
      {children}
      <div className="pt" ref={overlay} aria-hidden="true">
        <span className="pt-blade pt-blade--1" />
        <span className="pt-blade pt-blade--2" />
        <span className="pt-blade pt-blade--3" />
        <span className="pt-label" ref={label}>
          {title}
        </span>
      </div>
    </Ctx.Provider>
  );
}

/** Internal link that plays the page transition. */
export function TLink({ to, children, onClick, ...rest }) {
  const { go } = useTransition();
  return (
    <a
      href={to}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onClick?.(e);
        go(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
