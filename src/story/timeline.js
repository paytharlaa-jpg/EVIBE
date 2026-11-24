// The highway story as pure functions of scroll progress p (0..1).
// Everything (car, world, camera, cable, battery, HUD) is derived from p,
// so scrolling up rewinds the film exactly.

export const BEATS = [
  { id: 'drive', label: 'Drive', from: 0.0, to: 0.18 },
  { id: 'low', label: 'Low power', from: 0.18, to: 0.32 },
  { id: 'arrive', label: 'EVIBE', from: 0.32, to: 0.5 },
  { id: 'plug', label: 'Plug in', from: 0.5, to: 0.62 },
  { id: 'charge', label: 'Charge', from: 0.62, to: 0.84 },
  { id: 'go', label: 'Go', from: 0.84, to: 1.0 },
];

export const LANE_R = 5.6; // hero lane (right)
export const LANE_L = 1.9; // overtaking lane
export const BAY_X = 11.2; // charging bay centre
export const CHARGER_X = 13.2; // charger beside the bay
export const STATION_Z = 300; // world distance to the station

const V = STATION_Z / 0.41; // cruise speed in world units per unit p
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const sstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;
export const range = (p, a, b) => clamp((p - a) / (b - a));

// Distance the hero has travelled while the world scrolls past (frozen after arrival).
export function worldZ(p) {
  if (p <= 0.32) return V * p;
  if (p <= 0.5) {
    const u = (p - 0.32) / 0.18; // linear deceleration to a stop
    return V * 0.32 + V * 0.18 * (u - (u * u) / 2);
  }
  return STATION_Z;
}

export function speedKmh(p) {
  if (p < 0.18) return 96;
  if (p < 0.32) return Math.round(lerp(96, 78, range(p, 0.18, 0.32)));
  if (p < 0.5) return Math.round(78 * (1 - range(p, 0.32, 0.5)));
  if (p < 0.88) return 0;
  return Math.round(64 * range(p, 0.88, 1));
}

export function battery(p) {
  if (p < 0.18) return lerp(0.21, 0.12, range(p, 0, 0.18));
  if (p < 0.62) return lerp(0.12, 0.08, range(p, 0.18, 0.4));
  if (p < 0.84) return lerp(0.08, 1, sstep(0.64, 0.82, p));
  return 1;
}

// Hero car position (view space). The world scrolls past while driving, so the
// car's real travel = its own z change minus the world's advance.
function carXZ(p) {
  let x = LANE_R;
  let z = 0;
  if (p > 0.36 && p <= 0.5) {
    x = lerp(LANE_R, BAY_X, sstep(0.36, 0.49, p));
  } else if (p > 0.5) {
    x = BAY_X;
    if (p > 0.88) {
      // Leave the bay: pull out to the left first, clear of the car charging in
      // the next bay (z ≈ −9.6), then accelerate away down the slip lane.
      const u = range(p, 0.88, 1);
      z = -34 * u * u;
      x = lerp(BAY_X, LANE_R + 1.2, sstep(0.1, 0.6, u));
    }
  }
  return { x, z };
}

// Pose with heading taken from the actual direction of travel, so the car
// always points where it is going (never appears to reverse or slide).
export function carPose(p) {
  const a = carXZ(p);
  const e = 0.002;
  const p0 = Math.max(0, p - e);
  const p1 = Math.min(1, p + e);
  const b0 = carXZ(p0);
  const b1 = carXZ(p1);
  const dx = b1.x - b0.x;
  const dz = b1.z - b0.z - (worldZ(p1) - worldZ(p0));
  let yaw = 0;
  if (Math.hypot(dx, dz) > 1e-4) {
    // model faces +z, rotated by π to face −z; heading R = atan2(dx, dz)
    yaw = Math.atan2(dx, dz) - Math.PI;
    if (yaw < -Math.PI) yaw += Math.PI * 2;
    yaw = Math.max(-0.6, Math.min(0.6, yaw));
  }
  return { x: a.x, z: a.z, yaw };
}

// How far along the cable the connector is: 0 = holstered, 1 = in the car port.
export function plug(p) {
  if (p < 0.52) return 0;
  if (p < 0.6) return sstep(0.52, 0.6, p);
  if (p < 0.85) return 1;
  return 1 - sstep(0.85, 0.89, p);
}

// 0..1 intensity of the charging VFX (lightning, rings, particles).
export const charging = (p) => sstep(0.61, 0.64, p) * (1 - sstep(0.82, 0.85, p));

// Station lights switching on as it emerges from the fog.
export const stationLights = (p) => sstep(0.3, 0.42, p);

// Low-battery alarm (0..1).
export const lowAlarm = (p) => sstep(0.19, 0.22, p) * (1 - sstep(0.6, 0.64, p));

// Camera shots. pos/look are computed from the current car pose so the
// early shots track the car and the later ones frame the station.
const SHOTS = [
  { p: 0.0, pos: (c) => [c.x - 4.8, 2.9, c.z + 11.5], look: (c) => [c.x, 0.8, c.z - 8] },
  { p: 0.12, pos: (c) => [c.x + 9.5, 1.7, c.z - 4.2], look: (c) => [c.x - 0.5, 0.9, c.z + 2.8] },
  { p: 0.22, pos: (c) => [c.x - 1.9, 2.6, c.z + 7.6], look: (c) => [c.x, 1.0, c.z - 6] },
  { p: 0.36, pos: (c) => [c.x - 6.8, 5.2, c.z + 17], look: (c) => [c.x + 3, 1.2, c.z - 16] },
  { p: 0.5, pos: () => [BAY_X - 8.2, 2.9, 8.4], look: () => [BAY_X + 0.7, 0.9, 0.2] },
  { p: 0.58, pos: () => [BAY_X + 3.6, 1.75, 6.3], look: () => [BAY_X + 1.2, 0.85, 1.4] },
  { p: 0.7, pos: () => [BAY_X + 3.2, 2.6, 6.0], look: () => [BAY_X + 0.9, 0.8, 1.0] },
  { p: 0.82, pos: () => [BAY_X - 1.4, 2.7, 8.4], look: () => [BAY_X + 0.9, 0.8, 0.6] },
  { p: 0.9, pos: (c) => [BAY_X - 5.8, 1.6, 9.5], look: (c) => [c.x, 0.8, c.z - 2] },
  { p: 1.0, pos: () => [BAY_X - 8.5, 11, 23], look: () => [CHARGER_X - 1, 1.2, -6] },
];

export function camera(p, car, mobile) {
  let i = 0;
  while (i < SHOTS.length - 2 && p > SHOTS[i + 1].p) i++;
  const a = SHOTS[i];
  const b = SHOTS[i + 1];
  const t = sstep(a.p, b.p, p);
  const pa = a.pos(car);
  const pb = b.pos(car);
  const la = a.look(car);
  const lb = b.look(car);
  const pos = [0, 1, 2].map((k) => lerp(pa[k], pb[k], t));
  const look = [0, 1, 2].map((k) => lerp(la[k], lb[k], t));
  if (mobile) {
    // Pull back along the view direction so the taller frame still fits the action.
    const d = [pos[0] - look[0], pos[1] - look[1], pos[2] - look[2]];
    for (let k = 0; k < 3; k++) pos[k] = look[k] + d[k] * 1.45;
  }
  return { pos, look };
}

export const BAY2_Z = -9.6; // second bay (a car already charging there)
