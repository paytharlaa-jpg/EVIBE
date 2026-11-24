import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import ChargerModel from './Charger';

// The EVIBE charger beside the contact form. Scrolling the page charges it:
// the screen counts up, the light bar and cable pulse harder, energy rings
// radiate from the base and the whole unit turns to face you at 100%.
function Rings({ level }) {
  const refs = [useRef(), useRef(), useRef()];
  const mats = useMemo(
    () => refs.map(() => new THREE.MeshBasicMaterial({ color: new THREE.Color('#12DDC6').multiplyScalar(2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const speed = 0.35 + level.current * 0.9;
    refs.forEach((r, i) => {
      const k = (t * speed + i / 3) % 1;
      r.current.scale.setScalar(0.7 + k * 2.4);
      mats[i].opacity = (1 - k) * (0.25 + level.current * 0.6);
    });
  });
  return refs.map((r, i) => (
    <mesh key={i} ref={r} rotation-x={-Math.PI / 2} position-y={0.01} material={mats[i]}>
      <ringGeometry args={[0.95, 1, 64]} />
    </mesh>
  ));
}

function Charging({ tier, progressRef }) {
  const g = useRef();
  const charge = useRef(0.05);
  const glow = useRef(0.6);
  const level = useRef(0);
  useFrame((s, dt) => {
    const target = progressRef ? progressRef.current : 1;
    level.current = THREE.MathUtils.damp(level.current, target, 4, Math.min(dt, 0.1));
    const L = level.current;
    const t = s.clock.elapsedTime;
    charge.current = 0.05 + L * 0.95;
    glow.current = 0.5 + L * 1.3 + Math.sin(t * 7) * 0.08 * L;
    if (!g.current) return;
    g.current.rotation.y = -0.75 + L * 0.75 + Math.sin(t * 0.4) * 0.12 + s.pointer.x * 0.15;
    g.current.position.y = -0.95 + Math.sin(t * 0.9) * 0.035;
  });
  return (
    <group ref={g}>
      <ChargerModel tier={tier} chargeRef={charge} glowRef={glow} />
      <Rings level={level} />
    </group>
  );
}

export default function ContactCharger({ tier, progressRef }) {
  return (
    <Canvas dpr={[1, tier >= 3 ? 1.75 : 1.4]} camera={{ position: [0, 0.2, 6.6], fov: 34 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[-4, 6, 5]} intensity={2.2} />
      <directionalLight position={[5, 2, -4]} intensity={2.6} color="#12DDC6" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 1.4, 1]} />
        <Lightformer form="rect" intensity={2} color="#12DDC6" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
      </Environment>
      <Charging tier={tier} progressRef={progressRef} />
    </Canvas>
  );
}
