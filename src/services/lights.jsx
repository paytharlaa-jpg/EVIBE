import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { isTouch } from '../lib/device';
import { SS } from './state';
import { CAFE_X, SIG_X, FLAG_X } from './timeline';

// One fixed pool of point lights shared by the three sets. The number of
// lights in a three.js scene is baked into every material's shader, so
// switching lamps on/off per set forced a full recompile (the "lag" between
// models). Here the count never changes; the lamps just move to the set on
// screen. Ordered by importance: phones use the first few.
const WARM = '#ffc98a';
const L = (x, y, z, intensity, distance, color = WARM, decay = 1.6) => ({ x, y, z, intensity, distance, color, decay });

const SETS = {
  cafe: [
    L(CAFE_X, 3.6, 0.8, 24, 14, '#e9fbff', 2),
    L(CAFE_X - 3, 2.7, -9.8, 26, 9, '#ffc27a'),
    L(CAFE_X + 2.2, 2.5, -7.0, 22, 7, '#ffcf8f'),
    L(CAFE_X + 4.8, 2.5, -10.6, 16, 7, '#ffc27a'),
    L(CAFE_X - 1.0, 2.4, -8.6, 12, 6, '#ffd59c'),
  ],
  sig: [
    L(SIG_X, 3.5, 1.0, 30, 16, '#e9fbff', 2),
    L(SIG_X - 3, 2.8, -9, 22, 9),
    L(SIG_X - 6.6, 2.6, -12.0, 14, 6),
    L(SIG_X + 6.5, 2.6, -10.5, 16, 7),
    L(SIG_X - 2.2, 2.6, -12.0, 14, 6),
  ],
  flag: [
    L(FLAG_X, 3.8, 1.0, 30, 16, '#e9fbff', 2),
    L(FLAG_X - 7, 3.2, -11.5, 26, 11),
    L(FLAG_X + 9, 3, -12.5, 22, 9),
    L(FLAG_X, 3, -5, 14, 10, '#ffd59c'),
    L(FLAG_X - 12.2, 2.6, -15.0, 14, 6),
    L(FLAG_X - 6.9, 2.6, -15.0, 14, 6),
    L(FLAG_X - 1.6, 2.6, -15.0, 14, 6),
  ],
};
const setAt = (p) => (p < 0.39 ? 'cafe' : p < 0.695 ? 'sig' : 'flag');

export default function LightPool() {
  const n = useMemo(() => (isTouch() ? 4 : 7), []);
  const refs = useRef([]);
  const current = useRef('');
  const apply = (id) => {
    const list = SETS[id];
    refs.current.forEach((l, i) => {
      if (!l) return;
      const c = list[i];
      if (c) {
        l.position.set(c.x, c.y, c.z);
        l.color.set(c.color);
        // phones carry fewer lamps: lift the ones that remain a little
        l.intensity = c.intensity * (n < 7 ? 1.25 : 1);
        l.distance = c.distance * (n < 7 ? 1.2 : 1);
        l.decay = c.decay;
      } else {
        l.intensity = 0; // parked, but still counted: no shader change
        l.position.set(0, -50, 0);
      }
    });
  };
  useFrame(() => {
    const id = setAt(SS.p);
    if (id !== current.current) {
      current.current = id;
      apply(id);
    }
  });
  useEffect(() => apply(setAt(SS.p)), []); // eslint-disable-line react-hooks/exhaustive-deps
  return Array.from({ length: n }, (_, i) => <pointLight key={i} ref={(r) => (refs.current[i] = r)} />);
}

// Prepare every set once while loading: show all, compile all shaders,
// upload all textures, then hide again. Removes first-appearance hitches.
export function Warmup() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let alive = true;
    SS.warm = true;
    const id = requestAnimationFrame(async () => {
      try {
        scene.updateMatrixWorld(true);
        // Gates switch on in their useFrame; force that now
        scene.traverse((o) => {
          if (o.userData?.gate) o.visible = true;
        });
        if (gl.compileAsync) await gl.compileAsync(scene, camera);
        else gl.compile(scene, camera);
        const seen = new Set();
        scene.traverse((o) => {
          const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
          mats.forEach((m) =>
            Object.values(m).forEach((v) => {
              if (v && v.isTexture && !seen.has(v)) {
                seen.add(v);
                gl.initTexture(v);
              }
            }),
          );
        });
      } catch {
        /* warm-up is best effort */
      }
      if (alive) SS.warm = false;
    });
    return () => {
      alive = false;
      cancelAnimationFrame(id);
      SS.warm = false;
    };
  }, [gl, scene, camera]);
  return null;
}
