import { useEffect, useLayoutEffect } from 'react';
import { ScrollTrigger } from '../lib/scroll';
import { pages } from '../content';

function setMeta(name, content, attr = 'name') {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// Per-page title/description/canonical + background theme switching by section.
export default function PageShell({ path, children, className = '' }) {
  const meta = pages.find((p) => p.path === path) || pages[0];

  useEffect(() => {
    document.title = meta.title;
    setMeta('description', meta.desc);
    setMeta('og:title', meta.title, 'property');
    setMeta('og:description', meta.desc, 'property');
    setMeta('og:url', `https://evibemobility.com${path}`, 'property');
    const canon = document.head.querySelector('link[rel=canonical]');
    if (canon) canon.href = `https://evibemobility.com${path}`;
  }, [meta, path]);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = 'dark';
    const triggers = [...document.querySelectorAll('main [data-theme], footer[data-theme]')].map((sec) =>
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (s) => {
          if (s.isActive) document.documentElement.dataset.theme = sec.dataset.theme;
        },
      }),
    );
    ScrollTrigger.refresh();
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <main id="main" className={`page ${className}`}>
      {children}
    </main>
  );
}
