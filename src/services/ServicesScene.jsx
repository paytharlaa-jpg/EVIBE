import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, Line, PerformanceMonitor, RoundedBox } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import ChargerModel, { CABLE_START } from '../three/Charger';
import { Car } from '../story/Cars';
import { SS } from './state';
import { HOME_X, WORK_X, HUB_X, camera as camAt, homeCharge, workCharge, hubCharge, workPlug, hubPlug, hubBolts, workCar } from './timeline';

const TEAL = new THREE.Color('#12DDC6');
const damp = THREE.MathUtils.damp;

// Model space of a charger rotated to face −x (towards the car on its left) → world.
const toWorld = (v, cx, cz, s) => new THREE.Vector3(cx - v.z * s, v.y * s, cz + v.x * s);
// Car faces −z; its charge port sits on the right (+x) rear quarter.
const portOf = (x, z) => new THREE.Vector3(x + 1.0, 0.86, z + 1.55);

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

function PlugCable({ from, to, reveal, glow, bolts }) {
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
function Pedestal({ x, z, scale, charge, glow, tier }) {
  return (
    <group position={[x, 0, z]} rotation-y={-Math.PI / 2} scale={scale}>
      <ChargerModel tier={tier} chargeRef={charge} glowRef={glow} dynamicCable motes={false} ring={false} />
    </group>
  );
}

function useRefFn(fn) {
  const r = useRef(0);
  useFrame(() => (r.current = fn()));
  return r;
}

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  draw(c.getContext('2d'), c, () => (t.needsUpdate = true));
  return t;
}

// ── Set 1: home garage at night ────────────────────────────────────────────────
function Garage({ tier }) {
  const ring = useRef();
  const screen = useMemo(
    () => ({ c: document.createElement('canvas'), last: -1 }),
    [],
  );
  const screenTex = useMemo(() => {
    screen.c.width = 128;
    screen.c.height = 128;
    const t = new THREE.CanvasTexture(screen.c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [screen]);
  const strip = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color('#e9fbff').multiplyScalar(1.6), toneMapped: false }), []);
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ color: TEAL.clone().multiplyScalar(2), toneMapped: false }), []);
  const lamp = useRef();
  const window_ = useMemo(
    () =>
      canvasTex(256, 160, (g, c) => {
        const gr = g.createLinearGradient(0, 0, 0, c.height);
        gr.addColorStop(0, '#04122c');
        gr.addColorStop(1, '#0c2a55');
        g.fillStyle = gr;
        g.fillRect(0, 0, c.width, c.height);
        g.fillStyle = '#e8f4ff';
        g.beginPath();
        g.arc(190, 42, 16, 0, Math.PI * 2);
        g.fill();
        for (let i = 0; i < 40; i++) {
          g.fillStyle = `rgba(255,255,255,${Math.random() * 0.8})`;
          g.fillRect(Math.random() * c.width, Math.random() * 90, 1.5, 1.5);
        }
        g.fillStyle = '#020814';
        g.fillRect(0, 120, c.width, 40);
      }),
    [],
  );

  useFrame((state) => {
    const p = SS.p;
    const lvl = homeCharge(p);
    const pct = Math.round(lvl * 100);
    if (pct !== screen.last) {
      screen.last = pct;
      const g = screen.c.getContext('2d');
      g.fillStyle = '#04122a';
      g.fillRect(0, 0, 128, 128);
      g.strokeStyle = 'rgba(255,255,255,0.12)';
      g.lineWidth = 10;
      g.beginPath();
      g.arc(64, 64, 44, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = pct >= 100 ? '#88EE15' : '#12DDC6';
      g.beginPath();
      g.arc(64, 64, 44, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lvl);
      g.stroke();
      g.fillStyle = '#fff';
      g.font = '900 30px "Red Hat Display", sans-serif';
      g.textAlign = 'center';
      g.fillText(`${pct}%`, 64, 74);
      screenTex.needsUpdate = true;
    }
    const t = state.clock.elapsedTime;
    ringMat.color.copy(TEAL).multiplyScalar(1.2 + Math.sin(t * 2.2) * 0.6 * (pct < 100 ? 1 : 0.2));
    // house lights dim as the night goes on
    strip.color.setRGB(0.91, 0.98, 1).multiplyScalar(1.6 - sstepLocal(p, 0.05, 0.24) * 1.1);
    if (lamp.current) lamp.current.intensity = 9 - sstepLocal(p, 0.05, 0.24) * 5;
  });

  const charge = useRefFn(() => homeCharge(SS.p));
  const glow = useRefFn(() => (homeCharge(SS.p) < 0.999 ? 1 : 0.35));
  const box = new THREE.Vector3(HOME_X + 2.36, 0.98, 1.45);

  return (
    <group>
      {/* floor (glossy epoxy), walls, ceiling */}
      <mesh rotation-x={-Math.PI / 2} position={[HOME_X, 0, -0.1]}>
        <planeGeometry args={[5.2, 7.2]} />
        <meshStandardMaterial color="#1a2130" roughness={0.18} metalness={0.4} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[HOME_X, -0.01, 6]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#0b111c" roughness={0.7} />
      </mesh>
      <mesh position={[HOME_X, 1.45, -3.7]}>
        <boxGeometry args={[5.4, 2.9, 0.2]} />
        <meshStandardMaterial color="#8d96a3" roughness={0.75} />
      </mesh>
      {[-2.7, 2.7].map((x) => (
        <mesh key={x} position={[HOME_X + x, 1.45, -0.1]}>
          <boxGeometry args={[0.2, 2.9, 7.4]} />
          <meshStandardMaterial color="#7f8895" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[HOME_X, 2.95, -0.1]}>
        <boxGeometry args={[5.6, 0.12, 7.4]} />
        <meshStandardMaterial color="#c9ced6" roughness={0.9} />
      </mesh>
      {/* open garage door frame */}
      <mesh position={[HOME_X, 2.75, 3.5]}>
        <boxGeometry args={[5.6, 0.5, 0.25]} />
        <meshStandardMaterial color="#e6e9ee" roughness={0.6} />
      </mesh>
      {/* ceiling LED strip + warm lamp */}
      <mesh position={[HOME_X, 2.87, -0.4]} material={strip}>
        <boxGeometry args={[0.12, 0.03, 4.6]} />
      </mesh>
      <pointLight ref={lamp} position={[HOME_X, 2.5, 0.2]} intensity={9} distance={9} color="#fff1dc" />
      {/* night window on the back wall */}
      <mesh position={[HOME_X - 1.2, 1.75, -3.58]}>
        <planeGeometry args={[1.5, 0.95]} />
        <meshBasicMaterial map={window_} toneMapped={false} />
      </mesh>
      {/* shelf + boxes for scale */}
      <mesh position={[HOME_X + 1.4, 1.5, -3.45]}>
        <boxGeometry args={[1.6, 0.05, 0.4]} />
        <meshStandardMaterial color="#5b6472" />
      </mesh>
      {[0.9, 1.35, 1.8].map((x, i) => (
        <mesh key={x} position={[HOME_X + x, 1.66 + (i % 2) * 0.04, -3.45]}>
          <boxGeometry args={[0.32, 0.26 + (i % 2) * 0.08, 0.3]} />
          <meshStandardMaterial color={['#c48a52', '#2d3a4f', '#d8dde4'][i]} roughness={0.8} />
        </mesh>
      ))}
      {/* EVIBE wall box on the right wall */}
      <group position={[HOME_X + 2.52, 1.25, 1.45]} rotation-y={-Math.PI / 2}>
        <RoundedBox args={[0.42, 0.56, 0.14]} radius={0.05} smoothness={4}>
          <meshPhysicalMaterial color="#eef1f5" roughness={0.3} clearcoat={1} />
        </RoundedBox>
        <mesh position-z={0.072}>
          <planeGeometry args={[0.32, 0.32]} />
          <meshBasicMaterial map={screenTex} toneMapped={false} />
        </mesh>
        <mesh ref={ring} position={[0, -0.21, 0.072]} material={ringMat}>
          <boxGeometry args={[0.26, 0.012, 0.01]} />
        </mesh>
      </group>
      <Car model="amg" paint="#e9edf2" drive={() => ({ x: HOME_X, z: 0, dist: 0, glow: 0.3, port: 1, beam: 0 })} beams={false} port underglow tailBar={false} />
      <PlugCable from={box} to={portOf(HOME_X, 0)} reveal={() => 1} glow={() => glow.current} />
      {/* driveway lamp outside */}
      <pointLight position={[HOME_X - 3.5, 3, 6]} intensity={6} distance={10} color="#9fd8ff" />
      {charge && null}
    </group>
  );
}
const sstepLocal = (v, a, b) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// ── Set 2: workplace car park ─────────────────────────────────────────────────
function Workplace({ tier }) {
  const facade = useMemo(
    () =>
      canvasTex(1024, 352, (g, c) => {
        g.fillStyle = '#071122';
        g.fillRect(0, 0, c.width, c.height);
        // floor bands + mullions: a glass office at night
        for (let y = 10; y < c.height - 6; y += 32) {
          g.fillStyle = '#0b1a30';
          g.fillRect(0, y + 22, c.width, 4);
          for (let x = 4; x < c.width; x += 16) {
            const on = Math.random() < 0.42;
            g.fillStyle = on ? (Math.random() < 0.12 ? '#12DDC6' : '#dfeeff') : '#0e2038';
            g.globalAlpha = on ? 0.35 + Math.random() * 0.35 : 1;
            g.fillRect(x, y, 12, 20);
          }
        }
        g.globalAlpha = 1;
      }),
    [],
  );
  const sign = useMemo(
    () =>
      canvasTex(1024, 132, (g, c, done) => {
        g.fillStyle = '#071B3C';
        g.fillRect(0, 0, c.width, c.height);
        const im = new Image();
        im.onload = () => {
          const h = 70;
          g.drawImage(im, 24, (c.height - h) / 2, (im.width / im.height) * h, h);
          g.fillStyle = '#12DDC6';
          g.font = '800 40px "Red Hat Display", sans-serif';
          g.textAlign = 'right';
          g.fillText('STAFF & VISITOR CHARGING', c.width - 30, 80);
          done();
        };
        im.src = '/brand/EVIBE_Horizontal_no_Tagline_Reverse.svg';
      }),
    [],
  );
  const c1 = useRefFn(() => workCharge(SS.p));
  const g1 = useRefFn(() => 0.3 + workPlug(SS.p) * 1.1);
  const c0 = useRef(0.74);
  const g0 = useRef(1);
  const cIdle = useRef(1);
  const gIdle = useRef(0.4);
  const bays = [WORK_X - 4.6, WORK_X, WORK_X + 4.6];
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[WORK_X, 0, -2]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0f1626" roughness={0.32} metalness={0.45} />
      </mesh>
      {bays.map((x) => (
        <group key={x}>
          {[-1.45, 1.45].map((dx) => (
            <mesh key={dx} rotation-x={-Math.PI / 2} position={[x + dx, 0.006, 0.4]}>
              <planeGeometry args={[0.08, 5.6]} />
              <meshBasicMaterial color="#cfd8e3" />
            </mesh>
          ))}
          <mesh rotation-x={-Math.PI / 2} position={[x, 0.007, 3.1]}>
            <planeGeometry args={[1.2, 0.5]} />
            <meshBasicMaterial color={TEAL.clone().multiplyScalar(0.9)} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* office building */}
      <mesh position={[WORK_X, 6, -14]}>
        <boxGeometry args={[34, 12, 2]} />
        <meshStandardMaterial color="#0a1628" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[WORK_X, 6, -12.95]}>
        <planeGeometry args={[33, 11]} />
        <meshBasicMaterial map={facade} toneMapped={false} />
      </mesh>
      <mesh position={[WORK_X, 1.2, -6]}>
        <boxGeometry args={[7.2, 1.1, 0.12]} />
        <meshStandardMaterial color="#071B3C" />
      </mesh>
      <mesh position={[WORK_X, 1.2, -5.93]}>
        <planeGeometry args={[7, 0.9]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      <pointLight position={[WORK_X, 6, 4]} intensity={30} distance={22} color="#dff6ff" />
      <pointLight position={[WORK_X - 8, 5, 0]} intensity={14} distance={16} color="#9fd8ff" />
      {/* chargers */}
      <Pedestal tier={tier} x={bays[0] + 1.95} z={1.5} scale={0.5} charge={c0} glow={g0} />
      <Pedestal tier={tier} x={bays[1] + 1.95} z={1.5} scale={0.5} charge={c1} glow={g1} />
      <Pedestal tier={tier} x={bays[2] + 1.95} z={1.5} scale={0.5} charge={cIdle} glow={gIdle} />
      {/* black AMG already charging, red Challenger arriving */}
      <Car model="amg" paint="#111418" drive={() => ({ x: bays[0], z: 0, dist: 0, glow: 0.35, port: 1, beam: 0 })} beams={false} port underglow tailBar={false} />
      <PlugCable from={toWorld(CABLE_START, bays[0] + 1.95, 1.5, 0.5)} to={portOf(bays[0], 0)} reveal={() => 1} glow={() => 0.8} />
      <Car
        model="challenger"
        paint="#b3121c"
        drive={() => {
          const c = workCar(SS.p);
          return { x: WORK_X, z: c.z, dist: c.dist, brake: SS.p > 0.36 && SS.p < 0.45, glow: 0.2 + workPlug(SS.p) * 0.6, port: workPlug(SS.p) > 0 ? 1 : SS.p > 0.4 ? 1 : 0, beam: 1 - workPlug(SS.p) * 0.7 };
        }}
        port
        underglow
      />
      <PlugCable from={toWorld(CABLE_START, WORK_X + 1.95, 1.5, 0.5)} to={portOf(WORK_X, 0)} reveal={() => workPlug(SS.p)} glow={() => workPlug(SS.p)} />
    </group>
  );
}

// ── Set 3: highway DC fast-charging hub ────────────────────────────────────────
function Hub({ tier }) {
  const fascia = useMemo(
    () =>
      canvasTex(1024, 256, (g, c, done) => {
        g.fillStyle = '#071B3C';
        g.fillRect(0, 0, c.width, c.height);
        const im = new Image();
        im.onload = () => {
          const h = 150;
          const w = (im.width / im.height) * h;
          g.drawImage(im, (c.width - w) / 2, (c.height - h) / 2, w, h);
          done();
        };
        im.src = '/brand/EVIBE_Horizontal_no_Tagline_Reverse.svg';
      }),
    [],
  );
  const cA = useRefFn(() => hubCharge(SS.p));
  const cB = useRefFn(() => Math.min(1, hubCharge(SS.p) * 0.9 + 0.08));
  const gA = useRefFn(() => 0.4 + hubPlug(SS.p) * 1.4);
  const xs = [HUB_X - 1.2, HUB_X + 4.2];
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[HUB_X, 0, -2]}>
        <planeGeometry args={[44, 44]} />
        <meshStandardMaterial color="#101827" roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[HUB_X + 1.5, 4.3, -1.5]}>
        <boxGeometry args={[13, 0.4, 11]} />
        <meshStandardMaterial color="#0b1730" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[HUB_X + 1.5, 4.08, -1.5]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[12, 10]} />
        <meshBasicMaterial color={new THREE.Color('#dff8ff').multiplyScalar(0.55)} toneMapped={false} />
      </mesh>
      <mesh position={[HUB_X + 1.5, 4.3, 4.02]}>
        <planeGeometry args={[6.4, 1.6]} />
        <meshBasicMaterial map={fascia} toneMapped={false} />
      </mesh>
      <mesh position={[HUB_X + 1.5, 4.52, 4.02]}>
        <boxGeometry args={[13, 0.05, 0.05]} />
        <meshBasicMaterial color={TEAL.clone().multiplyScalar(2.4)} toneMapped={false} />
      </mesh>
      {[-4.6, 7.6].map((dx) => (
        <mesh key={dx} position={[HUB_X + dx, 2.1, -6]}>
          <cylinderGeometry args={[0.18, 0.18, 4.2, 16]} />
          <meshStandardMaterial color="#c9d1dc" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      <pointLight position={[HUB_X + 1.5, 3.6, 0.5]} intensity={22} distance={14} color="#e9fbff" />
      {xs.map((x, i) => (
        <group key={x}>
          <mesh rotation-x={-Math.PI / 2} position={[x, 0.007, 0.3]}>
            <planeGeometry args={[2.8, 5.6]} />
            <meshBasicMaterial color={TEAL.clone().multiplyScalar(0.25)} toneMapped={false} transparent opacity={0.6} />
          </mesh>
          <Pedestal tier={tier} x={x + 1.95} z={1.5} scale={0.62} charge={i ? cB : cA} glow={gA} />
          <PlugCable from={toWorld(CABLE_START, x + 1.95, 1.5, 0.62)} to={portOf(x, 0)} reveal={() => hubPlug(SS.p)} glow={() => hubPlug(SS.p) * 1.4} bolts={() => hubBolts(SS.p)} />
        </group>
      ))}
      <Car model="challenger" paint="#b3121c" drive={() => ({ x: xs[0], z: 0, dist: 0, glow: 0.2 + hubBolts(SS.p) * 0.8, port: 1, beam: 0.3 })} port underglow />
      <Car model="amg" paint="#e9edf2" drive={() => ({ x: xs[1], z: 0, dist: 0, glow: 0.2 + hubBolts(SS.p) * 0.8, port: 1, beam: 0.3 })} port underglow tailBar={false} />
    </group>
  );
}

function Director() {
  const cam = useThree((s) => s.camera);
  const look = useMemo(() => new THREE.Vector3(), []);
  const first = useRef(true);
  useFrame((state, dt) => {
    const d = Math.min(dt, 0.35);
    SS.p = first.current ? SS.target : damp(SS.p, SS.target, 3.4, d);
    const { pos, look: l } = camAt(SS.p, SS.mobile);
    if (first.current) {
      cam.position.set(...pos);
      look.set(...l);
      first.current = false;
    } else {
      cam.position.x = damp(cam.position.x, pos[0], 5, d);
      cam.position.y = damp(cam.position.y, pos[1], 5, d);
      cam.position.z = damp(cam.position.z, pos[2], 5, d);
      look.lerp(new THREE.Vector3(...l), 1 - Math.exp(-5 * d));
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
  const [dpr, setDpr] = useState(maxDpr);
  return (
    <Canvas
      className="sv-canvas"
      frameloop={active ? 'always' : 'demand'}
      dpr={dpr}
      gl={{ antialias: tier < 2, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: SS.mobile ? 56 : 38, near: 0.1, far: 300, position: [4, 2, 10] }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        scene.fog = new THREE.Fog('#040b1c', 18, 90);
        scene.background = new THREE.Color('#030916');
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(0.8, d - 0.2))} onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.2))} />
      <Director />
      <hemisphereLight args={['#2a4f8f', '#02060f', 0.5]} />
      <directionalLight position={[-20, 30, 20]} intensity={0.5} color="#9ec5ff" />
      <Environment resolution={128} frames={1}>
        <color attach="background" args={['#02060f']} />
        <Lightformer form="rect" intensity={2.4} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[20, 4, 1]} color="#e6f8ff" />
        <Lightformer form="rect" intensity={1.6} color="#12DDC6" position={[-10, 2, 0]} rotation-y={Math.PI / 2} scale={[30, 1.5, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#0A82FF" position={[10, 2, 0]} rotation-y={-Math.PI / 2} scale={[30, 2, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <Garage tier={tier} />
        <Workplace tier={tier} />
        <Hub tier={tier} />
        <Ready onReady={onReady} />
      </Suspense>
      {tier >= 2 && (
        <EffectComposer multisampling={0} disableNormalPass>
          <Bloom intensity={1.1} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur radius={0.7} />
          <Vignette offset={0.25} darkness={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
