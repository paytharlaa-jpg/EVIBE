import { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { isTouch } from '../lib/device';
import { S } from './state';
import { useIntroMoving } from '../lib/intro';
import { camera as cameraAt, carPose, worldZ, battery, charging, plug, lowAlarm, speedKmh, BAY_X, STATION_Z, LANE_L } from './timeline';
import World from './World';
import Station from './Station';
import { Car } from './Cars';

const damp = THREE.MathUtils.damp;

// Eases scroll progress and flies the camera. Must be first in the tree.
function Director() {
  const cam = useThree((s) => s.camera);
  const look = useMemo(() => new THREE.Vector3(), []);
  const smoothLook = useMemo(() => new THREE.Vector3(), []);
  const first = useMemo(() => ({ v: true }), []);
  useFrame((state, dt) => {
    S.p = first.v ? S.target : damp(S.p, S.target, 2.5, Math.min(dt, 0.35));
    if (Math.abs(S.target - S.p) > 0.25) S.p = S.target - Math.sign(S.target - S.p) * 0.25; // never lag a whole chapter
    const car = carPose(S.p);
    const { pos, look: l } = cameraAt(S.p, car, S.mobile);
    // a little handheld drift while cruising, stillness while charging
    const t = state.clock.elapsedTime;
    const shake = (S.p < 0.5 ? 0.05 : 0.015) * (1 - charging(S.p));
    look.set(l[0], l[1], l[2]);
    if (first.v) {
      cam.position.set(pos[0], pos[1], pos[2]);
      smoothLook.copy(look);
      first.v = false;
    } else {
      cam.position.x = damp(cam.position.x, pos[0] + Math.sin(t * 1.3) * shake, 4.2, dt);
      cam.position.y = damp(cam.position.y, pos[1] + Math.sin(t * 2.1) * shake * 0.6, 4.2, dt);
      cam.position.z = damp(cam.position.z, pos[2], 4.2, dt);
      smoothLook.lerp(look, 1 - Math.exp(-4.2 * Math.min(dt, 0.1)));
    }
    cam.lookAt(smoothLook);
  });
  return null;
}

function Traffic() {
  // Overtaking traffic in the left lane and oncoming headlights on the far side.
  const V = STATION_Z / 0.41;
  const mk = (z0, rel, lane) => () => {
    const hero = worldZ(S.p);
    const own = V * rel * S.p;
    const z = z0 - (own - hero);
    return { x: lane, z, dist: own, visible: z < 60 && z > -320 };
  };
  const oncoming = (z0, speed) => () => {
    const travel = worldZ(S.p) + S.p * V * speed;
    const span = 420;
    const z = (((z0 + travel) % span) + span) % span - 360;
    return { x: -3, z, yaw: Math.PI, dist: travel, visible: true };
  };
  return (
    <>
      <Car model="challenger" paint="#a5101a" drive={mk(22, 1.14, LANE_L)} beams={false} />
      <Car model="amg" paint="#101317" drive={mk(-26, 1.08, LANE_L)} beams={false} tailBar={false} />
      <Car model="challenger" paint="#8f98a3" drive={oncoming(0, 1.1)} beams />
    </>
  );
}

function Hero() {
  const drive = () => {
    const p = S.p;
    const c = carPose(p);
    const decel = p > 0.33 && p < 0.5;
    return {
      x: c.x,
      z: c.z,
      yaw: c.yaw,
      dist: worldZ(p) - c.z,
      brake: decel || (p >= 0.5 && p < 0.9),
      indicator: p > 0.33 && p < 0.47,
      glow: 0.2 + charging(p) * 0.6,
      port: plug(p) > 0 ? 1 : p > 0.5 && p < 0.9 ? Math.min(1, (p - 0.5) / 0.02) : 0,
      beam: p >= 0.5 && p < 0.88 ? 0.25 : 1,
    };
  };
  return <Car model="mustang" paint="#0a5bd6" drive={drive} port underglow />;
}

function ParkedVan() {
  const drive = () => ({ x: BAY_X, z: worldZ(S.p) - STATION_Z - 9.6, dist: 0, glow: 0.35, port: 1, beam: 0 });
  return <Car model="amg" paint="#e8ecf1" drive={drive} beams={false} port underglow tailBar={false} />;
}

// Street-light strips inside the reflection environment slide past with the
// car's travel, so light streaks run across the paint and glass while driving.
function MovingStrips() {
  const refs = useMemo(() => Array.from({ length: 8 }, () => ({ current: null })), []);
  useFrame(() => {
    const travel = worldZ(S.p);
    refs.forEach((r, i) => {
      if (!r.current) return;
      r.current.position.z = ((((i * 14 + travel * 1.0) % 112) + 112) % 112) - 56;
    });
  });
  return refs.map((r, i) => (
    <Lightformer
      key={i}
      ref={(el) => (r.current = el)}
      form="rect"
      intensity={i % 3 === 0 ? 3.2 : 2.2}
      color={i % 4 === 0 ? '#12DDC6' : '#e8f6ff'}
      position={[i % 2 ? -3 : 3, 6, 0]}
      rotation-x={Math.PI / 2}
      scale={[0.6, 4, 1]}
    />
  ));
}

function Lights({ tier }) {
  return (
    <>
      <hemisphereLight args={['#2a4f8f', '#02060f', 0.55]} />
      <directionalLight position={[-30, 40, 20]} intensity={0.6} color="#9ec5ff" />
      <Environment resolution={tier >= 3 ? 256 : 128} frames={tier >= 2 ? Infinity : 1}>
        <color attach="background" args={['#02060f']} />
        <Lightformer form="rect" intensity={1.2} position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[30, 30, 1]} color="#1b2f55" />
        <Lightformer form="rect" intensity={1.6} color="#12DDC6" position={[-12, 1.5, 0]} rotation-y={Math.PI / 2} scale={[40, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#0A82FF" position={[12, 2, 0]} rotation-y={-Math.PI / 2} scale={[40, 2, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffd9a8" position={[0, 3, -30]} scale={6} />
        {tier >= 2 && <MovingStrips />}
      </Environment>
    </>
  );
}

// Compile every shader up front, off the main thread where the browser supports
// it (KHR_parallel_shader_compile), so the first real frame doesn't stall.
function ReadySignal({ onReady }) {
  const { gl, scene, camera } = useThree();
  const moving = useIntroMoving();
  useEffect(() => {
    if (moving) return; // compile only while the intro stands still
    let live = true;
    const done = () => live && onReady?.();
    if (gl.compileAsync) gl.compileAsync(scene, camera).then(done, done);
    else done();
    return () => {
      live = false;
    };
  }, [gl, scene, camera, onReady, moving]);
  return null;
}

export default function StoryScene({ tier, active, onReady }) {
  const introMoving = useIntroMoving();
  // Mount the heavy scene only while the intro is still (gate or logo hold);
  // once mounted it stays.
  const [mountScene, setMountScene] = useState(false);
  useEffect(() => {
    if (!introMoving) setMountScene(true);
  }, [introMoving]);
  const maxDpr = tier === 3 ? 1.6 : tier === 2 ? 1.35 : 1;
  // Fixed pixel ratio: changing it mid-scroll resizes the canvas and flashes a frame.
  const [dpr] = useState(() => Math.min(maxDpr, window.devicePixelRatio || 1, isTouch() ? 1.25 : maxDpr));
  const [post] = useState(() => tier >= 2 && !isTouch());
  return (
    <Canvas
      className="story-canvas"
      frameloop={active ? 'always' : introMoving ? 'never' : 'demand'}
      dpr={dpr}
      gl={{ antialias: tier < 2, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: S.mobile ? 58 : 40, near: 0.2, far: 300, position: [0, 3, 10] }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.fog = new THREE.Fog('#040b1c', 26, 230);
        scene.background = new THREE.Color('#030916');
      }}
    >
      <Director />
      <Lights tier={tier} />
      {mountScene && <Suspense fallback={null}>
        <World tier={tier} />
        <Station tier={tier} />
        <Hero />
        <ParkedVan />
        <Traffic />
        <ReadySignal onReady={onReady} />
      </Suspense>}
      {post && (
        <EffectComposer multisampling={0} disableNormalPass>
          <Bloom intensity={1.25} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur radius={0.72} />
          <Vignette offset={0.25} darkness={0.75} />
        </EffectComposer>
      )}
    </Canvas>
  );
}

export { speedKmh };
