import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { CABLE_START } from '../three/Charger';
import { Car } from '../story/Cars';
import { SS } from './state';
import { CAFE_X, CAFE, cafeCharge, cafePlug, cafeCar, range, sstep } from './timeline';
import { TEAL, toWorld, portOf, PlugCable, Pedestal, useRefFn, canvasTex } from './parts';

// ── Set 1: the EVIBE Café ─────────────────────────────────────────────────────
// A Mustang pulls into a bay under the EVIBE canopy and plugs in; the driver
// walks into the café, sits at the window with a coffee and watches the car
// charge outside. Furniture: Poly Haven (CC0). People: Microsoft Rocketbox (MIT).
export const DRACO = '/draco/';
const PROPS = '/models/cafe-props.glb';
export const PEOPLE = {
  driver: '/models/people/driver.glb',
  barista: '/models/people/barista.glb',
  a: '/models/people/guest-a.glb',
  b: '/models/people/guest-b.glb',
  c: '/models/people/guest-c.glb',
};
useGLTF.preload(PROPS, DRACO);
Object.values(PEOPLE).forEach((u) => useGLTF.preload(u, DRACO));

const X = CAFE_X;
const GLASS_Z = -5.5; // café glass front
const BACK_Z = -13;
const W = 7.2; // half width
const H = 3.4; // ceiling height

// ── props ─────────────────────────────────────────────────────
export function useProps() {
  const { scene } = useGLTF(PROPS, DRACO);
  return useMemo(() => {
    scene.traverse((o) => {
      if (o.isMesh) {
        o.material.envMapIntensity = 0.7;
      }
    });
    return (name) => {
      const src = scene.getObjectByName(name);
      return src ? src.clone(true) : new THREE.Group();
    };
  }, [scene]);
}

export function Prop({ get, name, position, rotation = 0, scale = 1 }) {
  const obj = useMemo(() => get(name), [get, name]);
  return <primitive object={obj} position={position} rotation-y={rotation} scale={scale} />;
}

// ── people ────────────────────────────────────────────────────
export function usePerson(url) {
  const gltf = useGLTF(url, DRACO);
  return useMemo(() => {
    const root = cloneSkinned(gltf.scene);
    root.traverse((o) => {
      if (!o.isMesh) return;
      o.frustumCulled = false;
      const m = o.material;
      m.envMapIntensity = 0.55;
      if (/opacity/i.test(m.name) || m.transparent || m.alphaTest > 0) {
        m.transparent = false;
        m.alphaTest = 0.45;
        m.depthWrite = true;
        m.side = THREE.DoubleSide;
      }
    });
    const clips = Object.fromEntries(gltf.animations.map((c) => [c.name, c.clone()]));
    return { root, clips };
  }, [gltf]);
}

export function isShown(o) {
  for (let x = o; x; x = x.parent) if (!x.visible) return false;
  return true;
}

// Only the set whose chapter is on screen is drawn and animated.
export function Gate({ from, to, children }) {
  const g = useRef();
  useFrame(() => {
    // SS.warm: briefly show every set while the scene loads so all materials
    // and textures are prepared up front (no hitch when a set first appears)
    if (g.current) g.current.visible = SS.warm || (SS.p >= from && SS.p <= to);
  });
  return (
    <group ref={g} userData={{ gate: true }}>
      {children}
    </group>
  );
}

// A seated / standing guest playing one idle clip (ping-pong so trimmed loops never pop).
export function Person({ url, clip, position, rotation = 0, offset = 0, speed = 1 }) {
  const { root, clips } = usePerson(url);
  const mixer = useMemo(() => new THREE.AnimationMixer(root), [root]);
  useEffect(() => {
    const c = clips[clip] || Object.values(clips)[0];
    if (!c) return;
    const a = mixer.clipAction(c);
    a.setLoop(THREE.LoopPingPong, Infinity);
    a.timeScale = speed;
    a.play();
    a.time = offset % c.duration;
    return () => a.stop();
  }, [mixer, clips, clip, offset, speed]);
  // skip animation work while the set is hidden (another chapter is on screen)
  useFrame((_, dt) => isShown(root) && mixer.update(Math.min(dt, 0.05)));
  return <primitive object={root} position={position} rotation-y={rotation} />;
}

// Where the driver walks: car door → café door → window table.
const PATH = [
  [X - 1.3, 0.1],
  [X - 1.3, -3.0],
  [X + 0.9, -4.6],
  [X + 0.9, -6.3],
  [X + 1.0, -7.62],
  [X + 1.75, -7.62],
].map(([x, z]) => new THREE.Vector3(x, 0, z));
const SEAT = { x: X + 1.8, z: -7.72 }; // driver's chair at the window table

function Driver() {
  const { root, clips } = usePerson(PEOPLE.driver);
  const rig = useMemo(() => {
    const mixer = new THREE.AnimationMixer(root);
    const walk = clips.walk;
    let speed = 1.25;
    let heading = 0;
    // The walk clip travels forward: flatten the pelvis drift (walk in place)
    // and measure stride speed + facing so feet stay planted on the path.
    const tr = walk?.tracks.find((t) => /Pelvis.*\.position$/.test(t.name));
    if (tr) {
      const v = tr.values;
      const n = tr.times.length;
      const T = tr.times[n - 1] - tr.times[0] || 1;
      const d = [v[(n - 1) * 3] - v[0], v[(n - 1) * 3 + 1] - v[1], v[(n - 1) * 3 + 2] - v[2]];
      for (let i = 0; i < n; i++) {
        const k = (tr.times[i] - tr.times[0]) / T;
        for (let a = 0; a < 3; a++) v[i * 3 + a] -= d[a] * k;
      }
      const node = root.getObjectByName(tr.name.split('.')[0]);
      if (node?.parent) {
        root.updateWorldMatrix(false, true);
        const m3 = new THREE.Matrix3().setFromMatrix4(node.parent.matrixWorld);
        const dv = new THREE.Vector3(...d).applyMatrix3(m3);
        const dist = Math.hypot(dv.x, dv.z);
        if (dist > 0.2) {
          speed = dist / T;
          heading = Math.atan2(dv.x, dv.z);
        }
      }
    }
    const aWalk = walk ? mixer.clipAction(walk) : null;
    const aSit = clips.sit ? mixer.clipAction(clips.sit) : null;
    if (aWalk) {
      aWalk.play();
      aWalk.timeScale = 0; // scrubbed by scroll
    }
    if (aSit) {
      aSit.setLoop(THREE.LoopPingPong, Infinity);
      aSit.play();
    }
    // path lengths
    const segs = [];
    let L = 0;
    for (let i = 0; i < PATH.length - 1; i++) {
      const len = PATH[i].distanceTo(PATH[i + 1]);
      segs.push({ a: PATH[i], b: PATH[i + 1], from: L, len });
      L += len;
    }
    return { mixer, aWalk, aSit, speed, heading, segs, L, rot: 0 };
  }, [root, clips]);

  const g = useRef();
  useFrame((_, dt) => {
    const p = SS.p;
    const grp = g.current;
    if (!grp) return;
    grp.visible = p > CAFE.walk[0] - 0.004 && p < 0.39;
    if (!grp.visible) return;
    const u = range(p, CAFE.walk[0], CAFE.walk[1]);
    const s = u * rig.L;
    const seg = rig.segs.find((q) => s <= q.from + q.len) || rig.segs[rig.segs.length - 1];
    const k = Math.min(1, (s - seg.from) / seg.len);
    const pos = seg.a.clone().lerp(seg.b, k);
    const sit = sstep(CAFE.sit - 0.006, CAFE.sit + 0.012, p);
    const dir = seg.b.clone().sub(seg.a);
    const walkRot = Math.atan2(dir.x, dir.z) - rig.heading;
    const sitRot = -rig.heading; // face +z: the table, the window and the car outside
    const target = sit > 0.5 ? sitRot : walkRot;
    // shortest-path angle damping
    let diff = ((target - rig.rot + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    rig.rot += diff * (1 - Math.exp(-8 * Math.min(dt, 0.1)));
    grp.rotation.y = rig.rot;
    grp.position.set(sit > 0 ? THREE.MathUtils.lerp(pos.x, SEAT.x, sit) : pos.x, 0, sit > 0 ? THREE.MathUtils.lerp(pos.z, SEAT.z, sit) : pos.z);
    if (rig.aWalk) {
      rig.aWalk.time = (s / rig.speed) % rig.aWalk.getClip().duration;
      rig.aWalk.setEffectiveWeight(1 - sit);
    }
    if (rig.aSit) rig.aSit.setEffectiveWeight(sit);
    rig.mixer.update(Math.min(dt, 0.05));
  });
  return (
    <group ref={g}>
      <primitive object={root} />
    </group>
  );
}

// ── coffee cup with steam ─────────────────────────────────────
function steamTexture() {
  return canvasTex(64, 64, (g) => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,0.55)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
  });
}
export function Coffee({ position, rotation = 0 }) {
  const cupGeo = useMemo(() => {
    const pts = [
      [0, 0],
      [0.03, 0],
      [0.034, 0.004],
      [0.04, 0.06],
      [0.043, 0.085],
      [0.039, 0.085],
      [0.036, 0.062],
      [0.0, 0.062],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 32);
  }, []);
  const tex = useMemo(steamTexture, []);
  const puffs = useRef([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    puffs.current.forEach((m, i) => {
      if (!m) return;
      const k = (t * 0.35 + i / 4) % 1;
      m.position.set(Math.sin(t * 1.3 + i) * 0.012 * k, 0.1 + k * 0.22, Math.cos(t + i) * 0.01 * k);
      m.scale.setScalar(0.04 + k * 0.09);
      m.material.opacity = Math.sin(k * Math.PI) * 0.45;
    });
  });
  return (
    <group position={position} rotation-y={rotation}>
      <mesh geometry={cupGeo}>
        <meshPhysicalMaterial color="#f4f2ee" roughness={0.18} clearcoat={1} />
      </mesh>
      <mesh position={[0.046, 0.045, 0]} rotation-z={Math.PI / 2}>
        <torusGeometry args={[0.017, 0.005, 8, 20, Math.PI]} />
        <meshPhysicalMaterial color="#f4f2ee" roughness={0.18} />
      </mesh>
      <mesh position-y={0.075} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.036, 24]} />
        <meshStandardMaterial color="#5a3518" roughness={0.25} />
      </mesh>
      <mesh position-y={0.003}>
        <cylinderGeometry args={[0.075, 0.07, 0.008, 32]} />
        <meshPhysicalMaterial color="#f4f2ee" roughness={0.2} clearcoat={1} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <sprite key={i} ref={(m) => (puffs.current[i] = m)}>
          <spriteMaterial map={tex} transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </group>
  );
}

// The EVIBE app on a phone lying on the table: live charge of the car outside.
function Phone({ position, rotation = 0 }) {
  const st = useMemo(() => ({ c: document.createElement('canvas'), last: -1 }), []);
  const tex = useMemo(() => {
    st.c.width = 128;
    st.c.height = 256;
    const t = new THREE.CanvasTexture(st.c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [st]);
  useFrame(() => {
    const lvl = cafeCharge(SS.p);
    const pct = Math.round(lvl * 100);
    if (pct === st.last) return;
    st.last = pct;
    const g = st.c.getContext('2d');
    g.fillStyle = '#04122a';
    g.fillRect(0, 0, 128, 256);
    g.fillStyle = '#12DDC6';
    g.font = '800 15px "Red Hat Display", sans-serif';
    g.textAlign = 'center';
    g.fillText('EVIBE', 64, 34);
    g.strokeStyle = 'rgba(255,255,255,0.12)';
    g.lineWidth = 10;
    g.beginPath();
    g.arc(64, 118, 40, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = '#12DDC6';
    g.beginPath();
    g.arc(64, 118, 40, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lvl);
    g.stroke();
    g.fillStyle = '#fff';
    g.font = '900 26px "Red Hat Display", sans-serif';
    g.fillText(`${pct}%`, 64, 127);
    g.font = '600 11px "Plus Jakarta Sans", sans-serif';
    g.fillStyle = 'rgba(230,233,238,0.75)';
    g.fillText('Charging · Bay 02', 64, 192);
    g.fillText('Enjoy your coffee', 64, 210);
    tex.needsUpdate = true;
  });
  return (
    <group position={position} rotation-y={rotation}>
      <mesh>
        <boxGeometry args={[0.075, 0.008, 0.15]} />
        <meshStandardMaterial color="#0b0d12" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position-y={0.0045} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.068, 0.142]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── the building ──────────────────────────────────────────────
export function useWood() {
  return useMemo(() => {
    const t = canvasTex(512, 512, (g, c) => {
      for (let i = 0; i < 16; i++) {
        const y = i * 32;
        const base = 58 + Math.random() * 18;
        g.fillStyle = `rgb(${base + 34},${base + 6},${base - 20})`;
        g.fillRect(0, y, c.width, 32);
        for (let k = 0; k < 40; k++) {
          g.fillStyle = `rgba(30,16,6,${Math.random() * 0.18})`;
          g.fillRect(Math.random() * c.width, y + Math.random() * 32, 60 + Math.random() * 160, 1);
        }
        g.fillStyle = 'rgba(0,0,0,0.45)';
        g.fillRect(0, y, c.width, 1.5);
        const off = Math.random() * c.width;
        g.fillRect(off, y, 1.5, 32);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 3);
    return t;
  }, []);
}

export function signTex(text, sub, w = 1024, h = 256, color = '#12DDC6') {
  return canvasTex(w, h, (g, c, done) => {
    g.fillStyle = '#071B3C';
    g.fillRect(0, 0, c.width, c.height);
    const im = new Image();
    im.onload = () => {
      const lh = h * 0.42;
      const lw = (im.width / im.height) * lh;
      const total = lw + (text ? 28 + g.measureText(text).width : 0);
      g.font = `900 ${Math.round(h * 0.3)}px "Red Hat Display", sans-serif`;
      const tw = text ? g.measureText(text).width : 0;
      const x0 = (c.width - (lw + (text ? 34 + tw : 0))) / 2;
      g.drawImage(im, x0, sub ? h * 0.12 : (h - lh) / 2, lw, lh);
      if (text) {
        g.fillStyle = color;
        g.textBaseline = 'middle';
        g.fillText(text, x0 + lw + 34, (sub ? h * 0.12 : (h - lh) / 2) + lh / 2 + 4);
      }
      if (sub) {
        g.fillStyle = 'rgba(230,233,238,0.85)';
        g.font = `700 ${Math.round(h * 0.13)}px "Red Hat Display", sans-serif`;
        g.textAlign = 'center';
        g.textBaseline = 'alphabetic';
        g.fillText(sub, c.width / 2, h * 0.86);
      }
      done();
      return total;
    };
    im.src = '/brand/EVIBE_Horizontal_no_Tagline_Reverse.svg';
  });
}

function Building() {
  const wood = useWood();
  const fascia = useMemo(() => signTex('CAFÉ', 'CHARGE · DINE · DISCOVER · EXPERIENCE', 1024, 256), []);
  const wall = useMemo(() => signTex('CAFÉ', 'Charge your car. Enjoy your coffee.', 1024, 300), []);
  const canopySign = useMemo(() => signTex('', 'EV CHARGING', 1024, 220), []);
  const glass = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#a9d6e6', transparent: true, opacity: 0.1, roughness: 0.04, metalness: 0.1, envMapIntensity: 2.2, depthWrite: false, side: THREE.DoubleSide }),
    [],
  );
  const frame = '#1a2232';
  const warm = new THREE.Color('#ffd7a1');
  const mullions = [];
  for (let x = -W; x <= W + 0.01; x += 1.8) mullions.push(x);
  return (
    <group>
      {/* site paving + bays */}
      <mesh rotation-x={-Math.PI / 2} position={[X, 0, 2]}>
        <planeGeometry args={[46, 40]} />
        <meshStandardMaterial color="#101826" roughness={0.68} metalness={0.15} />
      </mesh>
      {[-4.6, 0, 4.6].map((bx) => (
        <group key={bx}>
          {[-1.45, 1.45].map((dx) => (
            <mesh key={dx} rotation-x={-Math.PI / 2} position={[X + bx + dx, 0.024, 0.4]}>
              <planeGeometry args={[0.08, 5.6]} />
              <meshBasicMaterial color="#cfd8e3" />
            </mesh>
          ))}
          <mesh rotation-x={-Math.PI / 2} position={[X + bx, 0.018, 0.3]}>
            <planeGeometry args={[2.8, 5.6]} />
            <meshBasicMaterial color={TEAL.clone().multiplyScalar(0.18)} toneMapped={false} transparent opacity={0.55} />
          </mesh>
        </group>
      ))}
      {/* charging canopy */}
      <mesh position={[X, 4.25, 0.6]}>
        <boxGeometry args={[15.4, 0.34, 6.4]} />
        <meshStandardMaterial color="#0b1730" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[X, 4.07, 0.6]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[14.6, 5.8]} />
        <meshBasicMaterial color={new THREE.Color('#dff8ff').multiplyScalar(0.42)} toneMapped={false} />
      </mesh>
      <mesh position={[X, 4.25, 3.81]}>
        <planeGeometry args={[5.4, 1.15]} />
        <meshBasicMaterial map={canopySign} toneMapped={false} />
      </mesh>
      <mesh position={[X, 4.44, 3.81]}>
        <boxGeometry args={[15.4, 0.04, 0.04]} />
        <meshBasicMaterial color={TEAL.clone().multiplyScalar(2.4)} toneMapped={false} />
      </mesh>
      {[-7.4, 7.4].map((dx) => (
        <mesh key={dx} position={[X + dx, 2.05, 0.6]}>
          <cylinderGeometry args={[0.14, 0.14, 4.1, 16]} />
          <meshStandardMaterial color="#c9d1dc" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}

      {/* café shell */}
      <mesh rotation-x={-Math.PI / 2} position={[X, 0.03, (GLASS_Z + BACK_Z) / 2]}>
        <planeGeometry args={[W * 2, GLASS_Z - BACK_Z]} />
        <meshStandardMaterial map={wood} roughness={0.42} metalness={0.05} />
      </mesh>
      <mesh position={[X, H / 2, BACK_Z]}>
        <boxGeometry args={[W * 2 + 0.3, H, 0.2]} />
        <meshStandardMaterial color="#1c2331" roughness={0.8} />
      </mesh>
      {[-W, W].map((dx) => (
        <mesh key={dx} position={[X + dx, H / 2, (GLASS_Z + BACK_Z) / 2]}>
          <boxGeometry args={[0.2, H, GLASS_Z - BACK_Z]} />
          <meshStandardMaterial color="#232b3a" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[X, H + 0.15, (GLASS_Z + BACK_Z) / 2 + 0.3]}>
        <boxGeometry args={[W * 2 + 0.6, 0.3, GLASS_Z - BACK_Z + 0.9]} />
        <meshStandardMaterial color="#0d1422" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* wood-slat ceiling */}
      {Array.from({ length: 22 }, (_, i) => (
        <mesh key={i} position={[X - W + 0.35 + i * 0.66, H - 0.06, (GLASS_Z + BACK_Z) / 2]}>
          <boxGeometry args={[0.1, 0.08, GLASS_Z - BACK_Z - 0.2]} />
          <meshStandardMaterial color="#6b4a2f" roughness={0.6} />
        </mesh>
      ))}
      {/* fascia over the glass */}
      <mesh position={[X, H + 0.15, GLASS_Z + 0.16]}>
        <planeGeometry args={[6.4, 1.6 * 0.5]} />
        <meshBasicMaterial map={fascia} toneMapped={false} />
      </mesh>
      <mesh position={[X, H + 0.32, GLASS_Z + 0.17]}>
        <boxGeometry args={[W * 2 + 0.6, 0.03, 0.03]} />
        <meshBasicMaterial color={TEAL.clone().multiplyScalar(2.2)} toneMapped={false} />
      </mesh>
      {/* glass front with an open doorway */}
      {mullions.map((mx) => (
        <mesh key={mx} position={[X + mx, H / 2, GLASS_Z]}>
          <boxGeometry args={[0.06, H, 0.08]} />
          <meshStandardMaterial color={frame} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {mullions.slice(0, -1).map((mx) =>
        Math.abs(mx) < 0.01 ? null : ( // doorway between x 0 and 1.8
          <mesh key={`g${mx}`} position={[X + mx + 0.9, H / 2, GLASS_Z]} material={glass}>
            <planeGeometry args={[1.74, H]} />
          </mesh>
        ),
      )}
      <mesh position={[X, 0.04, GLASS_Z]}>
        <boxGeometry args={[W * 2, 0.08, 0.14]} />
        <meshStandardMaterial color={frame} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* back wall: EVIBE café sign with halo */}
      <mesh position={[X + 2.4, 2.1, BACK_Z + 0.12]}>
        <planeGeometry args={[3.6, 1.05]} />
        <meshBasicMaterial map={wall} toneMapped={false} />
      </mesh>
      <mesh position={[X + 2.4, 2.1, BACK_Z + 0.11]}>
        <planeGeometry args={[3.9, 1.3]} />
        <meshBasicMaterial color={TEAL.clone().multiplyScalar(0.6)} toneMapped={false} />
      </mesh>
      {/* coffee bar */}
      <mesh position={[X - 3.4, 0.52, -10.6]}>
        <boxGeometry args={[4.2, 1.04, 0.7]} />
        <meshStandardMaterial color="#5a3b26" roughness={0.55} />
      </mesh>
      <mesh position={[X - 3.4, 1.06, -10.6]}>
        <boxGeometry args={[4.4, 0.05, 0.84]} />
        <meshPhysicalMaterial color="#e9e4dc" roughness={0.25} clearcoat={0.8} />
      </mesh>
      <mesh position={[X - 3.4, 0.1, -10.23]}>
        <boxGeometry args={[4.2, 0.025, 0.02]} />
        <meshBasicMaterial color={TEAL.clone().multiplyScalar(2)} toneMapped={false} />
      </mesh>
      {/* back bar shelves with warm glow */}
      {[1.5, 2.1].map((y) => (
        <mesh key={y} position={[X - 3.4, y, BACK_Z + 0.25]}>
          <boxGeometry args={[4.2, 0.05, 0.32]} />
          <meshStandardMaterial color="#3a2a1d" />
        </mesh>
      ))}
      <mesh position={[X - 3.4, 1.8, BACK_Z + 0.11]}>
        <planeGeometry args={[4.4, 1.2]} />
        <meshBasicMaterial color={warm.clone().multiplyScalar(0.45)} toneMapped={false} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[X - 5.2 + i * 0.27, 1.6 + (i % 2) * 0.6, BACK_Z + 0.25]}>
          <cylinderGeometry args={[0.05, 0.05, 0.16 + (i % 3) * 0.05, 12]} />
          <meshStandardMaterial color={['#e9e4dc', '#2b3647', '#b8865a'][i % 3]} roughness={0.4} />
        </mesh>
      ))}
      {/* lights: provided by the shared LightPool (see lights.js) */}
    </group>
  );
}

function Furniture() {
  const get = useProps();
  const P = (props) => <Prop get={get} {...props} />;
  return (
    <group>
      {/* coffee bar: espresso cart against the back, stools in front */}
      <P name="CoffeeCart_01" position={[X - 3.4, 0, BACK_Z + 0.75]} rotation={0} scale={0.95} />
      {[-4.8, -3.8, -2.8, -1.8].map((x) => (
        <P key={x} name="bar_chair_round_01" position={[X + x, 0, -9.9]} scale={1.12} />
      ))}
      {/* window table (driver) */}
      <P name="round_wooden_table_01" position={[X + 1.8, 0, -6.85]} scale={0.62} />
      <P name="dining_chair_02" position={[X + 1.8, 0, -7.78]} rotation={0} />
      <P name="dining_chair_02" position={[X + 1.8, 0, -6.1]} rotation={Math.PI} />
      <Coffee position={[X + 1.7, 0.628, -7.0]} />
      <Phone position={[X + 1.98, 0.632, -6.92]} rotation={0.35} />
      {/* table 2 (guest a) */}
      <P name="round_wooden_table_01" position={[X - 1.0, 0, -8.6]} scale={0.62} />
      <P name="dining_chair_02" position={[X - 0.25, 0, -8.6]} rotation={-Math.PI / 2} />
      <P name="dining_chair_02" position={[X - 1.75, 0, -8.6]} rotation={Math.PI / 2} />
      <Coffee position={[X - 0.85, 0.628, -8.55]} rotation={2} />
      {/* table 3 */}
      <P name="round_wooden_table_01" position={[X + 4.6, 0, -6.85]} scale={0.62} />
      <P name="dining_chair_02" position={[X + 4.6, 0, -7.62]} />
      <P name="dining_chair_02" position={[X + 4.6, 0, -6.1]} rotation={Math.PI} />
      <P name="potted_plant_04" position={[X + 4.6, 0.62, -6.85]} />
      {/* lounge */}
      <P name="sofa_03" position={[X + 6.5, 0, -10.6]} rotation={-Math.PI / 2} scale={0.92} />
      <P name="modern_coffee_table_01" position={[X + 5.2, 0, -10.6]} rotation={0} />
      <P name="modern_arm_chair_01" position={[X + 3.7, 0, -11.2]} rotation={Math.PI / 2 + 0.3} />
      <P name="mid_century_lounge_chair" position={[X + 3.8, 0, -9.6]} rotation={Math.PI / 2 - 0.4} scale={0.9} />
      {/* pendants */}
      {[
        [1.8, -6.85],
        [-1.0, -8.6],
        [4.6, -6.85],
        [-4.2, -10.6],
        [-2.6, -10.6],
      ].map(([x, z]) => (
        <group key={`${x}${z}`}>
          <P name="modern_ceiling_lamp_01" position={[X + x, H - 1.0, z]} />
          <mesh position={[X + x, H - 0.98, z]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color={new THREE.Color('#ffd59c').multiplyScalar(3)} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* plants */}
      <P name="potted_plant_01" position={[X - 6.4, 0, -6.2]} />
      <P name="potted_plant_02" position={[X + 6.4, 0, -6.3]} />
      <P name="potted_plant_01" position={[X + 6.3, 0, -12.3]} scale={0.9} />
      <P name="potted_plant_04" position={[X - 1.6, 1.08, -10.6]} />
      {/* terrace */}
      <P name="outdoor_table_chair_set_01" position={[X - 4.4, 0, -4.4]} rotation={Math.PI / 2} />
      <P name="outdoor_table_chair_set_01" position={[X + 4.4, 0, -4.4]} rotation={Math.PI / 2} />
      <P name="planter_box_01" position={[X - 2.2, 0, -3.6]} />
      <P name="planter_box_01" position={[X + 2.2, 0, -3.6]} />
    </group>
  );
}

function People() {
  return (
    <group>
      <Person url={PEOPLE.barista} clip="idle" position={[X - 3.0, 0, -11.75]} rotation={0} />
      <Person url={PEOPLE.a} clip="sit" position={[X - 0.2, 0, -8.6]} rotation={-Math.PI / 2} offset={2} />
      <Person url={PEOPLE.b} clip="sit" position={[X + 3.7, 0, -11.2]} rotation={Math.PI / 2 + 0.3} offset={5} />
      <Person url={PEOPLE.c} clip="sit" position={[X + 4.6, 0, -7.62]} rotation={0} offset={1} />
      <Driver />
    </group>
  );
}

export default function Cafe({ tier }) {
  const charge = useRefFn(() => cafeCharge(SS.p));
  const glow = useRefFn(() => 0.3 + cafePlug(SS.p) * 1.1);
  const full = useRef(1);
  const glowIdle = useRef(0.8);
  const cAmg = useRef(0.62);
  const bays = [X - 4.6, X, X + 4.6];
  return (
    <Gate from={0} to={0.43}>
      <Building />
      <Furniture />
      <People />
      <Pedestal tier={tier} x={bays[0] + 1.95} z={1.5} scale={0.5} charge={cAmg} glow={glowIdle} />
      <Pedestal tier={tier} x={bays[1] + 1.95} z={1.5} scale={0.5} charge={charge} glow={glow} />
      <Pedestal tier={tier} x={bays[2] + 1.95} z={1.5} scale={0.5} charge={full} glow={glowIdle} />
      {/* AMG and Challenger already charging; the Mustang arrives */}
      <Car model="amg" paint="#e9edf2" drive={() => ({ x: bays[0], z: 0, dist: 0, glow: 0.35, port: 1, beam: 0 })} beams={false} port underglow tailBar={false} />
      <PlugCable from={toWorld(CABLE_START, bays[0] + 1.95, 1.5, 0.5)} to={portOf(bays[0], 0)} reveal={() => 1} glow={() => 0.8} />
      <Car model="challenger" paint="#b3121c" drive={() => ({ x: bays[2], z: 0, dist: 0, glow: 0.3, port: 1, beam: 0 })} beams={false} port underglow />
      <PlugCable from={toWorld(CABLE_START, bays[2] + 1.95, 1.5, 0.5)} to={portOf(bays[2], 0)} reveal={() => 1} glow={() => 0.6} />
      <Car
        model="mustang"
        paint="#0d3b8c"
        drive={() => {
          const c = cafeCar(SS.p);
          return { visible: c.z < 12.5, x: bays[1], z: c.z, dist: c.dist, brake: SS.p > 0.05 && SS.p < 0.1, glow: 0.2 + cafePlug(SS.p) * 0.7, port: SS.p > 0.09 ? 1 : 0, beam: 1 - cafePlug(SS.p) * 0.8 };
        }}
        port
        underglow
      />
      <PlugCable from={toWorld(CABLE_START, bays[1] + 1.95, 1.5, 0.5)} to={portOf(bays[1], 0)} reveal={() => cafePlug(SS.p)} glow={() => cafePlug(SS.p)} />
    </Gate>
  );
}
