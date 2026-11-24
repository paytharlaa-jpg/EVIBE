import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from '../lib/scroll';
import { pages } from '../content';

// Minimal progress rail on the right edge with the current page name.
export default function ScrollProgress() {
  const bar = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => {
        if (bar.current) bar.current.style.transform = `scaleY(${s.progress})`;
      },
    });
    if (bar.current) bar.current.style.transform = 'scaleY(0)';
    return () => st.kill();
  }, [pathname]);
  const idx = Math.max(0, pages.findIndex((p) => p.path === pathname));
  return (
    <div className="progress" aria-hidden="true">
      <span className="progress-label">
        <b>{String(idx + 1).padStart(2, '0')}</b> {pages[idx]?.label}
      </span>
      <div className="progress-rail">
        <span ref={bar} />
      </div>
    </div>
  );
}
