import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { isTouch } from '../lib/device';
import { damp } from './parts';
import Cafe from './Cafe';
import Formats from './Formats';
import LightPool, { Warmup } from './lights';
import { SS } from './state';
import { camera as camAt } from './timeline';

function Director() {
  const cam = useThree((s) => s.camera);
  const look = useMemo(() => new THREE.Vector3(), []);
  const first = useRef(true);
  useFrame((state, dt) => {
    const d = Math.min(dt, 0.35);
    const gap = Math.abs(SS.target - SS.p);
    SS.p = first.current ? SS.target : damp(SS.p, SS.target, 2.4 + Math.max(0, gap - 0.06) * 30, Math.min(d, 0.1));
    const { pos, look: l } = camAt(SS.p, SS.mobile);
    if (first.current) {
      cam.position.set(...pos);
      look.set(...l);
      first.current = false;
    } else {
      cam.position.x = damp(cam.position.x, pos[0], 3.6, d);
      cam.position.y = damp(cam.position.y, pos[1], 3.6, d);
      cam.position.z = damp(cam.position.z, pos[2], 3.6, d);
      look.lerp(new THREE.Vector3(...l), 1 - Math.exp(-3.6 * d));
    }
    cam.lookAt(look);
  });
  return null;
}

function Ready({ onReady }) {
  useEffect(() => onReady?.(), [onReady]);
  return null;
}

export default function ServicesScene({ tier, active, onReady }) {
  const maxDpr = tier === 3 ? 1.6 : tier === 2 ? 1.35 : 1;
  // Fixed pixel ratio: changing it mid-scroll resizes the canvas and flashes a frame.
  // Phones: sharper (1.5×) with hardware anti-aliasing, because thin lines shimmer badly without it.
  const [dpr] = useState(() => (isTouch() ? Math.min(1.5, window.devicePixelRatio || 1) : Math.min(maxDpr, window.devicePixelRatio || 1)));
  const [post] = useState(() => tier >= 2 && !isTouch());
  return (
    <Canvas
      className="sv-canvas"
      resize={{ scroll: false, debounce: { scroll: 0, resize: 250 } }}
      frameloop={active ? 'always' : 'demand'}
      dpr={dpr}
      gl={{ antialias: tier < 2 || isTouch(), powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: SS.mobile ? 56 : 38, near: 0.2, far: 140, position: [4, 2, 10] }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        scene.fog = new THREE.Fog('#040b1c', 18, 90);
        scene.background = new THREE.Color('#030916');
      }}
    >
      <Director />
      <LightPool />
      <hemisphereLight args={['#2a4f8f', '#02060f', 0.5]} />
      <directionalLight position={[-20, 30, 20]} intensity={0.5} color="#9ec5ff" />
      <Environment resolution={128} frames={1}>
        <color attach="background" args={['#02060f']} />
        <Lightformer form="rect" intensity={2.4} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[20, 4, 1]} color="#e6f8ff" />
        <Lightformer form="rect" intensity={1.6} color="#12DDC6" position={[-10, 2, 0]} rotation-y={Math.PI / 2} scale={[30, 1.5, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#0A82FF" position={[10, 2, 0]} rotation-y={-Math.PI / 2} scale={[30, 2, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <Cafe tier={tier} />
        <Formats tier={tier} />
        <Warmup />
        <Ready onReady={onReady} />
      </Suspense>
      {post && (
        <EffectComposer multisampling={0} disableNormalPass>
          <Bloom intensity={1.1} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur radius={0.7} />
          <Vignette offset={0.25} darkness={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
