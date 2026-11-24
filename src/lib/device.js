// Device capability detection → quality tier for 3D and motion.
// Motion is ON by default (the experience is the product). Visitors who need calm
// motion switch it off with the "Reduce motion" toggle; the choice is remembered.
// The OS setting is not used on its own because many Windows PCs ship with
// animation effects off, which would hide the whole site experience.
export const MOTION_KEY = 'evibe-motion';
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(MOTION_KEY) === 'reduced';
  } catch {
    return false;
  }
};
export function setReducedMotion(on) {
  try {
    localStorage.setItem(MOTION_KEY, on ? 'reduced' : 'full');
  } catch {
    /* private mode */
  }
  window.location.reload();
}

export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches;

export const isMobileWidth = () => typeof window !== 'undefined' && window.innerWidth < 768;

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2')) || !!c.getContext('webgl');
  } catch {
    return false;
  }
}

// 0 = no WebGL (static fallback), 1 = low, 2 = mid, 3 = high
export function detectTier() {
  if (!hasWebGL()) return 0;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;
  const saveData = navigator.connection?.saveData;
  if (saveData || cores <= 2 || mem <= 2) return 1;
  if (isTouch() || cores <= 4 || mem <= 4) return 2;
  return 3;
}
