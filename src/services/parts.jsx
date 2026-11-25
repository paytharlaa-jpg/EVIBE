import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import ChargerModel from '../three/Charger';

// Shared pieces of the Solutions film sets.
export const TEAL = new THREE.Color('#12DDC6');
export const damp = THREE.MathUtils.damp;

// Model space of a charger rotated to face −x (towards the car on its left) → world.
export const toWorld = (v, cx, cz, s) => new THREE.Vector3(cx - v.z * s, v.y * s, cz + v.x * s);
// Car faces −z; its charge port sits on the right (+x) rear quarter.
export const portOf = (x, z) => new THREE.Vector3(x + 1.0, 0.86, z + 1.55);

// ── Cable: the connector travels along it from the charger to the car ─────────
const cableFrag = /* glsl */ `
uniform float uTime; uniform float uGlow; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  float fres = pow(1.0 - max(dot(vN, vV), 0.0), 2.0);
  float l = max(dot(vN, normalize(vec3(0.4,0.8,0.5))), 0.0);
  vec3 base = vec3(0.02,0.04,0.08) + vec3(0.1,0.13,0.18) * l;
  float p = fract(vUv.x * 5.0 - uTime * 1.2);
  float pulse = smoothstep(0.0, 0.08, p) * (1.0 - smoothstep(0.08, 0.3, p));
  vec3 teal = vec3(0.07,0.87,0.78);
  gl_FragColor = vec4(base + teal * pulse * uGlow * 2.4 + teal * fres * 0.4 * uGlow, 1.0);
}`;
const cableVert = /* glsl */ `
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;

export function PlugCable({ from, to, reveal, glow, bolts }) {
  const mesh = useRef();
  const conn = useRef();
  const boltRefs = [useRef(), useRef()];
  const last = useRef(0);
  const { geo, curve, count } = useMemo(() => {
    const a2 = from.clone().add(new THREE.Vector3(-0.04, -0.34, 0.06));
    const mid = a2.clone().lerp(to, 0.5);
    mid.y = Math.max(0.06, Math.min(a2.y, to.y) - 0.34);
    const curve = new THREE.CatmullRomCurve3([from.clone(), a2, mid, to.clone()]);
    const geo = new THREE.TubeGeometry(curve, 64, 0.026, 8, false);
    return { geo, curve, count: geo.index.count };
  }, [from, to]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uGlow: { value: 0 } }), []);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame((state) => {
    const r = reveal();
    const g = glow();
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;
    uniforms.uGlow.value = g;
    geo.setDrawRange(0, Math.max(0, Math.floor((count * r) / 6) * 6));
    if (conn.current) {
      const k = Math.max(0.001, Math.min(0.999, r));
      conn.current.visible = r > 0.01;
      conn.current.position.copy(curve.getPointAt(k));
      conn.current.lookAt(curve.getPointAt(Math.min(1, k + 0.01)));
    }
    if (bolts) {
      const b = bolts();
      if (b > 0.02 && t - last.current > 0.06) {
        last.current = t;
        boltRefs.forEach((ref, bi) => {
          if (!ref.current) return;
          const pts = [];
          for (let i = 0; i <= 24; i++) {
            const p = curve.getPointAt(i / 24);
            const amp = (bi ? 0.09 : 0.16) * Math.sin((i / 24) * Math.PI) + 0.01;
            pts.push(p.x + (Math.random() - 0.5) * amp, p.y + (Math.random() - 0.5) * amp, p.z + (Math.random() - 0.5) * amp);
          }
          ref.current.geometry.setPositions(pts);
        });
      }
      boltRefs.forEach((ref, bi) => {
        if (!ref.current) return;
        ref.current.visible = b > 0.02 && Math.random() > 0.2 + bi * 0.1;
        ref.current.material.opacity = b;
      });
    }
  });

  return (
    <>
      <mesh ref={mesh} geometry={geo}>
        <shaderMaterial vertexShader={cableVert} fragmentShader={cableFrag} uniforms={uniforms} />
      </mesh>
      <group ref={conn}>
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.05, 0.042, 0.2, 18]} />
          <meshStandardMaterial color="#101a2b" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position-z={0.1}>
          <torusGeometry args={[0.044, 0.007, 8, 24]} />
          <meshBasicMaterial color={TEAL.clone().multiplyScalar(2.5)} toneMapped={false} />
        </mesh>
      </group>
      {bolts &&
        boltRefs.map((r, i) => (
          <Line key={i} ref={r} points={[[0, 0, 0], [0, 0.01, 0]]} color={i ? new THREE.Color(0.4, 2.6, 2.4) : new THREE.Color(2.6, 3.4, 3.6)} lineWidth={i ? 1.8 : 3} transparent toneMapped={false} visible={false} />
        ))}
    </>
  );
}

// A charger standing to the right of a bay, facing the car (−x).
export function Pedestal({ x, z, scale, charge, glow, tier }) {
  return (
    <group position={[x, 0, z]} rotation-y={-Math.PI / 2} scale={scale}>
      <ChargerModel tier={tier} chargeRef={charge} glowRef={glow} dynamicCable motes={false} ring={false} />
    </group>
  );
}

export function useRefFn(fn) {
  const r = useRef(0);
  useFrame(() => (r.current = fn()));
  return r;
}

export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  draw(c.getContext('2d'), c, () => (t.needsUpdate = true));
  return t;
}

