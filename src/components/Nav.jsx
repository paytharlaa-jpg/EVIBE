import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, ScrollTrigger, stopScroll, resumeScroll } from '../lib/scroll';
import { TLink } from '../lib/transition';
import { prefersReducedMotion } from '../lib/device';
import { company, nav, waLink } from '../content';
import Magnetic from './Magnetic';
import MotionToggle from './MotionToggle';

export default function Nav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menu = useRef(null);
  const tl = useRef(null);
  const btn = useRef(null);

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    // Hysteresis: only flip after a deliberate 24px move, so touch jitter and
    // momentum wobble never make the bar blink.
    let anchor = 0;
    let dir = 0;
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => {
        const y = s.scroll();
        if (y < 200) {
          anchor = y;
          dir = 0;
          setHidden(false);
          return;
        }
        const d = s.direction;
        if (d !== dir) {
          dir = d;
          anchor = y;
        }
        if (Math.abs(y - anchor) > 24) setHidden(d === 1);
      },
    });
    return () => st.kill();
  }, []);

  // Menu timeline: circular mask from the button, then staggered links.
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      tl.current = gsap
        .timeline({ paused: true })
        .set(menu.current, { visibility: 'visible' })
        .fromTo(
          menu.current,
          { clipPath: 'circle(0% at calc(100% - 3rem) 2.5rem)' },
          { clipPath: 'circle(150% at calc(100% - 3rem) 2.5rem)', duration: reduced ? 0.01 : 1, ease: 'expo.inOut' },
        )
        .fromTo('.menu-link .menu-link-in', { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, duration: reduced ? 0.01 : 0.9, stagger: 0.06, ease: 'expo.out' }, reduced ? 0 : 0.45)
        .fromTo('.menu-foot > *', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, reduced ? 0 : 0.7);
    }, menu);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!tl.current) return;
    if (open) {
      stopScroll();
      document.documentElement.classList.add('menu-open');
      tl.current.timeScale(1).play();
      menu.current.querySelector('a')?.focus({ preventScroll: true });
    } else {
      resumeScroll();
      document.documentElement.classList.remove('menu-open');
      tl.current.timeScale(1.6).reverse();
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        btn.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Close the menu on route change.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className={`nav ${hidden && !open ? 'is-hidden' : ''} ${open ? 'is-open' : ''}`}>
        <TLink to="/" className="nav-logo" aria-label="EVIBE home">
          <img className="logo-dark" src="/brand/EVIBE_Horizontal_no_Tagline_Reverse.svg" alt="EVIBE" width="160" height="36" />
          <img className="logo-light" src="/brand/EVIBE_Horizontal_no_Tagline_FullColour.svg" alt="" aria-hidden="true" width="160" height="36" />
        </TLink>
        <nav className="nav-inline" aria-label="Primary">
          {nav.slice(1).map((n) => (
            <TLink key={n.path} to={n.path} className={`u-link ${pathname === n.path ? 'is-active' : ''}`} aria-current={pathname === n.path ? 'page' : undefined}>
              {n.label}
            </TLink>
          ))}
        </nav>
        <div className="nav-actions">
          <Magnetic strength={0.25}>
            <TLink className="btn btn--sm btn--glow" to="/contact" data-cursor="link">
              <span className="btn-label">Enquire</span>
            </TLink>
          </Magnetic>
          <Magnetic strength={0.4}>
            <button
              ref={btn}
              className={`menu-btn ${open ? 'is-open' : ''}`}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </Magnetic>
        </div>
      </header>

      <div id="site-menu" className="menu" ref={menu} aria-hidden={!open} inert={!open}>
        <div className="menu-glow" aria-hidden="true" />
        <nav className="menu-links" aria-label="Site">
          {nav.map((n, i) => (
            <TLink key={n.path} to={n.path} className={`menu-link ${pathname === n.path ? 'is-current' : ''}`} data-cursor="link" onClick={() => setOpen(false)}>
              <span className="menu-link-in">
                <small>{String(i + 1).padStart(2, '0')}</small>
                {n.label}
              </span>
            </TLink>
          ))}
        </nav>
        <div className="menu-foot">
          <a href={company.phoneHref} className="u-link">
            {company.phone}
          </a>
          <a href={`mailto:${company.email}`} className="u-link">
            {company.email}
          </a>
          <a href={waLink()} target="_blank" rel="noopener" className="u-link">
            WhatsApp us
          </a>
          <MotionToggle />
        </div>
      </div>
    </>
  );
}
