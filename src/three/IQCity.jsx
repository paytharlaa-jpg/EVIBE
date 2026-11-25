import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { isTouch } from '../lib/device';

// EVIBE IQ hero: a night city seen from above. A radar sweep scans the
// blocks; open land parcels light up as candidate sites, each with a beam
// and a small insight card. One site is picked as the strongest match.
const TEAL = new THREE.Color('#12DDC6');
const BLUE = new THREE.Color('#0A82FF');

// deterministic noise so the city is the same on every visit
function rand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const STEP = 1.25; // block pitch
const N = 9; // blocks each side of centre
// Candidate sites (grid coords) and their cards
export const SITES = [
  { gx: 3, gz: -2, name: 'Site 01', where: 'Highway corridor', score: 92, best: true },
  { gx: -4, gz: 1, name: 'Site 02', where: 'Business district', score: 84 },
  { gx: 1, gz: 4, name: 'Site 03', where: 'Gated community', score: 78 },
  { gx: -2, gz: -5, name: 'Site 04', where: 'Hotel frontage', score: 71 },
  { gx: 6, gz: 3, name: 'Site 05', where: 'Retail destination', score: 66 },
];
const isRoad = (g) => g % 3 === 0;
const isSite = (gx, gz) => SITES.some((s) => s.gx === gx && s.gz === gz);

// Night windows: a canvas texture with a few lit rooms (warm and cool)
function useWindows() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#04112a';
    x.fillRect(0, 0, 64, 128);
    const r = rand(11);
    for (let row = 0; row < 16; row++) {
      for (let col = 0; col < 8; col++) {
        const v = r();
        x.fillStyle = v > 0.9 ? '#ffcf8a' : v > 0.8 ? '#7fe9ff' : v > 0.55 ? '#0b2a5a' : '#061736';
        x.fillRect(col * 8 + 2, row * 8 + 2, 4, 4);
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    return t;
  }, []);
}

function City() {
  const ref = useRef();
  const windows = useWindows();
  const { count, matrices, colors } = useMemo(() => {
    const r = rand(7);
    const m = [];
    const c = [];
    const o = new THREE.Object3D();
    for (let gx = -N; gx <= N; gx++) {
      for (let gz = -N; gz <= N; gz++) {
        if (isRoad(gx) || isRoad(gz) || isSite(gx, gz)) continue;
        const d = Math.hypot(gx, gz);
        if (d > N + 0.5) continue;
        const centre = Math.max(0, 1 - d / 7);
        const parts = r() > 0.55 ? 2 : 1; // some plots hold two buildings
        for (let k = 0; k < parts; k++) {
          const h = 0.22 + r() * 0.7 + centre * centre * (1.1 + r() * 1.7);
          const w = parts === 2 ? STEP * 0.36 : STEP * (0.62 + r() * 0.16);
          const dz = STEP * (0.62 + r() * 0.16);
          o.position.set(gx * STEP + (parts === 2 ? (k ? 0.24 : -0.24) : 0), h / 2, gz * STEP);
          o.scale.set(w, h, dz);
          o.updateMatrix();
          m.push(o.matrix.clone());
          const lit = r();
          c.push(new THREE.Color('#0b1d44').lerp(lit > 0.86 ? BLUE : TEAL, lit > 0.86 ? 0.22 : 0.04 + centre * 0.08));
        }
      }
    }
    return { count: m.length, matrices: m, colors: c };
  }, []);

  const setRef = (mesh) => {
    if (!mesh || mesh.userData.done) return;
    matrices.forEach((mt, i) => {
      mesh.setMatrixAt(i, mt);
      mesh.setColorAt(i, colors[i]);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
    mesh.userData.done = true;
    ref.current = mesh;
  };

  return (
    <instancedMesh ref={setRef} args={[undefined, undefined, count]} castShadow={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.55} metalness={0.35} emissive="#ffffff" emissiveMap={windows} emissiveIntensity={1} />
    </instancedMesh>
  );
}

// Glowing street grid with light traffic running along it
function Streets() {
  const lines = useMemo(() => {
    const out = [];
    const L = N * STEP;
    for (let g = -N; g <= N; g++) {
      if (!isRoad(g)) continue;
      out.push([[g * STEP, 0.01, -L], [g * STEP, 0.01, L]]);
      out.push([[-L, 0.01, g * STEP], [L, 0.01, g * STEP]]);
    }
    return out;
  }, []);
  const cars = useMemo(() => {
    const r = rand(3);
    return Array.from({ length: 34 }, (_, i) => {
      const ln = lines[Math.floor(r() * lines.length)];
      return { ln, off: r(), speed: 0.03 + r() * 0.05, dir: r() > 0.5 ? 1 : -1, warm: i % 3 === 0 };
    });
  }, [lines]);
  const refs = useRef([]);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    cars.forEach((c, i) => {
      const m = refs.current[i];
      if (!m) return;
      let k = (c.off + t * c.speed * c.dir) % 1;
      if (k < 0) k += 1;
      const [a, b] = c.ln;
      m.position.set(a[0] + (b[0] - a[0]) * k, 0.05, a[2] + (b[2] - a[2]) * k);
    });
  });
  return (
    <group>
      {lines.map((p, i) => (
        <Line key={i} points={p} color="#12DDC6" lineWidth={1} transparent opacity={0.22} />
      ))}
      {cars.map((c, i) => (
        <mesh key={i} ref={(m) => (refs.current[i] = m)}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={c.warm ? '#ffb46b' : '#bff8ff'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// Radar: a rotating sweep wedge and an expanding scan ring
function Radar({ onSweep }) {
  const sweep = useRef();
  const ring = useRef();
  const ringMat = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (sweep.current) sweep.current.rotation.z = -t * 0.55;
    const k = (t * 0.16) % 1;
    if (ring.current) ring.current.scale.setScalar(0.2 + k * 13);
    if (ringMat.current) ringMat.current.opacity = (1 - k) * 0.55;
    onSweep?.(t * 0.55);
  });
  return (
    <group rotation-x={-Math.PI / 2} position-y={0.02}>
      <mesh ref={sweep}>
        <circleGeometry args={[N * STEP, 64, 0, 0.75]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.07} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.97, 1, 96]} />
        <meshBasicMaterial ref={ringMat} color={TEAL} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {[4, 8, 11.5].map((r) => (
        <mesh key={r}>
          <ringGeometry args={[r - 0.015, r, 128]} />
          <meshBasicMaterial color={TEAL} transparent opacity={0.12} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// One candidate land parcel: outline, beam and an insight card
function Site({ site, angleRef, cardRef }) {
  const x = site.gx * STEP;
  const z = site.gz * STEP;
  const beam = useRef();
  const fill = useRef();
  const lit = useRef(0);
  const myAngle = Math.atan2(z, x); // where the sweep passes this site
  const color = site.best ? TEAL : BLUE;
  const half = STEP * 0.42;
  const outline = [
    [x - half, 0.03, z - half],
    [x + half, 0.03, z - half],
    [x + half, 0.03, z + half],
    [x - half, 0.03, z + half],
    [x - half, 0.03, z - half],
  ];
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, dt) => {
    // the sweep rotates clockwise seen from above: compare angles
    const a = ((-angleRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const me = ((-myAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    let diff = Math.abs(a - me);
    diff = Math.min(diff, Math.PI * 2 - diff);
    if (diff < 0.25) lit.current = 1;
    lit.current = Math.max(site.best ? 0.55 : 0.18, lit.current - dt * 0.35);
    const L = lit.current;
    if (beam.current) {
      beam.current.material.opacity = 0.15 + L * 0.55;
      beam.current.scale.y = 0.6 + L * 0.5;
    }
    if (fill.current) fill.current.material.opacity = 0.05 + L * 0.22;
    const card = cardRef.current;
    if (card && beam.current) {
      // project the point above the beam to the screen and move the DOM card there
      beam.current.parent.localToWorld(tmp.set(x, 3.05, z));
      tmp.project(state.camera);
      const px = (tmp.x * 0.5 + 0.5) * state.size.width;
      const py = (-tmp.y * 0.5 + 0.5) * state.size.height;
      card.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -100%)`;
      card.style.opacity = tmp.z < 1 ? String(Math.min(1, 0.25 + L)) : '0';
      card.classList.toggle('is-hot', L > 0.6);
    }
  });
  return (
    <group>
      <Line points={outline} color={color} lineWidth={1.6} dashed dashSize={0.12} gapSize={0.07} toneMapped={false} />
      <mesh ref={fill} rotation-x={-Math.PI / 2} position={[x, 0.02, z]}>
        <planeGeometry args={[half * 2, half * 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={beam} position={[x, 1.4, z]}>
        <cylinderGeometry args={[0.04, 0.16, 2.8, 16, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[x, 2.85, z]}>
        <sphereGeometry args={[site.best ? 0.13 : 0.09, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Rig({ progressRef, cards }) {
  const g = useRef();
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime;
    const p = progressRef?.current || 0;
    if (!g.current) return;
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, 0.5 + t * 0.03 + s.pointer.x * 0.12, 3, dt);
    s.camera.position.y = THREE.MathUtils.damp(s.camera.position.y, 13 - p * 4 + s.pointer.y * 0.6, 3, dt);
    s.camera.position.z = THREE.MathUtils.damp(s.camera.position.z, 16 - p * 5, 3, dt);
    s.camera.lookAt(0.6, 0, -1.6);
  });
  const angle = useRef(0);
  return (
    <group ref={g}>
      <City />
      <Streets />
      <Radar onSweep={(a) => (angle.current = a)} />
      {SITES.map((s, i) => (
        <Site key={s.name} site={s} angleRef={angle} cardRef={cards[i]} />
      ))}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <circleGeometry args={[N * STEP + 1.5, 64]} />
        <meshStandardMaterial color="#040d20" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function IQCity({ tier, progressRef }) {
  const cards = [useRef(), useRef(), useRef(), useRef(), useRef()];
  return (
    <div className="iqc-wrap">
    <Canvas resize={{ scroll: false, debounce: { scroll: 0, resize: 250 } }} dpr={[1, tier >= 3 ? 1.6 : 1.25]} camera={{ position: [0, 13, 16], fov: 36 }} gl={{ alpha: true, antialias: tier < 3 || isTouch() }}>
      <fog attach="fog" args={['#050f22', 14, 30]} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#2a6cff', '#020814', 0.8]} />
      <directionalLight position={[-6, 10, 4]} intensity={1.2} color="#9fd8ff" />
      <pointLight position={[3.75, 2, -2.5]} intensity={14} distance={7} color="#12DDC6" />
      <Rig progressRef={progressRef} cards={cards} />
      {tier >= 2 && !isTouch() && (
        <EffectComposer multisampling={tier >= 3 ? 4 : 0}>
          <Bloom intensity={0.9} luminanceThreshold={0.25} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette offset={0.25} darkness={0.75} />
        </EffectComposer>
      )}
    </Canvas>
    <div className="iqc-layer" aria-hidden="true">
      {SITES.map((site, i) => (
        <div ref={cards[i]} key={site.name} className={`iqc-card ${site.best ? 'is-best' : ''}`}>
          <span className="iqc-name">{site.name}</span>
          <span className="iqc-where">{site.where}</span>
          <span className="iqc-score">
            <i style={{ width: `${site.score}%` }} />
          </span>
          {site.best && <span className="iqc-tag">Promising match</span>}
        </div>
      ))}
    </div>
    </div>
  );
}
