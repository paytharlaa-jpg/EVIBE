import { useSyncExternalStore } from 'react';

// True while the intro trailer has elements in motion. The home film holds back
// its heavy first render (shader compilation) during those seconds so the logo
// never stutters; the work happens on the still "hold" frame instead.
let moving = false;
const subs = new Set();
export function setIntroMoving(v) {
  if (moving === v) return;
  moving = v;
  subs.forEach((f) => f());
}
export const useIntroMoving = () =>
  useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => moving,
  );
