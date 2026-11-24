import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/scroll';
import { isTouch, prefersReducedMotion } from '../lib/device';

// Energy-spark cursor: a bright teal spark. Over links and buttons it crackles
// with small electric arcs; over images a charging ring opens with a label;
// over text fields it becomes a thin caret. Drawn on a small canvas that
// follows the pointer (desktop only).
const SIZE = 180;

export default function Cursor() {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const [enabled] = useState(() => !isTouch());
  const [label, setLabel] = useState('');
  const state = useRef({ mode: '', down: 0, hover: 0, ring: 0, visible: 1, vx: 0, vy: 0, lx: 0, ly: 0 });

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add('has-cursor');
    const st = state.current;
    const reduced = prefersReducedMotion();
    const xTo = gsap.quickTo(wrap.current, 'x', { duration: reduced ? 0.01 : 0.14, ease: 'power3.out' });
    const yTo = gsap.quickTo(wrap.current, 'y', { duration: reduced ? 0.01 : 0.14, ease: 'power3.out' });
    const ctx = canvas.current.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.current.width = SIZE * dpr;
    canvas.current.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const move = (e) => {
      st.vx = e.clientX - st.lx;
      st.vy = e.clientY - st.ly;
      st.lx = e.clientX;
      st.ly = e.clientY;
      xTo(e.clientX);
      yTo(e.clientY);
    };
    const over = (e) => {
      const t = e.target.closest?.('[data-cursor], a, button, input, textarea, select, label, [role="tab"]');
      if (!t) {
        st.mode = '';
        setLabel('');
        return;
      }
      st.mode = t.dataset.cursor || (t.matches('input, textarea, select') ? 'text' : 'link');
      setLabel(t.dataset.cursorLabel || '');
    };
    const down = () => (st.down = 1);
    const hide = () => (st.visible = 0);
    const show = () => (st.visible = 1);

    // jagged arc between two points
    const bolt = (x1, y1, x2, y2, segs, amp) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      for (let i = 1; i < segs; i++) {
        const t = i / segs;
        const nx = -(y2 - y1);
        const ny = x2 - x1;
        const l = Math.hypot(nx, ny) || 1;
        const o = (Math.random() - 0.5) * amp;
        ctx.lineTo(x1 + (x2 - x1) * t + (nx / l) * o, y1 + (y2 - y1) * t + (ny / l) * o);
      }
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    let raf;
    let t0 = performance.now();
    const draw = (now) => {
      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;
      const c = SIZE / 2;
      const isLink = st.mode === 'link';
      const isView = st.mode === 'view';
      const isText = st.mode === 'text';
      st.hover += ((isLink || isView ? 1 : 0) - st.hover) * Math.min(1, dt * 12);
      st.ring += ((isView ? 1 : 0) - st.ring) * Math.min(1, dt * 10);
      st.down = Math.max(0, st.down - dt * 3);
      ctx.clearRect(0, 0, SIZE, SIZE);
      if (!st.visible) {
        raf = requestAnimationFrame(draw);
        return;
      }
      ctx.globalCompositeOperation = 'lighter';

      if (isText) {
        ctx.fillStyle = 'rgba(18,221,198,0.95)';
        ctx.fillRect(c - 1.5, c - 13, 3, 26);
        raf = requestAnimationFrame(draw);
        return;
      }

      // halo
      const speed = Math.min(1, Math.hypot(st.vx, st.vy) / 40);
      st.vx *= 0.8;
      st.vy *= 0.8;
      const haloR = 16 + st.hover * 10 + st.down * 16 + speed * 4;
      const g = ctx.createRadialGradient(c, c, 0, c, c, haloR);
      g.addColorStop(0, 'rgba(18,221,198,0.55)');
      g.addColorStop(1, 'rgba(18,221,198,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(c, c, haloR, 0, Math.PI * 2);
      ctx.fill();

      // charging ring for media
      if (st.ring > 0.02) {
        const R = 46 * st.ring;
        ctx.strokeStyle = `rgba(18,221,198,${0.85 * st.ring})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(c, c, R, 0, Math.PI * 2);
        ctx.stroke();
        const a = (now / 600) % (Math.PI * 2);
        ctx.strokeStyle = `rgba(136,238,21,${st.ring})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(c, c, R, a, a + Math.PI * 0.6);
        ctx.stroke();
      }

      // electric arcs on hover (re-rolled each frame → crackle)
      if (st.hover > 0.05 && !reduced) {
        const n = 3;
        ctx.lineCap = 'round';
        for (let i = 0; i < n; i++) {
          const ang = Math.random() * Math.PI * 2;
          const len = (16 + Math.random() * 14) * st.hover;
          ctx.strokeStyle = `rgba(${i ? '120,240,230' : '235,255,252'},${0.9 * st.hover})`;
          ctx.lineWidth = i ? 1 : 1.6;
          bolt(c, c, c + Math.cos(ang) * len, c + Math.sin(ang) * len, 5, 7);
        }
      }

      // core spark
      const coreR = 3.2 + st.down * 3 + Math.sin(now / 90) * 0.4;
      const cg = ctx.createRadialGradient(c, c, 0, c, c, coreR * 2.2);
      cg.addColorStop(0, '#ffffff');
      cg.addColorStop(0.45, 'rgba(18,221,198,1)');
      cg.addColorStop(1, 'rgba(18,221,198,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(c, c, coreR * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over);
    window.addEventListener('pointerdown', down);
    root.addEventListener('pointerleave', hide);
    root.addEventListener('pointerenter', show);
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      window.removeEventListener('pointerdown', down);
      root.removeEventListener('pointerleave', hide);
      root.removeEventListener('pointerenter', show);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={wrap} className="spark-cursor" aria-hidden="true">
      <canvas ref={canvas} style={{ width: SIZE, height: SIZE }} />
      {label && <span className="spark-label">{label}</span>}
    </div>
  );
}
