// The Solutions film: scroll progress p (0..1) → camera, car and charge state
// for three sets that mirror the franchise formats (DC charging only):
//   01 EVIBE Starter (café)  ·  02 EVIBE Signature  ·  03 EVIBE Flagship
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const range = (p, a, b) => clamp((p - a) / (b - a));
export const sstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

// Set origins along x
export const CAFE_X = 0;
export const SIG_X = 40;
export const FLAG_X = 80;

export const CAFE_END = 0.38;

export const CHAPTERS = [
  { id: 'cafe', tier: 'starter', from: 0.0, to: 0.36, rate: 'DC charging · mini café & waiting room', label: 'Starter' },
  { id: 'sig', tier: 'signature', from: 0.4, to: 0.67, rate: 'Multiple DC charging points', label: 'Signature' },
  { id: 'flag', tier: 'flagship', from: 0.71, to: 1.0, rate: 'High-capacity DC charging', label: 'Flagship' },
];

// ── Café chapter beats ─────────────────────────────────────────
export const CAFE = {
  arrive: [0.0, 0.085], // Mustang drives into the bay
  out: 0.1, // driver steps out
  plug: [0.105, 0.14], // cable reaches the port
  walk: [0.14, 0.235], // driver walks into the café
  sit: 0.235, // sits at the window table
  coffee: [0.27, 0.35], // coffee close-up while the car charges
};
export const cafeCharge = (p) => lerp(0.18, 0.82, sstep(0.14, 0.35, p));
export const cafePlug = (p) => sstep(CAFE.plug[0], CAFE.plug[1], p);
export function cafeCar(p) {
  const u = sstep(CAFE.arrive[0], CAFE.arrive[1], p);
  return { z: lerp(18, 0, u), dist: lerp(0, 18, u) };
}
export const homeCharge = cafeCharge; // legacy name

// ── Signature chapter beats ───────────────────────────────────
export const SIG = { arrive: [0.42, 0.5], plug: [0.505, 0.535] };
export const sigCharge = (p) => lerp(0.2, 0.9, sstep(0.535, 0.67, p));
export const sigPlug = (p) => sstep(SIG.plug[0], SIG.plug[1], p);
export function sigCar(p) {
  const u = sstep(SIG.arrive[0], SIG.arrive[1], p);
  return { z: lerp(18, 0, u), dist: lerp(0, 18, u) };
}

// ── Flagship chapter beats ────────────────────────────────────
export const FLAG = { arrive: [0.73, 0.81], plug: [0.815, 0.84] };
export const flagCharge = (p) => lerp(0.1, 0.95, sstep(0.84, 0.98, p));
export const flagPlug = (p) => sstep(FLAG.plug[0], FLAG.plug[1], p);
export const flagBolts = (p) => sstep(0.84, 0.855, p) * (1 - sstep(0.96, 0.99, p));
export function flagCar(p) {
  const u = sstep(FLAG.arrive[0], FLAG.arrive[1], p);
  return { z: lerp(20, 0, u), dist: lerp(0, 20, u) };
}

// Camera keys: [p, position, look-at]
const CAFE_K = [
  [0.0, [7.2, 3.5, 13.8], [-2.8, 1.6, -4.6]], // establishing: the café glowing behind the canopy
  [0.08, [5.6, 2.1, 8.6], [0, 0.9, -0.6]], // Mustang pulls into the bay
  [0.125, [3.7, 1.35, 4.4], [1.0, 0.9, 1.3]], // the cable plugs in
  [0.19, [-3.0, 2.3, 5.4], [-0.6, 1.0, -4.4]], // driver walks to the café (camera in the aisle)
  [0.25, [4.8, 2.2, -6.4], [-2.4, 1.2, -11]], // inside: counter, barista, guests
  [0.31, [3.6, 1.42, -8.9], [1.3, 0.92, -5.4]], // coffee at the window, the car charging outside
  [0.35, [3.2, 1.5, -9.4], [0.6, 1.0, -3.0]],
];
const SIG_K = [
  [0.385, [20, 10, 19], [32, 1, -2]], // fly to the Signature site
  [0.415, [SIG_X + 11, 5, 17], [SIG_X - 2, 1.6, -4]], // establishing: blue canopy, café and lounge behind
  [0.47, [SIG_X + 5.5, 1.6, 8], [SIG_X - 2.3, 0.8, 0]], // the Challenger pulls in
  [0.52, [SIG_X + 1.4, 1.35, 4.4], [SIG_X - 1.3, 0.9, 1.3]], // plug in
  [0.58, [SIG_X - 9.5, 2.4, 5.5], [SIG_X + 4, 3.0, -2]], // under the premium canopy
  [0.635, [SIG_X + 5.2, 2.0, -6.8], [SIG_X - 4, 1.2, -11.5]], // indoor seating and F&B
  [0.675, [SIG_X + 3, 7.5, 13], [SIG_X, 1, -4]],
];
const FLAG_K = [
  [0.7, [60, 14, 24], [72, 1, -4]], // fly to the Flagship
  [0.735, [FLAG_X + 17, 9.5, 23], [FLAG_X - 2, 1, -6]], // drone: the whole gold-lit destination
  [0.79, [FLAG_X + 9, 1.7, 8.5], [FLAG_X + 2.3, 0.8, 0]], // the AMG arrives
  [0.835, [FLAG_X + 6.1, 1.4, 4.6], [FLAG_X + 3.3, 0.9, 1.3]], // high-capacity charge
  [0.885, [FLAG_X - 6, 3.0, 0.8], [FLAG_X - 7, 1.4, -13]], // terrace and F&B outlets
  [0.935, [FLAG_X + 8, 2.2, -9], [FLAG_X - 2, 1.7, -16]], // lounge and the EVIBE Miles wall
  [1.0, [FLAG_X - 4, 14, 21], [FLAG_X, 0, -5]], // rise above it
];
const K = [...CAFE_K, ...SIG_K, ...FLAG_K];

export function camera(p, mobile) {
  let i = 0;
  while (i < K.length - 2 && p > K[i + 1][0]) i++;
  const [pa, A, LA] = K[i];
  const [pb, B, LB] = K[i + 1];
  const t = sstep(pa, pb, p);
  const pos = [0, 1, 2].map((k) => lerp(A[k], B[k], t));
  const look = [0, 1, 2].map((k) => lerp(LA[k], LB[k], t));
  if (mobile) {
    // pull back on phones, less when inside a building (walls are close)
    const inside = (p > CAFE.walk[1] && p < CAFE_END) || (p > 0.6 && p < 0.67) || (p > 0.9 && p < 0.97);
    const k = inside ? 1.12 : 1.45;
    for (let j = 0; j < 3; j++) pos[j] = look[j] + (pos[j] - look[j]) * k;
  }
  return { pos, look };
}
