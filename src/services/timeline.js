// "Three drivers, one network": scroll progress p (0..1) → camera, car and
// charge state for the three sets on the Services page.
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const range = (p, a, b) => clamp((p - a) / (b - a));
export const sstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

// Set origins along x
export const HOME_X = 0;
export const WORK_X = 40;
export const HUB_X = 80;

export const CHAPTERS = [
  { id: 'home', from: 0.0, to: 0.27, rate: '7.4 kW AC · overnight', label: 'Home charging' },
  { id: 'work', from: 0.31, to: 0.61, rate: '22 kW AC · while you work', label: 'Workplace & commercial' },
  { id: 'hub', from: 0.66, to: 1.0, rate: '120 kW DC · minutes', label: 'DC fast-charging hubs' },
];

// Charge level shown per set
export const homeCharge = (p) => lerp(0.22, 1, sstep(0.08, 0.25, p));
export const workCharge = (p) => lerp(0.31, 0.92, sstep(0.46, 0.6, p));
export const hubCharge = (p) => lerp(0.12, 0.96, sstep(0.72, 0.95, p));

// Cable reveal (connector travelling from charger to car port)
export const homePlug = () => 1; // already plugged in for the night
export const workPlug = (p) => sstep(0.41, 0.46, p);
export const hubPlug = (p) => sstep(0.68, 0.72, p);
export const hubBolts = (p) => sstep(0.72, 0.74, p) * (1 - sstep(0.95, 0.99, p));

// The red Challenger drives into the workplace bay
export function workCar(p) {
  const u = sstep(0.31, 0.41, p);
  return { z: lerp(16, 0, u), dist: lerp(0, 16, u) };
}

const K = [
  [0.0, [4.4, 2.3, 10.8], [0, 0.9, 0]],
  [0.12, [-2.0, 1.6, 6.4], [-0.9, 0.95, 0.4]],
  [0.24, [1.9, 2.3, 7.2], [0.2, 0.8, -0.6]],
  [0.29, [20, 9, 18], [32, 1, 0]],
  [0.35, [WORK_X + 6, 3.2, 17], [WORK_X, 0.8, 3]],
  [0.46, [WORK_X + 4.6, 1.7, 7.2], [WORK_X - 0.6, 0.9, 0.8]],
  [0.58, [WORK_X - 6.5, 3, 10], [WORK_X, 1, -2]],
  [0.63, [60, 9, 18], [72, 1, 0]],
  [0.69, [HUB_X - 6, 4.6, 16], [HUB_X + 1.8, 1.2, -1]],
  [0.83, [HUB_X + 8.2, 2.5, 7.4], [HUB_X + 2.6, 0.9, 0.6]],
  [1.0, [HUB_X - 1.5, 3.3, 12], [HUB_X + 1.8, 1.2, -1]],
];

export function camera(p, mobile) {
  let i = 0;
  while (i < K.length - 2 && p > K[i + 1][0]) i++;
  const [pa, A, LA] = K[i];
  const [pb, B, LB] = K[i + 1];
  const t = sstep(pa, pb, p);
  const pos = [0, 1, 2].map((k) => lerp(A[k], B[k], t));
  const look = [0, 1, 2].map((k) => lerp(LA[k], LB[k], t));
  if (mobile) {
    for (let k = 0; k < 3; k++) pos[k] = look[k] + (pos[k] - look[k]) * 1.5;
  }
  return { pos, look };
}
