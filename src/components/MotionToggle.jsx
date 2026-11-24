import { prefersReducedMotion, setReducedMotion } from '../lib/device';

// Lets visitors who are sensitive to motion switch the animations off (remembered).
export default function MotionToggle({ className = '' }) {
  const reduced = prefersReducedMotion();
  return (
    <button type="button" className={`motion-toggle u-link ${className}`} aria-pressed={reduced} onClick={() => setReducedMotion(!reduced)}>
      <span className={`mt-dot ${reduced ? '' : 'is-on'}`} aria-hidden="true" />
      {reduced ? 'Motion off · turn on' : 'Reduce motion'}
    </button>
  );
}
